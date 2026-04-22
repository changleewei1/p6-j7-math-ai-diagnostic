/**
 * 測驗流程、出題、作答與摘要相關型別
 */

/** 診斷測驗五大模組（與 DB CHECK、常數檔一致） */
export type QuizModule =
  | "數感與基本運算"
  | "分數/小數/比例"
  | "代數前導"
  | "幾何與圖形"
  | "文字題與閱讀理解";

export type DifficultyLevel = "easy" | "medium" | "hard";

export type ConfidenceLevel = "high" | "medium" | "low";

/** 家長／行政追蹤狀態 */
export type FollowUpStatus = "未追蹤" | "已聯絡" | "已預約" | "已報名";

/** 測驗工作階段狀態 */
export type SessionStatus = "pending" | "in_progress" | "completed";

export type QuestionType = "mcq";

/**
 * 前後端共用的單題結構（題庫列或 API 傳輸）
 * choices 於 DB 為 jsonb，實務上為字串陣列
 */
export interface QuizQuestion {
  id: string;
  module: QuizModule;
  difficulty: DifficultyLevel;
  qtype: QuestionType;
  prompt: string;
  choices: string[];
  correct_choice_index: number;
  /** 測驗當下可選擇是否隱藏正解，此型別供完整題面使用 */
  answer: string;
  explain: string;
  ability_tags: string[];
  estimated_time_seconds: number;
  is_active: boolean;
  sort_order: number;
}

/** 單題送出 payload（不含正解） */
export interface QuizAnswerPayload {
  questionId: string;
  selectedChoiceIndex: number | null;
  timeSpentSeconds: number;
  confidenceLevel: ConfidenceLevel;
  shownAt: string;
  answeredAt: string;
}

/**
 * 單次測驗摘要（可寫入 test_sessions.summary_json 或由前端顯示）
 */
export interface SessionSummary {
  sessionId: string;
  totalQuestions: number;
  correctCount: number;
  /** 0–100 或 0–1 由實作約定，此處保持彈性 */
  accuracyRate: number;
  byModule: TopicPerformance[];
  /** 產生時間（ISO 字串） */
  generatedAt: string;
}

export interface TopicPerformance {
  module: QuizModule;
  attempted: number;
  correct: number;
  /** 可選：加權或 raw 分數 */
  averageTimeSeconds: number;
}

/**
 * 給學生／家長看的單一建議項目
 */
export interface RecommendationItem {
  type: string;
  title: string;
  description: string;
  url?: string | null;
}
