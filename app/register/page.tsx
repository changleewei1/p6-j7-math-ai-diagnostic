import Link from "next/link";
import { RegisterForm } from "@/components/register/RegisterForm";
import { Navbar } from "@/components/home/Navbar";

export const metadata = {
  title: "填寫資料｜小六升國一數學診斷",
  description: "登記學生與家長聯絡方式後開始 15 題測驗。",
};

export default function RegisterPage() {
  return (
    <div className="min-h-full flex flex-col bg-gradient-to-b from-emerald-50/90 to-white text-slate-900">
      <Navbar />
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 pb-8 pt-1 sm:px-6 sm:pt-2">
        <div className="mx-auto w-full max-w-md">
          <h1 className="text-center text-lg font-bold text-slate-900 sm:text-xl">測前登記</h1>
          <p className="mt-2 text-center text-sm leading-relaxed text-slate-600">
            請先填寫
            <span className="font-medium text-slate-800">學生</span>與
            <span className="font-medium text-slate-800">家長</span>
            資料；完成後將開始數學能力診斷測驗。
          </p>
          <p className="mt-1 text-center text-xs text-slate-500">登記後即建立專屬測驗，建議在 5 分鐘內完成本頁填寫。</p>
          <p className="mt-2 text-center text-sm">
            <Link
              href="#parent-section"
              className="text-emerald-700 underline decoration-emerald-300 decoration-1 underline-offset-2 hover:text-emerald-800"
            >
              捲到「家長」欄位
            </Link>
          </p>
          <div className="mt-5">
            <RegisterForm />
          </div>
          <p className="mt-8 text-center text-sm text-slate-500">
            <Link href="/" className="text-emerald-800 underline decoration-emerald-200 hover:text-emerald-900">
              返回首頁
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
