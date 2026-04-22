import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServiceRoleEnv } from "./env";

/**
 * 僅在 server、管理者 API、**離線匯入腳本** 使用；繞過 RLS。
 * 永遠不要 import 到 Client Component 或傳到瀏覽器。
 * 在函式內才 throw 與建立 client，避免建置階段誤觸。
 */
export function createAdminSupabaseClient(): SupabaseClient {
  const { url, serviceRoleKey } = getServiceRoleEnv();
  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
