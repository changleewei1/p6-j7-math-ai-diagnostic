/**
 * 資料庫表對應型別（手寫、風格接近 Supabase generated types）
 * 欄位名稱採用資料庫 snake_case，以與 @supabase/supabase-js 查詢結果一致
 */

import type { QuizModule, DifficultyLevel, SessionStatus, FollowUpStatus } from "./quiz";

/** JSONB / json 欄位用 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ---------------------------------------------------------------------------
// students
// ---------------------------------------------------------------------------
export interface StudentRow {
  id: string;
  name: string;
  school: string | null;
  grade: string;
  created_at: string;
}

export type StudentInsert = {
  id?: string;
  name: string;
  school?: string | null;
  grade?: string;
  created_at?: string;
};

export type StudentUpdate = Partial<Omit<StudentRow, "id">>;

// ---------------------------------------------------------------------------
// parents
// ---------------------------------------------------------------------------
export interface ParentRow {
  id: string;
  name: string;
  phone: string;
  line_id: string | null;
  email: string | null;
  consent: boolean;
  /** 行銷／課程建議等通訊同意（與 consent 分開） */
  marketing_opt_in: boolean;
  created_at: string;
}

export type ParentInsert = {
  id?: string;
  name: string;
  phone: string;
  line_id?: string | null;
  email?: string | null;
  consent?: boolean;
  marketing_opt_in?: boolean;
  created_at?: string;
};

export type ParentUpdate = Partial<Omit<ParentRow, "id">>;

// ---------------------------------------------------------------------------
// test_sessions
// ---------------------------------------------------------------------------
export interface TestSessionRow {
  id: string;
  student_id: string;
  parent_id: string;
  status: SessionStatus;
  started_at: string | null;
  completed_at: string | null;
  total_questions: number;
  adaptive_version: string;
  overall_score: string | null;
  overall_level: string | null;
  summary_json: Json | null;
  follow_up_status: FollowUpStatus;
  created_at: string;
}

export type TestSessionInsert = {
  id?: string;
  student_id: string;
  parent_id: string;
  status?: SessionStatus;
  started_at?: string | null;
  completed_at?: string | null;
  total_questions?: number;
  adaptive_version?: string;
  overall_score?: string | number | null;
  overall_level?: string | null;
  summary_json?: Json | null;
  follow_up_status?: FollowUpStatus;
  created_at?: string;
};

export type TestSessionUpdate = Partial<
  Omit<TestSessionRow, "id" | "student_id" | "parent_id">
>;

// ---------------------------------------------------------------------------
// question_bank
// ---------------------------------------------------------------------------
export interface QuestionBankRow {
  id: string;
  module: QuizModule;
  difficulty: DifficultyLevel;
  qtype: "mcq";
  prompt: string;
  choices: Json;
  correct_choice_index: number;
  answer: string;
  explain: string;
  ability_tags: Json;
  estimated_time_seconds: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type QuestionBankInsert = {
  id?: string;
  module: QuizModule;
  difficulty: DifficultyLevel;
  qtype?: "mcq";
  prompt: string;
  choices: Json;
  correct_choice_index: number;
  answer: string;
  explain: string;
  ability_tags?: Json;
  estimated_time_seconds?: number;
  is_active?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
};

export type QuestionBankUpdate = Partial<
  Omit<QuestionBankRow, "id" | "created_at">
> & { updated_at?: string };

// ---------------------------------------------------------------------------
// question_videos（題目 ↔ YouTube 補充影片）
// ---------------------------------------------------------------------------
export interface QuestionVideoRow {
  id: string;
  question_id: string;
  youtube_url: string;
  title: string | null;
  priority: number;
  created_at: string;
}

export type QuestionVideoInsert = {
  id?: string;
  question_id: string;
  youtube_url: string;
  title?: string | null;
  priority?: number;
  created_at?: string;
};

// ---------------------------------------------------------------------------
// session_questions
// ---------------------------------------------------------------------------
export interface SessionQuestionRow {
  id: string;
  session_id: string;
  question_id: string;
  question_order: number;
  module: QuizModule;
  difficulty: DifficultyLevel;
  created_at: string;
}

export type SessionQuestionInsert = {
  id?: string;
  session_id: string;
  question_id: string;
  question_order: number;
  module: QuizModule;
  difficulty: DifficultyLevel;
  created_at?: string;
};

// ---------------------------------------------------------------------------
// answers
// ---------------------------------------------------------------------------
export interface AnswerRow {
  id: string;
  session_id: string;
  question_id: string;
  selected_choice_index: number | null;
  is_correct: boolean;
  time_spent_seconds: string | number;
  confidence_level: "high" | "medium" | "low";
  shown_at: string;
  answered_at: string;
  created_at: string;
}

export type AnswerInsert = {
  id?: string;
  session_id: string;
  question_id: string;
  selected_choice_index?: number | null;
  is_correct: boolean;
  time_spent_seconds?: number;
  confidence_level: "high" | "medium" | "low";
  shown_at: string;
  answered_at: string;
  created_at?: string;
};

// ---------------------------------------------------------------------------
// recommendations
// ---------------------------------------------------------------------------
export interface RecommendationRow {
  id: string;
  session_id: string;
  recommendation_type: string;
  title: string;
  description: string;
  url: string | null;
  created_at: string;
}

export type RecommendationInsert = {
  id?: string;
  session_id: string;
  recommendation_type: string;
  title: string;
  description: string;
  url?: string | null;
  created_at?: string;
};

// ---------------------------------------------------------------------------
// video_recommendations
// ---------------------------------------------------------------------------
export interface VideoRecommendationRow {
  id: string;
  module: QuizModule;
  title: string;
  url: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export type VideoRecommendationInsert = {
  id?: string;
  module: QuizModule;
  title: string;
  url: string;
  description?: string | null;
  is_active?: boolean;
  created_at?: string;
};

// ---------------------------------------------------------------------------
// admin_users
// ---------------------------------------------------------------------------
export interface AdminUserRow {
  id: string;
  username: string;
  password_hash: string;
  created_at: string;
}

export type AdminUserInsert = {
  id?: string;
  username: string;
  password_hash: string;
  created_at?: string;
};

// ---------------------------------------------------------------------------
// bookings
// ---------------------------------------------------------------------------
export interface BookingRow {
  id: string;
  student_name: string;
  parent_name: string;
  phone: string;
  interested_course: string;
  note: string | null;
  session_id: string | null;
  created_at: string;
}

export type BookingInsert = {
  id?: string;
  student_name: string;
  parent_name: string;
  phone: string;
  interested_course: string;
  note?: string | null;
  session_id?: string | null;
  created_at?: string;
};

// ---------------------------------------------------------------------------
// conversion_events
// ---------------------------------------------------------------------------
export interface ConversionEventRow {
  id: string;
  session_id: string | null;
  event_type: string;
  meta_json: Json;
  created_at: string;
}

export type ConversionEventInsert = {
  id?: string;
  session_id?: string | null;
  event_type: string;
  meta_json?: Json;
  created_at?: string;
};

// ---------------------------------------------------------------------------
// line_push_logs
// ---------------------------------------------------------------------------
export interface LinePushLogRow {
  id: string;
  session_id: string | null;
  parent_id: string | null;
  target_line_id: string | null;
  message_type: string;
  payload_json: Json | null;
  status: string;
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
}

export type LinePushLogInsert = {
  id?: string;
  session_id?: string | null;
  parent_id?: string | null;
  target_line_id?: string | null;
  message_type: string;
  payload_json?: Json | null;
  status?: string;
  error_message?: string | null;
  sent_at?: string | null;
  created_at?: string;
};
