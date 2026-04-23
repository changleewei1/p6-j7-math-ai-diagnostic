"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { QuestionVideoManager } from "@/components/admin/QuestionVideoManager";

export default function AdminQuestionVideosPage() {
  const params = useParams();
  const questionId = typeof params.questionId === "string" ? params.questionId : "";

  if (!questionId) {
    return (
      <div>
        <AdminPageHeader title="題目影片" />
        <p className="text-sm text-rose-700">參數錯誤</p>
        <Link href="/admin/questions" className="mt-2 inline-block text-sm text-emerald-800 underline">
          返回題庫
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <AdminPageHeader title="題目對應影片" subtitle="管理與本題相連結的 YouTube 內容" />
        <Link href="/admin/questions" className="text-sm text-emerald-800 underline">
          返回題庫
        </Link>
      </div>
      <QuestionVideoManager questionId={questionId} />
    </div>
  );
}
