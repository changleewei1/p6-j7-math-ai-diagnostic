/** 合併 className；略過 falsy。 */
export function cn(...parts: (string | false | undefined | null)[]): string {
  return parts.filter(Boolean).join(" ");
}
