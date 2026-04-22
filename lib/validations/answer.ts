import { z } from "zod";

const iso = z
  .string()
  .min(1, "需為有效時間字串")
  .refine((s) => !Number.isNaN(Date.parse(s)), { message: "需為可解析的 ISO 日期時間" });

/**
 * POST /api/quiz/[sessionId]/answer 請求內文（與路徑 sessionId 分開驗證）
 */
export const answerBodySchema = z.object({
  questionId: z.string().uuid("題目 id 需為有效 UUID"),
  selectedChoiceIndex: z
    .number()
    .int("選項索引需為整數")
    .min(0, "選項索引不可為負"),
  confidenceLevel: z.enum(["high", "medium", "low"], {
    errorMap: () => ({ message: "信心度需為 high / medium / low" }),
  }),
  shownAt: iso,
  answeredAt: iso,
  timeSpentSeconds: z
    .number()
    .min(0, "作答秒數需為非負數")
    .max(86400, "作答秒數不合理"),
});

export type AnswerBodyInput = z.infer<typeof answerBodySchema>;
