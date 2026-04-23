import type { SupabaseClient } from "@supabase/supabase-js";
import type { QuestionVideoRow } from "@/types/database";

export const REPORT_VIDEO_REASON = {
  wrong_answer:
    "這題在作答上與正解有明顯落差，建議先觀看以下影片、重新釐清觀念，再回頭檢驗。",
  low_confidence: "這題雖有答對，但作答信心較低，顯示觀念仍不夠穩，建議優先重溫以加深印證。",
  slow_response: "這題用時明顯偏長，可透過影片幫助釐清步調，讓之後的作答更俐落。",
} as const;

export type ReportVideoReasonType = keyof typeof REPORT_VIDEO_REASON;

export type RecommendedVideoItem = {
  questionId: string;
  questionVideoId: string;
  youtubeUrl: string;
  title: string | null;
  reasonType: ReportVideoReasonType;
  reasonText: string;
};

type AnswerInput = {
  questionId: string;
  questionOrder: number;
  isCorrect: boolean;
  confidenceLevel: "high" | "medium" | "low";
  timeSpentSeconds: number;
};

type QuestionVideoForPick = {
  id: string;
  questionId: string;
  youtubeUrl: string;
  title: string | null;
  priority: number;
  createdAt: string;
};

/**
 * 以 YouTube 影片 ID 盡量合併重複（watch / youtu.be / embed / shorts）
 */
