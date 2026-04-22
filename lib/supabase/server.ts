import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getPublicSupabaseEnv } from "./env";

/**
 * Server Component、Route Handler、Server Actions 內使用。
 * 以 anon 金鑰建 client，受 RLS 約束；若未實作使用者 JWT，行為與未登入存取相同。
 * 不於模組頂層建立實例，便於在無 env 的建置階段仍通過編譯。
 */
export function createServerSupabaseClient(): SupabaseClient {
  const { url, anonKey } = getPublicSupabaseEnv();
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
