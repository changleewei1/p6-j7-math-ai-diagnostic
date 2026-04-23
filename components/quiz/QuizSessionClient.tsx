"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { QuizProgressBar } from "@/components/quiz/QuizProgressBar";
import { QuizQuestionCard } from "@/components/quiz/QuizQuestionCard";
import { SectionCard } from "@/components/ui/SectionCard";
import type {
  QuizAnswerApiResponse,
  QuizCurrentApiResponse,
  QuizFinishApiResponse,
  QuizStartApiResponse,
} from "@/types/api";
import type { ConfidenceLevel } from "@/types/quiz";

type Phase = "loading" | "ready" | "error" | "finishing";

type Props = { sessionId: string };

/**
 * 測驗主流程：啟動卷 → 讀當前題 → 送答 → 完成時 finish → 導向報告
 */
export function QuizSessionClient({ sessionId }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [data, setData] = useState<QuizCurrentApiResponse | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<ConfidenceLevel | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const shownAtRef = useRef<string | null>(null);

  const readJson = useCallback(
    async <T,>(res: Response): Promise<T> => {
      return (await res.json().catch(() => ({}))) as T;
    },
    [],
  );

  const callFinishAndReport = useCallback(async () => {
    setPhase("finishing");
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/quiz/${sessionId}/finish`, { method: "POST" });
      const body = await readJson<QuizFinishApiResponse>(res);
      if (!res.ok || body?.success === false) {
        const m =
          typeof body?.message === "string" ? body.message : `完成測驗失敗（${res.status}）`;
        setErrorMessage(m);
        setPhase("error");
        return;
      }
      router.replace(`/report/${sessionId}`);
    } catch {
      setErrorMessage("完成測驗時網路錯誤。");
      setPhase("error");
    }
  }, [readJson, router, sessionId]);

  const loadCurrent = useCallback(async (): Promise<QuizCurrentApiResponse | null> => {
    const resCurrent = await fetch(`/api/quiz/${sessionId}/current`);
    const bodyCurrent = await readJson<QuizCurrentApiResponse>(resCurrent);
    if (!resCurrent.ok || bodyCurrent?.success === false) {
      const m =
        typeof (bodyCurrent as { message?: string })?.message === "string"
          ? (bodyCurrent as { message: string }).message
          : `讀取題目失敗（${resCurrent.status}）`;
      setErrorMessage(m);
      setPhase("error");
      return null;
    }
    return bodyCurrent;
  }, [readJson, sessionId]);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      setPhase("loading");
      setErrorMessage(null);
      setData(null);

      try {
        const resStart = await fetch("/api/quiz/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const bodyStart = await readJson<QuizStartApiResponse>(resStart);

        if (!resStart.ok || bodyStart?.success === false) {
          const m =
            typeof bodyStart?.message === "string"
              ? bodyStart.message
              : `測驗啟動失敗（${resStart.status}）`;
          if (!cancelled) {
            setErrorMessage(m);
            setPhase("error");
          }
          return;
        }

        // 剛寫入 session_questions 後，少數環境讀到「尚未初始化」；短重試幾次再顯示錯誤
        let bodyCurrent: QuizCurrentApiResponse | null = null;
        for (let attempt = 0; attempt < 4; attempt++) {
          if (attempt > 0) {
            await new Promise((r) => setTimeout(r, 300));
          }
          const resCurrent = await fetch(`/api/quiz/${sessionId}/current`);
          const body = await readJson<QuizCurrentApiResponse & { message?: string }>(resCurrent);
          if (resCurrent.ok && body?.success) {
            bodyCurrent = body;
            break;
          }
          const msg = typeof body?.message === "string" ? body.message : "";
          const retryable = resCurrent.status === 404 && msg.includes("尚未初始化");
          if (retryable && attempt < 3) {
            continue;
          }
          const m = msg || `讀取題目失敗（${resCurrent.status}）`;
          if (!cancelled) {
            setErrorMessage(m);
            setPhase("error");
          }
          return;
        }
        if (cancelled || !bodyCurrent) return;

        if (bodyCurrent.completed) {
          await callFinishAndReport();
          return;
        }

        if (!bodyCurrent.question) {
          if (!cancelled) {
            setErrorMessage("暫時沒有題目資料，請重新整理。");
            setPhase("error");
          }
          return;
        }

        if (!cancelled) {
          shownAtRef.current = new Date().toISOString();
          setData(bodyCurrent);
          setPhase("ready");
        }
      } catch {
        if (!cancelled) {
          setErrorMessage("網路或伺服器錯誤，請稍後再試。");
          setPhase("error");
        }
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, [callFinishAndReport, loadCurrent, readJson, sessionId]);

  async function handleSubmit() {
    if (!data?.question) return;
    if (selectedChoice == null || confidence == null) {
      setSubmitError("請選擇選項與答題信心。");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    const answeredAt = new Date().toISOString();
    const shown = shownAtRef.current ?? answeredAt;
    const timeSpentSeconds = Math.max(
      0,
      (new Date(answeredAt).getTime() - new Date(shown).getTime()) / 1000,
    );

    try {
      const res = await fetch(`/api/quiz/${sessionId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: data.question.id,
          selectedChoiceIndex: selectedChoice,
          confidenceLevel: confidence,
          shownAt: shown,
          answeredAt,
          timeSpentSeconds,
        }),
      });
      const body = await readJson<QuizAnswerApiResponse>(res);
      if (!res.ok || !body?.success) {
        const m =
          typeof body?.message === "string" ? body.message : `送答失敗（${res.status}）`;
        setSubmitError(m);
        setSubmitting(false);
        return;
      }

      if (body.completed) {
        await callFinishAndReport();
        return;
      }

      const next = await loadCurrent();
      if (!next) {
        setSubmitting(false);
        return;
      }
      if (next.completed) {
        await callFinishAndReport();
        return;
      }
      if (!next.question) {
        setErrorMessage("讀取下一題失敗。");
        setPhase("error");
        setSubmitting(false);
        return;
      }
      shownAtRef.current = new Date().toISOString();
      setSelectedChoice(null);
      setConfidence(null);
      setSubmitError(null);
      setData(next);
    } catch {
      setSubmitError("網路錯誤，請重試。");
    } finally {
      setSubmitting(false);
    }
  }

  if (phase === "loading" || phase === "finishing") {
    return (
      <div className="px-4 py-16 text-center text-sm text-slate-600">
        {phase === "finishing" ? "正在產生報告…" : "載入測驗中…"}
      </div>
    );
  }

  if (phase === "error" && errorMessage) {
    return (
      <div className="px-4 py-6">
        <SectionCard>
          <h2 className="text-sm font-semibold text-rose-900">目前無法顯示測驗</h2>
          <p className="mt-2 text-sm text-slate-600">{errorMessage}</p>
          {/題庫|匯入|seed|不足/i.test(errorMessage) && (
            <p className="mt-2 text-xs text-slate-500">
              開發者請在本機專案執行匯入題庫腳本（如 README 的{" "}
              <code className="rounded bg-slate-100 px-1">npm run seed:questions</code>），並確認
              <code className="rounded bg-slate-100 px-1">question_bank</code> 內有足夠模組與難度題目。
            </p>
          )}
          <p className="mt-4">
            <button
              type="button"
              onClick={() => {
                window.location.reload();
              }}
              className="min-h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
            >
              重新載入此頁
            </button>
          </p>
        </SectionCard>
      </div>
    );
  }

  if (!data?.question) {
    return (
      <div className="px-4 py-6">
        <SectionCard>
          <h2 className="text-sm font-semibold text-slate-800">尚無題目</h2>
          <p className="mt-1 text-sm text-slate-600">請重新整理此頁面，或回上一頁重新進入。</p>
        </SectionCard>
      </div>
    );
  }

  const q = data.question;
  const total = data.totalQuestions;
  const ac = data.answeredCount ?? 0;

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-4 sm:py-6">
      <div className="mb-4">
        <QuizProgressBar
          answeredCount={ac}
          total={total}
          currentOrder={data.currentQuestionOrder}
        />
      </div>
      <QuizQuestionCard
        key={q.id}
        orderIndex={data.currentQuestionOrder}
        totalQuestions={total}
        module={q.module}
        difficulty={q.difficulty}
        prompt={q.prompt}
        choices={q.choices}
        estimatedSeconds={q.estimated_time_seconds}
        selectedChoice={selectedChoice}
        onSelectChoice={setSelectedChoice}
        confidence={confidence}
        onSelectConfidence={setConfidence}
        onSubmit={handleSubmit}
        canSubmit={selectedChoice != null && confidence != null && !submitting}
        submitLoading={submitting}
        submitError={submitError}
      />
    </div>
  );
}
