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
