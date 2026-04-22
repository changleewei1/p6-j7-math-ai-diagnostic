/**
 * 預約試聽「想了解的課程」選項；與 `bookings.interested_course` 寫入值一致（繁體中文完整字串）。
 */
export const INTERESTED_COURSE_OPTIONS = [
  "小六升國一完整銜接班",
  "分數與比例先修",
  "國一代數先修",
  "應用題與列式訓練",
  "想先了解適合的班別",
] as const;

export type InterestedCourseOption = (typeof INTERESTED_COURSE_OPTIONS)[number];
