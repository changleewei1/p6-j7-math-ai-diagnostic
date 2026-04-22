/**
 * 客戶端轉換追蹤：呼叫 `POST /api/track`；失敗不拋錯、不影響主流程。
 * 專用於瀏覽器；僅在 `typeof window !== "undefined"` 時實際送出。
 */
export function trackEvent(
  sessionId: string | null | undefined,
  eventType: string,
  meta: Record<string, unknown> = {},
): void {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify({
    sessionId: sessionId ?? null,
    eventType,
    meta,
  });
  try {
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // silent
    });
  } catch {
    // silent
  }
}
