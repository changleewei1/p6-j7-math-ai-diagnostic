import { SectionCard } from "@/components/ui/SectionCard";

type Rec = { recommendation_type: string; title: string; description: string; url: string | null; created_at: string };

type Props = { items: Rec[]; highlights: string[] | null | undefined };

export function RecommendationSection({ items, highlights }: Props) {
  return (
    <div>
      {highlights && highlights.length > 0 && (
        <div className="mb-3 rounded-lg border border-emerald-100 bg-emerald-50/30 px-3 py-2 text-sm text-slate-700">
          <span className="font-medium text-emerald-900">要點：</span>
          {highlights.join(" · ")}
        </div>
      )}
      <h2 className="text-base font-semibold text-slate-900">推薦課程與學習路徑</h2>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">暫無特別建議，建議以延續練習為主。</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((r, i) => (
            <li key={i}>
              <SectionCard className="p-3.5" title={r.title} subtitle={r.recommendation_type}>
                <p className="text-sm leading-relaxed text-slate-600">{r.description}</p>
              </SectionCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
