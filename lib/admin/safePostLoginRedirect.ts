/**
 * 管理後台登入成功後的導向路徑（僅允許站內 /admin 開頭，防 open redirect）
 */
export function safeAdminPostLoginRedirect(redirectParam: string | null | undefined): string {
  if (redirectParam == null || typeof redirectParam !== "string") return "/admin";
  const t = redirectParam.trim();
  if (t.length === 0) return "/admin";
  if (t.startsWith("http://") || t.startsWith("https://")) return "/admin";
  if (t.startsWith("//")) return "/admin";
  if (!t.startsWith("/")) return "/admin";
  // 只允許 /admin 或 /admin/…，避免 /adminEvil 等偽路徑
  if (t !== "/admin" && !t.startsWith("/admin/")) return "/admin";
  if (t.includes("://")) return "/admin";
  if (t.includes("..")) return "/admin";
  return t;
}
