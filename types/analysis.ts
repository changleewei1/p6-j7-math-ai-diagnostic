/**
 * AI / 規則分析與報告用型別（第 2 階段起；第 4 段以實際寫入之 summary_json 見 sessionAnalysis.ts）
 */

import type { QuizModule } from "./quiz";

export type LearningRiskTag =
  | "computation_fatigue"
  | "fraction_gap"
  | "word_problem_reading"
  | "low_confidence_pattern"
  | "slow_but_accurate"
  | "fast_with_careless_mistakes"
  | (string & {});

/**
 * 整體正確率與分項（可依模組或難度切分）
 */
export interface AccuracyAnalysis {
  overallAccuracy: number;
  byModule: Partial<Record<QuizModule, { correct: number; total: number; accuracy: number }>>;
  byDifficulty: {
    easy: { correct: number; total: number };
    medium: { correct: number; total: number };
    hard: { correct: number; total: number };
  };
}

/**
 * 作答時間分佈、偏慢／偏快偵測
 */
export interface TimingAnalysis {
  meanSeconds: number;
  medianSeconds: number;
  /** 高於同難度估計秒數的題數 */
  slowQuestionCount: number;
  /** 多快於估計的題數（可能需搭配錯因） */
  fastQuestionCount: number;
  /** 每模組平均用時 */
  meanSecondsByModule: Partial<Record<QuizModule, number>>;
}

/**
 * 自信程度與實際正誤的交叉觀察
 */
export interface ConfidenceAnalysis {
  highConfidenceWrong: number;
  lowConfidenceCorrect: number;
  /** 各自信程度下的正確率 */
  accuracyByConfidence: {
    high: { correct: number; total: number };
    medium: { correct: number; total: number };
    low: { correct: number; total: number };
  };
}

/**
 * 單一模組的診斷結果（銜接 AI 文字產生）
 */
export interface ModuleAnalysisResult {
  module: QuizModule;
  strengths: string[];
  weaknesses: string[];
  suggestedFocus: string;
  riskTags: LearningRiskTag[];
}

/**
 * 整份報告的彙整結果
 */
export interface OverallAnalysisResult {
  headline: string;
  narrativeSummary: string;
  /** 學生程度標籤或等第（可對應 test_sessions.overall_level） */
  levelLabel: string;
  moduleResults: ModuleAnalysisResult[];
  accuracy: AccuracyAnalysis;
  timing: TimingAnalysis;
  confidence: ConfidenceAnalysis;
  /** 產生此分析所依據的 schema / 模型版本 */
  modelVersion: string;
  createdAt: string;
}
