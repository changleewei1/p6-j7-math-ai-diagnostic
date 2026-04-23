import { assertAdminOr401 } from "@/lib/admin/assertAdminApi";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { AdminQuestionsListApiResponse } from "@/types/api";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * 後台：題庫列表（供 /admin/questions）
 */
export async function GET() {
  const c = (await cookies()).get("admin_gate")?.value;
  const unauth = await assertAdminOr401(c);
  if (unauth) return unauth;

  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("question_bank")
      .select("id, module, difficulty, prompt, is_active, sort_order")
      .order("module", { ascending: true })
      .order("difficulty", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      console.error("admin/questions list", error);
      return NextResponse.json(
        { success: false, message: "讀取題庫失敗", items: [] } satisfies AdminQuestionsListApiResponse,
        { status: 500 },
      );
    }

    const items = (data ?? []).map((r) => ({
      id: r.id,
      module: r.module,
      difficulty: r.difficulty,
      prompt: r.prompt,
      is_active: r.is_active,
      sort_order: r.sort_order,
    }));

    return NextResponse.json({ success: true, items } satisfies AdminQuestionsListApiResponse);
  } catch (e) {
    console.error("admin/questions", e);
    return NextResponse.json(
      { success: false, message: "系統暫時無法處理請求", items: [] } satisfies AdminQuestionsListApiResponse,
      { status: 500 },
    );
  }
}
