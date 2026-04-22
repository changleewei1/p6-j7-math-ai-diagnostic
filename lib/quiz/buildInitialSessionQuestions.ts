import { QUIZ_MODULES } from "@/lib/constants/quiz";
import type { QuestionBankRow } from "@/types/database";
import type { DifficultyLevel, QuizModule } from "@/types/quiz";

const ORDERED_DIFFICULTIES: readonly DifficultyLevel[] = [
  "easy",
  "medium",
  "hard",
];

/**
 * 依模組與難度分桶，key = `模組名::難度`
 */
export function groupQuestionsByModuleAndDifficulty(
  rows: QuestionBankRow[],
): Map<string, QuestionBankRow[]> {
  const map = new Map<string, QuestionBankRow[]>();
  for (const row of rows) {
    const key = `${row.module}::${row.difficulty}`;
    const list = map.get(key);
    if (list) list.push(row);
    else map.set(key, [row]);
  }
  return map;
}

/**
 * 從候選中隨機抽一題（可注入亂數於測試）
 */
export function pickRandomQuestion(
  candidates: QuestionBankRow[],
  random: () => number = Math.random,
): QuestionBankRow {
  if (candidates.length === 0) {
    throw new Error("pickRandomQuestion: 候選陣列為空");
  }
  const r = random();
  const i = Math.floor(r * candidates.length);
  return candidates[Math.min(i, candidates.length - 1)]!;
}

/**
 * 題庫中缺少足夠題目以組出正式測驗
 */
export class InsufficientQuestionBankError extends Error {
  module: QuizModule;
  difficulty: DifficultyLevel;
  availableCount: number;

  constructor(
    message: string,
    ctx: { module: QuizModule; difficulty: DifficultyLevel; availableCount: number },
  ) {
    super(message);
    this.name = "InsufficientQuestionBankError";
    this.module = ctx.module;
    this.difficulty = ctx.difficulty;
    this.availableCount = ctx.availableCount;
  }
}

/**
 * 從**已篩選 is_active 之題庫列**產生 15 題：
 * 五大模組 ×（easy, medium, hard 各 1 題），題目不重複。
 * 回傳順序：第 1 模組 3 題、第 2 模組 3 題、…
 */
export function buildInitialSessionQuestions(
  allActiveRows: QuestionBankRow[],
  random: () => number = Math.random,
): QuestionBankRow[] {
  const grouped = groupQuestionsByModuleAndDifficulty(allActiveRows);
  const picked: QuestionBankRow[] = [];
  const seenIds = new Set<string>();

  for (const mod of QUIZ_MODULES) {
    for (const d of ORDERED_DIFFICULTIES) {
      const key = `${mod}::${d}` as const;
      const list = grouped.get(key) ?? [];
      if (list.length === 0) {
        throw new InsufficientQuestionBankError(
          `模組「${mod}」難度「${d}」沒有可用題目。請匯入題庫。`,
          { module: mod, difficulty: d, availableCount: 0 },
        );
      }
      // 從可選中排除已選 id（理論上同 key 內不應重複，保險起見）
      const available = list.filter((q) => !seenIds.has(q.id));
      if (available.length === 0) {
        throw new InsufficientQuestionBankError(
          `模組「${mod}」難度「${d}」可選題目不足（可能與其他槽位重疊重複 id）。`,
          { module: mod, difficulty: d, availableCount: list.length },
        );
      }
      const choice = pickRandomQuestion(available, random);
      if (seenIds.has(choice.id)) {
        throw new Error("內部錯誤：抽中重複題目 id");
      }
      seenIds.add(choice.id);
      picked.push(choice);
    }
  }

  if (picked.length !== 15) {
    throw new Error(`內部錯誤：預期 15 題，實際 ${picked.length} 題`);
  }
  return picked;
}
