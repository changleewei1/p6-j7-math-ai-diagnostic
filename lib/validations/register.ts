import { z } from "zod";

/**
 * JSON.stringify 會略過 `undefined` 的鍵，導致 POST body 欄位「消失」、
 * Zod 的 z.string() 得到 undefined 時，預設訊息為英文 "Required"。
 * 以下對可能缺漏的欄位一律 preprocess 成字串 / 布林預設值，並維持繁中錯誤訊息。
 */

function strIn(v: unknown, fallback = ""): string {
  if (v == null) return fallback;
  return String(v);
}

export const registerBodySchema = z.object({
  studentName: z.preprocess(
    (v) => strIn(v, ""),
    z
      .string()
      .transform((s) => s.trim())
      .pipe(z.string().min(1, "學生姓名必填").max(100, "姓名長度過長")),
  ),

  school: z.preprocess(
    (v) => strIn(v, ""),
    z
      .string()
      .max(200, "學校名稱過長")
      .transform((s) => {
        const t = s.trim();
        return t === "" ? undefined : t;
      }),
  ),

  grade: z.preprocess(
    (v) => (v === "" || v == null || v === undefined ? "小六" : v),
    z.string().max(20, "年級內容過長"),
  ),

  parentName: z.preprocess(
    (v) => strIn(v, ""),
    z
      .string()
      .transform((s) => s.trim())
      .pipe(z.string().min(1, "家長姓名必填").max(100, "家長姓名長度過長")),
  ),

  parentPhone: z.preprocess(
    (v) => strIn(v, ""),
    z
      .string()
      .transform((s) => s.trim())
      .pipe(
        z
          .string()
          .min(1, "家長手機必填")
          .refine(
            (s) => s.replace(/\D/g, "").length >= 8,
            "家長手機格式不正確，請至少輸入 8 碼數字",
          ),
      ),
  ),

  lineId: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : v),
    z.union([z.null(), z.string().max(100, "LINE ID 過長")]),
  ),

  email: z.preprocess(
    (v) => {
      if (v === "" || v === null || v === undefined) return null;
      const t = String(v).trim();
      return t === "" ? null : t;
    },
    z.union([z.null(), z.string().email("Email 格式不正確").max(200, "Email 內容過長")]),
  ),

  /**
   * 行銷／訊息同意：願意接收診斷報告與課程相關建議等（寫入 parents.marketing_opt_in）
   * JSON 若缺鍵，補上 false
   */
  marketingOptIn: z.preprocess(
    (v) => (v === undefined || v === null ? false : v),
    z.boolean(),
  ),

  /** 個資：JSON 若缺鍵，補上 false 再走 refine 顯示中文 */
  agreePrivacy: z.preprocess(
    (v) => (v === undefined ? false : v),
    z
      .boolean()
      .refine((v) => v === true, { message: "請勾選同意個資蒐集" }),
  ),
});

export type RegisterBodyInput = z.infer<typeof registerBodySchema>;
