import type { InterestedCourseOption } from "@/lib/constants/booking";

/**
 * 依診斷報告第一則建議標題，粗步對應預約表單「想了解的課程」預選（加分功能）。
 */
export function suggestInterestedCourseFromRecommendationTitle(title: string): InterestedCourseOption {
  const t = title.trim();
  if (!t) return "想先了解適合的班別";
  if (/銜接|完整班|升國一/.test(t)) return "小六升國一完整銜接班";
  if (/分數|比例|小數/.test(t)) return "分數與比例先修";
  if (/代數|代數前導|符號|方程式/.test(t)) return "國一代數先修";
  if (/應用|列式|文字題|閱讀/.test(t)) return "應用題與列式訓練";
  return "想先了解適合的班別";
}
