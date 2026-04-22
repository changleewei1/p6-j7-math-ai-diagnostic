"use client";

import { useEffect, useState } from "react";
import { ContactInfoCard } from "@/components/report/ContactInfoCard";
import { BookingForm } from "@/components/booking/BookingForm";
import { BookingSuccessCard } from "@/components/booking/BookingSuccessCard";
import { suggestInterestedCourseFromRecommendationTitle } from "@/lib/booking/suggestCourseFromReport";
import { trackEvent } from "@/lib/tracking/client";
import type { InterestedCourseOption } from "@/lib/constants/booking";
import type { ReportApiResponse } from "@/types/api";
import type { QuizModule } from "@/types/quiz";
import { SectionCard } from "@/components/ui/SectionCard";

type Phase = "loading" | "ready";

const WHY_BULLETS = [
  "依本次診斷結果提供專屬學習建議",
  "課堂實際體驗學習方式",
  "由老師說明國一銜接重點",
] as const;

export function BookingPageClient({ searchSessionId }: { searchSessionId: string | null }) {
  const [phase, setPhase] = useState<Phase>(searchSessionId ? "loading" : "ready");
  const [studentName, setStudentName] = useState("");
  const [weakestModules, setWeakestModules] = useState<QuizModule[] | null>(null);
  const [course, setCourse] = useState<InterestedCourseOption>("想先了解適合的班別");
  const [successId, setSuccessId] = useState<string | null>(null);

  useEffect(() => {
    if (!searchSessionId) return;
    let cancelled = false;
    async function run() {
      setPhase("loading");
      try {
        const res = await fetch(`/api/report/${searchSessionId}`);
        const j = (await res.json().catch(() => ({}))) as ReportApiResponse;
        if (cancelled) return;
        if (res.ok && j?.success && j.reportReady) {
          setStudentName(j.studentName?.trim() ?? "");
          setWeakestModules(
            j.weakestModules && j.weakestModules.length > 0 ? j.weakestModules : null,
          );
          if (j.recommendations?.length) {
            setCourse(
              suggestInterestedCourseFromRecommendationTitle(j.recommendations[0].title),
            );
          }
        } else {
          setWeakestModules(null);
        }
      } catch {
        setWeakestModules(null);
      } finally {
        if (!cancelled) setPhase("ready");
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [searchSessionId]);

  if (successId) {
    return (
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:py-8">
        <BookingSuccessCard bookingId={successId} reportSessionId={searchSessionId} />
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="px-4 py-16 text-center text-sm text-slate-600">載入預約表單…</div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-4 py-6 sm:space-y-8 sm:py-8">
      <div className="text-center sm:text-left">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">預約試聽</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          填寫下列表單後，我們將由專人協助安排試聽與課程說明。
        </p>
        {searchSessionId ? (
          <p className="mt-1 text-xs text-slate-500">已帶入診斷工作階段參考，欄位可再修改。</p>
        ) : null}
      </div>

      <SectionCard>
        <h2 className="text-sm font-semibold text-slate-900 sm:text-base">為什麼建議預約試聽？</h2>
        <ul className="mt-2.5 space-y-1.5 text-sm text-slate-700">
          {WHY_BULLETS.map((t) => (
            <li key={t} className="flex gap-2">
              <span className="shrink-0 text-emerald-600" aria-hidden>
                ✔
              </span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      {searchSessionId && weakestModules && weakestModules.length > 0 ? (
        <div className="rounded-xl border border-amber-100/90 bg-amber-50/60 px-3 py-3 sm:px-4 sm:py-3.5">
          <p className="text-xs font-medium text-amber-950 sm:text-sm">本次診斷建議加強：</p>
          <ul className="mt-1.5 space-y-0.5 text-sm text-slate-800">
            {weakestModules.map((m) => (
              <li key={m} className="flex gap-1.5">
                <span aria-hidden>👉</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <BookingForm
        key={searchSessionId ?? "open"}
        initialSessionId={searchSessionId}
        defaultStudentName={studentName}
        defaultInterestedCourse={course}
        onSuccess={(id) => {
          trackEvent(searchSessionId, "submit_booking", { bookingId: id });
          setSuccessId(id);
        }}
      />

      <SectionCard>
        <h2 className="text-sm font-semibold text-slate-800">想先與專人聊聊？</h2>
        <p className="mt-1 text-sm text-slate-600">歡迎透過官方 LINE 或服務電話聯絡，無須填表也可。</p>
        <div className="mt-4">
          <ContactInfoCard
            onLineClick={() => {
              trackEvent(searchSessionId, "click_line", { from: "booking_contact" });
            }}
          />
        </div>
      </SectionCard>
    </div>
  );
}
