'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { BookOpen } from 'lucide-react';

// エラーが起きても画面が真っ白にならず、何が原因か日本語で表示するガード
class SafeBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('FieldNote Render Error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 m-4 bg-rose-50 border border-rose-300 rounded-lg text-[#2B2F38]">
          <h2 className="text-lg font-bold text-rose-700 mb-2">野帳の表示中にエラーが発生しました</h2>
          <pre className="p-3 bg-white border border-rose-200 rounded text-xs overflow-auto font-mono text-rose-900 mb-4">
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#2B2F38] text-white rounded text-xs font-semibold"
          >
            ページを再読み込み
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// SSRを安全にオフにして読み込み
const KumanoFutureLabOS = dynamic(
  () => import('../components/KumanoFutureLabOS').then((mod) => {
    return mod.default || mod.KumanoFutureLabOS || mod;
  }),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-[#F8F6F0] text-[#2B2F38] gap-3 font-mono text-sm">
        <div className="w-6 h-6 border-2 border-[#2B2F38] border-t-transparent rounded-full animate-spin" />
        <span>Kumano Field Note 読み込み中...</span>
      </div>
    ),
  }
);

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#F8F6F0]">
      {/* デジタル図書室ボタン：Gather.townと被らないよう、画面右上ではなく「画面上部の中央（タイトル横）」へ配置 */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto">
        <a
          href="/archive"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2B2F38]/90 hover:bg-[#2B2F38] backdrop-blur-sm text-[#FCFBF8] border border-[#2B2F38] rounded-full text-xs font-semibold shadow-lg transition-all active:scale-95"
          title="デジタル図書室（アーカイブ）を開く"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#FCFBF8]" />
          <span>デジタル図書室</span>
          <span>→</span>
        </a>
      </div>

      <SafeBoundary>
        <KumanoFutureLabOS />
      </SafeBoundary>
    </main>
  );
}
