import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 僅刪除單一測驗工作階段與其衍生資料，保留 students / parents。
 * 刪除順序：關聯表 → `test_sessions`（answers / session_questions / recommendations 隨外鍵 CASCADE）
 */
export async function deleteTestSessionOnly(
  supabase: SupabaseClient,
  sessionId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { data: row, error: se } = await supabase
    .from("test_sessions")
    .select("id")
    .eq("id", sessionId)
    .maybeSingle();
  if (se) {
    return { ok: false, message: "讀取測驗工作階段失敗" };
  }
  if (!row) {
    return { ok: false, message: "找不到此筆測驗" };
  }

  const { error: eConv } = await supabase.from("conversion_events").delete().eq("session_id", sessionId);
  if (eConv) {
    return { ok: false, message: "刪除關聯轉換事件失敗" };
  }
  const { error: eBook } = await supabase.from("bookings").update({ session_id: null }).eq("session_id", sessionId);
  if (eBook) {
    return { ok: false, message: "解除預約與測驗關聯失敗" };
  }
  const { error: eLine } = await supabase.from("line_push_logs").delete().eq("session_id", sessionId);
  if (eLine) {
    return { ok: false, message: "刪除測驗相關推播紀錄失敗" };
  }

  const { error: eTs } = await supabase.from("test_sessions").delete().eq("id", sessionId);
  if (eTs) {
    return { ok: false, message: "刪除測驗工作階段失敗" };
  }
  return { ok: true };
}

/**
 * 刪除與本場次學生＋家長**同一配對**之所有測驗、再刪學生與家長列。
 * 僅刪 `student_id`+`parent_id` 同時與本 session 一致之 `test_sessions`；再視是否仍有場次决家長／學生存殘。
 */
export async function fullDeletePairForSession(
  supabase: SupabaseClient,
  sessionId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { data: current, error: se } = await supabase
    .from("test_sessions")
    .select("id, student_id, parent_id")
    .eq("id", sessionId)
    .maybeSingle();
  if (se) {
    return { ok: false, message: "讀取測驗工作階段失敗" };
  }
  if (!current) {
    return { ok: false, message: "找不到此筆測驗" };
  }

  const s = current.student_id;
  const p = current.parent_id;

  const { data: pairRows, error: pe } = await supabase
    .from("test_sessions")
    .select("id")
    .eq("student_id", s)
    .eq("parent_id", p);
  if (pe) {
    return { ok: false, message: "讀取學生／家長關聯場次失敗" };
  }
  const sessionIds = (pairRows ?? []).map((r) => r.id);
  if (sessionIds.length === 0) {
    return { ok: false, message: "無可刪除的關聯場次" };
  }

  const { error: eConv } = await supabase.from("conversion_events").delete().in("session_id", sessionIds);
  if (eConv) {
    return { ok: false, message: "刪除關聯轉換事件失敗" };
  }
  const { error: eBook } = await supabase
    .from("bookings")
    .update({ session_id: null })
    .in("session_id", sessionIds);
  if (eBook) {
    return { ok: false, message: "解除預約與測驗關聯失敗" };
  }
  const { error: eLineS } = await supabase.from("line_push_logs").delete().in("session_id", sessionIds);
  if (eLineS) {
    return { ok: false, message: "刪除測驗相關推播紀錄失敗" };
  }

  const { error: ePair } = await supabase
    .from("test_sessions")
    .delete()
    .eq("student_id", s)
    .eq("parent_id", p);
  if (ePair) {
    return { ok: false, message: "刪除測驗工作階段失敗" };
  }

  const { count: restS, error: cse } = await supabase
    .from("test_sessions")
    .select("id", { count: "exact", head: true })
    .eq("student_id", s);
  if (cse) {
    return { ok: false, message: "檢查學生關聯失敗" };
  }
  if ((restS ?? 0) === 0) {
    const { error: eStu } = await supabase.from("students").delete().eq("id", s);
    if (eStu) {
      return { ok: false, message: `刪除學生失敗：${eStu.message}` };
    }
  }

  const { count: restP, error: cpe } = await supabase
    .from("test_sessions")
    .select("id", { count: "exact", head: true })
    .eq("parent_id", p);
  if (cpe) {
    return { ok: false, message: "檢查家長關聯失敗" };
  }
  if ((restP ?? 0) === 0) {
    const { error: eLineP } = await supabase.from("line_push_logs").delete().eq("parent_id", p);
    if (eLineP) {
      return { ok: false, message: "刪除家長相關推播紀錄失敗" };
    }
    const { error: ePar } = await supabase.from("parents").delete().eq("id", p);
    if (ePar) {
      return { ok: false, message: `刪除家長失敗：${ePar.message}` };
    }
  }

  return { ok: true };
}
