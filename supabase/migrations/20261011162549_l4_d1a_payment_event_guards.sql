-- L4-d1a: apply after schema.sql, licenses.sql, and auth.sql (or their
-- equivalent prior migrations). This migration is independent of artifact
-- delivery migrations. Do not apply before the local SQL integration gate.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.purchases
    WHERE stripe_payment_intent IS NOT NULL
    GROUP BY stripe_payment_intent HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate PaymentIntent values require manual reconciliation';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.purchases
    WHERE status = 'completed' AND stripe_payment_intent IS NULL
  ) THEN
    RAISE EXCEPTION 'Completed purchases without PaymentIntent require manual reconciliation';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.purchases
    WHERE stripe_payment_intent IS NOT NULL
      AND (btrim(stripe_payment_intent) = ''
        OR stripe_payment_intent !~ '^pi_[A-Za-z0-9]+$')
  ) THEN
    RAISE EXCEPTION 'Empty or invalid PaymentIntent values require manual reconciliation';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.purchases p
    WHERE (p.status = 'completed' OR EXISTS (
      SELECT 1 FROM public.licenses l WHERE l.purchase_id = p.id
    )) AND (p.stripe_session_id IS NULL
      OR btrim(p.stripe_session_id) = ''
      OR p.stripe_payment_intent IS NULL
      OR p.amount IS NULL OR p.amount < 1000
      OR p.currency IS DISTINCT FROM 'brl'
      OR p.customer_email IS NULL OR btrim(p.customer_email) = ''
      OR p.product IS DISTINCT FROM 'ameno-cotas')
  ) THEN
    RAISE EXCEPTION 'Legacy paid purchase metadata requires manual reconciliation';
  END IF;
END;
$$;

-- A null marker means that no paid payload has finalized these fields yet.
-- Existing completed/licensed rows are frozen, not backfilled from a new
-- event. For those legacy rows this timestamp is the migration time, not the
-- original Stripe payment time.
ALTER TABLE public.purchases
  ADD COLUMN IF NOT EXISTS paid_confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS blocked_while_pending_at timestamptz;
UPDATE public.purchases p SET paid_confirmed_at = clock_timestamp()
WHERE p.paid_confirmed_at IS NULL
  AND (p.status = 'completed' OR (
    p.status IN ('suspended', 'refunded') AND EXISTS (
      SELECT 1 FROM public.licenses l WHERE l.purchase_id = p.id
    )
  ));

-- Even future service-role code must not silently rewrite a finalized paid
-- identity or forge pending-to-blocked provenance on a terminal legacy row.
-- Status, owner, and license revocation remain independently mutable.
CREATE OR REPLACE FUNCTION public.keep_paid_metadata_immutable()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.blocked_while_pending_at IS NOT NULL THEN
    RAISE EXCEPTION 'Prepaid block marker requires pending transition';
  END IF;
  IF TG_OP = 'UPDATE' THEN
    IF OLD.blocked_while_pending_at IS NOT NULL
      AND NEW.blocked_while_pending_at IS DISTINCT FROM OLD.blocked_while_pending_at THEN
      RAISE EXCEPTION 'Prepaid block provenance is immutable';
    END IF;
    IF OLD.blocked_while_pending_at IS NULL
      AND NEW.blocked_while_pending_at IS NOT NULL
      AND (OLD.status IS DISTINCT FROM 'pending'
        OR NEW.status IS NULL
        OR NEW.status NOT IN ('suspended', 'refunded')) THEN
      RAISE EXCEPTION 'Prepaid block marker requires pending transition';
    END IF;
    IF OLD.paid_confirmed_at IS NOT NULL AND (
      NEW.paid_confirmed_at IS DISTINCT FROM OLD.paid_confirmed_at
      OR NEW.stripe_session_id IS DISTINCT FROM OLD.stripe_session_id
      OR NEW.stripe_payment_intent IS DISTINCT FROM OLD.stripe_payment_intent
      OR NEW.amount IS DISTINCT FROM OLD.amount
      OR NEW.currency IS DISTINCT FROM OLD.currency
      OR NEW.customer_email IS DISTINCT FROM OLD.customer_email
      OR NEW.product IS DISTINCT FROM OLD.product
    ) THEN
      RAISE EXCEPTION 'Finalized paid metadata is immutable';
    END IF;
  END IF;
  IF NEW.status = 'completed' AND NEW.paid_confirmed_at IS NULL THEN
    RAISE EXCEPTION 'Completed purchase requires finalized paid metadata';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.keep_paid_metadata_immutable()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.keep_paid_metadata_immutable()
  TO service_role;
