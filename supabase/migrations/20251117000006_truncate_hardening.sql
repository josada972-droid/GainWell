-- Stage 7A hardening: close the inherited default TRUNCATE grant (docs §10.4).
--
-- Origin (verified against the live local DB in Stage 7A): Supabase initializes
-- ALTER DEFAULT PRIVILEGES for the `public` schema twice — once for tables
-- created by `postgres` and once for tables created by `supabase_admin` —
-- granting every future table the full set `arwdDxtm` to anon, authenticated
-- and service_role. The `D` (TRUNCATE) bit is what this migration removes.
-- It is not reachable through PostgREST (no TRUNCATE verb, no rpc-accessible
-- function truncates), but a table-wipe privilege enabled for browser roles is
-- not a production posture. REFERENCES (x) and TRIGGER (t) are likewise inert
-- for PostgREST clients and are revoked together.
--
-- Scope: `public` schema tables only.
-- * SELECT/INSERT/UPDATE/DELETE are untouched: RLS policies continue to govern
--   them exactly as before.
-- * service_role keeps its full grants: the privileged server client is the
--   app's write path for OFF caches and entry snapshots, and Supabase-managed
--   functionality runs through it or through platform roles.
-- * Supabase-managed schemas (auth, storage, realtime, …) are not touched.
-- * Migration-owner operations are unaffected: the revocations target only
--   anon and authenticated.
--
-- Future tables: the default privileges that re-grant TRUNCATE on creation
-- are rewritten for both owning roles, so a later migration's new tables do
-- not silently regain the privilege.

revoke truncate, references, trigger
  on all tables in schema public
  from anon, authenticated;

-- The role this repo's migrations run as (CLI db push connects as `postgres`).
alter default privileges in schema public
  revoke truncate, references, trigger on tables from anon, authenticated;

-- supabase_admin creates tables from the dashboard SQL editor and some
-- platform operations. Attempt the same rewrite for it; if the deployment
-- role cannot alter another role's default privileges, report and continue —
-- the revocation above still covers every table that exists today, and the
-- deployment guide's verification step will surface the gap.
do $$
begin
  alter default privileges for role supabase_admin in schema public
    revoke truncate, references, trigger on tables from anon, authenticated;
exception
  when insufficient_privilege then
    raise warning 'GainWell 0006: could not rewrite supabase_admin default privileges; check pg_default_acl after deployment';
end $$;
