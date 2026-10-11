-- Run in an isolated PostgreSQL/Supabase database after schema.sql,
-- licenses.sql, auth.sql, the artifact migration, d1a, then d1b.
-- This file intentionally rolls back every fixture. NOT executed on prod.
BEGIN;
DO $$
DECLARE
  suffix text := substr(replace(gen_random_uuid()::text, '-', ''), 1, 16);
  live_session text;
  live_pi text;
  paid_event text;
  partial_event text;
  full_event text;
  v_token text := gen_random_uuid()::text;
  license_id uuid;
  repeat_id uuid;
  purchase_id uuid;
  legacy_session text;
  legacy_pi text;
  legacy_token text := gen_random_uuid()::text;
  pre_pi text;
  pre_session text;
BEGIN
  live_session := 'cs_live_' || suffix;
  live_pi := 'pi_' || suffix;
  paid_event := 'evt_paid' || suffix;
  partial_event := 'evt_partial' || suffix;
  full_event := 'evt_full' || suffix;
  ASSERT NOT has_function_privilege('service_role',
    'public.fulfill_plugin_purchase(text,text,integer,text,text,text,text)',
    'EXECUTE'), 'legacy fulfillment remains callable by service_role';
  ASSERT has_function_privilege('service_role',
    'public.fulfill_plugin_purchase_v2(text,text,text,text,integer,text,text,text,text,boolean,text)',
    'EXECUTE'), 'v2 not callable by service_role';
  ASSERT NOT has_function_privilege('anon',
    'public.fulfill_plugin_purchase_v2(text,text,text,text,integer,text,text,text,text,boolean,text)',
    'EXECUTE'), 'anon can mint paid entitlement';

  license_id := public.fulfill_plugin_purchase_v2(paid_event,
    'checkout.session.completed', live_session, live_pi,
    3000, 'brl', 'buyer@example.invalid', 'ameno-cotas',
    'ameno-cotas-first-paid', true, v_token);
  ASSERT license_id IS NOT NULL, 'live paid event did not create license';
  ASSERT (SELECT status = 'completed'
    AND entitlement_scope = 'ameno-cotas-first-paid'
    AND stripe_livemode = true FROM public.purchases
    WHERE stripe_session_id = live_session), 'paid commercial markers missing';
  ASSERT (public.verify_plugin_license(v_token, 'machine-a')->>'valid')::boolean,
    'eligible live license did not verify';
  repeat_id := public.fulfill_plugin_purchase_v2(paid_event,
    'checkout.session.completed', live_session, live_pi,
    3000, 'brl', 'buyer@example.invalid', 'ameno-cotas',
    'ameno-cotas-first-paid', true, gen_random_uuid()::text);
  ASSERT repeat_id = license_id, 'same event changed license identity';
  ASSERT (SELECT count(*) = 1 FROM public.licenses l
    JOIN public.purchases p ON p.id = l.purchase_id
    WHERE p.stripe_payment_intent = live_pi), 'duplicate paid event minted token';

  BEGIN
    PERFORM public.fulfill_plugin_purchase_v2(paid_event,
      'checkout.session.completed', live_session, live_pi,
      4000, 'brl', 'buyer@example.invalid', 'ameno-cotas',
      'ameno-cotas-first-paid', true, gen_random_uuid()::text);
    RAISE EXCEPTION 'paid event collision was accepted';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM <> 'Stripe event identity collision' THEN RAISE; END IF;
  END;
  BEGIN
    PERFORM public.fulfill_plugin_purchase_v2('evt_test' || suffix,
      'checkout.session.completed', live_session, live_pi,
      3000, 'brl', 'buyer@example.invalid', 'ameno-cotas',
      'ameno-cotas-first-paid', false, gen_random_uuid()::text);
    RAISE EXCEPTION 'test-mode entitlement was accepted';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM <> 'Invalid paid event' THEN RAISE; END IF;
  END;

  ASSERT public.record_plugin_payment_block(partial_event, 'charge.refunded',
    'ch_' || suffix, live_session, live_pi, 'partial_refund', true) = 'blocked',
    'partial refund was not recorded';
  ASSERT (SELECT status = 'suspended' FROM public.purchases
    WHERE stripe_session_id = live_session), 'partial refund did not suspend';
  ASSERT NOT (public.verify_plugin_license(v_token, 'machine-a')->>'valid')::boolean,
    'partial refund did not revoke activation';
  repeat_id := public.fulfill_plugin_purchase_v2(paid_event,
    'checkout.session.completed', live_session, live_pi,
    3000, 'brl', 'buyer@example.invalid', 'ameno-cotas',
    'ameno-cotas-first-paid', true, gen_random_uuid()::text);
  ASSERT repeat_id IS NULL,
    'paid replay after partial refund signaled an active entitlement';
  ASSERT (SELECT l.id = license_id AND l.token = v_token
    FROM public.licenses l WHERE l.id = license_id),
    'paid replay changed stored revoked license';
  ASSERT (SELECT status = 'suspended' FROM public.purchases
    WHERE stripe_session_id = live_session), 'paid replay reactivated partial refund';
  ASSERT public.record_plugin_payment_block(full_event, 'charge.refunded',
    'ch_' || suffix, live_session, live_pi, 'full_refund', true) = 'blocked',
    'full refund not recorded';
  ASSERT public.record_plugin_payment_block(partial_event, 'charge.refunded',
    'ch_' || suffix, live_session, live_pi, 'partial_refund', true) = 'duplicate_event',
    'partial event replay was not idempotent';
  ASSERT (SELECT status = 'refunded' FROM public.purchases
    WHERE stripe_session_id = live_session), 'partial replay downgraded full refund';

  pre_pi := 'pi_pre' || suffix;
  pre_session := 'cs_live_pre' || suffix;
  PERFORM public.record_plugin_payment_block('evt_pre' || suffix,
    'charge.dispute.created', 'du_' || suffix,
    pre_session, pre_pi, 'dispute', true);
  ASSERT public.fulfill_plugin_purchase_v2('evt_late' || suffix,
    'checkout.session.async_payment_succeeded', pre_session, pre_pi,
    3000, 'brl', 'late@example.invalid', 'ameno-cotas',
    'ameno-cotas-first-paid', true, gen_random_uuid()::text) IS NULL,
    'dispute-before-payment created a license';
  ASSERT (SELECT status = 'suspended' FROM public.purchases
    WHERE stripe_payment_intent = pre_pi),
    'dispute-before-payment was forgotten';

  legacy_session := 'cs_live_legacy' || suffix;
  legacy_pi := 'pi_legacy' || suffix;
  INSERT INTO public.purchases (stripe_session_id, stripe_payment_intent,
    amount, currency, customer_email, product, status, paid_confirmed_at)
  VALUES (legacy_session, legacy_pi, 3000, 'brl', 'legacy@example.invalid',
    'ameno-cotas', 'completed', clock_timestamp())
  RETURNING id INTO purchase_id;
  INSERT INTO public.licenses (token, purchase_id, product)
    VALUES (legacy_token, purchase_id, 'ameno-cotas');
  ASSERT NOT (public.verify_plugin_license(legacy_token, 'machine-a')->>'valid')::boolean,
    'legacy token received paid-first access';
  BEGIN
    PERFORM public.fulfill_plugin_purchase_v2('evt_legacy' || suffix,
      'checkout.session.completed', legacy_session, legacy_pi,
      3000, 'brl', 'legacy@example.invalid', 'ameno-cotas',
      'ameno-cotas-first-paid', true, gen_random_uuid()::text);
    RAISE EXCEPTION 'legacy purchase was upgraded by replay';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM <> 'Finalized purchase identity mismatch' THEN RAISE; END IF;
  END;
