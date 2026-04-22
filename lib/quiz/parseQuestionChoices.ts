import type { Json } from "@/types/database";

/**
 * 題庫 choices 在 DB 為 jsonb，實務上為字串陣列
 */
export function parseChoiceStrings(choices: Json | null | undefined): string[] {
  if (choices == null) return [];
  if (!Array.isArray(choices)) return [];
  return choices.filter(
    (c): c is string => typeof c === "string",
  );
}
