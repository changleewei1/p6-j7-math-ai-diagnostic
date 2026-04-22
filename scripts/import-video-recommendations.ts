/**
 * 從 data/videoRecommendations.seed.json 匯入至 video_recommendations
 * 執行：npm run seed:videos
 * 需 .env.local 中 NEXT_PUBLIC_SUPABASE_URL 與 SUPABASE_SERVICE_ROLE_KEY
 */

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { config } from "dotenv";
import { createAdminSupabaseClient } from "../lib/supabase/admin";
import type { QuizModule } from "../types/quiz";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

interface VideoSeed {
  module: QuizModule;
  title: string;
  url: string;
  description: string | null;
  is_active: boolean;
}

function dedupeKey(v: { module: string; title: string; url: string }): string {
  return [v.module, v.title, v.url].join("\0");
}

async function main() {
  const jsonPath = resolve(process.cwd(), "data/videoRecommendations.seed.json");
  const raw = await readFile(jsonPath, "utf-8");
  const items: VideoSeed[] = JSON.parse(raw);
  if (!Array.isArray(items) || items.length === 0) {
    console.error("videoRecommendations.seed.json 必須為非空陣列");
    process.exit(1);
  }

  const supabase = createAdminSupabaseClient();
  const { data: existing, error: fetchError } = await supabase
    .from("video_recommendations")
    .select("module, title, url");
  if (fetchError) {
    console.error("讀取既有影片失敗", fetchError.message);
    process.exit(1);
  }

  const existingSet = new Set((existing ?? []).map((row) => dedupeKey(row)));
  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const item of items) {
    if (existingSet.has(dedupeKey(item))) {
      skipped += 1;
      continue;
    }
    const { error } = await supabase.from("video_recommendations").insert({
      module: item.module,
      title: item.title,
      url: item.url,
      description: item.description,
      is_active: item.is_active,
    });
    if (error) {
      failed += 1;
      console.error("插入失敗", item.title, error.message);
      continue;
    }
    existingSet.add(dedupeKey(item));
    inserted += 1;
  }

  console.log(
    `完成：成功匯入 ${inserted} 筆、略過（已存在）${skipped} 筆、失敗 ${failed} 筆。`,
  );
}

main().catch((e) => {
  console.error("匯入腳本未預期錯誤", e);
  process.exit(1);
});
