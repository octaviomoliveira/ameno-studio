-- Run only against an isolated local Supabase DB after schema.sql,
-- licenses.sql, auth.sql, and the L4-d1a migration. All data rolls back.
BEGIN;
DO $$
DECLARE
  v_session text := 'd1a_email_' || gen_random_uuid()::text;
  v_pi text := 'pi_' || replace(gen_random_uuid()::text, '-', '');
  v_null_token text := gen_random_uuid()::text;
  v_empty_token text := gen_random_uuid()::text;
  v_malformed_token text := gen_random_uuid()::text;
  v_license uuid;
BEGIN
  BEGIN
    PERFORM public.fulfill_plugin_purchase(v_session, v_pi, 3000, 'brl',
      NULL, 'ameno-cotas', v_null_token);
    RAISE EXCEPTION 'expected null-email refusal';
  EXCEPTION WHEN others THEN
    IF SQLERRM <> 'Invalid purchase' THEN RAISE; END IF;
  END;
  BEGIN
    PERFORM public.fulfill_plugin_purchase(v_session, v_pi, 3000, 'brl',
      '', 'ameno-cotas', v_empty_token);
    RAISE EXCEPTION 'expected empty-email refusal';
  EXCEPTION WHEN others THEN
    IF SQLERRM <> 'Invalid purchase' THEN RAISE; END IF;
  END;
  BEGIN
    PERFORM public.fulfill_plugin_purchase(v_session, v_pi, 3000, 'brl',
      'not-an-email', 'ameno-cotas', v_malformed_token);
    RAISE EXCEPTION 'expected malformed-email refusal';
  EXCEPTION WHEN others THEN
    IF SQLERRM <> 'Invalid purchase' THEN RAISE; END IF;
  END;
  ASSERT NOT EXISTS (SELECT 1 FROM public.purchases
    WHERE stripe_session_id = v_session OR stripe_payment_intent = v_pi),
    'invalid email created or sealed purchase';
  ASSERT NOT EXISTS (SELECT 1 FROM public.licenses
    WHERE token IN (v_null_token, v_empty_token, v_malformed_token)),
    'invalid email created license';
  v_license := public.fulfill_plugin_purchase(v_session, v_pi, 3000, 'brl',
    'valid@example.invalid', 'ameno-cotas', gen_random_uuid()::text);
  ASSERT v_license IS NOT NULL, 'valid paid email did not create license';
  ASSERT (SELECT status = 'completed' AND paid_confirmed_at IS NOT NULL
    AND customer_email = 'valid@example.invalid' FROM public.purchases
    WHERE stripe_session_id = v_session), 'valid paid email was not finalized';
END;
$$;

DO $$
DECLARE
  v_session text := 'd1a_session_' || gen_random_uuid()::text;
  v_pi text := 'd1a_pi_' || gen_random_uuid()::text;
  v_charge text := 'd1a_charge_' || gen_random_uuid()::text;
  v_first_event text := 'd1a_event_' || gen_random_uuid()::text;
  v_second_event text := 'd1a_event_' || gen_random_uuid()::text;
  v_full_event text := 'd1a_event_' || gen_random_uuid()::text;
  v_license uuid;
  v_token text := gen_random_uuid()::text;
