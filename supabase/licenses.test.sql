-- Transactional integration test: synthetic data is always rolled back.
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
  v_refunded_purchase uuid;
  v_result jsonb;
  v_count integer;
BEGIN
  v_first := public.fulfill_plugin_purchase(v_session, 'pi_original', 2900, 'brl', 'first@example.invalid', 'ameno-cotas', v_token);
  v_repeat := public.fulfill_plugin_purchase(v_session, 'pi_replay', 3900, 'brl', 'changed@example.invalid', 'ameno-cotas', gen_random_uuid()::text);
  ASSERT v_first = v_repeat, 'duplicate webhook created another license';
  ASSERT (SELECT token = v_token FROM public.licenses WHERE id = v_first), 'retry rotated token';
  ASSERT (SELECT stripe_payment_intent = 'pi_original' AND amount = 2900
    AND customer_email = 'first@example.invalid' AND status = 'completed'
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
  ASSERT has_function_privilege('service_role', 'public.verify_plugin_license(text,text)', 'EXECUTE'), 'service role RPC grant missing';
  ASSERT NOT has_function_privilege('anon', 'public.verify_plugin_license(text,text)', 'EXECUTE'), 'anon RPC access';
  ASSERT NOT has_function_privilege('authenticated', 'public.fulfill_plugin_purchase(text,text,integer,text,text,text,text)', 'EXECUTE'), 'authenticated fulfillment access';
  SELECT count(*) INTO v_count FROM public.purchases WHERE stripe_session_id = v_session;
  ASSERT v_count = 1, 'duplicate purchase';

  -- A legitimate paid event must complete an earlier pending checkout,
  -- replacing its provisional details with the signed Stripe event details.
  INSERT INTO public.purchases
    (stripe_session_id, stripe_payment_intent, amount, currency, customer_email, product, status)
  VALUES (v_pending_session, 'pi_provisional', 1000, 'brl',
    'provisional@example.invalid', 'ameno-cotas', 'pending')
  RETURNING id INTO v_pending_purchase;
  v_pending_license := public.fulfill_plugin_purchase(v_pending_session,
    'pi_paid', 3000, 'brl', 'buyer@example.invalid', 'ameno-cotas', gen_random_uuid()::text);
  ASSERT v_pending_license IS NOT NULL, 'paid pending checkout did not create license';
  ASSERT (SELECT stripe_payment_intent = 'pi_paid' AND amount = 3000
    AND customer_email = 'buyer@example.invalid' AND status = 'completed'
    FROM public.purchases WHERE id = v_pending_purchase),
    'pending checkout was not completed from signed event';
  ASSERT (SELECT purchase_id = v_pending_purchase AND active
    FROM public.licenses WHERE id = v_pending_license),
    'pending checkout license missing or inactive';
  v_repeat := public.fulfill_plugin_purchase(v_pending_session,
    'pi_replay', 3900, 'brl', 'changed@example.invalid', 'ameno-cotas', gen_random_uuid()::text);
  ASSERT v_repeat = v_pending_license, 'paid pending replay changed license';
  ASSERT (SELECT stripe_payment_intent = 'pi_paid' AND amount = 3000
    AND customer_email = 'buyer@example.invalid' AND status = 'completed'
    FROM public.purchases WHERE id = v_pending_purchase),
    'paid pending replay changed authoritative data';

  -- Stripe may replay a paid session after a separate refund or suspension.
  -- Neither the purchase state nor an inactive license may be resurrected.
  UPDATE public.purchases SET status = 'refunded' WHERE stripe_session_id = v_session;
  UPDATE public.licenses SET active = false WHERE id = v_first;
  v_repeat := public.fulfill_plugin_purchase(v_session, 'pi_replay', 3900, 'brl',
    'changed@example.invalid', 'ameno-cotas', gen_random_uuid()::text);
  ASSERT v_repeat = v_first, 'refunded replay changed license id';
  ASSERT (SELECT status = 'refunded' AND stripe_payment_intent = 'pi_original'
    AND amount = 2900 AND customer_email = 'first@example.invalid'
    FROM public.purchases WHERE stripe_session_id = v_session), 'refunded purchase was resurrected';
  ASSERT (SELECT token = v_token AND NOT active FROM public.licenses WHERE id = v_first),
    'refunded replay reactivated or replaced license';

  UPDATE public.purchases SET status = 'suspended' WHERE stripe_session_id = v_session;
  v_repeat := public.fulfill_plugin_purchase(v_session, 'pi_replay', 3900, 'brl',
    'changed@example.invalid', 'ameno-cotas', gen_random_uuid()::text);
  ASSERT v_repeat = v_first, 'suspended replay changed license id';
  ASSERT (SELECT status = 'suspended' FROM public.purchases WHERE stripe_session_id = v_session),
    'suspended purchase was resurrected';
  ASSERT (SELECT token = v_token AND NOT active FROM public.licenses WHERE id = v_first),
    'suspended replay reactivated or replaced license';

  -- If a refund was recorded before fulfillment, a late paid-session event
  -- must not create an active license either.
  INSERT INTO public.purchases (stripe_session_id, status)
    VALUES (v_refunded_session, 'refunded') RETURNING id INTO v_refunded_purchase;
  v_repeat := public.fulfill_plugin_purchase(v_refunded_session, 'pi_late', 2900, 'brl',
    'first@example.invalid', 'ameno-cotas', gen_random_uuid()::text);
  ASSERT v_repeat IS NULL, 'late replay minted a license for refunded purchase';
  ASSERT NOT EXISTS (SELECT 1 FROM public.licenses WHERE purchase_id = v_refunded_purchase),
    'late replay stored a license for refunded purchase';
  ASSERT (SELECT status = 'refunded' FROM public.purchases WHERE id = v_refunded_purchase),
    'late replay changed refunded purchase status';
END;
$$;
ROLLBACK;
SELECT 'license integration checks passed; synthetic data rolled back' AS result;
