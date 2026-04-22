import type {
  ConfidenceLevel,
  DifficultyLevel,
  FollowUpStatus,
  QuizModule,
  SessionStatus,
} from "@/types/quiz";

/**
 * 與 DB CHECK、題庫 seed 一致之五大模組
 */
export const QUIZ_MODULES: readonly QuizModule[] = [
  "數感與基本運算",
  "分數/小數/比例",
  "代數前導",
  "幾何與圖形",
  "文字題與閱讀理解",
] as const;

export const DIFFICULTY_LEVELS: readonly DifficultyLevel[] = [
  "easy",
  "medium",
  "hard",
] as const;

export const CONFIDENCE_LEVELS: readonly ConfidenceLevel[] = [
  "high",
  "medium",
  "low",
] as const;

export const FOLLOW_UP_STATUSES: readonly FollowUpStatus[] = [
  "未追蹤",
  "已聯絡",
  "已預約",
  "已報名",
] as const;

export const SESSION_STATUSES: readonly SessionStatus[] = [
  "pending",
  "in_progress",
  "completed",
] as const;

export const DEFAULT_TOTAL_QUESTIONS = 15;

export const DEFAULT_ADAPTIVE_VERSION = "v2";
