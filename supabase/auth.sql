-- Optional account authentication and guest purchase recovery.
-- Apply after schema.sql and licenses.sql.

ALTER TABLE public.purchases
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS claimed_at timestamptz;

CREATE INDEX IF NOT EXISTS purchases_user_id_created_at_idx
  ON public.purchases (user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

-- Purchases and licenses are intentionally server-only. Account reads happen
-- after server-side identity verification and use the service role client.
REVOKE ALL ON public.purchases FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.purchases TO service_role;

CREATE OR REPLACE FUNCTION public.claim_purchases_for_user(p_user_id uuid, p_email text)
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_claimed integer;
BEGIN
  IF p_user_id IS NULL OR p_email IS NULL OR trim(p_email) = ''
    OR length(trim(p_email)) > 320 THEN
    RAISE EXCEPTION 'User and email are required';
  END IF;

  UPDATE public.purchases
  SET user_id = p_user_id,
      claimed_at = coalesce(claimed_at, clock_timestamp())
  WHERE user_id IS NULL
    AND customer_email IS NOT NULL
    AND lower(trim(customer_email)) = lower(trim(p_email));

  GET DIAGNOSTICS v_claimed = ROW_COUNT;
  RETURN v_claimed;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_purchases_for_user(uuid,text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_purchases_for_user(uuid,text)
  TO service_role;

CREATE OR REPLACE FUNCTION public.attach_purchase_to_user(
  p_session_id text,
  p_user_id uuid,
  p_email text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_owner uuid;
BEGIN
  IF p_session_id IS NULL OR p_session_id = '' OR p_user_id IS NULL
    OR p_email IS NULL OR trim(p_email) = '' OR length(trim(p_email)) > 320 THEN
    RETURN false;
  END IF;

  UPDATE public.purchases
  SET user_id = p_user_id,
      claimed_at = coalesce(claimed_at, clock_timestamp())
  WHERE stripe_session_id = p_session_id
    AND (user_id IS NULL OR user_id = p_user_id)
    AND customer_email IS NOT NULL
    AND lower(trim(customer_email)) = lower(trim(p_email));

  SELECT user_id INTO v_owner
  FROM public.purchases
  WHERE stripe_session_id = p_session_id;

  RETURN coalesce(v_owner = p_user_id, false);
END;
$$;

REVOKE ALL ON FUNCTION public.attach_purchase_to_user(text,uuid,text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.attach_purchase_to_user(text,uuid,text)
  TO service_role;
