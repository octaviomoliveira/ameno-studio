-- Apply after schema.sql. Server-only RPCs; one license per paid Checkout session.
CREATE TABLE IF NOT EXISTS public.licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL,
  purchase_id uuid NOT NULL UNIQUE REFERENCES public.purchases(id),
  product text NOT NULL DEFAULT 'ameno-cotas',
  machine_id text,
  machine_bound_at timestamptz,
  last_verified_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.licenses FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.licenses TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.purchases TO service_role;

-- Shared rolling rate limit, including unknown tokens. No raw token in this table.
CREATE TABLE IF NOT EXISTS public.license_verify_limits (
  token_hash text PRIMARY KEY,
  attempts timestamptz[] NOT NULL DEFAULT '{}',
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS license_verify_limits_expiry_idx
  ON public.license_verify_limits (expires_at);
ALTER TABLE public.license_verify_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.license_verify_limits FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.license_verify_limits TO service_role;

CREATE OR REPLACE FUNCTION public.fulfill_plugin_purchase(
  p_session_id text, p_payment_intent text, p_amount integer,
  p_currency text, p_email text, p_product text, p_token text
) RETURNS uuid
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  v_purchase_id uuid;
  v_license_id uuid;
BEGIN
  IF p_session_id IS NULL OR p_session_id = '' OR p_amount IS NULL OR p_amount < 1000
    OR p_currency IS DISTINCT FROM 'brl' OR p_product IS DISTINCT FROM 'ameno-cotas'
    OR p_token IS NULL OR p_token = '' THEN
    RAISE EXCEPTION 'Invalid purchase';
  END IF;

  INSERT INTO public.purchases
    (stripe_session_id, stripe_payment_intent, amount, currency, customer_email, product, status)
  VALUES (p_session_id, p_payment_intent, p_amount, p_currency, p_email, p_product, 'completed')
  ON CONFLICT (stripe_session_id) DO UPDATE SET stripe_session_id = EXCLUDED.stripe_session_id
  RETURNING id INTO v_purchase_id;

  -- The purchase row lock serializes retries; the unique FK also enforces 1:1.
  UPDATE public.purchases SET status = 'completed' WHERE id = v_purchase_id;
  INSERT INTO public.licenses (token, purchase_id, product)
  VALUES (p_token, v_purchase_id, p_product)
  ON CONFLICT (purchase_id) DO NOTHING;
  SELECT id INTO v_license_id FROM public.licenses WHERE purchase_id = v_purchase_id;
  RETURN v_license_id;
END;
$$;
REVOKE ALL ON FUNCTION public.fulfill_plugin_purchase(text,text,integer,text,text,text,text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fulfill_plugin_purchase(text,text,integer,text,text,text,text)
  TO service_role;

CREATE OR REPLACE FUNCTION public.verify_plugin_license(p_token text, p_machine_id text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  v_license public.licenses%ROWTYPE;
  v_hash text;
  v_now timestamptz;
  v_attempts timestamptz[];
  v_retry integer;
BEGIN
  IF p_token IS NULL OR length(p_token) NOT BETWEEN 1 AND 128
    OR p_machine_id IS NULL OR length(p_machine_id) NOT BETWEEN 1 AND 256 THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'invalid_request');
  END IF;
  v_hash := encode(sha256(convert_to(p_token, 'UTF8')), 'hex');

  -- Bounded cleanup avoids accumulating expired keys or waiting for other cleaners.
  WITH stale AS (
    SELECT token_hash FROM public.license_verify_limits
    WHERE expires_at < clock_timestamp() ORDER BY expires_at
    LIMIT 100 FOR UPDATE SKIP LOCKED
  ) DELETE FROM public.license_verify_limits l USING stale s WHERE l.token_hash = s.token_hash;

  INSERT INTO public.license_verify_limits (token_hash, expires_at)
  VALUES (v_hash, clock_timestamp() + interval '1 minute')
  ON CONFLICT (token_hash) DO NOTHING;
  SELECT attempts INTO v_attempts FROM public.license_verify_limits
    WHERE token_hash = v_hash FOR UPDATE;
  v_now := clock_timestamp();
  SELECT coalesce(array_agg(t ORDER BY t), '{}'::timestamptz[]) INTO v_attempts
    FROM unnest(v_attempts) AS t WHERE t > v_now - interval '1 minute';
  IF cardinality(v_attempts) >= 10 THEN
    v_retry := greatest(1, ceil(extract(epoch FROM (v_attempts[1] + interval '1 minute' - v_now)))::integer);
    RETURN jsonb_build_object('valid', false, 'reason', 'rate_limited', 'retry_after', v_retry);
  END IF;
  UPDATE public.license_verify_limits SET attempts = array_append(v_attempts, v_now),
    expires_at = v_now + interval '1 minute' WHERE token_hash = v_hash;

  SELECT * INTO v_license FROM public.licenses WHERE token = p_token FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'not_found');
  END IF;
  IF NOT v_license.active THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'inactive');
  END IF;
  IF v_license.machine_id IS NOT NULL AND v_license.machine_id <> p_machine_id THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'machine_mismatch');
  END IF;
  UPDATE public.licenses SET machine_id = p_machine_id,
    machine_bound_at = coalesce(machine_bound_at, v_now), last_verified_at = v_now
    WHERE id = v_license.id;
  RETURN jsonb_build_object('valid', true);
END;
$$;
REVOKE ALL ON FUNCTION public.verify_plugin_license(text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_plugin_license(text,text) TO service_role;
