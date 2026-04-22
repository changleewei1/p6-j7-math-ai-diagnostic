/**
 * Admin gate：以 HMAC-SHA256 產生 cookie 值（與 Edge / Node 的 Web Crypto 相容）
 */
const MSG = "p6j7-math-admin-cookie-v1";

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function getAdminCookieToken(secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(MSG));
  return bufToHex(sig);
}

export async function verifyAdminCookie(
  secret: string | undefined,
  cookieValue: string | undefined,
): Promise<boolean> {
  if (!secret || !cookieValue) return false;
  const expected = await getAdminCookieToken(secret);
  if (expected.length !== cookieValue.length) return false;
  let ok = true;
  for (let i = 0; i < expected.length; i++) {
    ok &&= expected[i] === cookieValue[i];
  }
  return ok;
}
