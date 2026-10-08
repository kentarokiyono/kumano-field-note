'use client';

import dynamic from 'next/dynamic';
import { BookOpen } from 'lucide-react';

const KumanoFutureLabOS = dynamic(
  () => import('../components/KumanoFutureLabOS'),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#F8F6F0]">
      {/* デジタル図書室への移動ボタン */}
      <div className="fixed top-2.5 right-14 md:right-24 z-[9999]">
        <a
          href="/archive"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2B2F38] hover:bg-[#3A3F4B] text-[#FCFBF8] border border-[#2B2F38] rounded-md text-xs font-semibold shadow-md transition-all active:scale-95"
          title="デジタル図書室（アーカイブ）を開く"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#FCFBF8]" />
          <span className="hidden sm:inline">デジタル図書室</span>
          <span className="sm:hidden">図書室</span>
          <span>→</span>
        </a>
      </div>

      <KumanoFutureLabOS />
    </main>
  );
}
