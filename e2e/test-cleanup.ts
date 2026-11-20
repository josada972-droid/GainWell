import { createClient } from "@supabase/supabase-js";

/**
 * Deletes the accounts a gated E2E run created (every spec derives its
 * addresses from one `stamp`), so the local database does not accumulate
 * test users across runs — the same hygiene the Vitest RLS suites follow.
 * Needs SUPABASE_E2E_SECRET_KEY; without it the run simply skips cleanup.
 */
export async function cleanupRunUsers(stamp: string): Promise<void> {
  const url = process.env.SUPABASE_E2E_URL;
  const secret = process.env.SUPABASE_E2E_SECRET_KEY;
  if (!url || !secret) return;
  const admin = createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const suffix = `-${stamp}@example.com`;
  // Page through (the admin list API caps page size), delete by matching id.
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw error;
    const users = data?.users ?? [];
    for (const user of users) {
      if (user.email?.endsWith(suffix)) {
        const { error: deleteError } = await admin.auth.admin.deleteUser(
          user.id,
        );
        if (deleteError) throw deleteError;
      }
    }
    if (users.length < 200) return;
  }
}
