"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  /** 登入成功後導向（已由伺服器驗證為安全路徑） */
  postLoginPath?: string;
};

export function AdminLoginForm({ postLoginPath = "/admin" }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (pending) return;
    setPending(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ secret: password }),
      });
      const data = (await res.json().catch(() => ({}))) as { success?: boolean; message?: string };
      if (res.status === 503) {
        setError("系統設定異常，請稍後再試。");
        return;
      }
      if (res.ok && data.success) {
        router.push(postLoginPath);
        router.refresh();
        return;
      }
      if (res.status === 401 || res.status === 400) {
        setError(data.message ?? "管理員密碼錯誤，請重新輸入。");
        return;
      }
      setError("管理員密碼錯誤，請重新輸入。");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-sm space-y-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8"
    >
      <p className="text-sm text-slate-600">請輸入管理員密碼以進入後台系統。</p>
      <div>
        <label htmlFor="admin-secret" className="mb-1.5 block text-sm font-medium text-slate-800">
          管理員密碼
        </label>
        <input
          id="admin-secret"
          name="secret"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="請輸入管理員密碼"
          disabled={pending}
          className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-xs outline-none ring-emerald-500/20 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 disabled:opacity-60"
        />
      </div>
      {error ? (
        <p className="text-sm text-rose-600" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "驗證中…" : "進入後台"}
      </button>
    </form>
  );
}
