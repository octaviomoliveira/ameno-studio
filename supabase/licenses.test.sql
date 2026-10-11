-- Transactional integration test after schema.sql, licenses.sql, auth.sql,
-- and migrations/20261011162549_l4_d1a_payment_event_guards.sql.
-- Synthetic data is always rolled back.
BEGIN;
DO $$
DECLARE
  v_token text := gen_random_uuid()::text;
  v_unknown text := gen_random_uuid()::text;
  v_session text := 'codex_license_test_' || gen_random_uuid()::text;
  v_pending_session text := 'codex_pending_test_' || gen_random_uuid()::text;
  v_refunded_session text := 'codex_refunded_test_' || gen_random_uuid()::text;
  v_first uuid;
  v_repeat uuid;
  v_pending_purchase uuid;
  v_pending_license uuid;
  v_user_a uuid := gen_random_uuid();
  v_user_b uuid := gen_random_uuid();
  v_user_a_email text := 'provisional+' || gen_random_uuid()::text || '@example.invalid';
  v_user_b_email text := 'buyer+' || gen_random_uuid()::text || '@example.invalid';
  v_refunded_purchase uuid;
  v_paid_marker timestamptz;
  v_result jsonb;
  v_count integer;
BEGIN
  v_first := public.fulfill_plugin_purchase(v_session, 'pi_original', 2900, 'brl', 'first@example.invalid', 'ameno-cotas', v_token);
  SELECT paid_confirmed_at INTO v_paid_marker FROM public.purchases
    WHERE stripe_session_id = v_session;
  ASSERT v_paid_marker IS NOT NULL, 'paid purchase lacks finalization marker';
  v_repeat := public.fulfill_plugin_purchase(v_session, 'pi_original', 3900, 'brl', 'changed@example.invalid', 'ameno-cotas', gen_random_uuid()::text);
  ASSERT v_first = v_repeat, 'duplicate webhook created another license';
  ASSERT (SELECT token = v_token FROM public.licenses WHERE id = v_first), 'retry rotated token';
  ASSERT (SELECT stripe_payment_intent = 'pi_original' AND amount = 2900
    AND customer_email = 'first@example.invalid' AND status = 'completed'
    AND paid_confirmed_at = v_paid_marker
    FROM public.purchases WHERE stripe_session_id = v_session), 'retry changed purchase identity';
  ASSERT public.verify_plugin_license(v_token, 'pc-a') = '{"valid":true}'::jsonb, 'first activation failed';
  ASSERT public.verify_plugin_license(v_token, 'pc-a') = '{"valid":true}'::jsonb, 'same machine rejected';
  ASSERT public.verify_plugin_license(v_token, 'pc-b')->>'reason' = 'machine_mismatch', 'second machine allowed';
  ASSERT (SELECT machine_id = 'pc-a' FROM public.licenses WHERE id = v_first), 'binding overwritten';
  UPDATE public.licenses SET active = false WHERE id = v_first;
  ASSERT public.verify_plugin_license(v_token, 'pc-a')->>'reason' = 'inactive', 'inactive license allowed';
  UPDATE public.licenses SET active = true WHERE id = v_first;
  FOR i IN 5..10 LOOP
    ASSERT public.verify_plugin_license(v_token, 'pc-a') = '{"valid":true}'::jsonb, 'rate limit too early';
  END LOOP;
  ASSERT public.verify_plugin_license(v_token, 'pc-a')->>'reason' = 'rate_limited', '11th request allowed';
  UPDATE public.license_verify_limits SET attempts = ARRAY[clock_timestamp() - interval '61 seconds']
    WHERE token_hash = encode(sha256(convert_to(v_token,'UTF8')),'hex');
  ASSERT public.verify_plugin_license(v_token, 'pc-a') = '{"valid":true}'::jsonb, 'rate limit did not expire';
  FOR i IN 1..10 LOOP
    ASSERT public.verify_plugin_license(v_unknown, 'pc-a')->>'reason' = 'not_found', 'unknown token accepted';
  END LOOP;
  ASSERT public.verify_plugin_license(v_unknown, 'pc-a')->>'reason' = 'rate_limited', 'unknown token not limited';
  ASSERT public.verify_plugin_license(NULL, 'pc-a')->>'reason' = 'invalid_request', 'null token accepted';
  ASSERT NOT has_table_privilege('anon', 'public.licenses', 'SELECT'), 'public license access';
  ASSERT has_table_privilege('service_role', 'public.licenses', 'SELECT,INSERT,UPDATE'), 'service role table grants missing';
  ASSERT has_column_privilege('service_role', 'auth.users', 'id', 'SELECT')
    AND has_column_privilege('service_role', 'auth.users', 'email', 'SELECT')
    AND has_column_privilege('service_role', 'auth.users', 'email_confirmed_at', 'SELECT'),
    'service role cannot check verified auth email';
  ASSERT has_function_privilege('service_role', 'public.verify_plugin_license(text,text)', 'EXECUTE'), 'service role RPC grant missing';
  ASSERT NOT has_function_privilege('anon', 'public.verify_plugin_license(text,text)', 'EXECUTE'), 'anon RPC access';
  ASSERT NOT has_function_privilege('authenticated', 'public.fulfill_plugin_purchase(text,text,integer,text,text,text,text)', 'EXECUTE'), 'authenticated fulfillment access';
  SELECT count(*) INTO v_count FROM public.purchases WHERE stripe_session_id = v_session;
  ASSERT v_count = 1, 'duplicate purchase';

  -- A legitimate paid event must complete an earlier pending checkout,
  -- replacing its provisional details and discarding any stale account owner.
  -- auth.sql must be applied before this test script.
  INSERT INTO auth.users (instance_id, id, aud, role, email, email_confirmed_at,
    created_at, updated_at)
  VALUES
    ('00000000-0000-0000-0000-000000000000', v_user_a,
      'authenticated', 'authenticated', v_user_a_email, clock_timestamp(),
      clock_timestamp(), clock_timestamp()),
    ('00000000-0000-0000-0000-000000000000', v_user_b,
      'authenticated', 'authenticated', v_user_b_email, clock_timestamp(),
      clock_timestamp(), clock_timestamp());
  INSERT INTO public.purchases
    (stripe_session_id, stripe_payment_intent, amount, currency, customer_email, product, status)
  VALUES (v_pending_session, 'pi_provisional', 1000, 'brl',
    v_user_a_email, 'ameno-cotas', 'pending')
  RETURNING id INTO v_pending_purchase;
  ASSERT public.claim_purchases_for_user(v_user_a, v_user_a_email) = 0,
    'pending checkout was claimable before payment';
  -- Simulate an older, already-claimed pending row in the deployed database.
  UPDATE public.purchases SET user_id = v_user_a, claimed_at = clock_timestamp()
  WHERE id = v_pending_purchase;
  v_pending_license := public.fulfill_plugin_purchase(v_pending_session,
    'pi_paid', 3000, 'brl', v_user_b_email, 'ameno-cotas', gen_random_uuid()::text);
  ASSERT v_pending_license IS NOT NULL, 'paid pending checkout did not create license';
  ASSERT (SELECT stripe_payment_intent = 'pi_paid' AND amount = 3000
    AND customer_email = v_user_b_email AND status = 'completed'
    AND user_id IS NULL AND claimed_at IS NULL
    FROM public.purchases WHERE id = v_pending_purchase),
    'pending checkout retained provisional data or owner';
  ASSERT (SELECT purchase_id = v_pending_purchase AND active
    FROM public.licenses WHERE id = v_pending_license),
    'pending checkout license missing or inactive';
  ASSERT NOT public.attach_purchase_to_user(v_pending_session, v_user_a, v_user_b_email),
    'buyer email could be attached to the wrong account';
  ASSERT public.attach_purchase_to_user(v_pending_session, v_user_b, v_user_b_email),
    'verified buyer could not claim paid checkout';
  ASSERT (SELECT user_id = v_user_b FROM public.purchases WHERE id = v_pending_purchase),
    'paid checkout not owned by verified buyer';
  v_repeat := public.fulfill_plugin_purchase(v_pending_session,
    'pi_paid', 3900, 'brl', 'changed@example.invalid', 'ameno-cotas', gen_random_uuid()::text);
  ASSERT v_repeat = v_pending_license, 'paid pending replay changed license';
  ASSERT (SELECT stripe_payment_intent = 'pi_paid' AND amount = 3000
    AND customer_email = v_user_b_email AND status = 'completed'
    AND user_id = v_user_b
    FROM public.purchases WHERE id = v_pending_purchase),
    'paid pending replay changed authoritative data';

  -- Stripe may replay a paid session after a separate refund or suspension.
  -- Neither the purchase state nor an inactive license may be resurrected.
  UPDATE public.purchases SET status = 'refunded' WHERE stripe_session_id = v_session;
  UPDATE public.licenses SET active = false WHERE id = v_first;
  v_repeat := public.fulfill_plugin_purchase(v_session, 'pi_original', 3900, 'brl',
    'changed@example.invalid', 'ameno-cotas', gen_random_uuid()::text);
  ASSERT v_repeat = v_first, 'refunded replay changed license id';
  ASSERT (SELECT status = 'refunded' AND stripe_payment_intent = 'pi_original'
    AND amount = 2900 AND customer_email = 'first@example.invalid'
    FROM public.purchases WHERE stripe_session_id = v_session), 'refunded purchase was resurrected';
  ASSERT (SELECT token = v_token AND NOT active FROM public.licenses WHERE id = v_first),
    'refunded replay reactivated or replaced license';

  UPDATE public.purchases SET status = 'suspended' WHERE stripe_session_id = v_session;
  v_repeat := public.fulfill_plugin_purchase(v_session, 'pi_original', 3900, 'brl',
    'changed@example.invalid', 'ameno-cotas', gen_random_uuid()::text);
  ASSERT v_repeat = v_first, 'suspended replay changed license id';
  ASSERT (SELECT status = 'suspended' FROM public.purchases WHERE stripe_session_id = v_session),
    'suspended purchase was resurrected';
  ASSERT (SELECT token = v_token AND NOT active FROM public.licenses WHERE id = v_first),
    'suspended replay reactivated or replaced license';

  -- A pre-existing terminal row without a d1a block or licensed/paid marker
  -- is of unknown provenance: refuse the paid event pending reconciliation.
  INSERT INTO public.purchases (stripe_session_id, status)
    VALUES (v_refunded_session, 'refunded') RETURNING id INTO v_refunded_purchase;
  BEGIN
    PERFORM public.fulfill_plugin_purchase(v_refunded_session, 'pi_late', 2900, 'brl',
      'first@example.invalid', 'ameno-cotas', gen_random_uuid()::text);
    RAISE EXCEPTION 'expected unknown-terminal refusal';
  EXCEPTION WHEN others THEN
    IF SQLERRM <> 'Unconfirmed terminal purchase requires manual reconciliation' THEN
      RAISE;
    END IF;
  END;
  ASSERT NOT EXISTS (SELECT 1 FROM public.licenses WHERE purchase_id = v_refunded_purchase),
    'unknown terminal purchase stored a license';
  ASSERT (SELECT status = 'refunded' AND stripe_payment_intent IS NULL
    AND paid_confirmed_at IS NULL FROM public.purchases WHERE id = v_refunded_purchase),
    'unknown terminal purchase absorbed paid metadata';
END;
$$;
-- Exercising invoker rights catches a missing auth.users grant that tests
-- running only as postgres would conceal.
SET LOCAL ROLE service_role;
DO $$
BEGIN
  BEGIN
    PERFORM public.claim_purchases_for_user(
      '00000000-0000-0000-0000-000000000001'::uuid, 'absent@example.invalid');
    RAISE EXCEPTION 'Expected verified-user refusal';
  EXCEPTION WHEN others THEN
    IF SQLERRM <> 'Verified user email required' THEN
      RAISE EXCEPTION 'Service-role claim check failed: %', SQLERRM;
    END IF;
  END;
  ASSERT NOT public.attach_purchase_to_user('absent_session',
    '00000000-0000-0000-0000-000000000001'::uuid, 'absent@example.invalid'),
    'service-role attach accepted absent user';
END;
$$;
RESET ROLE;
ROLLBACK;
SELECT 'license integration checks passed; synthetic data rolled back' AS result;