BEGIN
  ASSERT public.record_plugin_payment_block(v_first_event, 'charge.refunded',
    v_charge, v_session, v_pi, 'partial_refund', false) = 'blocked',
    'refund before purchase not recorded';
  ASSERT public.record_plugin_payment_block(v_first_event, 'charge.refunded',
    v_charge, v_session, v_pi, 'partial_refund', false) = 'duplicate_event',
    'event ID replay was not idempotent';
  ASSERT public.record_plugin_payment_block(v_second_event, 'refund.updated',
    v_charge, v_session, v_pi, 'partial_refund', false) = 'duplicate_fact',
    'different event ID duplicated same business fact';
  ASSERT (SELECT count(*) = 2 FROM public.stripe_event_receipts
    WHERE stripe_payment_intent = v_pi), 'event receipts missing';
  ASSERT (SELECT count(*) = 1 FROM public.payment_blocks
    WHERE stripe_payment_intent = v_pi), 'payment blocker duplicated';

  v_license := public.fulfill_plugin_purchase(v_session, v_pi, 3000, 'brl',
    'buyer@example.invalid', 'ameno-cotas', v_token);
  ASSERT v_license IS NULL, 'late paid event minted license after partial refund';
  ASSERT (SELECT status = 'suspended' FROM public.purchases
    WHERE stripe_session_id = v_session), 'partial refund did not suspend purchase';
  ASSERT NOT EXISTS (SELECT 1 FROM public.licenses WHERE token = v_token),
    'late paid event created token after refund';

  ASSERT public.record_plugin_payment_block(v_full_event, 'charge.refunded',
    v_charge, v_session, v_pi, 'full_refund', false) = 'blocked',
    'full refund event not recorded';
  ASSERT (SELECT status = 'refunded' FROM public.purchases
    WHERE stripe_payment_intent = v_pi), 'full refund did not upgrade status';
  ASSERT public.fulfill_plugin_purchase(v_session, v_pi, 3000, 'brl',
    'buyer@example.invalid', 'ameno-cotas', gen_random_uuid()::text) IS NULL,
    'paid replay minted license after full refund';

  BEGIN
    PERFORM public.record_plugin_payment_block(v_first_event, 'charge.refunded',
      v_charge, v_session, 'different_pi', 'partial_refund', false);
    RAISE EXCEPTION 'expected collision refusal';
  EXCEPTION WHEN others THEN
    IF SQLERRM = 'expected collision refusal' THEN RAISE; END IF;
  END;
  BEGIN
    PERFORM public.fulfill_plugin_purchase(v_session, 'different_pi', 3000,
      'brl', 'buyer@example.invalid', 'ameno-cotas', gen_random_uuid()::text);
    RAISE EXCEPTION 'expected PI/session mismatch refusal';
  EXCEPTION WHEN others THEN
    IF SQLERRM = 'expected PI/session mismatch refusal' THEN RAISE; END IF;
  END;
  ASSERT (SELECT status = 'refunded' AND stripe_payment_intent = v_pi
    FROM public.purchases WHERE stripe_session_id = v_session),
    'identity mismatch mutated purchase';
END;
$$;

DO $$
DECLARE
  v_session text := 'd1a_provisional_' || gen_random_uuid()::text;
  v_provisional_pi text := 'pi_' || replace(gen_random_uuid()::text, '-', '');
  v_paid_pi text := 'pi_' || replace(gen_random_uuid()::text, '-', '');
  v_owner uuid := gen_random_uuid();
  v_owner_email text := 'provisional+' || gen_random_uuid()::text || '@example.invalid';
  v_purchase_id uuid;
  v_paid_confirmed_at timestamptz;
