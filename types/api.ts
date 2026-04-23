import type { SessionSummaryJsonV1 } from "@/types/sessionAnalysis";
import type { DifficultyLevel, FollowUpStatus, QuizModule, QuestionType } from "@/types/quiz";

/** GET /api/quiz/[sessionId]/current 成功回傳的題面（不含正解） */
export type QuizCurrentQuestionDto = {
  id: string;
  module: QuizModule;
  difficulty: DifficultyLevel;
  qtype: QuestionType;
  prompt: string;
  choices: string[];
  estimated_time_seconds: number;
};

export type RegisterApiResponse =
  | {
      success: true;
      sessionId: string;
      studentId: string;
      parentId: string;
    }
  | { success: false; message: string };

export type BookingApiResponse =
  | { success: true; bookingId: string }
  | { success: false; message: string };

/** POST /api/track 埋點；成功時僅作確認，失敗不影響主流程 */
export type TrackApiResponse =
  | { success: true; id: string }
  | { success: false; message: string };

export type QuizStartApiResponse = {
  success: boolean;
  existing?: boolean;
  totalQuestions?: number;
  message?: string;
};

export type QuizCurrentApiResponse = {
  success: boolean;
  sessionId: string;
  totalQuestions: number;
  currentQuestionOrder: number;
  /** 已作答題數（本場次） */
  answeredCount?: number;
  completed: boolean;
  question: QuizCurrentQuestionDto | null;
  message?: string;
};

export type QuizAnswerApiResponse = {
  success: boolean;
  isCorrect?: boolean;
  completed?: boolean;
  nextQuestionOrder?: number | null;
  answeredCount?: number;
  totalQuestions?: number;
  message?: string;
};

export type QuizFinishApiResponse = {
  success: boolean;
  sessionId?: string;
  overallScore?: number | string | null;
  overallLevel?: string | null;
  summary?: SessionSummaryJsonV1;
  message?: string;
};

export type ReportVideoItem = {
  id: string;
  module: QuizModule;
  title: string;
  url: string;
  description: string | null;
};

/** 依本次作答，自 question_videos 規則式挑選的推薦（與舊有 module 影片庫可並存，前端優先顯示本陣列） */
export type ReportRecommendedVideoItem = {
  questionId: string;
  questionVideoId: string;
  youtubeUrl: string;
  title: string | null;
  reasonType: "wrong_answer" | "low_confidence" | "slow_response";
  reasonText: string;
};

export type ReportApiResponse = {
  success: boolean;
  sessionId: string;
  reportReady: boolean;
  studentName: string;
  status: string;
  overallScore: number | string | null;
  overallLevel: string | null;
  moduleResults: SessionSummaryJsonV1["moduleResults"] | null;
  timingSummary: SessionSummaryJsonV1["timingSummary"] | null;
  confidenceSummary: SessionSummaryJsonV1["confidenceSummary"] | null;
  riskTags: string[];
  /** 敘事摘要、銜接度、强弱模組等（同 summary_json 內，亦於頂層重複常見欄位方便前端） */
  readinessStatus: SessionSummaryJsonV1["readinessStatus"] | null;
  narrativeSummary: SessionSummaryJsonV1["narrativeSummary"] | null;
  strongestModules: SessionSummaryJsonV1["strongestModules"] | null;
  weakestModules: SessionSummaryJsonV1["weakestModules"] | null;
  recommendationHighlights: string[] | null;
  recommendations: {
    recommendation_type: string;
    title: string;
    description: string;
    url: string | null;
    created_at: string;
  }[];
  /** 同 test_sessions.summary_json 完整內容 */
  summary: unknown;
  /** 由 video_recommendations 依弱點排序後最多 5 筆（無作答推薦時作為補充） */
  videos: ReportVideoItem[];
  /** 依 answers + question_videos 規則式推薦，最多 5 筆 */
  recommendedVideos: ReportRecommendedVideoItem[];
  message?: string;
};

export type AdminOverviewApiResponse = {
  success: boolean;
  totalSessions: number;
  completedCount: number;
  averageScore: number | null;
  levelDistribution: { A: number; B: number; C: number; D: number };
  weaknessModuleRank: { module: QuizModule; count: number }[];
  followUpDistribution: { status: FollowUpStatus; count: number }[];
  recentSessions: {
    id: string;
    studentName: string;
    parentName: string;
    status: string;
    overallLevel: string | null;
    followUpStatus: FollowUpStatus;
    createdAt: string;
  }[];
  message?: string;
};

export type AdminSessionListItem = {
  id: string;
  createdAt: string;
  status: string;
  studentName: string;
  parentName: string;
  parentPhone: string;
  overallLevel: string | null;
  overallScore: string | null;
  followUpStatus: FollowUpStatus;
  marketingOptIn: boolean;
};

export type AdminSessionsListApiResponse = {
  success: boolean;
  items: AdminSessionListItem[];
  total: number;
  page: number;
  pageSize: number;
  message?: string;
};

export type AdminAnswerItem = {
  questionOrder: number;
  questionId: string;
  module: QuizModule;
  difficulty: DifficultyLevel;
  selectedChoiceIndex: number | null;
  isCorrect: boolean;
  timeSpentSeconds: number;
  confidenceLevel: "high" | "medium" | "low";
};

export type AdminSessionDetailApiResponse = {
  success: boolean;
  session: {
    id: string;
    status: string;
    createdAt: string;
    startedAt: string | null;
    completedAt: string | null;
    followUpStatus: FollowUpStatus;
    overallLevel: string | null;
    overallScore: string | null;
  };
  student: { id: string; name: string; school: string | null; grade: string };
  parent: {
    id: string;
    name: string;
    phone: string;
    lineId: string | null;
    email: string | null;
    consent: boolean;
    marketingOptIn: boolean;
  };
  summary: SessionSummaryJsonV1 | null;
  recommendations: {
    recommendation_type: string;
    title: string;
    description: string;
    url: string | null;
    created_at: string;
  }[];
  answers: AdminAnswerItem[];
  message?: string;
};

export type AdminFollowUpApiResponse = {
  success: boolean;
  followUpStatus?: FollowUpStatus;
  message?: string;
};

export type AdminSessionDeleteApiResponse = {
  success: boolean;
  message?: string;
};

export type AdminQuestionListItem = {
  id: string;
  module: QuizModule;
  difficulty: DifficultyLevel;
  prompt: string;
  is_active: boolean;
  sort_order: number;
};

export type AdminQuestionsListApiResponse = {
  success: boolean;
  /** 僅在 success 為 true 時保證意義；失敗時可為空陣列 */
  items: AdminQuestionListItem[];
  message?: string;
};

export type AdminQuestionVideoDto = {
  id: string;
  questionId: string;
  youtubeUrl: string;
  title: string | null;
  priority: number;
  createdAt: string;
};

export type AdminQuestionVideosApiResponse = {
  success: boolean;
  question: {
    id: string;
    module: QuizModule;
    difficulty: DifficultyLevel;
    prompt: string;
  } | null;
  videos: AdminQuestionVideoDto[];
  message?: string;
};

export type AdminQuestionVideoCreateApiResponse = {
  success: boolean;
  video?: AdminQuestionVideoDto;
  message?: string;
};

export type AdminQuestionVideoDeleteApiResponse = {
  success: boolean;
  message?: string;
};