function youtubeVideoKeyForDedup(url: string): string {
  const s = url.trim();
  if (!s) {
    return "";
  }
  try {
    const u = new URL(s, "https://example.com");
    if (u.hostname === "youtu.be" || u.hostname === "www.youtu.be") {
      const p = u.pathname.replace(/^\//, "");
      if (p) {
        return p.split("/")[0] ?? "";
      }
    }
    const v = u.searchParams.get("v");
    if (v) {
      return v;
    }
    const parts = u.pathname.split("/").filter(Boolean);
    const i = parts.findIndex((x) => x === "shorts" || x === "embed");
    if (i >= 0 && parts[i + 1]) {
      return parts[i + 1];
    }
  } catch {
    // ignore
  }
  return s.toLowerCase();
}

function sortVideosForQuestion(a: QuestionVideoForPick, b: QuestionVideoForPick): number {
  if (a.priority !== b.priority) {
    return a.priority - b.priority;
  }
  const tc = a.createdAt.localeCompare(b.createdAt);
  if (tc !== 0) {
    return tc;
  }
  return a.id.localeCompare(b.id);
}

type Tier = 1 | 2 | 3;

/**
 * 規則式推薦：答錯 → 低信心答對 → 偏慢。同一 youtube 不重複，最多 5 支。
 * 不讀取資料庫，僅處理已取得的作答與 question_videos 集合。
 */
export function pickRecommendedVideoItems(
  answerRows: AnswerInput[],
  estimatedByQuestion: Map<string, number>,
  videosByQuestion: Map<string, QuestionVideoForPick[]>,
  max = 5,
): RecommendedVideoItem[] {
  const best = new Map<string, { order: number; tier: Tier; reason: ReportVideoReasonType }>();
  for (const a of answerRows) {
    const est = estimatedByQuestion.get(a.questionId) ?? 0;
    const spent = Math.max(0, Number(a.timeSpentSeconds));
    let tier: 0 | Tier = 0;
    let reason: ReportVideoReasonType = "wrong_answer";
    if (!a.isCorrect) {
      tier = 1;
      reason = "wrong_answer";
    } else if (a.confidenceLevel === "low") {
      tier = 2;
      reason = "low_confidence";
    } else if (est > 0 && spent > 1.5 * est) {
      tier = 3;
      reason = "slow_response";
    }
    if (tier === 0) {
      continue;
    }
    const prev = best.get(a.questionId);
    if (!prev || tier < prev.tier) {
      best.set(a.questionId, { order: a.questionOrder, tier, reason });
    } else if (prev && tier === prev.tier && a.questionOrder < prev.order) {
      best.set(a.questionId, { order: a.questionOrder, tier, reason });
    }
  }
  const classified = Array.from(best.entries(), ([questionId, v]) => ({
    questionId,
    order: v.order,
    tier: v.tier,
    reason: v.reason,
  }));
  classified.sort(
    (x, y) => x.tier - y.tier || x.order - y.order || x.questionId.localeCompare(y.questionId),
  );

  const seen = new Set<string>();
  const out: RecommendedVideoItem[] = [];
  for (const c of classified) {
    if (out.length >= max) {
      break;
    }
    const vids = (videosByQuestion.get(c.questionId) ?? []).slice().sort(sortVideosForQuestion);
    for (const v of vids) {
      if (out.length >= max) {
        break;
      }
      const k = youtubeVideoKeyForDedup(v.youtubeUrl);
      if (k && seen.has(k)) {
        continue;
      }
      if (k) {
        seen.add(k);
      }
      out.push({
        questionId: c.questionId,
        questionVideoId: v.id,
        youtubeUrl: v.youtubeUrl,
        title: v.title,
        reasonType: c.reason,
        reasonText: REPORT_VIDEO_REASON[c.reason],
      });
    }
  }
  return out;
}

function toPickRows(rows: QuestionVideoRow[]): Map<string, QuestionVideoForPick[]> {
  const m = new Map<string, QuestionVideoForPick[]>();
  for (const r of rows) {
    const v: QuestionVideoForPick = {
      id: r.id,
      questionId: r.question_id,
      youtubeUrl: r.youtube_url,
      title: r.title,
      priority: r.priority,
      createdAt: r.created_at,
    };
    const list = m.get(r.question_id) ?? [];
    list.push(v);
    m.set(r.question_id, list);
  }
  return m;
}

/**
 * 依本次測驗作答，自 `question_videos` 組出建議清單（最多 5 支）
 */
export async function getRecommendedVideosForSession(
  supabase: SupabaseClient,
  sessionId: string,
  max = 5,
): Promise<RecommendedVideoItem[]> {
  const { data: sq, error: sqe } = await supabase
    .from("session_questions")
    .select("question_id, question_order")
    .eq("session_id", sessionId);
  if (sqe) {
    console.error("getRecommendedVideosForSession: session_questions", sqe);
    return [];
  }
  const orderByQ = new Map<string, number>();
  for (const r of sq ?? []) {
    orderByQ.set(r.question_id, r.question_order);
  }

  const { data: ans, error: ane } = await supabase
    .from("answers")
    .select("question_id, is_correct, time_spent_seconds, confidence_level")
    .eq("session_id", sessionId);
  if (ane) {
    console.error("getRecommendedVideosForSession: answers", ane);
    return [];
  }
  if (!ans?.length) {
    return [];
  }

  const qids = Array.from(new Set(ans.map((a) => a.question_id)));
  const { data: estRows, error: ee } = await supabase
    .from("question_bank")
    .select("id, estimated_time_seconds")
    .in("id", qids);
  if (ee) {
    console.error("getRecommendedVideosForSession: question_bank", ee);
  }
  const estMap = new Map<string, number>();
  for (const e of estRows ?? []) {
    estMap.set(e.id, Math.max(0, Number(e.estimated_time_seconds)));
  }

  const { data: vrows, error: ve } = await supabase
    .from("question_videos")
    .select("id, question_id, youtube_url, title, priority, created_at")
    .in("question_id", qids);
  if (ve) {
    console.error("getRecommendedVideosForSession: question_videos", ve);
  }
  const videosByQ = toPickRows((vrows ?? []) as QuestionVideoRow[]);

  const answerRows: AnswerInput[] = (ans ?? []).map((a) => ({
    questionId: a.question_id,
    questionOrder: orderByQ.get(a.question_id) ?? 1_000_000,
    isCorrect: a.is_correct,
    confidenceLevel: a.confidence_level as "high" | "medium" | "low",
    timeSpentSeconds: Number(a.time_spent_seconds),
  }));

  return pickRecommendedVideoItems(answerRows, estMap, videosByQ, max);
}
