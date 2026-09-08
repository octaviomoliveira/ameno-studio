-- Transactional integration test: synthetic data is always rolled back.
BEGIN;
DO $$
DECLARE
  v_token text := gen_random_uuid()::text;
  v_unknown text := gen_random_uuid()::text;
  v_session text := 'codex_license_test_' || gen_random_uuid()::text;
  v_first uuid;
  v_repeat uuid;
  v_result jsonb;
  v_count integer;
BEGIN
  v_first := public.fulfill_plugin_purchase(v_session, NULL, 2900, 'brl', NULL, 'ameno-cotas', v_token);
  v_repeat := public.fulfill_plugin_purchase(v_session, NULL, 2900, 'brl', NULL, 'ameno-cotas', gen_random_uuid()::text);
  ASSERT v_first = v_repeat, 'duplicate webhook created another license';
  ASSERT (SELECT token = v_token FROM public.licenses WHERE id = v_first), 'retry rotated token';
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
END;
$$;
ROLLBACK;
SELECT 'license integration checks passed; synthetic data rolled back' AS result;