END;
$$;
-- Exercise the invoker role, not only postgres: receipts deliberately have
-- no UPDATE grant; duplicate reads rely on the PI lock and event PK.
SET LOCAL ROLE service_role;
DO $$
DECLARE
  suffix text := substr(replace(gen_random_uuid()::text, '-', ''), 1, 16);
  session_id text;
  pi_id text;
  event_id text;
  license_id uuid;
BEGIN
  ASSERT NOT has_table_privilege('service_role',
    'public.stripe_event_receipts', 'UPDATE'),
    'receipt table unexpectedly mutable by service_role';
  session_id := 'cs_live_role' || suffix;
  pi_id := 'pi_role' || suffix;
  event_id := 'evt_role' || suffix;
  ASSERT public.record_plugin_payment_block('evt_block' || suffix,
    'charge.refunded', 'ch_role' || suffix, 'cs_live_block' || suffix,
    'pi_block' || suffix, 'partial_refund', true) = 'blocked',
    'service_role failed to record block';
  ASSERT public.record_plugin_payment_block('evt_block' || suffix,
    'charge.refunded', 'ch_role' || suffix, 'cs_live_block' || suffix,
    'pi_block' || suffix, 'partial_refund', true) = 'duplicate_event',
    'service_role could not replay block without UPDATE grant';
  license_id := public.fulfill_plugin_purchase_v2(event_id,
    'checkout.session.completed', session_id, pi_id,
    3000, 'brl', 'role@example.invalid', 'ameno-cotas',
    'ameno-cotas-first-paid', true, gen_random_uuid()::text);
  ASSERT license_id IS NOT NULL, 'service_role failed paid RPC';
  ASSERT public.fulfill_plugin_purchase_v2(event_id,
    'checkout.session.completed', session_id, pi_id,
    3000, 'brl', 'role@example.invalid', 'ameno-cotas',
    'ameno-cotas-first-paid', true, gen_random_uuid()::text) = license_id,
    'service_role could not replay paid receipt without UPDATE grant';
END;
$$;
RESET ROLE;
ROLLBACK;
