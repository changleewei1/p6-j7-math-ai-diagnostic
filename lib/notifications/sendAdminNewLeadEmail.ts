import { Resend } from "resend";

export type AdminNewLeadEmailPayload = {
  sessionId: string;
  studentName: string;
  school: string | null;
  parentName: string;
  parentPhone: string;
  parentEmail: string | null;
  lineId: string | null;
  referrerName: string | null;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function displayOrDash(v: string | null | undefined): string {
  if (v == null) return "未填寫";
  const t = String(v).trim();
  return t.length > 0 ? t : "未填寫";
}

/**
 * 網站公開根網址（用於 Email 內絕對連結）。無設定時嘗試 VERCEL_URL。
 */
function getPublicAppBase(): string {
  const u = (process.env.NEXT_PUBLIC_APP_URL ?? "").trim().replace(/\/$/, "");
  if (u) return u;
  const v = (process.env.VERCEL_URL ?? "").trim().replace(/\/$/, "");
  if (v) return `https://${v}`;
  return "";
}

function buildHtml(payload: AdminNewLeadEmailPayload, adminViewUrl: string | null, telHref: string | null): string {
  const school = displayOrDash(payload.school);
  const email = displayOrDash(payload.parentEmail);
  const line = displayOrDash(payload.lineId);
  const referrer = displayOrDash(payload.referrerName);

  const btnPrimary =
    "display:inline-block;padding:12px 20px;background:#059669;color:#ffffff !important;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;";
  const btnSecondary =
    "display:inline-block;padding:12px 20px;background:#0f172a;color:#ffffff !important;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;";

  const viewBlock = adminViewUrl
    ? `<p style="margin:20px 0 8px 0;"><a href="${escapeHtml(adminViewUrl)}" style="${btnPrimary}">後台查看測驗</a></p>`
    : `<p style="color:#64748b;font-size:14px;">（尚未設定 <code>NEXT_PUBLIC_APP_URL</code>，請至後台「測驗列表」手動搜尋 session。）</p>
       <p style="font-size:13px;color:#334155;">Session ID：<strong>${escapeHtml(payload.sessionId)}</strong></p>`;

  const phoneBlock = telHref
    ? `<p style="margin:16px 0 8px 0;"><a href="${escapeHtml(telHref)}" style="${btnSecondary}">直接撥打家長電話</a></p>`
    : `<p style="color:#64748b;font-size:14px;">家長電話無法產生撥號連結，請手動撥打：${escapeHtml(payload.parentPhone)}</p>`;

  return `
<!DOCTYPE html>
<html lang="zh-Hant">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /></head>
<body style="margin:0;padding:24px;background:#f8fafc;font-family:'Segoe UI',Roboto,'Noto Sans TC',sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
    <tr>
      <td style="padding:28px 24px 8px 24px;">
        <h1 style="margin:0 0 8px 0;font-size:20px;color:#0f172a;">📢 新家長完成測驗通知</h1>
        <p style="margin:0;font-size:15px;line-height:1.6;color:#334155;">
          有家長剛完成「升國一數學學習診斷」，請儘快查看。
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 24px 8px 24px;">
        <h2 style="margin:16px 0 8px 0;font-size:15px;color:#047857;border-bottom:1px solid #d1fae5;padding-bottom:6px;">學生資訊</h2>
        <ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.7;color:#334155;">
          <li>學生姓名：${escapeHtml(payload.studentName)}</li>
          <li>就讀學校：${escapeHtml(school)}</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 24px 8px 24px;">
        <h2 style="margin:16px 0 8px 0;font-size:15px;color:#047857;border-bottom:1px solid #d1fae5;padding-bottom:6px;">家長資訊</h2>
        <ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.7;color:#334155;">
          <li>家長姓名：${escapeHtml(payload.parentName)}</li>
          <li>聯絡電話：${escapeHtml(payload.parentPhone)}</li>
          <li>Email：${escapeHtml(email)}</li>
          <li>LINE ID：${escapeHtml(line)}</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 24px 8px 24px;">
        <h2 style="margin:16px 0 8px 0;font-size:15px;color:#047857;border-bottom:1px solid #d1fae5;padding-bottom:6px;">推薦來源</h2>
        <p style="margin:0;font-size:14px;line-height:1.7;color:#334155;">介紹人：${escapeHtml(referrer)}</p>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 24px 8px 24px;">
        <h2 style="margin:16px 0 8px 0;font-size:15px;color:#047857;border-bottom:1px solid #d1fae5;padding-bottom:6px;">建議動作</h2>
        <ol style="margin:0;padding-left:20px;font-size:14px;line-height:1.7;color:#334155;">
          <li>立即查看測驗報告</li>
          <li>判斷學生程度</li>
          <li>主動聯絡家長</li>
        </ol>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 24px 20px 24px;background:#fffbeb;border-top:1px solid #fde68a;">
        <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">
          <strong>提醒：</strong>建議 24 小時內聯絡，轉換率最高。
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 24px 28px 24px;">
        <p style="margin:0 0 12px 0;font-size:13px;color:#64748b;">Session ID（系統編號）</p>
        <p style="margin:0 0 16px 0;font-family:ui-monospace,monospace;font-size:13px;color:#0f172a;word-break:break-all;">${escapeHtml(payload.sessionId)}</p>
        ${viewBlock}
        ${phoneBlock}
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * 註冊成功後通知管理者。失敗不拋錯、不影響註冊主流程。
 */
export async function sendAdminNewLeadEmail(payload: AdminNewLeadEmailPayload): Promise<void> {
  const apiKey = (process.env.RESEND_API_KEY ?? "").trim();
  if (!apiKey) {
    console.warn("[sendAdminNewLeadEmail] 略過：未設定 RESEND_API_KEY");
    return;
  }

  const to = (process.env.ADMIN_NOTIFY_EMAIL ?? "").trim();
  if (!to) {
    console.warn("[sendAdminNewLeadEmail] 略過：未設定 ADMIN_NOTIFY_EMAIL");
    return;
  }

  const from = (process.env.EMAIL_FROM ?? "").trim();
  if (!from) {
    console.warn("[sendAdminNewLeadEmail] 略過：未設定 EMAIL_FROM");
    return;
  }

  const base = getPublicAppBase();
  const adminViewUrl = base
    ? `${base}/admin-login?redirect=${encodeURIComponent(`/admin/sessions/${payload.sessionId}`)}`
    : null;

  const digits = payload.parentPhone.replace(/\D/g, "");
  const telHref = digits.length > 0 ? `tel:${digits}` : null;

  const subject = "【名貫補習班】新家長完成升國一測驗（需跟進）";
  const html = buildHtml(payload, adminViewUrl, telHref);

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: [to],
      subject,
      html,
    });
    if (error) {
      console.error("[sendAdminNewLeadEmail] Resend 回傳錯誤:", error);
    }
  } catch (err) {
    console.error("[sendAdminNewLeadEmail] 寄信失敗:", err);
  }
}