BEGIN
  INSERT INTO auth.users (instance_id, id, aud, role, email,
    email_confirmed_at, created_at, updated_at)
  VALUES ('00000000-0000-0000-0000-000000000000', v_owner,
    'authenticated', 'authenticated', v_owner_email,
    clock_timestamp(), clock_timestamp(), clock_timestamp());
  INSERT INTO public.purchases
    (stripe_session_id, stripe_payment_intent, amount, currency,
     customer_email, product, status, user_id, claimed_at)
  VALUES (v_session, v_provisional_pi, 1000, 'usd',
    v_owner_email, 'provisional-product', 'pending', v_owner, clock_timestamp())
  RETURNING id INTO v_purchase_id;

  PERFORM public.record_plugin_payment_block(
    'd1a_pending_refund_' || gen_random_uuid()::text, 'charge.refunded',
    'ch_pending_partial', v_session, v_paid_pi, 'partial_refund', false);
  ASSERT (SELECT status = 'suspended' AND stripe_payment_intent = v_paid_pi
    AND user_id IS NULL AND claimed_at IS NULL AND paid_confirmed_at IS NULL
    AND blocked_while_pending_at IS NOT NULL
    FROM public.purchases WHERE id = v_purchase_id),
    'refund before paid failed to clear provisional ownership';

  ASSERT public.fulfill_plugin_purchase(v_session, v_paid_pi, 3000, 'brl',
    'paid@example.invalid', 'ameno-cotas', gen_random_uuid()::text) IS NULL,
    'late paid confirmation minted license after refund';
  SELECT paid_confirmed_at INTO v_paid_confirmed_at
    FROM public.purchases WHERE id = v_purchase_id;
  ASSERT v_paid_confirmed_at IS NOT NULL,
    'late paid confirmation did not finalize authoritative metadata';
  ASSERT (SELECT status = 'suspended' AND stripe_session_id = v_session
    AND stripe_payment_intent = v_paid_pi AND amount = 3000
    AND currency = 'brl' AND customer_email = 'paid@example.invalid'
    AND product = 'ameno-cotas' AND user_id IS NULL AND claimed_at IS NULL
    AND blocked_while_pending_at IS NOT NULL
    FROM public.purchases WHERE id = v_purchase_id),
    'suspended purchase retained provisional data after paid event';
  ASSERT NOT EXISTS (SELECT 1 FROM public.licenses WHERE purchase_id = v_purchase_id),
    'late paid event created a license';

  ASSERT public.fulfill_plugin_purchase(v_session, v_paid_pi, 4500, 'brl',
    'different@example.invalid', 'ameno-cotas', gen_random_uuid()::text) IS NULL,
    'divergent paid replay minted license';
  ASSERT (SELECT status = 'suspended' AND amount = 3000
    AND customer_email = 'paid@example.invalid'
    AND paid_confirmed_at = v_paid_confirmed_at
    FROM public.purchases WHERE id = v_purchase_id),
    'divergent paid replay changed finalized metadata';
  BEGIN
    UPDATE public.purchases SET amount = 4500 WHERE id = v_purchase_id;
    RAISE EXCEPTION 'expected immutable-paid-data refusal';
  EXCEPTION WHEN others THEN
    IF SQLERRM <> 'Finalized paid metadata is immutable' THEN RAISE; END IF;
  END;
END;
$$;

DO $$
DECLARE
  v_session text := 'd1a_legacy_terminal_' || gen_random_uuid()::text;
  v_pi text := 'pi_' || replace(gen_random_uuid()::text, '-', '');
  v_purchase_id uuid;
BEGIN
  -- A new refund on an old terminal row must not masquerade as evidence
  -- that this row had been pending when the payment was blocked.
  INSERT INTO public.purchases
    (stripe_session_id, stripe_payment_intent, amount, currency,
     customer_email, product, status)
  VALUES (v_session, v_pi, 1000, 'brl',
    'legacy@example.invalid', 'ameno-cotas', 'refunded')
  RETURNING id INTO v_purchase_id;
  PERFORM public.record_plugin_payment_block(
    'd1a_legacy_refund_' || gen_random_uuid()::text, 'charge.refunded',
    'ch_legacy_terminal', v_session, v_pi, 'partial_refund', false);
  ASSERT (SELECT status = 'refunded' AND paid_confirmed_at IS NULL
    AND blocked_while_pending_at IS NULL FROM public.purchases
    WHERE id = v_purchase_id),
    'new block retroactively marked legacy terminal as pending';
  BEGIN
    UPDATE public.purchases SET blocked_while_pending_at = clock_timestamp()
      WHERE id = v_purchase_id;
    RAISE EXCEPTION 'expected forged-provenance refusal';
  EXCEPTION WHEN others THEN
    IF SQLERRM <> 'Prepaid block marker requires pending transition' THEN
      RAISE;
    END IF;
  END;
  BEGIN
    PERFORM public.fulfill_plugin_purchase(v_session, v_pi, 3000, 'brl',
      'different@example.invalid', 'ameno-cotas', gen_random_uuid()::text);
    RAISE EXCEPTION 'expected legacy-terminal refusal';
  EXCEPTION WHEN others THEN
    IF SQLERRM <> 'Unconfirmed terminal purchase requires manual reconciliation' THEN
      RAISE;
    END IF;
  END;
  ASSERT (SELECT status = 'refunded' AND amount = 1000
    AND customer_email = 'legacy@example.invalid'
    AND paid_confirmed_at IS NULL AND blocked_while_pending_at IS NULL
    FROM public.purchases WHERE id = v_purchase_id),
    'legacy terminal absorbed paid metadata after new refund';
  ASSERT NOT EXISTS (SELECT 1 FROM public.licenses
    WHERE purchase_id = v_purchase_id),
    'legacy terminal minted license after new refund';
