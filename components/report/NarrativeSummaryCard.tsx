import { SectionCard } from "@/components/ui/SectionCard";
import type { NarrativeSummaryBlock } from "@/types/sessionAnalysis";

type Props = { narrative: NarrativeSummaryBlock | null | undefined };

export function NarrativeSummaryCard({ narrative }: Props) {
  if (!narrative) {
    return (
      <SectionCard title="診斷摘要" className="border-dashed">
        <p className="text-sm text-slate-500">此份報告為較早版本產生，暫無長篇敘事摘要。可重新測驗以取得最新分析。</p>
      </SectionCard>
    );
  }
  return (
    <div className="space-y-4">
      <SectionCard title="診斷摘要總覽" className="bg-white/90">
        <p className="text-sm leading-relaxed text-slate-700 md:text-base">{narrative.overviewParagraph}</p>
      </SectionCard>
      <SectionCard title="優勢與亮點" className="bg-white/90">
        <p className="text-sm leading-relaxed text-slate-700 md:text-base">{narrative.strengthsParagraph}</p>
      </SectionCard>
      <SectionCard title="待留意面向" className="bg-white/90">
        <p className="text-sm leading-relaxed text-slate-700 md:text-base">{narrative.risksParagraph}</p>
      </SectionCard>
      <SectionCard title="學習與演練建議" className="bg-white/90">
        <p className="text-sm leading-relaxed text-slate-700 md:text-base">{narrative.studyAdviceParagraph}</p>
      </SectionCard>
      <SectionCard title="致家長" className="border-emerald-200/60 bg-emerald-50/40">
        <p className="text-sm leading-relaxed text-slate-800 md:text-base">{narrative.parentMessageParagraph}</p>
      </SectionCard>
    </div>
  );
}
