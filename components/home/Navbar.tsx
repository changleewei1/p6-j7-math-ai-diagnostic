import Image from "next/image";
import Link from "next/link";
import { CTA_PRIMARY_SM } from "@/components/home/ctaStyles";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-emerald-100/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 w-full max-w-5xl items-center justify-between gap-3 px-4 py-2 md:min-h-[5.5rem] md:gap-4 md:px-8">
        <Link href="/" className="flex min-w-0 flex-1 items-center gap-3 md:gap-4">
          <Image
            src="/logo.png"
            alt="名貫補習班"
            width={72}
            height={72}
            className="h-16 w-16 shrink-0 object-contain md:h-[4.5rem] md:w-[4.5rem]"
            priority
          />
          <span className="truncate text-2xl font-semibold text-slate-900 md:text-3xl">名貫補習班</span>
        </Link>
        <Link href="/register" className={`${CTA_PRIMARY_SM} h-10 shrink-0 px-4 text-base md:h-11 md:px-5`}>
          開始測驗
        </Link>
      </div>
    </header>
  );
}