CREATE TRIGGER purchases_paid_metadata_immutable
  BEFORE INSERT OR UPDATE ON public.purchases
  FOR EACH ROW EXECUTE FUNCTION public.keep_paid_metadata_immutable();

CREATE UNIQUE INDEX IF NOT EXISTS purchases_stripe_payment_intent_unique_idx
  ON public.purchases (stripe_payment_intent)
  WHERE stripe_payment_intent IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.stripe_event_receipts (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  object_id text NOT NULL,
  stripe_session_id text NOT NULL,
  stripe_payment_intent text NOT NULL,
  block_kind text NOT NULL CHECK (block_kind IN ('partial_refund', 'full_refund', 'dispute')),
  livemode boolean NOT NULL,
  disposition text NOT NULL CHECK (disposition IN ('blocked', 'duplicate_fact')),
  processed_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX IF NOT EXISTS stripe_event_receipts_pi_idx
  ON public.stripe_event_receipts (stripe_payment_intent, processed_at DESC);
ALTER TABLE public.stripe_event_receipts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.stripe_event_receipts FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.stripe_event_receipts TO service_role;

-- A blocker has no purchase FK: a refund/dispute can arrive before the paid
-- Checkout webhook. The first verified event remains the audit origin.
CREATE TABLE IF NOT EXISTS public.payment_blocks (
  stripe_payment_intent text NOT NULL,
  stripe_session_id text NOT NULL,
  block_kind text NOT NULL CHECK (block_kind IN ('partial_refund', 'full_refund', 'dispute')),
  object_id text NOT NULL,
  source_event_id text NOT NULL REFERENCES public.stripe_event_receipts(event_id),
  livemode boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (stripe_payment_intent, block_kind, object_id)
);
CREATE INDEX IF NOT EXISTS payment_blocks_session_idx
  ON public.payment_blocks (stripe_session_id);
ALTER TABLE public.payment_blocks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.payment_blocks FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.payment_blocks TO service_role;

-- Input identity/product validation belongs to the signed Stripe webhook
-- (d1b). This RPC only accepts service_role and makes a validated block fact
-- atomic with the receipt, purchase status, and license revocation.
CREATE OR REPLACE FUNCTION public.record_plugin_payment_block(
  p_event_id text, p_event_type text, p_object_id text,
  p_session_id text, p_payment_intent text, p_block_kind text,
  p_livemode boolean
) RETURNS text
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  v_receipt public.stripe_event_receipts%ROWTYPE;
  v_block public.payment_blocks%ROWTYPE;
  v_by_pi public.purchases%ROWTYPE;
  v_by_session public.purchases%ROWTYPE;
  v_purchase_id uuid;
  v_purchase_status text;
  v_disposition text;
BEGIN
  IF p_event_id IS NULL OR length(p_event_id) NOT BETWEEN 1 AND 255
    OR p_event_type IS NULL OR length(p_event_type) NOT BETWEEN 1 AND 255
    OR p_object_id IS NULL OR length(p_object_id) NOT BETWEEN 1 AND 255
    OR p_session_id IS NULL OR length(p_session_id) NOT BETWEEN 1 AND 255
    OR p_payment_intent IS NULL OR length(p_payment_intent) NOT BETWEEN 1 AND 255
    OR p_block_kind IS NULL
    OR p_block_kind NOT IN ('partial_refund', 'full_refund', 'dispute')
    OR p_livemode IS NULL THEN
    RAISE EXCEPTION 'Invalid payment block';
  END IF;

  -- All paid/refund/dispute paths use this exact PI lock before touching a
  -- purchase or license. Hash collision can only serialize unrelated PIs.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('ameno-cotas-payment:' || p_payment_intent, 0));

  -- Receipts are immutable. PI advisory lock + event_id PK are sufficient;
  -- FOR UPDATE would require an UPDATE grant not held by service_role.
  SELECT * INTO v_receipt FROM public.stripe_event_receipts
  WHERE event_id = p_event_id;
  IF FOUND THEN
    IF v_receipt.event_type IS DISTINCT FROM p_event_type
      OR v_receipt.object_id IS DISTINCT FROM p_object_id
      OR v_receipt.stripe_session_id IS DISTINCT FROM p_session_id
      OR v_receipt.stripe_payment_intent IS DISTINCT FROM p_payment_intent
      OR v_receipt.block_kind IS DISTINCT FROM p_block_kind
      OR v_receipt.livemode IS DISTINCT FROM p_livemode THEN
      RAISE EXCEPTION 'Stripe event identity collision';
    END IF;
    RETURN 'duplicate_event';
  END IF;

  SELECT * INTO v_by_pi FROM public.purchases
  WHERE stripe_payment_intent = p_payment_intent FOR UPDATE;
  SELECT * INTO v_by_session FROM public.purchases
  WHERE stripe_session_id = p_session_id FOR UPDATE;
  IF v_by_pi.id IS NOT NULL AND v_by_session.id IS NOT NULL
    AND v_by_pi.id <> v_by_session.id THEN
    RAISE EXCEPTION 'PaymentIntent and Checkout session refer to different purchases';
  END IF;
  IF v_by_pi.id IS NOT NULL AND v_by_pi.stripe_session_id IS NOT NULL
    AND v_by_pi.stripe_session_id <> p_session_id THEN
    RAISE EXCEPTION 'PaymentIntent belongs to another Checkout session';
  END IF;
  IF v_by_session.id IS NOT NULL
    AND v_by_session.stripe_payment_intent IS NOT NULL
    AND v_by_session.stripe_payment_intent <> p_payment_intent
    AND v_by_session.status <> 'pending' THEN
    RAISE EXCEPTION 'Checkout session belongs to another PaymentIntent';
  END IF;
  -- Current Checkout metadata can be edited after a paid snapshot. The
  -- webhook records a block by Charge/PI/session identity even when that
  -- metadata now names another product. Protect an actually finalized
  -- unrelated purchase, while preserving pending/prepaid-block placeholders.
  IF (v_by_pi.id IS NOT NULL
      AND v_by_pi.product IS DISTINCT FROM 'ameno-cotas'
      AND NOT (v_by_pi.status = 'pending' OR
        (v_by_pi.blocked_while_pending_at IS NOT NULL
         AND v_by_pi.paid_confirmed_at IS NULL)))
    OR (v_by_session.id IS NOT NULL
      AND v_by_session.product IS DISTINCT FROM 'ameno-cotas'
      AND NOT (v_by_session.status = 'pending' OR
        (v_by_session.blocked_while_pending_at IS NOT NULL
         AND v_by_session.paid_confirmed_at IS NULL))) THEN
    RAISE EXCEPTION 'Finalized unrelated product requires manual review';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.payment_blocks
    WHERE stripe_payment_intent = p_payment_intent
      AND (stripe_session_id <> p_session_id OR livemode <> p_livemode)
  ) THEN
    RAISE EXCEPTION 'Payment block identity mismatch';
  END IF;

  -- Even a second event ID for the same Charge/Dispute is recorded, but the
  -- business fact itself has one row. A failed transaction records neither.
  SELECT * INTO v_block FROM public.payment_blocks
  WHERE stripe_payment_intent = p_payment_intent
    AND block_kind = p_block_kind AND object_id = p_object_id;
  v_disposition := CASE WHEN v_block.source_event_id IS NULL
    THEN 'blocked' ELSE 'duplicate_fact' END;
  INSERT INTO public.stripe_event_receipts
    (event_id, event_type, object_id, stripe_session_id,
     stripe_payment_intent, block_kind, livemode, disposition)
  VALUES
    (p_event_id, p_event_type, p_object_id, p_session_id,
     p_payment_intent, p_block_kind, p_livemode, v_disposition);
  IF v_block.source_event_id IS NULL THEN
    INSERT INTO public.payment_blocks
      (stripe_payment_intent, stripe_session_id, block_kind,
       object_id, source_event_id, livemode)
    VALUES (p_payment_intent, p_session_id, p_block_kind,
      p_object_id, p_event_id, p_livemode);
  END IF;

  IF v_by_session.id IS NOT NULL THEN
    v_purchase_id := v_by_session.id;
  ELSE
    v_purchase_id := v_by_pi.id;
  END IF;
  IF v_purchase_id IS NOT NULL THEN
    SELECT status INTO v_purchase_status FROM public.purchases WHERE id = v_purchase_id;
    IF v_purchase_status IS NULL
      OR v_purchase_status NOT IN ('pending', 'completed', 'suspended', 'refunded') THEN
      RAISE EXCEPTION 'Unknown purchase status';
    END IF;
    SELECT CASE WHEN v_purchase_status = 'refunded' OR EXISTS (
      SELECT 1 FROM public.payment_blocks
      WHERE stripe_payment_intent = p_payment_intent AND block_kind = 'full_refund'
    ) THEN 'refunded' ELSE 'suspended' END INTO v_purchase_status;

    UPDATE public.purchases SET
      stripe_session_id = coalesce(stripe_session_id, p_session_id),
      stripe_payment_intent = p_payment_intent,
      status = v_purchase_status,
      blocked_while_pending_at = CASE WHEN status = 'pending'
        THEN coalesce(blocked_while_pending_at, clock_timestamp())
        ELSE blocked_while_pending_at END,
      user_id = CASE WHEN status = 'pending' THEN NULL ELSE user_id END,
      claimed_at = CASE WHEN status = 'pending' THEN NULL ELSE claimed_at END
    WHERE id = v_purchase_id;
    UPDATE public.licenses SET active = false WHERE purchase_id = v_purchase_id;
  END IF;
  RETURN v_disposition;
