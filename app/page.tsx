'use client';

import dynamic from 'next/dynamic';

// Leaflet（地図）はブラウザ専用のため、SSR（サーバーレンダリング）を無効化して読み込む
const KumanoFutureLabOS = dynamic(
  () => import('../components/KumanoFutureLabOS'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-[#F8F6F0] text-[#2B2F38]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B2F38] mb-3"></div>
        <p className="text-xs font-mono font-bold tracking-wider uppercase">Loading Kumano Field OS...</p>
      </div>
    ),
  }
);

export default function Home() {
  return (
    <main className="w-full h-screen overflow-hidden bg-[#F8F6F0]">
      <KumanoFutureLabOS />
    </main>
  );
}
