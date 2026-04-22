import { z } from "zod";

/**
 * 行為追蹤 body（`POST /api/track`）
 */
export const trackBodySchema = z.object({
  sessionId: z
    .union([z.string().uuid("sessionId 格式錯誤"), z.null()])
    .optional(),
  eventType: z
    .string()
    .trim()
    .min(1, "請提供 eventType")
    .max(64, "eventType 過長"),
  /** 可為空；後端寫入 jsonb，允許純 key-value */
  meta: z.record(z.unknown()).optional(),
});

export type TrackBodyInput = z.infer<typeof trackBodySchema>;