END;
$$;
REVOKE ALL ON FUNCTION public.record_plugin_payment_block(text,text,text,text,text,text,boolean)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_plugin_payment_block(text,text,text,text,text,text,boolean)
  TO service_role;

CREATE OR REPLACE FUNCTION public.fulfill_plugin_purchase(
  p_session_id text, p_payment_intent text, p_amount integer,
  p_currency text, p_email text, p_product text, p_token text
) RETURNS uuid
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  v_by_pi public.purchases%ROWTYPE;
  v_by_session public.purchases%ROWTYPE;
  v_purchase_id uuid;
  v_purchase_status text;
  v_paid_confirmed_at timestamptz;
  v_blocked_while_pending_at timestamptz;
  v_target_status text;
  v_license_id uuid;
BEGIN
  IF p_session_id IS NULL OR p_session_id = ''
    OR p_payment_intent IS NULL OR p_payment_intent = ''
    OR p_amount IS NULL OR p_amount < 1000
    OR p_currency IS DISTINCT FROM 'brl'
    OR p_email IS NULL OR length(p_email) NOT BETWEEN 3 AND 320
    OR p_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
    OR p_product IS DISTINCT FROM 'ameno-cotas'
    OR p_token IS NULL OR p_token = '' THEN
    RAISE EXCEPTION 'Invalid purchase';
  END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('ameno-cotas-payment:' || p_payment_intent, 0));

  IF EXISTS (
    SELECT 1 FROM public.payment_blocks
    WHERE stripe_payment_intent = p_payment_intent
      AND stripe_session_id <> p_session_id
  ) THEN
    RAISE EXCEPTION 'Payment block belongs to another Checkout session';
  END IF;
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM public.payment_blocks
    WHERE stripe_payment_intent = p_payment_intent AND block_kind = 'full_refund'
  ) THEN 'refunded' WHEN EXISTS (
    SELECT 1 FROM public.payment_blocks
    WHERE stripe_payment_intent = p_payment_intent
  ) THEN 'suspended' ELSE 'completed' END INTO v_target_status;

  SELECT * INTO v_by_pi FROM public.purchases
  WHERE stripe_payment_intent = p_payment_intent FOR UPDATE;
  SELECT * INTO v_by_session FROM public.purchases
  WHERE stripe_session_id = p_session_id FOR UPDATE;
  IF v_by_pi.id IS NOT NULL AND v_by_session.id IS NOT NULL
    AND v_by_pi.id <> v_by_session.id THEN
    RAISE EXCEPTION 'PaymentIntent and Checkout session refer to different purchases';
  END IF;
  IF v_by_pi.id IS NOT NULL AND v_by_pi.stripe_session_id IS NOT NULL
    AND v_by_pi.stripe_session_id <> p_session_id THEN
    RAISE EXCEPTION 'PaymentIntent belongs to another Checkout session';
  END IF;
  IF v_by_session.id IS NOT NULL
    AND v_by_session.stripe_payment_intent IS NOT NULL
    AND v_by_session.stripe_payment_intent <> p_payment_intent
    AND v_by_session.status <> 'pending' THEN
    RAISE EXCEPTION 'Checkout session belongs to another PaymentIntent';
  END IF;

  IF v_by_session.id IS NOT NULL THEN
    v_purchase_id := v_by_session.id;
  ELSE
    v_purchase_id := v_by_pi.id;
  END IF;
  IF v_purchase_id IS NULL THEN
    INSERT INTO public.purchases
      (stripe_session_id, stripe_payment_intent, amount, currency,
       customer_email, product, status, paid_confirmed_at)
    VALUES (p_session_id, p_payment_intent, p_amount, p_currency,
      p_email, p_product, v_target_status, clock_timestamp())
    RETURNING id, status INTO v_purchase_id, v_purchase_status;
  ELSE
    SELECT status, paid_confirmed_at, blocked_while_pending_at
      INTO v_purchase_status, v_paid_confirmed_at, v_blocked_while_pending_at
      FROM public.purchases
      WHERE id = v_purchase_id;
    IF v_purchase_status = 'pending' THEN
      IF v_paid_confirmed_at IS NOT NULL THEN
        RAISE EXCEPTION 'Pending purchase has finalized paid metadata';
      END IF;
      UPDATE public.purchases SET
        stripe_session_id = p_session_id,
        stripe_payment_intent = p_payment_intent,
        amount = p_amount, currency = p_currency,
        customer_email = p_email, product = p_product,
        user_id = NULL, claimed_at = NULL,
        status = v_target_status,
        paid_confirmed_at = clock_timestamp()
      WHERE id = v_purchase_id;
      v_purchase_status := v_target_status;
    ELSIF v_purchase_status IN ('completed', 'suspended', 'refunded') THEN
      IF v_paid_confirmed_at IS NULL THEN
        -- Only a pending-to-blocked transition, plus its matching blocker,
        -- explains a terminal row without a prior paid event. A new block on
        -- an unknown legacy terminal row cannot make it eligible for paid
        -- metadata; that row still needs manual reconciliation.
        IF v_purchase_status = 'completed'
          OR v_blocked_while_pending_at IS NULL OR NOT EXISTS (
          SELECT 1 FROM public.payment_blocks
          WHERE stripe_payment_intent = p_payment_intent
            AND stripe_session_id = p_session_id
        ) THEN
          RAISE EXCEPTION 'Unconfirmed terminal purchase requires manual reconciliation';
        END IF;
        UPDATE public.purchases SET
          stripe_session_id = p_session_id,
          stripe_payment_intent = p_payment_intent,
          amount = p_amount, currency = p_currency,
          customer_email = p_email, product = p_product,
          user_id = NULL, claimed_at = NULL,
          paid_confirmed_at = clock_timestamp()
        WHERE id = v_purchase_id;
      ELSE
        UPDATE public.purchases SET
          stripe_session_id = coalesce(stripe_session_id, p_session_id),
          stripe_payment_intent = coalesce(stripe_payment_intent, p_payment_intent)
        WHERE id = v_purchase_id;
      END IF;
      -- Old paid replays never downgrade refunded/suspended. A new full
      -- refund blocker can upgrade a previously suspended purchase.
      IF (v_purchase_status = 'completed' AND v_target_status <> 'completed')
        OR (v_purchase_status = 'suspended' AND v_target_status = 'refunded') THEN
        UPDATE public.purchases SET status = v_target_status,
          stripe_session_id = coalesce(stripe_session_id, p_session_id),
          stripe_payment_intent = coalesce(stripe_payment_intent, p_payment_intent)
        WHERE id = v_purchase_id;
        v_purchase_status := v_target_status;
      END IF;
    ELSE
      RAISE EXCEPTION 'Unknown purchase status';
    END IF;
  END IF;

  IF v_purchase_status = 'completed' THEN
    INSERT INTO public.licenses (token, purchase_id, product)
    VALUES (p_token, v_purchase_id, p_product)
    ON CONFLICT (purchase_id) DO NOTHING;
  ELSE
    UPDATE public.licenses SET active = false WHERE purchase_id = v_purchase_id;
  END IF;
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
  v_purchase_id uuid;
  v_purchase_status text;
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

  -- Match refund/fulfillment lock order: purchase first, license second.
  -- The initial lookup is only a hint; recheck the token under both locks.
  SELECT purchase_id INTO v_purchase_id FROM public.licenses WHERE token = p_token;
  IF v_purchase_id IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'not_found');
  END IF;
  SELECT status INTO v_purchase_status FROM public.purchases
    WHERE id = v_purchase_id FOR UPDATE;
  SELECT * INTO v_license FROM public.licenses
    WHERE token = p_token AND purchase_id = v_purchase_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'not_found');
  END IF;
  IF v_purchase_status IS DISTINCT FROM 'completed' OR NOT v_license.active THEN
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
