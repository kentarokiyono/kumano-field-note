'use client';

import dynamic from 'next/dynamic';

// SSRエラーを防ぐ動的インポート
const KumanoArchiveApp = dynamic(() => import('../../components/KumanoArchive'), {
  ssr: false,
});

export default function ArchivePage() {
  return <KumanoArchiveApp />;
}
