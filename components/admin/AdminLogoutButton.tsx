"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onLogout() {
    if (pending) return;
    setPending(true);
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
      router.push("/admin-login");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={pending}
      className="text-slate-500 underline-offset-2 transition hover:text-slate-800 hover:underline disabled:opacity-50"
    >
      {pending ? "登出中…" : "登出"}
    </button>
  );
}
