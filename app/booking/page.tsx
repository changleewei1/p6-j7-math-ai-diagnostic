import { BookingPageClient } from "@/components/booking/BookingPageClient";

export const metadata = {
  title: "預約試聽",
  description: "預約試聽與課程說明 — 小六升國一數學診斷。",
};

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string | string[] }>;
}) {
  const sp = await searchParams;
  const raw = sp.sessionId;
  const sessionId =
    typeof raw === "string" && /^[0-9a-f-]{36}$/i.test(raw.trim()) ? raw.trim() : null;

  return (
    <div className="min-h-full flex flex-col bg-gradient-to-b from-emerald-50/80 via-white to-slate-50/80">
      <BookingPageClient searchSessionId={sessionId} />
    </div>
  );
}
