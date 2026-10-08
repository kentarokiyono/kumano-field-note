'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import dynamic from 'next/dynamic';

class SafeBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Archive Render Error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 m-4 bg-rose-50 border border-rose-300 rounded-lg text-[#2B2F38] font-sans">
          <h2 className="text-lg font-bold text-rose-700 mb-2">デジタル図書室の表示中にエラーが発生しました</h2>
          <pre className="p-3 bg-white border border-rose-200 rounded text-xs overflow-auto font-mono text-rose-900 mb-4">
            {this.state.error?.toString()}
          </pre>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-[#2B2F38] text-white rounded text-xs font-semibold mr-2"
          >
            ← 現場野帳に戻る
          </a>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 border border-[#2B2F38] text-[#2B2F38] rounded text-xs font-semibold"
          >
            再読み込み
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// 相対パスで確実に KumanoArchive を読み込み（ローディング表示付き）
const KumanoArchiveApp = dynamic(
  () => import('../../components/KumanoArchive').then((mod) => mod.default || mod.KumanoArchiveApp || mod),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-[#F8F6F0] text-[#2B2F38] gap-3 font-mono text-sm">
        <div className="w-6 h-6 border-2 border-[#2B2F38] border-t-transparent rounded-full animate-spin" />
        <span>デジタル図書室（Kumano Archive）を読み込み中...</span>
      </div>
    ),
  }
);

export default function ArchivePage() {
  return (
    <SafeBoundary>
      <KumanoArchiveApp />
    </SafeBoundary>
  );
}
