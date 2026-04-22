/**
 * 從 data/questionBank.seed.json 匯入題庫至 question_bank
 * 執行：npm run seed:questions
 * 需 .env.local 中 NEXT_PUBLIC_SUPABASE_URL 與 SUPABASE_SERVICE_ROLE_KEY
 */

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { config } from "dotenv";
import { createAdminSupabaseClient } from "../lib/supabase/admin";
import type { Json } from "../types/database";
import type { DifficultyLevel, QuizModule, QuestionType } from "../types/quiz";

// 讀取 .env.local 優先，便於本機匯入
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

interface QuestionSeed {
  module: QuizModule;
  difficulty: DifficultyLevel;
  qtype: QuestionType;
  prompt: string;
  choices: string[];
  correct_choice_index: number;
  answer: string;
  explain: string;
  ability_tags: string[];
  estimated_time_seconds: number;
  is_active: boolean;
  sort_order: number;
}

function dedupeKey(q: {
  module: string;
  difficulty: string;
  prompt: string;
}): string {
  return [q.module, q.difficulty, q.prompt].join("\0");
}

async function main() {
  const jsonPath = resolve(process.cwd(), "data/questionBank.seed.json");
  let raw: string;
  try {
    raw = await readFile(jsonPath, "utf-8");
  } catch (e) {
    console.error(`無法讀取 ${jsonPath}`, e);
    process.exit(1);
  }

  const items: QuestionSeed[] = JSON.parse(raw);
  if (!Array.isArray(items) || items.length === 0) {
    console.error("questionBank.seed.json 必須為非空陣列");
    process.exit(1);
  }

  const supabase = createAdminSupabaseClient();

  const { data: existing, error: fetchError } = await supabase
    .from("question_bank")
    .select("module, difficulty, prompt");

  if (fetchError) {
    console.error("讀取既有題庫失敗", fetchError.message);
    process.exit(1);
  }

  const existingSet = new Set(
    (existing ?? []).map((row) => dedupeKey(row))
  );

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const item of items) {
    if (existingSet.has(dedupeKey(item))) {
      skipped += 1;
      continue;
    }

    const row = {
      module: item.module,
      difficulty: item.difficulty,
      qtype: item.qtype,
      prompt: item.prompt,
      choices: item.choices as unknown as Json,
      correct_choice_index: item.correct_choice_index,
      answer: item.answer,
      explain: item.explain,
      ability_tags: item.ability_tags as unknown as Json,
      estimated_time_seconds: item.estimated_time_seconds,
      is_active: item.is_active,
      sort_order: item.sort_order,
    };

    const { error } = await supabase.from("question_bank").insert(row);

    if (error) {
      failed += 1;
      console.error("插入失敗:", item.prompt.slice(0, 40) + "…", error.message);
      continue;
    }

    existingSet.add(dedupeKey(item));
    inserted += 1;
  }

  console.log(
    `完成：成功匯入 ${inserted} 筆、略過（已存在相同 module+difficulty+prompt）${skipped} 筆、失敗 ${failed} 筆。`
  );
}

main().catch((e) => {
  console.error("匯入腳本未預期錯誤", e);
  process.exit(1);
});
