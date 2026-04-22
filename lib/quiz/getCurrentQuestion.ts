/**
 * 取得「當前題目」的共用邏輯（第 3 階段起）。
 * 定義：在 session_questions 中，**尚未在 answers 出現之 question_id** 裡，
 * take question_order 最小者。若沒有未作答殘量 → 本輪可視為「題目層面已完成」
 *（全部題目都已有 answer 紀錄）。
 */
export function getNextUnansweredSessionQuestion<
  T extends { question_id: string; question_order: number },
>(sessionRows: T[] | null | undefined, answeredQuestionIds: Set<string> | null | undefined): T | null {
  if (sessionRows == null || sessionRows.length === 0) return null;
  const done = answeredQuestionIds ?? new Set();
  const pending = sessionRows.filter((r) => !done.has(r.question_id));
  if (pending.length === 0) return null;
  return pending.reduce(
    (min, row) => (row.question_order < min.question_order ? row : min),
    pending[0]!,
  );
}

/** 向後相容：單純取最小 question_order（未排除已答） */
export function getCurrentQuestionByMinOrder<T extends { question_order: number }>(
  rows: T[] | null | undefined,
): T | null {
  if (rows == null || rows.length === 0) return null;
  return rows.reduce(
    (min, row) => (row.question_order < min.question_order ? row : min),
    rows[0]!,
  );
}
