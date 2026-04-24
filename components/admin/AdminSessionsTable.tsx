import Link from "next/link";
import type { AdminSessionListItem } from "@/types/api";

const wrap = "whitespace-nowrap px-2 py-2 text-left text-xs sm:text-sm";

export function AdminSessionsTable({ items }: { items: AdminSessionListItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-500">沒有符合條件的資料。</p>;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className={wrap}>學生</th>
            <th className={wrap}>家長</th>
            <th className={wrap}>手機</th>
            <th className={wrap}>介紹人</th>
            <th className={wrap}>介紹人聯絡</th>
            <th className={wrap}>建立</th>
            <th className={wrap}>狀態</th>
            <th className={wrap}>等第</th>
            <th className={wrap}>分數</th>
            <th className={wrap}>追蹤</th>
            <th className={wrap}>行銷</th>
            <th className={wrap}>操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((r) => (
            <tr key={r.id} className="hover:bg-slate-50/80">
              <td className={wrap + " max-w-[8rem] truncate font-medium text-slate-800"}>
                {r.studentName}
              </td>
              <td className={wrap + " max-w-[8rem] truncate"}>{r.parentName}</td>
              <td className={wrap}>{r.parentPhone}</td>
              <td className={wrap + " max-w-[7rem] truncate text-slate-700"}>
                {r.referrerName?.trim() ? r.referrerName : "—"}
              </td>
              <td className={wrap + " max-w-[8rem] truncate text-slate-600"}>
                {r.referrerContact?.trim() ? r.referrerContact : "—"}
              </td>
              <td className={wrap + " text-slate-500"}>
                {new Date(r.createdAt).toLocaleString("zh-TW", { dateStyle: "short", timeStyle: "short" })}
              </td>
              <td className={wrap}>{r.status}</td>
              <td className={wrap}>{r.overallLevel ?? "—"}</td>
              <td className={wrap}>{r.overallScore ?? "—"}</td>
              <td className={wrap}>{r.followUpStatus}</td>
              <td className={wrap}>{r.marketingOptIn ? "是" : "否"}</td>
              <td className={wrap}>
                <Link
                  href={`/admin/sessions/${r.id}`}
                  className="font-medium text-emerald-800 underline"
                >
                  詳情
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
