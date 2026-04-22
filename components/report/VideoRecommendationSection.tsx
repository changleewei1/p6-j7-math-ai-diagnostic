import type { ReportVideoItem } from "@/types/api";

type Props = { videos: ReportVideoItem[] };

export function VideoRecommendationSection({ videos }: Props) {
  return (
    <div>
      <h2 className="text-base font-semibold text-slate-900">推薦觀看影片</h2>
      <p className="mt-0.5 text-xs text-slate-500">依診斷弱點模組優先排序，最多 5 支。亦可於後台維護影片庫。</p>
      {videos.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">尚未建立影片，請執行 <code className="rounded bg-slate-100 px-1">npm run seed:videos</code> 或於 Supabase 手動新增。</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {videos.map((v) => (
            <li
              key={v.id}
              className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-xs font-medium text-emerald-800">{v.module}</p>
                <p className="text-sm font-semibold text-slate-900">{v.title}</p>
                {v.description && <p className="mt-1 text-sm text-slate-600">{v.description}</p>}
              </div>
              <a
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg border border-emerald-600/30 bg-white px-4 text-sm font-medium text-emerald-800 transition hover:bg-emerald-50"
              >
                開啟影片
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
