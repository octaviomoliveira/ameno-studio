-- L4-d1b: paid-event identity and first paid commercial entitlement.
-- Apply after 20261011161301_release_artifacts_private_download.sql and
-- 20261011162549_l4_d1a_payment_event_guards.sql in an isolated database.
-- The public checkout remains disabled. Existing rows are never backfilled.

-- Reuse the same event-id ledger for paid and blocking events. A digest of
-- paid immutable inputs catches an event-id collision without retaining PII
-- in a second table. Existing d1a block receipts remain valid.
ALTER TABLE public.stripe_event_receipts
  ADD COLUMN paid_payload_sha256 text;
ALTER TABLE public.stripe_event_receipts
  DROP CONSTRAINT stripe_event_receipts_block_kind_check,
  DROP CONSTRAINT stripe_event_receipts_disposition_check;
ALTER TABLE public.stripe_event_receipts
  ADD CONSTRAINT stripe_event_receipts_block_kind_check
    CHECK (block_kind IN ('paid', 'partial_refund', 'full_refund', 'dispute')),
  ADD CONSTRAINT stripe_event_receipts_disposition_check
    CHECK (disposition IN ('paid_active', 'paid_blocked', 'blocked', 'duplicate_fact')),
  ADD CONSTRAINT stripe_event_receipts_paid_digest_check
    CHECK ((block_kind = 'paid' AND paid_payload_sha256 ~ '^[0-9a-f]{64}$')
      OR (block_kind <> 'paid' AND paid_payload_sha256 IS NULL));

-- The d1a trigger already freezes finalized payment identity. Extend it to
-- the new commercial markers: a legacy row with NULL markers cannot be
-- upgraded by a replay, manual UPDATE, or a later version of the server.
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
      OR NEW.entitlement_scope IS DISTINCT FROM OLD.entitlement_scope
      OR NEW.stripe_livemode IS DISTINCT FROM OLD.stripe_livemode
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

-- Revoke the former seven-argument path before the new webhook is used.
-- Its old callers now fail closed rather than creating a license without a
-- signed event receipt, live-mode marker or first-paid scope.
REVOKE EXECUTE ON FUNCTION public.fulfill_plugin_purchase(
  text,text,integer,text,text,text,text) FROM service_role;

CREATE OR REPLACE FUNCTION public.fulfill_plugin_purchase_v2(
  p_event_id text, p_event_type text, p_session_id text,
  p_payment_intent text, p_amount integer, p_currency text,
  p_email text, p_product text, p_entitlement_scope text,
  p_livemode boolean, p_token text
) RETURNS uuid
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  v_receipt public.stripe_event_receipts%ROWTYPE;
  v_by_pi public.purchases%ROWTYPE;
  v_by_session public.purchases%ROWTYPE;
  v_purchase_id uuid;
  v_status text;
  v_target_status text;
  v_license_id uuid;
  v_digest text;
