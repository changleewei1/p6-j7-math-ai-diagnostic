import { z } from "zod";
import { INTERESTED_COURSE_OPTIONS } from "@/lib/constants/booking";

const courseEnum = z.enum(INTERESTED_COURSE_OPTIONS, {
  errorMap: () => ({ message: "請選擇想了解的課程" }),
});

const bookingFieldsSchema = z.object({
  studentName: z
    .string()
    .trim()
    .min(1, "請輸入學生姓名")
    .max(80, "學生姓名過長"),
  parentName: z
    .string()
    .trim()
    .min(1, "請輸入家長姓名")
    .max(80, "家長姓名過長"),
  phone: z
    .string()
    .trim()
    .min(8, "請輸入聯絡電話")
    .max(20, "聯絡電話格式請再確認"),
  interestedCourse: courseEnum,
  note: z
    .string()
    .trim()
    .max(2000, "備註內容過長")
    .optional(),
  /** 若未送此欄，後端可視為 true */
  willingToBeContacted: z.boolean().optional().default(true),
  agreeDataContact: z
    .boolean()
    .refine((v) => v === true, { message: "請勾選同意提供資料供補習班聯絡" }),
});

/**
 * 預約試聽表單欄位（不含 sessionId，供 RHF 客戶端驗證）
 */
export const bookingFormClientSchema = bookingFieldsSchema;
export type BookingFormClientInput = z.infer<typeof bookingFormClientSchema>;

/**
 * POST /api/booking 完整 body（可含診斷工作階段 id）
 */
export const bookingBodySchema = bookingFieldsSchema.extend({
  sessionId: z.string().uuid().nullish(),
});
export type BookingBodyInput = z.infer<typeof bookingBodySchema>;