END;
$$;

DO $$
DECLARE
  v_session text := 'd1a_paid_' || gen_random_uuid()::text;
  v_pi text := 'd1a_paid_pi_' || gen_random_uuid()::text;
  v_event text := 'd1a_dispute_' || gen_random_uuid()::text;
  v_token text := gen_random_uuid()::text;
  v_license uuid;
BEGIN
  v_license := public.fulfill_plugin_purchase(v_session, v_pi, 3000, 'brl',
    'paid@example.invalid', 'ameno-cotas', v_token);
  ASSERT v_license IS NOT NULL, 'ordinary paid event did not create license';
  ASSERT public.verify_plugin_license(v_token, 'pc-a') = '{"valid":true}'::jsonb,
    'ordinary active license denied';

  ASSERT public.record_plugin_payment_block(v_event, 'charge.dispute.created',
    'du_synthetic', v_session, v_pi, 'dispute', false) = 'blocked',
    'dispute not recorded';
  ASSERT (SELECT status = 'suspended' FROM public.purchases
    WHERE stripe_session_id = v_session), 'dispute did not suspend purchase';
  ASSERT (SELECT NOT active FROM public.licenses WHERE id = v_license),
    'dispute did not revoke license in same transaction';
  ASSERT public.verify_plugin_license(v_token, 'pc-a')->>'reason' = 'inactive',
    'suspended license verified';

  -- Even an inconsistent active flag cannot override the purchase status.
  UPDATE public.licenses SET active = true WHERE id = v_license;
  ASSERT public.verify_plugin_license(v_token, 'pc-a')->>'reason' = 'inactive',
    'verifier ignored suspended purchase';
  UPDATE public.licenses SET active = false WHERE id = v_license;
  ASSERT public.fulfill_plugin_purchase(v_session, v_pi, 3000, 'brl',
    'paid@example.invalid', 'ameno-cotas', gen_random_uuid()::text) = v_license,
    'paid replay changed license ID';
  ASSERT (SELECT status = 'suspended' FROM public.purchases
    WHERE stripe_session_id = v_session), 'paid replay reactivated dispute';

  -- An event must roll back both receipt and block if purchase identity fails.
  BEGIN
    PERFORM public.record_plugin_payment_block('d1a_wrong_' || gen_random_uuid()::text,
      'charge.refunded', 'ch_wrong', 'different_session', v_pi,
      'partial_refund', false);
    RAISE EXCEPTION 'expected wrong-session refusal';
  EXCEPTION WHEN others THEN
    IF SQLERRM = 'expected wrong-session refusal' THEN RAISE; END IF;
  END;
  ASSERT NOT EXISTS (SELECT 1 FROM public.stripe_event_receipts
    WHERE stripe_payment_intent = v_pi AND object_id = 'ch_wrong'),
    'failed operation committed a receipt';
  ASSERT NOT EXISTS (SELECT 1 FROM public.payment_blocks
    WHERE stripe_payment_intent = v_pi AND object_id = 'ch_wrong'),
    'failed operation committed a blocker';
END;
$$;

DO $$
DECLARE
  v_session text := 'd1a_partial_paid_' || gen_random_uuid()::text;
  v_pi text := 'd1a_partial_paid_pi_' || gen_random_uuid()::text;
  v_token text := gen_random_uuid()::text;
  v_license uuid;
BEGIN
  -- d1b must classify an R$ 5 refund on a R$ 30 purchase as partial.
  -- Even R$ 25 remaining exceeds the R$ 10 floor: access is suspended.
  v_license := public.fulfill_plugin_purchase(v_session, v_pi, 3000, 'brl',
    'partial@example.invalid', 'ameno-cotas', v_token);
  ASSERT v_license IS NOT NULL, 'paid purchase missing before partial refund';
  PERFORM public.record_plugin_payment_block(
    'd1a_partial_event_' || gen_random_uuid()::text, 'charge.refunded',
    'ch_partial_500_of_3000', v_session, v_pi, 'partial_refund', false);
  ASSERT (SELECT status = 'suspended' FROM public.purchases
    WHERE stripe_payment_intent = v_pi), 'partial refund above minimum kept access';
  ASSERT (SELECT NOT active FROM public.licenses WHERE id = v_license),
    'partial refund above minimum kept license active';