BEGIN
  IF p_event_id IS NULL OR p_event_id !~ '^evt_[A-Za-z0-9]+$'
    OR p_event_type IS NULL OR p_event_type NOT IN ('checkout.session.completed',
      'checkout.session.async_payment_succeeded')
    OR p_session_id IS NULL OR p_session_id !~ '^cs_live_[A-Za-z0-9]+$'
    OR p_payment_intent IS NULL OR p_payment_intent !~ '^pi_[A-Za-z0-9]+$'
    OR p_amount IS NULL OR p_amount < 1000
    OR p_currency IS DISTINCT FROM 'brl'
    OR p_email IS NULL OR length(p_email) NOT BETWEEN 3 AND 320
    OR p_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
    OR p_product IS DISTINCT FROM 'ameno-cotas'
    OR p_entitlement_scope IS DISTINCT FROM 'ameno-cotas-first-paid'
    OR p_livemode IS DISTINCT FROM true
    OR p_token IS NULL OR p_token = '' THEN
    RAISE EXCEPTION 'Invalid paid event';
  END IF;
  v_digest := pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
    pg_catalog.jsonb_build_array(p_event_id, p_event_type, p_session_id,
      p_payment_intent, p_amount, p_currency, p_email, p_product,
      p_entitlement_scope, p_livemode)::text, 'UTF8')), 'hex');

  -- The same PI lock is used by record_plugin_payment_block. It serializes
  -- paid/refund/dispute before any purchase or license row lock.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('ameno-cotas-payment:' || p_payment_intent, 0));
  -- Immutable receipt: PK detects cross-PI collisions; no row UPDATE needed.
  SELECT * INTO v_receipt FROM public.stripe_event_receipts
    WHERE event_id = p_event_id;
  IF FOUND THEN
    IF v_receipt.event_type IS DISTINCT FROM p_event_type
      OR v_receipt.object_id IS DISTINCT FROM p_session_id
      OR v_receipt.stripe_session_id IS DISTINCT FROM p_session_id
      OR v_receipt.stripe_payment_intent IS DISTINCT FROM p_payment_intent
      OR v_receipt.block_kind IS DISTINCT FROM 'paid'
      OR v_receipt.livemode IS DISTINCT FROM p_livemode
      OR v_receipt.paid_payload_sha256 IS DISTINCT FROM v_digest THEN
      RAISE EXCEPTION 'Stripe event identity collision';
    END IF;
    SELECT id, status INTO v_purchase_id, v_status FROM public.purchases
      WHERE stripe_payment_intent = p_payment_intent
        AND stripe_session_id = p_session_id FOR UPDATE;
    IF v_purchase_id IS NULL THEN
      RAISE EXCEPTION 'Paid event receipt has no purchase';
    END IF;
    -- A paid event replay after a refund/dispute must not signal an active
    -- entitlement to the webhook's optional account-attachment step.
    IF v_status IS DISTINCT FROM 'completed' THEN RETURN NULL; END IF;
    SELECT id INTO v_license_id FROM public.licenses
      WHERE purchase_id = v_purchase_id AND active = true;
    RETURN v_license_id;
  END IF;

  IF EXISTS (SELECT 1 FROM public.payment_blocks
    WHERE stripe_payment_intent = p_payment_intent
      AND (stripe_session_id <> p_session_id OR livemode <> p_livemode)) THEN
    RAISE EXCEPTION 'Payment block identity mismatch';
  END IF;
  SELECT CASE WHEN EXISTS (SELECT 1 FROM public.payment_blocks
    WHERE stripe_payment_intent = p_payment_intent AND block_kind = 'full_refund')
    THEN 'refunded' WHEN EXISTS (SELECT 1 FROM public.payment_blocks
    WHERE stripe_payment_intent = p_payment_intent)
    THEN 'suspended' ELSE 'completed' END INTO v_target_status;

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
    AND v_by_session.stripe_payment_intent <> p_payment_intent THEN
    RAISE EXCEPTION 'Checkout session belongs to another PaymentIntent';
  END IF;

  v_purchase_id := coalesce(v_by_session.id, v_by_pi.id);
  IF v_purchase_id IS NULL THEN
    INSERT INTO public.purchases (stripe_session_id, stripe_payment_intent,
      amount, currency, customer_email, product, entitlement_scope,
      stripe_livemode, status, paid_confirmed_at)
    VALUES (p_session_id, p_payment_intent, p_amount, p_currency,
      p_email, p_product, p_entitlement_scope, p_livemode,
      v_target_status, clock_timestamp())
    RETURNING id, status INTO v_purchase_id, v_status;
  ELSE
    SELECT * INTO v_by_session FROM public.purchases
      WHERE id = v_purchase_id;
    v_status := v_by_session.status;
    IF v_status = 'pending' THEN
      IF v_by_session.paid_confirmed_at IS NOT NULL
        OR (v_by_session.entitlement_scope IS NOT NULL
          AND v_by_session.entitlement_scope <> p_entitlement_scope)
        OR (v_by_session.stripe_livemode IS NOT NULL
          AND v_by_session.stripe_livemode <> p_livemode) THEN
        RAISE EXCEPTION 'Pending purchase identity mismatch';
      END IF;
      UPDATE public.purchases SET
        stripe_session_id = p_session_id,
        stripe_payment_intent = p_payment_intent,
        amount = p_amount, currency = p_currency,
        customer_email = p_email, product = p_product,
        entitlement_scope = p_entitlement_scope,
        stripe_livemode = p_livemode,
        user_id = NULL, claimed_at = NULL,
        status = v_target_status, paid_confirmed_at = clock_timestamp()
      WHERE id = v_purchase_id;
      v_status := v_target_status;
    ELSIF v_status IN ('completed', 'suspended', 'refunded') THEN
      IF v_by_session.paid_confirmed_at IS NULL THEN
        IF v_status = 'completed'
          OR v_by_session.blocked_while_pending_at IS NULL
          OR NOT EXISTS (SELECT 1 FROM public.payment_blocks
            WHERE stripe_payment_intent = p_payment_intent
              AND stripe_session_id = p_session_id) THEN
          RAISE EXCEPTION 'Unconfirmed terminal purchase requires manual reconciliation';
        END IF;
        UPDATE public.purchases SET
          stripe_session_id = p_session_id,
          stripe_payment_intent = p_payment_intent,
          amount = p_amount, currency = p_currency,
          customer_email = p_email, product = p_product,
          entitlement_scope = p_entitlement_scope,
          stripe_livemode = p_livemode,
          user_id = NULL, claimed_at = NULL,
          paid_confirmed_at = clock_timestamp()
        WHERE id = v_purchase_id;
      ELSIF v_by_session.stripe_session_id IS DISTINCT FROM p_session_id
        OR v_by_session.stripe_payment_intent IS DISTINCT FROM p_payment_intent
        OR v_by_session.amount IS DISTINCT FROM p_amount
        OR v_by_session.currency IS DISTINCT FROM p_currency
        OR v_by_session.customer_email IS DISTINCT FROM p_email
        OR v_by_session.product IS DISTINCT FROM p_product
        OR v_by_session.entitlement_scope IS DISTINCT FROM p_entitlement_scope
        OR v_by_session.stripe_livemode IS DISTINCT FROM p_livemode THEN
        RAISE EXCEPTION 'Finalized purchase identity mismatch';
      END IF;
      IF (v_status = 'completed' AND v_target_status <> 'completed')
        OR (v_status = 'suspended' AND v_target_status = 'refunded') THEN
        UPDATE public.purchases SET status = v_target_status
          WHERE id = v_purchase_id;
        v_status := v_target_status;
      END IF;
    ELSE
      RAISE EXCEPTION 'Unknown purchase status';
    END IF;
  END IF;

  IF v_status = 'completed' THEN
    INSERT INTO public.licenses (token, purchase_id, product)
      VALUES (p_token, v_purchase_id, p_product)
      ON CONFLICT (purchase_id) DO NOTHING;
  ELSE
    UPDATE public.licenses SET active = false WHERE purchase_id = v_purchase_id;
  END IF;
  INSERT INTO public.stripe_event_receipts (event_id, event_type, object_id,
    stripe_session_id, stripe_payment_intent, block_kind, livemode,
    disposition, paid_payload_sha256)
  VALUES (p_event_id, p_event_type, p_session_id, p_session_id,
    p_payment_intent, 'paid', p_livemode,
    CASE WHEN v_status = 'completed' THEN 'paid_active' ELSE 'paid_blocked' END,
    v_digest);
  IF v_status IS DISTINCT FROM 'completed' THEN RETURN NULL; END IF;
  SELECT id INTO v_license_id FROM public.licenses
    WHERE purchase_id = v_purchase_id AND active = true;
  RETURN v_license_id;
