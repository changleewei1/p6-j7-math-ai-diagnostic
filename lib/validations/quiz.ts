import { z } from "zod";

/**
 * POST /api/quiz/start
 */
export const quizStartBodySchema = z.object({
  sessionId: z.string().uuid("請提供有效的測驗工作階段編號（UUID）"),
});

export type QuizStartBodyInput = z.infer<typeof quizStartBodySchema>;

const uuidParam = z.string().uuid("無效的測驗工作階段編號");

/**
 * 路徑參數 [sessionId] 驗證
 */
export function parseSessionIdParam(value: string | undefined) {
  return uuidParam.parse(value);
}

const questionIdParam = z.string().uuid("無效的題目編號");

/** 路徑參數 [questionId] 驗證（題庫 question_bank.id） */
export function parseQuestionIdParam(value: string | undefined) {
  return questionIdParam.parse(value);
}
