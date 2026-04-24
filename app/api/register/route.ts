import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_ADAPTIVE_VERSION, DEFAULT_TOTAL_QUESTIONS } from "@/lib/constants/quiz";
import { sendAdminNewLeadEmail } from "@/lib/notifications/sendAdminNewLeadEmail";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { registerBodySchema } from "@/lib/validations/register";

const DB_TROUBLESHOOTING =
  "請確認已於 Supabase 執行 migration（有 students / parents / test_sessions 等表），且 .env.local 的 NEXT_PUBLIC_SUPABASE_URL 與 SUPABASE_SERVICE_ROLE_KEY 正確、未過期。";

/**
 * 建立學生、家長與測驗工作階段（以 service role 寫入，供註冊表單使用）
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "無法解析 JSON" },
      { status: 400 },
    );
  }

  const parsed = registerBodySchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    let message = first?.message ?? "參數驗證失敗";
    if (
      !message ||
      message === "Required" ||
      /^required$/i.test(String(message).trim())
    ) {
      message = "請完成所有必填欄位，並確認欄位格式正確。";
    }
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
  const d = parsed.data;

  try {
    const supabase = createAdminSupabaseClient();

    const { data: student, error: eStudent } = await supabase
      .from("students")
      .insert({
        name: d.studentName,
        school: d.school ?? null,
        grade: d.grade || "小六",
        referrer_name: d.referrerName ?? null,
        referrer_contact: d.referrerContact ?? null,
      })
      .select("id")
      .single();

    if (eStudent || !student) {
      console.error("register: student insert", eStudent);
      return NextResponse.json(
        {
          success: false,
          message: `建立學生資料失敗。${DB_TROUBLESHOOTING}`,
        },
        { status: 500 },
      );
    }

    const { data: parent, error: eParent } = await supabase
      .from("parents")
      .insert({
        name: d.parentName,
        phone: d.parentPhone,
        line_id: d.lineId,
        email: d.email,
        consent: d.agreePrivacy,
        marketing_opt_in: d.marketingOptIn,
      })
      .select("id")
      .single();

    if (eParent || !parent) {
      console.error("register: parent insert", eParent);
      return NextResponse.json(
        {
          success: false,
          message: `建立家長資料失敗。${DB_TROUBLESHOOTING}`,
        },
        { status: 500 },
      );
    }

    const { data: session, error: eSession } = await supabase
      .from("test_sessions")
      .insert({
        student_id: student.id,
        parent_id: parent.id,
        status: "pending",
        total_questions: DEFAULT_TOTAL_QUESTIONS,
        adaptive_version: DEFAULT_ADAPTIVE_VERSION,
      })
      .select("id")
      .single();

    if (eSession || !session) {
      console.error("register: session insert", eSession);
      return NextResponse.json(
        {
          success: false,
          message: `建立測驗工作階段失敗。${DB_TROUBLESHOOTING}`,
        },
        { status: 500 },
      );
    }

    await sendAdminNewLeadEmail({
      sessionId: session.id,
      studentName: d.studentName,
      school: d.school ?? null,
      parentName: d.parentName,
      parentPhone: d.parentPhone,
      parentEmail: d.email ?? null,
      lineId: d.lineId ?? null,
      referrerName: d.referrerName ?? null,
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      studentId: student.id,
      parentId: parent.id,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "伺服器錯誤";
    if (msg.includes("SUPABASE") || msg.includes("環境變數")) {
      return NextResponse.json(
        { success: false, message: "伺服器未正確設定 Supabase 金鑰" },
        { status: 500 },
      );
    }
    console.error("register: unexpected", err);
    return NextResponse.json(
      { success: false, message: "系統暫時無法處理請求" },
      { status: 500 },
    );
  }
}
