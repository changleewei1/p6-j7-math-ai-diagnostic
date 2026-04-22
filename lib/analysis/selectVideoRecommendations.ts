import { QUIZ_MODULES } from "@/lib/constants/quiz";
import type { VideoRecommendationRow } from "@/types/database";
import type { QuizModule } from "@/types/quiz";

const MAX = 5;

/**
 * 依弱點模組優先，自題庫影片表中挑選最多 5 支（規則式，不呼叫外部 API）
 */
export function selectVideoRecommendations(
  weakestModules: QuizModule[],
  rows: VideoRecommendationRow[],
): VideoRecommendationRow[] {
  const active = rows.filter((r) => r.is_active);
  const byModule = new Map<QuizModule, VideoRecommendationRow[]>();
  for (const m of QUIZ_MODULES) {
    byModule.set(m, []);
  }
  for (const r of active) {
    const list = byModule.get(r.module);
    if (list) list.push(r);
  }

  const out: VideoRecommendationRow[] = [];
  const seen = new Set<string>();

  const pushFrom = (mod: QuizModule) => {
    const list = byModule.get(mod) ?? [];
    for (const v of list) {
      if (out.length >= MAX) return;
      if (seen.has(v.id)) continue;
      seen.add(v.id);
      out.push(v);
    }
  };

  for (const w of weakestModules) {
    pushFrom(w);
  }
  for (const m of QUIZ_MODULES) {
    if (out.length >= MAX) break;
    pushFrom(m);
  }

  return out.slice(0, MAX);
}
