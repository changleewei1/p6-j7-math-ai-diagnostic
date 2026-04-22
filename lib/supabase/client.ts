import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getPublicSupabaseEnv } from "./env";

/**
 * 僅在瀏覽器或 Client Component 內使用；使用 RLS 與使用者的 JWT（未來接 Auth 時）。
 * 在函式內讀取 env 並建 client，避免模組層級因缺少變數而導致整包 build 失敗。
 */
export function createBrowserSupabaseClient(): SupabaseClient {
  const { url, anonKey } = getPublicSupabaseEnv();
  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}
