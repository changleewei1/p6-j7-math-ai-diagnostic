import type { BasicRecommendation } from "@/lib/analysis/generateBasicRecommendations";
import { generateNarrativeSummary } from "@/lib/analysis/generateNarrativeSummary";
import type { ModuleAnalysisRow, ReadinessStatus, SessionSummaryJsonV1 } from "@/types/sessionAnalysis";
import type { QuizModule } from "@/types/quiz";

function pickStrongestWeakest(rows: ModuleAnalysisRow[]): {
  strongestModules: QuizModule[];
  weakestModules: QuizModule[];
} {
  const sorted = [...rows].sort((a, b) => b.correctRate - a.correctRate);
  const strong = sorted.slice(0, 2).map((m) => m.module);
  const weak = [...rows].sort((a, b) => a.correctRate - b.correctRate).slice(0, 2).map((m) => m.module);
  return { strongestModules: strong, weakestModules: weak };
}

function computeReadiness(
  level: "A" | "B" | "C" | "D",
  moduleResults: ModuleAnalysisRow[],
): ReadinessStatus {
  const minR = moduleResults.length
    ? Math.min(...moduleResults.map((m) => m.correctRate))
    : 0;
  if (level === "C" || level === "D" || minR < 50) {
    return "建議完整補強";
  }
  if (level === "B" || minR < 70) {
    return "建議先修";
  }
  return "可直接銜接";
}

/**
 * 在 analyzeSession 產生之 v1 摘要上，補敘事、强／弱模組、銜接度、建議要點
 */
export function enrichSessionReportSummary(
  base: SessionSummaryJsonV1,
  opts: { studentName: string; recommendations: BasicRecommendation[] },
): SessionSummaryJsonV1 {
  const { strongestModules, weakestModules } = pickStrongestWeakest(base.moduleResults);
  const readinessStatus = computeReadiness(base.overallLevel, base.moduleResults);
  const narrativeSummary = generateNarrativeSummary({
    studentName: opts.studentName,
    overallLevel: base.overallLevel,
    overallScore: base.overallScore,
    moduleResults: base.moduleResults,
    timingSummary: base.timingSummary,
    confidenceSummary: base.confidenceSummary,
    riskTags: base.riskTags,
  });
  const recommendationHighlights = opts.recommendations.map((r) => r.title).slice(0, 5);

  return {
    ...base,
    version: "v1",
    narrativeSummary,
    strongestModules,
    weakestModules,
    readinessStatus,
    recommendationHighlights,
  };
}

/** 從舊版 summary 推論弱點模組（無 weakestModules 時給影片排序用） */
export function inferWeakestModulesFromSummary(summary: SessionSummaryJsonV1): QuizModule[] {
  if (summary.weakestModules && summary.weakestModules.length > 0) {
    return summary.weakestModules;
  }
  const rows = summary.moduleResults;
  const low = [...rows].sort((a, b) => a.correctRate - b.correctRate);
  return low.slice(0, 2).map((m) => m.module);
}

/** 從舊版 summary 推論 readiness（無欄位時） */
export function inferReadinessStatus(summary: SessionSummaryJsonV1): ReadinessStatus {
  if (summary.readinessStatus) return summary.readinessStatus;
  return computeReadiness(summary.overallLevel, summary.moduleResults);
}

export { pickStrongestWeakest, computeReadiness };
