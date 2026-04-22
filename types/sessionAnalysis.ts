/**
 * 寫入 test_sessions.summary_json 與報告 API 共用的規則式分析結構
 */

import type { DifficultyLevel, QuizModule } from "@/types/quiz";

export type ModuleStatusLabel = "高潛力" | "基礎穩定" | "需要加強" | "弱點明顯";

export type ModuleAnalysisRow = {
  module: QuizModule;
  total: number;
  correct: number;
  correctRate: number;
  averageTimeSpent: number;
  averageEstimatedTime: number;
  highConfidenceRate: number;
  lowConfidenceRate: number;
  status: ModuleStatusLabel;
};

export type DifficultyAnalysisRow = {
  total: number;
  correct: number;
  correctRate: number;
  averageTimeSpent: number;
};

export type DifficultyBreakdown = Record<DifficultyLevel, DifficultyAnalysisRow>;

export type TimingSummary = {
  averageTimeSpent: number;
  fastButInaccurateCount: number;
  slowQuestionCount: number;
};

export type ConfidenceSummary = {
  highConfidenceCorrectCount: number;
  lowConfidenceCorrectCount: number;
  highConfidenceWrongCount: number;
  lowConfidenceWrongCount: number;
  /** 補充：中等信心之筆數（非第 3 段強制顯示） */
  mediumConfidenceCount: number;
};

/** 銜接準備度（第 4 段報告用，規則式） */
export type ReadinessStatus = "可直接銜接" | "建議先修" | "建議完整補強";

/**
 * 規則式產生之家長可讀診斷文案（不呼叫外部 LLM）
 */
export type NarrativeSummaryBlock = {
  headline: string;
  overviewParagraph: string;
  strengthsParagraph: string;
  risksParagraph: string;
  studyAdviceParagraph: string;
  parentMessageParagraph: string;
};

/**
 * 寫入 test_sessions.summary_json 之 v1 結構（第 1～3 段基礎 + 第 4 段可選擴充）
 * 第 3 段既有資料僅有前者；第 4 段 finish 後會一併寫入擴充欄位
 */
export type SessionSummaryJsonV1 = {
  version: "v1";
  generatedAt: string;
  overallCorrectRate: number;
  overallScore: number;
  overallLevel: "A" | "B" | "C" | "D";
  moduleResults: ModuleAnalysisRow[];
  difficultyResults: DifficultyBreakdown;
  timingSummary: TimingSummary;
  confidenceSummary: ConfidenceSummary;
  riskTags: string[];
  /** 第 4 段起：敘事摘要、模組强／弱、銜接度、建議要點 */
  narrativeSummary?: NarrativeSummaryBlock;
  strongestModules?: QuizModule[];
  weakestModules?: QuizModule[];
  readinessStatus?: ReadinessStatus;
  recommendationHighlights?: string[];
};
