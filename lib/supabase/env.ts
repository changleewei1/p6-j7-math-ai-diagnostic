/**
 * 集中讀取 Supabase 相關環境變數
 * 不在此模組 **頂層** throw，避免 Vercel build 匯入鏈在無變數時即失敗；
 * 實際檢查延後至各 create*Client 函式內。
 */

function trimOrEmpty(v: string | undefined): string {
  return (v ?? "").trim();
}

/**
 * 瀏覽器與一般 server route 共用之公開端點（URL + anon key）
 */
export function getPublicSupabaseEnv(): { url: string; anonKey: string } {
  const url = trimOrEmpty(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = trimOrEmpty(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!url) {
    throw new Error(
      "缺少 NEXT_PUBLIC_SUPABASE_URL。請在 .env.local 或部署環境變數中設定專案 URL（例如 https://你的專案.supabase.co）。"
    );
  }
  if (!anonKey) {
    throw new Error(
      "缺少 NEXT_PUBLIC_SUPABASE_ANON_KEY。請到 Supabase Project Settings → API 複製 anon public 金鑰。"
    );
  }
  return { url, anonKey };
}

/**
 * 僅供後台腳本、server-only API、createAdminSupabaseClient 使用。
 * 只驗證專案 URL 與 service role，不要求 anon 金鑰，方便匯入腳本在僅有後端變數時執行。
 * 絕不可傳入前端或 NEXT_PUBLIC_ 的 service 金鑰欄位。
 */
export function getServiceRoleEnv(): {
  url: string;
  serviceRoleKey: string;
} {
  const url = trimOrEmpty(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const serviceRoleKey = trimOrEmpty(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!url) {
    throw new Error(
      "缺少 NEXT_PUBLIC_SUPABASE_URL。匯入腳本與 admin client 需要與專案相同的 URL。"
    );
  }
  if (!serviceRoleKey) {
    throw new Error(
      "缺少 SUPABASE_SERVICE_ROLE_KEY。此金鑰僅能於後端與匯入腳本使用，請勿提交至 Git 或寫入 NEXT_PUBLIC_。"
    );
  }
  return { url, serviceRoleKey };
}