END;
$$;

DO $$
DECLARE
  v_session text := 'd1a_other_session_' || gen_random_uuid()::text;
  v_pi text := 'd1a_other_pi_' || gen_random_uuid()::text;
  v_event text := 'd1a_other_event_' || gen_random_uuid()::text;
BEGIN
  -- The block route cannot rely on mutable current Checkout metadata to
  -- suppress events. The RPC itself must protect finalized other products.
  INSERT INTO public.purchases (stripe_session_id, stripe_payment_intent,
    amount, currency, customer_email, product, status, paid_confirmed_at)
  VALUES (v_session, v_pi, 3000, 'brl', 'other@example.invalid',
    'other-product', 'completed', clock_timestamp());
  BEGIN
    PERFORM public.record_plugin_payment_block(v_event, 'charge.refunded',
      'ch_other', v_session, v_pi, 'partial_refund', true);
    RAISE EXCEPTION 'expected unrelated-product refusal';
  EXCEPTION WHEN others THEN
    IF SQLERRM = 'expected unrelated-product refusal' THEN RAISE; END IF;
  END;
  ASSERT (SELECT status = 'completed' FROM public.purchases
    WHERE stripe_payment_intent = v_pi),
    'block RPC mutated a finalized unrelated purchase';
  ASSERT NOT EXISTS (SELECT 1 FROM public.stripe_event_receipts
    WHERE event_id = v_event), 'rejected block left a receipt';
  ASSERT NOT EXISTS (SELECT 1 FROM public.payment_blocks
    WHERE stripe_payment_intent = v_pi), 'rejected block left a blocker';
END;
$$;

DO $$
BEGIN
  ASSERT NOT has_table_privilege('anon', 'public.stripe_event_receipts', 'SELECT'),
    'anon can read Stripe receipt';
  ASSERT NOT has_table_privilege('authenticated', 'public.payment_blocks', 'SELECT'),
    'authenticated can read payment blocks';
  ASSERT has_table_privilege('service_role', 'public.stripe_event_receipts', 'SELECT')
    AND has_table_privilege('service_role', 'public.stripe_event_receipts', 'INSERT'),
    'service_role missing receipt grants';
  ASSERT has_table_privilege('service_role', 'public.payment_blocks', 'SELECT')
    AND has_table_privilege('service_role', 'public.payment_blocks', 'INSERT'),
    'service_role missing blocker grants';
  ASSERT has_function_privilege('service_role',
    'public.record_plugin_payment_block(text,text,text,text,text,text,boolean)', 'EXECUTE'),
    'service_role missing block RPC grant';
  ASSERT NOT has_function_privilege('anon',
    'public.record_plugin_payment_block(text,text,text,text,text,text,boolean)', 'EXECUTE'),
    'anon can invoke block RPC';
  ASSERT has_function_privilege('service_role',
    'public.keep_paid_metadata_immutable()', 'EXECUTE')
    AND NOT has_function_privilege('anon',
      'public.keep_paid_metadata_immutable()', 'EXECUTE'),
    'paid metadata trigger function grants are wrong';
END;
$$;

SET LOCAL ROLE service_role;
DO $$
DECLARE
  v_session text := 'd1a_role_' || gen_random_uuid()::text;
  v_pi text := 'd1a_role_pi_' || gen_random_uuid()::text;
BEGIN
  ASSERT public.record_plugin_payment_block(
    'd1a_role_event_' || gen_random_uuid()::text, 'charge.refunded',
    'd1a_role_charge', v_session, v_pi, 'partial_refund', false) = 'blocked',
    'service_role could not invoke block RPC';
  ASSERT public.fulfill_plugin_purchase(v_session, v_pi, 3000, 'brl',
    'paid@example.invalid', 'ameno-cotas', gen_random_uuid()::text) IS NULL,
    'service_role late paid event ignored blocker';
END;
$$;
RESET ROLE;
ROLLBACK;
SELECT 'L4-d1a SQL checks passed; synthetic data rolled back' AS result;
