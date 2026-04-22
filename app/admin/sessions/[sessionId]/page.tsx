"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FollowUpStatusSelect } from "@/components/admin/FollowUpStatusSelect";
import type { AdminSessionDetailApiResponse } from "@/types/api";
import Link from "next/link";

export default function AdminSessionDetailPage() {
  const params = useParams();
  const sessionId = typeof params.sessionId === "string" ? params.sessionId : "";
  const [d, setD] = useState<AdminSessionDetailApiResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    let a = true;
    async function run() {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`/api/admin/sessions/${sessionId}`, { credentials: "include" });
        const j = (await res.json().catch(() => ({}))) as AdminSessionDetailApiResponse;
        if (!res.ok || j.success === false) {
          if (a) setErr((j as { message?: string }).message ?? "讀取失敗");
        } else if (a) {
          setD(j);
        }
      } catch {
        if (a) setErr("網路錯誤");
      } finally {
        if (a) setLoading(false);
      }
    }
    void run();
    return () => {
      a = false;
    };
  }, [sessionId]);

  if (loading) {
    return <p className="text-sm text-slate-600">讀取中…</p>;
  }
  if (err || !d?.success) {
    return (
      <div>
        <AdminPageHeader title="測驗詳情" />
        <p className="text-sm text-rose-700">{err ?? "讀取失敗"}</p>
        <Link href="/admin/sessions" className="mt-2 inline-block text-sm text-emerald-800 underline">
          返回列表
        </Link>
      </div>
    );
  }

  const sum = d.summary;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <AdminPageHeader title="測驗詳情" subtitle={`工作階段 ${d.session.id}`} />
        <Link href="/admin/sessions" className="text-sm text-emerald-800 underline">
          返回列表
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">學生</h2>
          <dl className="mt-2 space-y-1 text-sm text-slate-600">
            <div>
              <dt className="text-xs text-slate-400">姓名</dt>
              <dd>{d.student.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">學校／年級</dt>
              <dd>
                {d.student.school ?? "—"} / {d.student.grade}
              </dd>
            </div>
          </dl>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">家長</h2>
          <dl className="mt-2 space-y-1 text-sm text-slate-600">
            <div>
              <dt className="text-xs text-slate-400">姓名／手機</dt>
              <dd>
                {d.parent.name} / {d.parent.phone}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">個資同意 / 行銷同意</dt>
              <dd>
                {d.parent.consent ? "是" : "否"} / {d.parent.marketingOptIn ? "是" : "否"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Email / LINE</dt>
              <dd>
                {d.parent.email ?? "—"} / {d.parent.lineId ?? "—"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">成績與摘要</h2>
        <p className="mt-1 text-sm text-slate-600">
          狀態 {d.session.status} · 等第 {d.session.overallLevel ?? "—"} · 分數
          {d.session.overallScore ?? "—"}
          {sum?.readinessStatus ? ` · 銜接：${sum.readinessStatus}` : ""}
        </p>
        {sum?.narrativeSummary && (
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <p className="font-medium text-slate-900">{sum.narrativeSummary.headline}</p>
            <p>{sum.narrativeSummary.overviewParagraph}</p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <FollowUpStatusSelect
          sessionId={d.session.id}
          initial={d.session.followUpStatus}
        />
      </div>

      {d.recommendations.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-900">建議</h2>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {d.recommendations.map((r, i) => (
              <li key={i}>
                <span className="font-medium text-slate-800">{r.title}：</span>
                {r.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      {sum?.riskTags && sum.riskTags.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-900">風險標籤</h2>
          <p className="mt-1 text-sm text-slate-600">{sum.riskTags.join(" · ")}</p>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-slate-900">作答明細</h2>
        <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200 bg-white text-xs sm:text-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-2 py-2 text-left">#</th>
                <th className="px-2 py-2 text-left">模組</th>
                <th className="px-2 py-2 text-left">難度</th>
                <th className="px-2 py-2 text-left">選</th>
                <th className="px-2 py-2 text-left">對</th>
                <th className="px-2 py-2 text-left">秒</th>
                <th className="px-2 py-2 text-left">信心</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {d.answers.map((a) => (
                <tr key={`${a.questionId}-${a.questionOrder}`}>
                  <td className="px-2 py-1.5">{a.questionOrder}</td>
                  <td className="px-2 py-1.5">{a.module}</td>
                  <td className="px-2 py-1.5">{a.difficulty}</td>
                  <td className="px-2 py-1.5">{a.selectedChoiceIndex ?? "—"}</td>
                  <td className="px-2 py-1.5">{a.isCorrect ? "O" : "X"}</td>
                  <td className="px-2 py-1.5">{a.timeSpentSeconds}</td>
                  <td className="px-2 py-1.5">{a.confidenceLevel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
