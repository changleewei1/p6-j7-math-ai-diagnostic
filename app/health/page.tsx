import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "健康檢查",
  robots: "noindex, nofollow",
};

export default function HealthPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Deployment OK</h1>
      <p className="mt-2 text-slate-600">Site is running.</p>
      <p className="mt-6 text-sm text-slate-500">若需 API 驗證，請一併檢查 /api/health</p>
    </div>
  );
}