END;
$$;
REVOKE ALL ON FUNCTION public.fulfill_plugin_purchase_v2(
  text,text,text,text,integer,text,text,text,text,boolean,text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fulfill_plugin_purchase_v2(
  text,text,text,text,integer,text,text,text,text,boolean,text)
  TO service_role;

-- Download and activation intentionally use the same commercial predicate.
-- The account route adds confirmed-email ownership; a plugin token cannot
-- claim an old, test-mode, suspended or refunded purchase.
CREATE OR REPLACE FUNCTION public.verify_plugin_license(p_token text, p_machine_id text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  v_license public.licenses%ROWTYPE;
  v_purchase public.purchases%ROWTYPE;
  v_purchase_id uuid;
  v_hash text;
  v_now timestamptz;
  v_attempts timestamptz[];
  v_retry integer;
BEGIN
  IF p_token IS NULL OR length(p_token) NOT BETWEEN 1 AND 128
    OR p_machine_id IS NULL OR length(p_machine_id) NOT BETWEEN 1 AND 256 THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'invalid_request');
  END IF;
  v_hash := pg_catalog.encode(pg_catalog.sha256(
    pg_catalog.convert_to(p_token, 'UTF8')), 'hex');
  WITH stale AS (
    SELECT token_hash FROM public.license_verify_limits
    WHERE expires_at < clock_timestamp() ORDER BY expires_at
    LIMIT 100 FOR UPDATE SKIP LOCKED
  ) DELETE FROM public.license_verify_limits l USING stale s
    WHERE l.token_hash = s.token_hash;
  INSERT INTO public.license_verify_limits (token_hash, expires_at)
    VALUES (v_hash, clock_timestamp() + interval '1 minute')
    ON CONFLICT (token_hash) DO NOTHING;
  SELECT attempts INTO v_attempts FROM public.license_verify_limits
    WHERE token_hash = v_hash FOR UPDATE;
  v_now := clock_timestamp();
  SELECT coalesce(array_agg(t ORDER BY t), '{}'::timestamptz[])
    INTO v_attempts FROM unnest(v_attempts) AS t
    WHERE t > v_now - interval '1 minute';
  IF cardinality(v_attempts) >= 10 THEN
    v_retry := greatest(1, ceil(extract(epoch FROM
      (v_attempts[1] + interval '1 minute' - v_now)))::integer);
    RETURN jsonb_build_object('valid', false, 'reason', 'rate_limited',
      'retry_after', v_retry);
  END IF;
  UPDATE public.license_verify_limits
    SET attempts = array_append(v_attempts, v_now),
      expires_at = v_now + interval '1 minute'
    WHERE token_hash = v_hash;

  -- Hint lookup, then purchase first and license second as in d1a.
  SELECT purchase_id INTO v_purchase_id FROM public.licenses
    WHERE token = p_token;
  IF v_purchase_id IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'not_found');
  END IF;
  SELECT * INTO v_purchase FROM public.purchases
    WHERE id = v_purchase_id FOR UPDATE;
  SELECT * INTO v_license FROM public.licenses
    WHERE token = p_token AND purchase_id = v_purchase_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'not_found');
  END IF;
  IF v_purchase.status IS DISTINCT FROM 'completed'
    OR v_purchase.product IS DISTINCT FROM 'ameno-cotas'
    OR v_purchase.entitlement_scope IS DISTINCT FROM 'ameno-cotas-first-paid'
    OR v_purchase.stripe_livemode IS DISTINCT FROM true
    OR v_purchase.amount IS NULL OR v_purchase.amount < 1000
    OR v_purchase.currency IS DISTINCT FROM 'brl'
    OR v_purchase.stripe_payment_intent IS NULL
    OR btrim(v_purchase.stripe_payment_intent) = ''
    OR v_license.product IS DISTINCT FROM 'ameno-cotas'
    OR NOT v_license.active THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'inactive');
  END IF;
  IF v_license.machine_id IS NOT NULL
    AND v_license.machine_id <> p_machine_id THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'machine_mismatch');
  END IF;
  UPDATE public.licenses SET machine_id = p_machine_id,
    machine_bound_at = coalesce(machine_bound_at, v_now),
    last_verified_at = v_now WHERE id = v_license.id;
  RETURN jsonb_build_object('valid', true);
END;
$$;
REVOKE ALL ON FUNCTION public.verify_plugin_license(text,text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_plugin_license(text,text)
  TO service_role;
