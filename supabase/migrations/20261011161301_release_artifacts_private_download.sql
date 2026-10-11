-- L4-a: metadata is server-only; ZIP bytes live in private Supabase Storage.
-- Apply only after the existing schema.sql, licenses.sql and auth.sql bootstrap.
-- No release is published and no object is uploaded by this migration.
CREATE TABLE public.release_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product text NOT NULL CHECK (product = 'ameno-cotas'),
  -- Existing purchases have product but no commercial-version entitlement.
  -- Only the first paid scope is sellable until purchase schema is versioned.
  entitlement_scope text NOT NULL DEFAULT 'ameno-cotas-first-paid'
    CHECK (entitlement_scope = 'ameno-cotas-first-paid'),
  release_version text NOT NULL CHECK (release_version ~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$'),
  max_year integer NOT NULL CHECK (max_year = 2026),
  bucket text NOT NULL DEFAULT 'ameno-private-releases'
    CHECK (bucket = 'ameno-private-releases'),
  object_path text NOT NULL UNIQUE
    CHECK (object_path ~ '^[A-Za-z0-9][A-Za-z0-9._/-]{0,239}\.zip$'
      AND object_path !~ '(^|/)\.\.(/|$)' AND object_path !~ '//'),
  sha256 text NOT NULL CHECK (sha256 ~ '^[0-9a-f]{64}$'),
  size_bytes bigint NOT NULL CHECK (size_bytes > 0),
  source_commit_sha text NOT NULL CHECK (source_commit_sha ~ '^[0-9a-f]{40}$'),
  status text NOT NULL DEFAULT 'staged'
    CHECK (status IN ('staged', 'published', 'withdrawn')),
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  CONSTRAINT release_published_date_required
    CHECK (status <> 'published' OR published_at IS NOT NULL),
  CONSTRAINT release_product_year_version_unique
    UNIQUE (product, max_year, release_version)
);
CREATE INDEX release_artifacts_available_idx
  ON public.release_artifacts (product, max_year, published_at DESC)
  WHERE status = 'published';
ALTER TABLE public.release_artifacts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.release_artifacts FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.release_artifacts TO service_role;

-- A private bucket is necessary but not sufficient if broad pre-existing
-- storage.objects policies exist. Verify anonymous object access at the host gate.
INSERT INTO storage.buckets (id, name, public)
VALUES ('ameno-private-releases', 'ameno-private-releases', false)
ON CONFLICT (id) DO NOTHING;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets
    WHERE id = 'ameno-private-releases' AND public = false
  ) THEN
    RAISE EXCEPTION 'Ameno release bucket exists but is public or missing';
  END IF;
END;
$$;
