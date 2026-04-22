import type { SessionSummaryJsonV1 } from "@/types/sessionAnalysis";
import type { QuizModule } from "@/types/quiz";

export type BasicRecommendation = {
  recommendation_type: "module_focus" | "level_bridge" | "advanced_track";
  title: string;
  description: string;
  url: string | null;
};

/**
 * 規則式課程／學習建議，供寫入 recommendations（不含 session_id，由 API 層補上）
 */
export function generateBasicRecommendations(
  sum: SessionSummaryJsonV1,
): BasicRecommendation[] {
  const out: BasicRecommendation[] = [];
  const { moduleResults, overallLevel } = sum;
  const rate = (m: QuizModule) =>
    moduleResults.find((x) => x.module === m)?.correctRate ?? 100;

  if (rate("分數/小數/比例") < 70) {
    out.push({
      recommendation_type: "module_focus",
      title: "分數與比例先修",
      description: "分數、小數與比例的銜接若薄弱，建議從圖示與生活情境出發，建立量感。",
      url: null,
    });
  }
  if (rate("代數前導") < 70) {
    out.push({
      recommendation_type: "module_focus",
      title: "國一代數先修",
      description: "以符號表達、式子化簡與規律尋找為主，可搭配少量情境題。",
      url: null,
    });
  }
  if (rate("文字題與閱讀理解") < 70) {
    out.push({
      recommendation_type: "module_focus",
      title: "應用題與列式訓練",
      description: "從兩步驟敘事與圖表解讀練起，重點是「讀完再下筆」的習慣。",
      url: null,
    });
  }
  if (overallLevel === "C" || overallLevel === "D") {
    out.push({
      recommendation_type: "level_bridge",
      title: "小六升國一完整銜接班",
      description: "以段考範圍與學力檢測重點設計的系統性複習，穩定銜接國一。",
      url: null,
    });
  }
  if (
    (overallLevel === "A" || overallLevel === "B") &&
    moduleResults.some((m) => m.status === "高潛力")
  ) {
    out.push({
      recommendation_type: "advanced_track",
      title: "國一進階先修班",
      description: "部分模組表現穩定且用時得宜，可挑戰探究型題目與延伸。",
      url: null,
    });
  }
  if (out.length === 0) {
    out.push({
      recommendation_type: "level_bridge",
      title: "延續練習與學力維持",
      description: "整體表現均衡，可定期回診、維持答題感與閱讀穩定度。",
      url: null,
    });
  }
  return out;
}
