/**
 * 產生對外可分享的測驗報告 URL。
 * 優先使用 `NEXT_PUBLIC_APP_URL`；未設定時在瀏覽器端以 `window.location.origin` 為後援（見 `getReportAbsoluteUrl`）。
 */
export function getReportPublicBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (fromEnv) {
    return fromEnv;
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "";
}

export function getReportPath(sessionId: string): string {
  return `/report/${encodeURIComponent(sessionId)}`;
}

/**
 * 含網域的完整報告連結（分享、剪貼簿、開新分頁）。
 * 1. 若有 `NEXT_PUBLIC_APP_URL` 則使用（正式站公告網域與管理後臺子網域可不同，請盡量設定）。
 * 2. 否則在瀏覽器以 `new URL(path, window.location.origin)` 組出絕對網址（開發用）。
 * 3. 僅在 SSR 且無上兩者時回傳相對路徑 `/report/...`。
 */
export function getReportAbsoluteUrl(sessionId: string): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (fromEnv) {
    return new URL(getReportPath(sessionId), `${fromEnv}/`).toString();
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return new URL(getReportPath(sessionId), window.location.origin).toString();
  }
  return getReportPath(sessionId);
}
