import { z } from "zod";

/** 接受常見 YouTube 網址格式（含 Shorts、embed） */
const youtubeUrlSchema = z
  .string()
  .trim()
  .min(12, "請貼上有效的 YouTube 連結")
  .refine(
    (s) =>
      /^https?:\/\//i.test(s) &&
      (s.includes("youtube.com/") || s.includes("youtu.be/")),
    "必須為 YouTube 連結（youtube.com 或 youtu.be）",
  );

export const postQuestionVideoBodySchema = z
  .object({
    youtube_url: youtubeUrlSchema,
    title: z.string().max(500).optional(),
  })
  .strict();

export type PostQuestionVideoBodyInput = z.infer<typeof postQuestionVideoBodySchema>;
