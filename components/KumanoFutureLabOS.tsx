'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  Navigation,
  X,
  MapPin,
  Clock,
  Download,
  Upload,
  Archive,
  Waves,
  Plus,
  Trash2,
  Edit3,
  Map as MapIcon,
  ArrowLeft,
  ArrowRight,
  GitBranch,
  BookOpen,
  Layers,
  ChevronUp,
  ChevronDown,
  Film,
  Camera,
  Maximize2,
  ExternalLink,
  Check,
  Compass,
  Globe
} from 'lucide-react';

export type Language = 'ja' | 'en';

// 調査地区（エリア）の型定義
export interface AreaConfig {
  id: string;
  name: string;           // 地区名（例: 「堀・笠島地区」）
  nameEn?: string;
  municipality: string;   // 自治体名（例: 「和歌山県串本町」）
  municipalityEn?: string;
  center: [number, number]; // [経度, 緯度]
  defaultZoom: number;
  targetElevation: string; // 地区ごとの避難目標標高（例: 「海抜20m以上」）
  targetElevationEn?: string;
  description: string;
  descriptionEn?: string;
}

// 登録済み地区マスタ（フィールドワーク基準エリア）
export const REGISTERED_AREAS: AreaConfig[] = [
  {
    id: 'kushimoto-hori-kasajima',
    name: '堀・笠島地区',
    nameEn: 'Hori & Kasajima',
    municipality: '和歌山県串本町',
    municipalityEn: 'Kushimoto, Wakayama',
    center: [135.778, 33.475],
    defaultZoom: 15,
    targetElevation: '海抜20m以上',
    targetElevationEn: 'Elevation ≥20m',
    description: '昭和南海地震の教訓と裏山小径、井戸水脈が残る沿岸集落',
    descriptionEn: 'Coastal settlement preserving 1946 Nankai earthquake lore, hillside paths, and wells',
  },
  {
    id: 'kushimoto-oshima',
    name: '大島地区',
    nameEn: 'Oshima Island',
    municipality: '和歌山県串本町',
    municipalityEn: 'Kushimoto, Wakayama',
    center: [135.815, 33.468],
    defaultZoom: 14.5,
    targetElevation: '海抜25m以上',
    targetElevationEn: 'Elevation ≥25m',
    description: '島しょ部の孤立対策、段々畑と古井戸の生活史',
    descriptionEn: 'Island isolation countermeasures, terraced fields, and historic water sources',
  },
  {
    id: 'kushimoto-shionomisaki',
    name: '潮岬地区',
    nameEn: 'Shionomisaki',
    municipality: '和歌山県串本町',
    municipalityEn: 'Kushimoto, Wakayama',
    center: [135.760, 33.435],
    defaultZoom: 14.5,
    targetElevation: '海抜30m以上',
    targetElevationEn: 'Elevation ≥30m',
    description: '本州最南端の台地、風衝地特有の防風林と避難動線',
    descriptionEn: 'Honshu southernmost plateau with windbreak forests and evacuation corridors',
  },
];

export const UI_TEXT = {
  ja: {
    mapTab: '地図',
    branchTab: 'つながり',
    recordsTab: '記録一覧',
    virtualLab: '仮想研究所',
    virtualLabShort: '研究所',
    allFilter: 'すべて',
    tsunamiDepth: '津波浸水深',
    targetGoal: '避難目標',
    surveyStart: '調査開始',
    surveying: '調査中',
    locateMe: '現在地',
    addMemo: 'メモを残す',
    recordVoice: '声を録る',
    stop: '停止',
    recordingVoice: '聞き書き録音中',
    narratorLabel: '語り手',
    listenVoice: '証言を聴く',
    seeConnections: 'つながりを見る',
    routeHeading: '集落連絡小径・避難路の連環',
    addPointBtn: '地点を追加',
    incomingRoutes: 'この地点へ至るルート:',
    fromHereRoutes: 'ここからの小径・つながり',
    noConnectionsYet: 'つながっている小径・分岐はまだありません。「つながりを追加」から他の地点と結べます。',
    addConnectionBtn: 'つながりを追加',
    proceedPath: 'この先へ進む',
    viewOnMap: '地図で見る',
    backToMap: '地図に戻る',
    recordsHeading: '聞き書き記録一覧',
    recordsSubtitle: '件の現地記録',
    surveyDistrictLabel: '調査地区:',
    newDistrictBtn: '新規地区',
    noRecordsInDistrict: 'にはまだ記録がありません',
    noRecordsSub: '現地で「声を録る」または「メモを残す」から記録を追加してみましょう',
    addFirstRecord: 'この地区の最初の記録を残す',
    editRecord: '記録の編集',
    addNewRecord: '新しい記録を追加',
    recordType: '記録の種別',
    pointTitle: '地点・記録の見出し',
    narratorInput: '語り手 / 情報提供者',
    elevationInput: '標高目安',
    noteInput: '話の内容・観察メモ',
    mediaLabel: '現地の写真・動画',
    addPhoto: '写真を追加',
    photoUploadHint: 'タップしてカメラ撮影または写真を選択（最大3件）',
    photoUploadSub: '※写真は高解像度のままIndexedDBへ永続保存されます',
    tagsLabel: 'タグ（カンマ区切り）',
    cancel: 'キャンセル',
    save: '保存する',
    addConnectionModalTitle: '新しいつながりを追加',
    targetPointLabel: 'つなぎ先の地点',
    relationTypeLabel: '関係性・ルート名',
    routeNoteLabel: 'ルートの補足・知恵（任意）',
    connectBtn: '接続する',
    areaModalTitle: '調査地区（野帳エリア）の選択',
    areaModalSub: '地区を切り替えると、その地域の地図・避難知・記録へジャンプします',
    registeredDistricts: '登録済み地区',
    addNewDistrictHeading: '新しい地区（野帳）を追加する',
    createAtGps: '現在地で作成',
    createAtCenter: '地図中心で作成',
    recordsCountLabel: '記録',
    pointsUnit: '地点',
    exportZipBtn: 'ZIP一括保存',
    importZipBtn: 'ZIP復元',
    noAudioWarn: '再生できる音声ファイルがありません',
  },
  en: {
    mapTab: 'MAP',
    branchTab: 'CONNECTIONS',
    recordsTab: 'RECORDS',
    virtualLab: 'VIRTUAL LAB',
    virtualLabShort: 'LAB',
    allFilter: 'ALL',
    tsunamiDepth: 'Tsunami Inundation Depth',
    targetGoal: 'Evacuation Target',
    surveyStart: 'START SURVEY',
    surveying: 'SURVEYING',
    locateMe: 'LOCATE',
    addMemo: 'ADD NOTE',
    recordVoice: 'RECORD VOICE',
    stop: 'STOP',
    recordingVoice: 'RECORDING ORAL TESTIMONY',
    narratorLabel: 'Narrator',
    listenVoice: 'Listen to Testimony',
    seeConnections: 'View Connections',
    routeHeading: 'Pathways & Evacuation Linkages',
    addPointBtn: 'Add Point',
    incomingRoutes: 'Approaching routes to this point:',
    fromHereRoutes: 'Connected pathways from here',
    noConnectionsYet: 'No connections registered yet. Connect other points using "Add Connection".',
    addConnectionBtn: 'Add Connection',
    proceedPath: 'Follow Path',
    viewOnMap: 'Locate on Map',
    backToMap: 'Back to Map',
    recordsHeading: 'Field Records Archive',
    recordsSubtitle: 'field records',
    surveyDistrictLabel: 'District:',
    newDistrictBtn: 'New District',
    noRecordsInDistrict: 'has no records yet',
    noRecordsSub: 'Add records on-site using "Record Voice" or "Add Note"',
    addFirstRecord: 'Record the first entry for this district',
    editRecord: 'Edit Record',
    addNewRecord: 'Add New Record',
    recordType: 'Record Category',
    pointTitle: 'Point / Record Title',
    narratorInput: 'Narrator / Informant',
    elevationInput: 'Elevation Guide',
    noteInput: 'Interview / Field Notes',
    mediaLabel: 'Field Photos & Videos',
    addPhoto: 'Add Photo',
    photoUploadHint: 'Tap to capture photo or select files (max 3)',
    photoUploadSub: '* Photos are saved directly into IndexedDB in high quality',
    tagsLabel: 'Tags (comma separated)',
    cancel: 'Cancel',
    save: 'Save',
    addConnectionModalTitle: 'Add New Connection',
    targetPointLabel: 'Target Point',
    relationTypeLabel: 'Relationship / Route Name',
    routeNoteLabel: 'Route notes & lore (optional)',
    connectBtn: 'Connect',
    areaModalTitle: 'Select Survey District (Field Notebook)',
    areaModalSub: 'Switching district updates the map, evacuation lore, and local notes',
    registeredDistricts: 'Registered Districts',
    addNewDistrictHeading: 'Add New District (Notebook)',
    createAtGps: 'Create at GPS Location',
    createAtCenter: 'Create at Map Center',
    recordsCountLabel: 'Records',
    pointsUnit: 'pts',
    exportZipBtn: 'Export ZIP',
    importZipBtn: 'Import ZIP',
    noAudioWarn: 'No playable audio file available',
  }
};

// 国土地理院 重ねるハザードマップ（津波浸水想定 新凡例）の6段階区分
export const TSUNAMI_DEPTH_LEGEND = [
  { label: '20.0m 以上', labelEn: '≥ 20.0m', note: '4階屋根以上', noteEn: '4th floor roof+', color: '#4a0040', textColor: '#ffffff' },
  { label: '10.0m 〜 20.0m', labelEn: '10.0m – 20.0m', note: '3〜4階水没', noteEn: '3-4 floors submerged', color: '#721b65', textColor: '#ffffff' },
  { label: '5.0m 〜 10.0m', labelEn: '5.0m – 5.0m', note: '2階屋根まで', noteEn: 'Up to 2nd floor roof', color: '#b23b8c', textColor: '#ffffff' },
  { label: '3.0m 〜 5.0m', labelEn: '3.0m – 5.0m', note: '2階軒下まで', noteEn: 'Up to 2nd floor eaves', color: '#e60012', textColor: '#ffffff' },
  { label: '0.5m 〜 3.0m', labelEn: '0.5m – 3.0m', note: '1階軒下まで', noteEn: 'Up to 1st floor eaves', color: '#f7be85', textColor: '#1e293b' },
  { label: '0.5m 未満', labelEn: '< 0.5m', note: '床下・大人の膝', noteEn: 'Under floor / adult knees', color: '#ffffb3', textColor: '#1e293b' },
];

// メディアアイテム（写真・動画）の型定義（実体はIndexedDBに保持し、ハッシュ値とメタデータをlocalStorageで管理）
export interface MediaItem {
  id: string;
  blobId?: string;
  type: 'image' | 'video';
  url?: string; // 実行時に生成される一時BlobURL
  checksum?: string; // SHA-256 (64文字)
  mimeType?: string;
  caption?: string;
  originalName?: string;
}

// ローカル・ナレッジのカテゴリ定義（アーカイブアプリと完全一致）
export type KnowledgeCategory = 'all' | 'disaster' | 'living' | 'water' | 'industry' | 'culture';

export const CATEGORY_CONFIG: Record<
  string,
  { label: { ja: string; en: string }; code: string; color: string; badgeBorder: string; badgeText: string; badgeBg: string }
> = {
  disaster: {
    label: { ja: '防災・避難知', en: 'Disaster & Evacuation' },
    code: 'DISASTER',
    color: '#E11D48',
    badgeBorder: 'border-rose-500/40',
    badgeText: 'text-rose-700',
    badgeBg: 'bg-rose-50'
  },
  living: {
    label: { ja: '暮らし・住まい', en: 'Living & Housing' },
    code: 'LIVING',
    color: '#D97706',
    badgeBorder: 'border-amber-500/40',
    badgeText: 'text-amber-800',
    badgeBg: 'bg-amber-50'
  },
  water: {
    label: { ja: '水脈・井戸', en: 'Water & Wells' },
    code: 'WATER',
    color: '#0284C7',
    badgeBorder: 'border-sky-500/40',
    badgeText: 'text-sky-800',
    badgeBg: 'bg-sky-50'
  },
  industry: {
    label: { ja: '生業・山海', en: 'Livelihood & Commons' },
    code: 'INDUSTRY',
    color: '#059669',
    badgeBorder: 'border-emerald-500/40',
    badgeText: 'text-emerald-800',
    badgeBg: 'bg-emerald-50'
  },
  culture: {
    label: { ja: '歴史・風土伝承', en: 'History & Lore' },
    code: 'CULTURE',
    color: '#4F46E5',
    badgeBorder: 'border-indigo-500/40',
    badgeText: 'text-indigo-800',
    badgeBg: 'bg-indigo-50'
  },
};

// ノード間の関係性（つながり・分岐・小径）
export interface KnowledgeConnection {
  targetId: string;
  relationType: string;
  description?: string;
  estimatedTime?: string;
}

// ローカル・ナレッジノード本体（失効するBlobURLは含めず、BlobIDとSHA-256で安全に管理）
export interface KnowledgeNode {
  id: string;
  areaId: string;
  title: string;
  category: KnowledgeCategory;
  narrator: string;
  narratorAge?: number;
  elevation: string;
  coordinates: [number, number];
  audioBlobId?: string;
  audioChecksum?: string;
  audioMimeType?: string;
  audioUrl?: string; // 画面描画用の一時オブジェクトURL
  duration: string;
  note: string;
  tags: string[];
  connections: KnowledgeConnection[];
  media?: MediaItem[];
  createdAt: string;
  isArchived?: boolean; // 論理削除対応フラグ
}

const DB_NAME = 'kumano_field_media_db_v1';
const STORE_NAME = 'media_blobs';

// IndexedDB の接続インスタンス取得
function openMediaDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// SHA-256 チェックサムの高速計算 (Web Crypto API)
async function computeSHA256(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// メディア実体の IndexedDB 保存
async function storeMediaBlob(id: string, blob: Blob, mimeType: string): Promise<string> {
  const checksum = await computeSHA256(blob);
  const db = await openMediaDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const item = {
      id,
      blob,
      mimeType,
      checksum,
      createdAt: new Date().toISOString(),
    };
    const req = store.put(item);
    req.onsuccess = () => resolve(checksum);
    req.onerror = () => reject(req.error);
  });
}

// メディア実体の IndexedDB 読み出し
async function fetchMediaBlob(id: string): Promise<{ blob: Blob; mimeType: string; checksum: string } | null> {
  try {
    const db = await openMediaDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result ? { blob: req.result.blob, mimeType: req.result.mimeType, checksum: req.result.checksum } : null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    return null;
  }
}

// メディア実体の削除
async function removeMediaBlob(id: string): Promise<void> {
  try {
    const db = await openMediaDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {}
}

// JSZip ライブラリの動的ローダー
function loadJSZipLibrary(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('Window not available'));
    if ((window as any).JSZip) return resolve((window as any).JSZip);

    const scriptId = 'jszip-cdn-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      script.async = true;
      document.body.appendChild(script);
    }
    script.addEventListener('load', () => resolve((window as any).JSZip));
    script.addEventListener('error', () => reject(new Error('Failed to load JSZip')));
  });
}

type ViewMode = 'map' | 'branch-tree' | 'archive';
const INITIAL_KNOWLEDGE_NODES: KnowledgeNode[] = [];

/**
 * Kushimoto Future Lab.svg のピクセルシルエットを忠実に再現した高精細ベクター
 */
export function KumanoLogoSilhouette({ className = 'text-[#23272F]' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 148 28"
      fill="currentColor"
      className={className}
      preserveAspectRatio="xMidYMid meet"
      shapeRendering="crispEdges"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0" y="14" width="3" height="12" />
      <rect x="3" y="12" width="3" height="14" />
      <rect x="6" y="8" width="3" height="18" />
      <rect x="9" y="3" width="3" height="23" />
      <rect x="12" y="9" width="3" height="17" />
      <rect x="15" y="14" width="3" height="12" />
      <rect x="18" y="18" width="4" height="8" />
      <rect x="22" y="18" width="3" height="8" />
      <rect x="25" y="20" width="4" height="6" />
      <rect x="5" y="24" width="2" height="3" fill="#FCFBF9" />
      <rect x="11" y="24" width="2" height="3" fill="#FCFBF9" />
      <rect x="19" y="24" width="2" height="3" fill="#FCFBF9" />
      <rect x="32" y="21" width="2.4" height="2.4" />
      <rect x="38" y="21" width="20" height="5" />
      <rect x="40" y="17" width="16" height="9" />
      <rect x="42" y="13" width="12" height="13" />
      <rect x="44" y="9" width="8" height="17" />
      <rect x="46" y="5.5" width="4" height="20.5" />
      <rect x="47" y="3" width="2" height="23" />
      <rect x="44" y="24" width="2.5" height="3" fill="#FCFBF9" />
      <rect x="52" y="24" width="2.5" height="3" fill="#FCFBF9" />
      <rect x="64" y="21" width="22" height="5" />
      <rect x="66" y="17" width="18" height="9" />
      <rect x="68" y="13" width="14" height="13" />
      <rect x="70.5" y="9" width="9" height="17" />
      <rect x="72.5" y="5" width="5" height="21" />
      <rect x="73.5" y="1" width="3" height="25" />
      <rect x="70" y="24" width="2.5" height="3" fill="#FCFBF9" />
      <rect x="78" y="24" width="2.5" height="3" fill="#FCFBF9" />
      <rect x="92" y="21" width="16" height="5" />
      <rect x="94" y="17" width="12" height="9" />
      <rect x="96" y="12" width="8" height="14" />
      <rect x="98" y="7" width="4" height="19" />
      <rect x="99" y="3.5" width="2" height="22.5" />
      <rect x="99" y="24" width="2.5" height="3" fill="#FCFBF9" />
      <rect x="114" y="19" width="3" height="7" />
      <rect x="117" y="13" width="3" height="13" />
      <rect x="120" y="8" width="4" height="18" />
      <rect x="124" y="8" width="4" height="18" />
      <rect x="128" y="13" width="3" height="13" />
      <rect x="131" y="15" width="3" height="11" />
      <rect x="134" y="13" width="2.5" height="13" />
      <rect x="136.5" y="17" width="2.5" height="9" />
      <rect x="139" y="20" width="3" height="6" />
      <rect x="142" y="14" width="3" height="12" />
      <rect x="145" y="19" width="3" height="7" />
      <rect x="121" y="24" width="2.5" height="3" fill="#FCFBF9" />
      <rect x="133" y="24" width="2.5" height="3" fill="#FCFBF9" />
      <rect x="141" y="24" width="2.5" height="3" fill="#FCFBF9" />
    </svg>
  );
}

export function KumanoLogo({
  variant = 'lockup',
  className = '',
}: {
  variant?: 'full' | 'lockup' | 'silhouette-only';
  className?: string;
}) {
  if (variant === 'silhouette-only') {
    return <KumanoLogoSilhouette className={`w-28 h-5 text-[#2B2F38] ${className}`} />;
  }
  if (variant === 'lockup') {
    return (
      <div className={`flex flex-col items-start select-none ${className}`}>
        <KumanoLogoSilhouette className="w-24 sm:w-28 h-auto text-[#2B2F38]" />
        <span className="text-[8px] font-mono tracking-[0.24em] text-[#2B2F38] mt-1 uppercase font-semibold -mr-[0.24em]">
          Kumano Future Lab.
        </span>
      </div>
    );
  }
  return (
    <div className={`flex flex-col items-center justify-center gap-3 select-none ${className}`}>
      <KumanoLogoSilhouette className="w-44 sm:w-48 h-auto text-[#2B2F38]" />
      <span className="text-xs font-sans tracking-[0.32em] text-[#2B2F38] uppercase font-medium -mr-[0.32em] text-center">
        K U M A N O &nbsp; F U T U R E &nbsp; L A B .
      </span>
    </div>
  );
}

export default function KumanoFutureLabOS() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const tsunamiLayerRef = useRef<any>(null);
  const trackPolylineRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const nodeMarkersMapRef = useRef<{ [key: string]: any }>({});

  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('kumano_lang_pref') as Language;
        if (saved === 'ja' || saved === 'en') return saved;
      } catch (e) {}
    }
    return 'ja';
  });

  const changeLanguage = (nextLang: Language) => {
    setLang(nextLang);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('kumano_lang_pref', nextLang);
      }
    } catch (e) {}
    showToast(nextLang === 'ja' ? '表示言語を「日本語」に切り替えました' : 'Switched language to English');
  };

  const t = UI_TEXT[lang];

  const [areas, setAreas] = useState<AreaConfig[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('kumano_field_areas_v1');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return REGISTERED_AREAS;
  });

  const [currentAreaId, setCurrentAreaId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('kumano_field_current_area_v1');
        if (saved) return saved;
      } catch (e) {}
    }
    return 'kushimoto-hori-kasajima';
  });

  const [isAreaModalOpen, setIsAreaModalOpen] = useState<boolean>(false);
  const [newAreaName, setNewAreaName] = useState<string>('');
  const [newAreaMunicipality, setNewAreaMunicipality] = useState<string>('和歌山県串本町');
  const [newAreaElevation, setNewAreaElevation] = useState<string>('海抜20m以上');
  const [newAreaDesc, setNewAreaDesc] = useState<string>('');

  const currentArea = areas.find((a) => a.id === currentAreaId) || areas[0] || REGISTERED_AREAS[0];

  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<KnowledgeCategory>('all');
  const [activeNodeId, setActiveNodeId] = useState<string>('');

  const [nodes, setNodes] = useState<KnowledgeNode[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('kumano_field_knowledge_v1');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_KNOWLEDGE_NODES;
  });

  // ブラウザ永続ストレージの要求 (自動削除を抑止)
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().then((persistent) => {
        if (persistent) {
          console.log('Kumano Future Lab: Storage persistence granted.');
        }
      }).catch(() => {});
    }
  }, []);

  // IndexedDBからメディア実体を読み出し、一時URL（BlobURL）を再接続するハイドレーション
  useEffect(() => {
    let isCancelled = false;
    const objectUrlsToRevoke: string[] = [];

    const hydrateBlobs = async () => {
      let hasUpdates = false;
      const updatedNodes = await Promise.all(
        nodes.map(async (node) => {
          let updatedNode = { ...node };

          // 音声実体の復元
          if (node.audioBlobId && !node.audioUrl) {
            const audioData = await fetchMediaBlob(node.audioBlobId);
            if (audioData && !isCancelled) {
              const url = URL.createObjectURL(audioData.blob);
              objectUrlsToRevoke.push(url);
              updatedNode.audioUrl = url;
              hasUpdates = true;
            }
          }

          // 写真・動画実体の復元
          if (node.media && node.media.length > 0) {
            const updatedMedia = await Promise.all(
              node.media.map(async (med) => {
                if (med.blobId && !med.url) {
                  const mediaData = await fetchMediaBlob(med.blobId);
                  if (mediaData && !isCancelled) {
                    const url = URL.createObjectURL(mediaData.blob);
                    objectUrlsToRevoke.push(url);
                    hasUpdates = true;
                    return { ...med, url, mimeType: mediaData.mimeType, checksum: mediaData.checksum };
                  }
                }
                return med;
              })
            );
            updatedNode.media = updatedMedia;
          }

          return updatedNode;
        })
      );

      if (hasUpdates && !isCancelled) {
        setNodes(updatedNodes);
      }
    };

    hydrateBlobs();

    return () => {
      isCancelled = true;
      objectUrlsToRevoke.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [currentAreaId]);

  // localStorage への安全な保存（実体BlobURLは保存せず、IDとチェックサムのみを同期）
  useEffect(() => {
    try {
      const sanitized = nodes.map((node) => ({
        ...node,
        audioUrl: undefined, // 失効するBlobURLを除外
        media: (node.media || []).map((m) => ({
          ...m,
          url: undefined, // 失効するBlobURLを除外
        })),
      }));
      localStorage.setItem('kumano_field_knowledge_v1', JSON.stringify(sanitized));
    } catch (e: any) {
      if (e?.name === 'QuotaExceededError' || e?.code === 22) {
        showToast('⚠️ 端末の保存容量の上限です。ZIP書き出しでバックアップしてください');
      }
    }
  }, [nodes]);

  const currentAreaNodes = nodes.filter((n) => (n.areaId ? n.areaId === currentAreaId : true));

  const [currentCoords, setCurrentCoords] = useState<[number, number]>(currentArea.center);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [lastFixTime, setLastFixTime] = useState<string>('');
  const [trackCoordinates, setTrackCoordinates] = useState<[number, number][]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`kumano_field_track_v1_${currentAreaId}`);
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [currentArea.center];
  });

  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [showTsunamiLayer, setShowTsunamiLayer] = useState<boolean>(false);
  const [mapLayerType, setMapLayerType] = useState<'pale' | 'photo'>('pale');
  const [isLegendExpanded, setIsLegendExpanded] = useState<boolean>(true);

  const [isEditingNode, setIsEditingNode] = useState<boolean>(false);
  const [editingData, setEditingData] = useState<Partial<KnowledgeNode>>({});

  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const zipImportInputRef = useRef<HTMLInputElement | null>(null);

  const [isAddingConnection, setIsAddingConnection] = useState<boolean>(false);
  const [targetConnectId, setTargetConnectId] = useState<string>('');
  const [connectLabel, setConnectLabel] = useState<string>('');
  const [connectDesc, setConnectDesc] = useState<string>('');

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedMimeTypeRef = useRef<string>('audio/webm');
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage((prev) => (prev === msg ? null : prev)), 2800);
  };

  useEffect(() => {
    try {
      localStorage.setItem('kumano_field_areas_v1', JSON.stringify(areas));
    } catch (e) {}
  }, [areas]);

  useEffect(() => {
    try {
      localStorage.setItem('kumano_field_current_area_v1', currentAreaId);
    } catch (e) {}
  }, [currentAreaId]);

  useEffect(() => {
    try {
      localStorage.setItem(`kumano_field_track_v1_${currentAreaId}`, JSON.stringify(trackCoordinates));
    } catch (e) {}
  }, [trackCoordinates, currentAreaId]);

  const handleSwitchArea = (area: AreaConfig) => {
    setCurrentAreaId(area.id);
    setCurrentCoords(area.center);

    let loadedTrack: [number, number][] = [area.center];
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`kumano_field_track_v1_${area.id}`);
        if (saved) {
          loadedTrack = JSON.parse(saved);
        }
      } catch (e) {}
    }
    setTrackCoordinates(loadedTrack);

    setIsAreaModalOpen(false);
    setSelectedNode(null);

    const areaFirstNode = nodes.find((n) => n.areaId === area.id);
    setActiveNodeId(areaFirstNode ? areaFirstNode.id : '');

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([area.center[1], area.center[0]], area.defaultZoom, { duration: 1.0 });
    }
    showToast(`地区を「${area.name}」に切り替えました`);
  };

  const handleCreateArea = (useGPS: boolean = false) => {
    if (!newAreaName.trim()) {
      showToast('地区名を入力してください');
      return;
    }

    let centerCoords: [number, number] = [currentCoords[0], currentCoords[1]];
    if (!useGPS && mapInstanceRef.current) {
      const c = mapInstanceRef.current.getCenter();
      centerCoords = [Number(c.lng.toFixed(6)), Number(c.lat.toFixed(6))];
    }

    const newArea: AreaConfig = {
      id: `area-${Date.now()}`,
      name: newAreaName.trim(),
      municipality: newAreaMunicipality.trim() || '和歌山県串本町',
      center: centerCoords,
      defaultZoom: 15,
      targetElevation: newAreaElevation.trim() || '海抜20m以上',
      description: newAreaDesc.trim() || '現地調査野帳',
    };

    const updatedAreas = [...areas, newArea];
    setAreas(updatedAreas);
    handleSwitchArea(newArea);

    setNewAreaName('');
    setNewAreaMunicipality('和歌山県串本町');
    setNewAreaElevation('海抜20m以上');
    setNewAreaDesc('');
    showToast(`新地区「${newArea.name}」を作成しました`);
  };

  const handleDeleteArea = (areaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (areas.length <= 1) {
      showToast('最後の1地区は削除できません');
      return;
    }
    const filtered = areas.filter((a) => a.id !== areaId);
    setAreas(filtered);
    try {
      localStorage.removeItem(`kumano_field_track_v1_${areaId}`);
    } catch (e) {}
    if (currentAreaId === areaId) {
      handleSwitchArea(filtered[0]);
    }
    showToast('地区を削除しました');
  };

  useEffect(() => {
    if (viewMode === 'map' && mapInstanceRef.current) {
      const timer = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [viewMode]);

  useEffect(() => {
    let wakeLockSentinel: any = null;
    const requestWakeLock = async () => {
      if (isTracking && 'wakeLock' in navigator) {
        try {
          wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        } catch (err) {}
      }
    };
    requestWakeLock();
    return () => {
      if (wakeLockSentinel) wakeLockSentinel.release().catch(() => {});
    };
  }, [isTracking]);

  useEffect(() => {
    let isMounted = true;

    const cssId = 'leaflet-core-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const initMap = () => {
      const win = window as any;
      if (!win.L || !mapContainerRef.current || mapInstanceRef.current) return;

      try {
        const L = win.L;
        const map = L.map(mapContainerRef.current, {
          center: [currentArea.center[1], currentArea.center[0]],
          zoom: currentArea.defaultZoom,
          zoomControl: false,
          attributionControl: false,
        });

        const tileLayer = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png', {
          maxZoom: 18,
          minZoom: 4,
          attribution: '国土地理院',
        }).addTo(map);
        tileLayerRef.current = tileLayer;

        const polyline = L.polyline([[currentArea.center[1], currentArea.center[0]]], {
          color: '#2B2F38',
          weight: 3.5,
          opacity: 0.9,
          lineJoin: 'round',
          lineCap: 'round',
          dashArray: '3, 6'
        }).addTo(map);
        trackPolylineRef.current = polyline;

        const userIcon = L.divIcon({
          className: 'custom-user-marker',
          iconSize: [22, 22],
          iconAnchor: [11, 11],
          html: `
            <div class="relative flex items-center justify-center w-5 h-5">
              <span class="absolute inline-flex w-5 h-5 rounded-full bg-[#0284C7] opacity-40 animate-ping"></span>
              <span class="relative inline-flex w-3.5 h-3.5 rounded-full bg-[#2B2F38] border-2 border-[#FCFBF8] shadow"></span>
            </div>
          `,
        });

        const userMarker = L.marker([currentArea.center[1], currentArea.center[0]], { icon: userIcon }).addTo(map);
        userMarkerRef.current = userMarker;

        mapInstanceRef.current = map;
        setTimeout(() => {
          if (isMounted && mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 150);
      } catch (err) {
        console.error('Leaflet Init Error:', err);
      }
    };

    if (!(window as any).L) {
      const scriptId = 'leaflet-core-js';
      let script = document.getElementById(scriptId) as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        document.body.appendChild(script);
      }
      script.addEventListener('load', initMap);
    } else {
      initMap();
    }

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const win = window as any;
    if (!map || !win.L) return;
    const L = win.L;

    Object.keys(nodeMarkersMapRef.current).forEach((id) => {
      map.removeLayer(nodeMarkersMapRef.current[id]);
      delete nodeMarkersMapRef.current[id];
    });

    const districtNodes = nodes.filter((n) => (n.areaId ? n.areaId === currentAreaId : true));
    const filteredNodes = activeCategoryFilter === 'all'
      ? districtNodes
      : districtNodes.filter((n) => n.category === activeCategoryFilter);

    filteredNodes.forEach((item) => {
      const cfg = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.living;
      const isSelected = selectedNode?.id === item.id;

      const markerIcon = L.divIcon({
        className: 'custom-knowledge-marker',
        iconSize: [44, 24],
        iconAnchor: [22, 12],
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            background: ${isSelected ? '#2B2F38' : '#FCFBF8'};
            color: ${isSelected ? '#FCFBF8' : '#2B2F38'};
            border: 1px solid ${isSelected ? '#2B2F38' : '#CDC8BD'};
            border-left: 4px solid ${cfg.color};
            border-radius: 3px;
            padding: 3px 6px;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: -0.01em;
            box-shadow: 0 1px 4px rgba(43,47,56,0.12);
            white-space: nowrap;
            cursor: pointer;
            transform: ${isSelected ? 'scale(1.08)' : 'scale(1)'};
            transition: transform 0.15s ease, background-color 0.15s ease;
          ">
            <span>${item.elevation.replace(/[^0-9]/g, '') || '0'}m</span>
          </div>
        `,
      });

      const marker = L.marker([item.coordinates[1], item.coordinates[0]], { icon: markerIcon }).addTo(map);

      marker.on('click', () => {
        setSelectedNode(item);
        setActiveNodeId(item.id);
        const targetLat = window.innerWidth >= 768 ? item.coordinates[1] : item.coordinates[1] - 0.0012;
        map.flyTo([targetLat, item.coordinates[0]], 16.5, { duration: 0.7 });
      });

      nodeMarkersMapRef.current[item.id] = marker;
    });
  }, [nodes, activeCategoryFilter, currentAreaId, selectedNode]);

  useEffect(() => {
    if (trackPolylineRef.current) {
      const latLngs = trackCoordinates.map((c) => [c[1], c[0]]);
      trackPolylineRef.current.setLatLngs(latLngs);
    }
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([currentCoords[1], currentCoords[0]]);
    }
  }, [trackCoordinates, currentCoords]);

  const toggleTsunamiLayer = () => {
    const map = mapInstanceRef.current;
    const win = window as any;
    if (!map || !win.L) return;

    if (showTsunamiLayer) {
      if (tsunamiLayerRef.current) {
        map.removeLayer(tsunamiLayerRef.current);
        tsunamiLayerRef.current = null;
      }
      setShowTsunamiLayer(false);
      showToast('津波想定レイヤーを非表示');
    } else {
      const tsunamiTile = win.L.tileLayer(
        'https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_data/{z}/{x}/{y}.png',
        {
          opacity: 0.62,
          maxZoom: 17,
          minZoom: 2,
        }
      ).addTo(map);

      tsunamiLayerRef.current = tsunamiTile;
      setShowTsunamiLayer(true);
      setIsLegendExpanded(true);
      showToast('津波浸水想定を表示しました');
    }
  };

  const toggleMapLayer = () => {
    const map = mapInstanceRef.current;
    const win = window as any;
    if (!map || !win.L) return;

    const nextType = mapLayerType === 'pale' ? 'photo' : 'pale';
    setMapLayerType(nextType);

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileUrl =
      nextType === 'pale'
        ? 'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png'
        : 'https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg';

    const newLayer = win.L.tileLayer(tileUrl, {
      maxZoom: 18,
      minZoom: 4,
    }).addTo(map);

    tileLayerRef.current = newLayer;
    showToast(nextType === 'pale' ? '淡色地図に切り替えました' : '航空写真（衛星画像）に切り替えました');
  };

  useEffect(() => {
    let timerId: any = null;
    let isCancelled = false;

    const performGpsMeasurement = () => {
      if (!isTracking || !('geolocation' in navigator)) return;

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (isCancelled) return;
          const newLngLat: [number, number] = [
            Number(pos.coords.longitude.toFixed(6)),
            Number(pos.coords.latitude.toFixed(6)),
          ];
          const accuracy = Math.round(pos.coords.accuracy);

          setCurrentCoords(newLngLat);
          setGpsAccuracy(accuracy);
          setLastFixTime(new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

          setTrackCoordinates((prev) => {
            const last = prev[prev.length - 1];
            if (last && last[0] === newLngLat[0] && last[1] === newLngLat[1]) {
              return prev;
            }
            return [...prev, newLngLat];
          });

          if (mapInstanceRef.current) {
            mapInstanceRef.current.panTo([newLngLat[1], newLngLat[0]], { animate: true });
          }

          if (!isCancelled && isTracking) {
            timerId = setTimeout(performGpsMeasurement, 1000);
          }
        },
        (error) => {
          console.warn('GPS測位待機中:', error.message);
          if (!isCancelled && isTracking) {
            timerId = setTimeout(performGpsMeasurement, 1000);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 3000,
          maximumAge: 0,
        }
      );
    };

    if (isTracking) {
      performGpsMeasurement();
    }

    return () => {
      isCancelled = true;
      if (timerId) clearTimeout(timerId);
    };
  }, [isTracking]);

  const handleLocateImmediate = () => {
    if (!('geolocation' in navigator)) {
      showToast('お使いのブラウザは位置情報に対応していません');
      return;
    }
    showToast('現在地を測位中...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [
          Number(pos.coords.longitude.toFixed(6)),
          Number(pos.coords.latitude.toFixed(6)),
        ];
        setCurrentCoords(coords);
        setGpsAccuracy(Math.round(pos.coords.accuracy));
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([coords[1], coords[0]], 16.5, { duration: 0.8 });
        }
        showToast(`現在地を捕捉 (精度: ±${Math.round(pos.coords.accuracy)}m)`);
      },
      () => {
        showToast('現在地を取得できませんでした（位置情報を許可してください）');
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  // 16-bit PCM WAV エンコーダー (SafariのMediaRecorderクラッシュを完全回避)
  const encodeWav = (samples: Float32Array[], sampleRate: number): Blob => {
    let totalLen = 0;
    for (let i = 0; i < samples.length; i++) totalLen += samples[i].length;
    const merged = new Float32Array(totalLen);
    let offset = 0;
    for (let i = 0; i < samples.length; i++) {
      merged.set(samples[i], offset);
      offset += samples[i].length;
    }

    const buffer = new ArrayBuffer(44 + merged.length * 2);
    const view = new DataView(buffer);
    const writeStr = (off: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i));
    };

    writeStr(0, "RIFF");
    view.setUint32(4, 36 + merged.length * 2, true);
    writeStr(8, "WAVE");
    writeStr(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // モノラル
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, "data");
    view.setUint32(40, merged.length * 2, true);

    let idx = 44;
    for (let i = 0; i < merged.length; i++) {
      let s = Math.max(-1, Math.min(1, merged[i]));
      view.setInt16(idx, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      idx += 2;
    }
    return new Blob([view], { type: "audio/wav" });
  };

  // iOS/Safariで絶対に落ちないハイブリッド録音エンジン
  
  const handleNativeAudioFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    showToast("音声を保存しています...");
    const audioBlobId = "audio-" + Date.now();
    const mimeType = file.type || "audio/mp4";
    try {
      const checksum = await storeMediaBlob(audioBlobId, file, mimeType);
      const audioUrl = URL.createObjectURL(file);
      openNewNodeEditor(audioUrl, "00:30", audioBlobId, checksum, mimeType);
      showToast("音声の取り込みが完了しました");
    } catch (err) {
      console.error("保存エラー:", err);
      showToast("⚠️ 音声の保存に失敗しました");
    } finally {
      if (nativeAudioInputRef.current) nativeAudioInputRef.current.value = "";
    }
  };

  const startRecording = async () => {
    try {
      showToast("マイクを初期化中...");
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("ブラウザがマイク録音に対応していません");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      audioChunksRef.current = [];

      // Safari/iOSクラッシュ防止：MIMEオプションは一切指定せずブラウザ標準に委ねる
      let recorder;
      try {
        recorder = new MediaRecorder(stream);
      } catch (recErr) {
        alert("MediaRecorder初期化失敗: " + recErr.message);
        return;
      }

      mediaRecorderRef.current = recorder;
      recordedMimeTypeRef.current = recorder.mimeType || "audio/mp4";

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onerror = (e) => {
        alert("録音エラー: " + JSON.stringify(e));
      };

      recorder.start(1000); // 1秒ごとにデータを蓄積
      setIsRecording(true);
      setRecordingSeconds(0);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => setRecordingSeconds((prev) => prev + 1), 1000);
      showToast("音声聞き書きを録音中");
    } catch (err) {
      alert("マイク許可エラー: " + err.name + " - " + err.message);
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return;
    setIsRecording(false);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);

    const mins = Math.floor(recordingSeconds / 60);
    const secs = recordingSeconds % 60;
    const durationStr = String(mins).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
    const finalDuration = durationStr === "00:00" ? "00:05" : durationStr;

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = async () => {
        const mime = recorder.mimeType || recordedMimeTypeRef.current || "audio/mp4";
        const audioBlob = new Blob(audioChunksRef.current, { type: mime });
        const audioBlobId = "audio-" + Date.now();
        try {
          const checksum = await storeMediaBlob(audioBlobId, audioBlob, mime);
          const audioUrl = URL.createObjectURL(audioBlob);
          openNewNodeEditor(audioUrl, finalDuration, audioBlobId, checksum, mime);
        } catch (err) {
          alert("保存エラー: " + err.message);
        }

        try {
          if (recorder.stream) {
            recorder.stream.getTracks().forEach((track) => track.stop());
          }
        } catch (e) {}
      };

      try {
        recorder.stop();
      } catch (e) {
        if (recorder.stream) {
          recorder.stream.getTracks().forEach((track) => track.stop());
        }
      }
    } else {
      openNewNodeEditor(undefined, finalDuration);
    }
  };

  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const currentMediaCount = (editingData.media || []).length;
    if (currentMediaCount >= 3) {
      showToast('現場写真・動画は1地点につき3件まで保存可能です');
      return;
    }

    showToast('メディアをIndexedDBに安全に保存しています...');
    const newItems: MediaItem[] = [];
    const maxAdd = 3 - currentMediaCount;

    for (let i = 0; i < Math.min(files.length, maxAdd); i++) {
      const file = files[i];
      const isVideo = file.type.startsWith('video/');
      const blobId = `med-blob-${Date.now()}-${i}`;

      try {
        let finalBlob: Blob = file;
        // 写真の場合：長辺1920pxの高品質スケール（原本視認性を保持）
        if (!isVideo && file.size > 800 * 1024) {
          finalBlob = await new Promise<Blob>((resolve) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const maxDim = 1920;
              let width = img.width;
              let height = img.height;
              if (width > height && width > maxDim) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else if (height > maxDim) {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', 0.88);
              } else {
                resolve(file);
              }
              URL.revokeObjectURL(url);
            };
            img.onerror = () => {
              URL.revokeObjectURL(url);
              resolve(file);
            };
            img.src = url;
          });
        }

        const checksum = await storeMediaBlob(blobId, finalBlob, finalBlob.type || (isVideo ? 'video/mp4' : 'image/jpeg'));
        const ephemeralUrl = URL.createObjectURL(finalBlob);

        newItems.push({
          id: `med-${Date.now()}-${i}`,
          blobId,
          type: isVideo ? 'video' : 'image',
          url: ephemeralUrl,
          checksum,
          mimeType: finalBlob.type,
          caption: '',
          originalName: file.name,
        });
      } catch (err) {
        console.warn('メディア保存エラー:', err);
      }
    }

    setEditingData((prev) => ({
      ...prev,
      media: [...(prev.media || []), ...newItems],
    }));

    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast(`${newItems.length}件のメディアを保存しました`);
  };

  const handleRemoveMedia = async (mediaId: string, blobId?: string) => {
    if (blobId) {
      await removeMediaBlob(blobId);
    }
    setEditingData((prev) => ({
      ...prev,
      media: (prev.media || []).filter((m) => m.id !== mediaId),
    }));
  };

  const openNewNodeEditor = (
    audioUrl?: string,
    duration: string = '00:30',
    audioBlobId?: string,
    audioChecksum?: string,
    audioMimeType?: string
  ) => {
    const simulatedAlt = Math.floor(6 + Math.random() * 24);
    setEditingData({
      id: `k-node-${Date.now()}`,
      areaId: currentAreaId,
      title: '',
      category: 'living',
      narrator: '',
      narratorAge: undefined,
      elevation: `海抜 ${simulatedAlt}m`,
      coordinates: [...currentCoords],
      audioUrl: audioUrl,
      audioBlobId: audioBlobId,
      audioChecksum: audioChecksum,
      audioMimeType: audioMimeType,
      duration: duration,
      note: '',
      tags: [],
      connections: [],
      media: [],
      createdAt: new Date().toLocaleString('ja-JP', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    });
    setIsEditingNode(true);
  };

  const openExistingNodeEditor = (node: KnowledgeNode) => {
    setEditingData({ ...node, media: node.media || [] });
    setIsEditingNode(true);
  };

  const handleSaveNode = () => {
    if (!editingData.title?.trim()) {
      showToast('タイトルを入力してください');
      return;
    }

    const completeNode: KnowledgeNode = {
      id: editingData.id || `k-node-${Date.now()}`,
      areaId: editingData.areaId || currentAreaId,
      title: editingData.title.trim(),
      category: (editingData.category as KnowledgeCategory) || 'living',
      narrator: editingData.narrator?.trim() || '地域住民',
      narratorAge: editingData.narratorAge,
      elevation: editingData.elevation || '海抜 15m',
      coordinates: editingData.coordinates || [...currentCoords],
      audioUrl: editingData.audioUrl,
      audioBlobId: editingData.audioBlobId,
      audioChecksum: editingData.audioChecksum,
      audioMimeType: editingData.audioMimeType,
      duration: editingData.duration || '00:30',
      note: editingData.note?.trim() || '現地での知恵・口述記録メモ。',
      tags: editingData.tags || ['風土知'],
      connections: editingData.connections || [],
      media: editingData.media || [],
      createdAt: editingData.createdAt || new Date().toLocaleString('ja-JP'),
    };

    setNodes((prev) => {
      const exists = prev.some((n) => n.id === completeNode.id);
      if (exists) {
        return prev.map((n) => (n.id === completeNode.id ? completeNode : n));
      } else {
        return [completeNode, ...prev];
      }
    });

    setSelectedNode(completeNode);
    setActiveNodeId(completeNode.id);
    setIsEditingNode(false);
    showToast('記録を保存しました');
  };

  const handleDeleteNode = async (id: string) => {
    const target = nodes.find((n) => n.id === id);
    if (target) {
      if (target.audioBlobId) await removeMediaBlob(target.audioBlobId);
      if (target.media) {
        for (const m of target.media) {
          if (m.blobId) await removeMediaBlob(m.blobId);
        }
      }
    }

    setNodes((prev) => {
      const filtered = prev.filter((n) => n.id !== id);
      return filtered.map((n) => ({
        ...n,
        connections: n.connections.filter((c) => c.targetId !== id),
      }));
    });

    if (selectedNode?.id === id) setSelectedNode(null);
    if (activeNodeId === id) {
      const remaining = nodes.filter((n) => n.id !== id);
      setActiveNodeId(remaining.length > 0 ? remaining[0].id : '');
    }
    setIsEditingNode(false);
    showToast('地点を削除しました');
  };

  const handleAddConnection = () => {
    if (!targetConnectId) {
      showToast('接続先の地点を選択してください');
      return;
    }
    if (!connectLabel.trim()) {
      showToast('つながりの関係性（小径名など）を入力してください');
      return;
    }

    const newConnection: KnowledgeConnection = {
      targetId: targetConnectId,
      relationType: connectLabel.trim(),
      description: connectDesc.trim() || undefined,
      estimatedTime: '徒歩 2分',
    };

    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === activeNodeId) {
          const otherConnections = n.connections.filter((c) => c.targetId !== targetConnectId);
          return {
            ...n,
            connections: [...otherConnections, newConnection],
          };
        }
        return n;
      })
    );

    setIsAddingConnection(false);
    setTargetConnectId('');
    setConnectLabel('');
    setConnectDesc('');
    showToast('新しいつながりを追加しました');
  };

  const handleRemoveConnection = (sourceNodeId: string, targetId: string) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === sourceNodeId) {
          return {
            ...n,
            connections: n.connections.filter((c) => c.targetId !== targetId),
          };
        }
        return n;
      })
    );
    showToast('つながりを解除しました');
  };

  const togglePlayAudio = (targetNode?: KnowledgeNode) => {
    const node = targetNode || selectedNode;
    if (!node) return;

    if (!node.audioUrl && !node.audioBlobId) {
      showToast(t.noAudioWarn);
      return;
    }

    if (isPlayingAudio) {
      if (audioElementRef.current) audioElementRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      if (node.audioUrl && audioElementRef.current) {
        setIsPlayingAudio(true);
        audioElementRef.current.src = node.audioUrl;
        audioElementRef.current.play().catch((err) => {
          console.warn('Audio playback error:', err);
          showToast(t.noAudioWarn);
          setIsPlayingAudio(false);
        });
      } else {
        showToast(t.noAudioWarn);
      }
    }
  };

  const exportFullZipPackage = async () => {
    showToast('音声と写真をZIPパッケージ化しています...');
    try {
      const JSZip = await loadJSZipLibrary();
      const zip = new JSZip();

      const featureCollection = {
        type: 'FeatureCollection',
        lab: 'Kumano Future Lab.',
        properties: {
          areaId: currentArea.id,
          areaName: currentArea.name,
          municipality: currentArea.municipality,
          targetElevation: currentArea.targetElevation,
          exportedAt: new Date().toISOString(),
        },
        features: [
          {
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: trackCoordinates },
            properties: {
              name: `${currentArea.name} 調査歩行ルート`,
              areaId: currentArea.id,
              exportedAt: new Date().toISOString(),
            },
          },
          ...currentAreaNodes.map((node) => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [node.coordinates[1], node.coordinates[0]] },
            properties: {
              id: node.id,
              areaId: node.areaId,
              title: node.title,
              category: node.category,
              narrator: node.narrator,
              elevation: node.elevation,
              note: node.note,
              tags: node.tags,
              duration: node.duration,
              audioBlobId: node.audioBlobId,
              audioChecksum: node.audioChecksum,
              audioMimeType: node.audioMimeType,
              connections: node.connections,
              mediaMeta: (node.media || []).map((m) => ({
                id: m.id,
                blobId: m.blobId,
                type: m.type,
                checksum: m.checksum,
                mimeType: m.mimeType,
                caption: m.caption,
              })),
              createdAt: node.createdAt,
            },
          })),
        ],
      };

      // 1. GeoJSONメタデータ
      zip.file('data.geojson', JSON.stringify(featureCollection, null, 2));

      // 2. 音声実体の追加
      const audioFolder = zip.folder('audio');
      for (const node of currentAreaNodes) {
        if (node.audioBlobId) {
          const media = await fetchMediaBlob(node.audioBlobId);
          if (media) {
            const ext = media.mimeType.includes('mp4') ? 'mp4' : media.mimeType.includes('aac') ? 'aac' : 'webm';
            audioFolder?.file(`${node.audioBlobId}.${ext}`, media.blob);
          }
        }
      }

      // 3. 写真・動画実体の追加
      const mediaFolder = zip.folder('media');
      for (const node of currentAreaNodes) {
        if (node.media) {
          for (const m of node.media) {
            if (m.blobId) {
              const media = await fetchMediaBlob(m.blobId);
              if (media) {
                const ext = m.type === 'video' ? 'mp4' : 'jpg';
                mediaFolder?.file(`${m.blobId}.${ext}`, media.blob);
              }
            }
          }
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      const url = URL.createObjectURL(content);
      a.href = url;
      a.download = `kumano_${currentArea.id}_full_archive_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`${currentArea.name} の音声・写真入りZIPを出力しました`);
    } catch (err: any) {
      console.error('ZIP書き出し失敗:', err);
      showToast('⚠️ ZIPの書き出しに失敗しました');
    }
  };

  const importFullZipPackage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    showToast('ZIPパッケージから音声・写真を復元中...');
    try {
      const JSZip = await loadJSZipLibrary();
      const zip = await JSZip.loadAsync(file);

      const geojsonFile = zip.file('data.geojson');
      if (!geojsonFile) {
        showToast('⚠️ 有効な data.geojson が見つかりませんでした');
        return;
      }

      const geojsonText = await geojsonFile.async('text');
      const parsed = JSON.parse(geojsonText);

      // IndexedDB への実体リストア
      for (const relativePath of Object.keys(zip.files)) {
        if (relativePath.startsWith('audio/') && !zip.files[relativePath].dir) {
          const fileName = relativePath.replace('audio/', '');
          const blobId = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
          const blob = await zip.files[relativePath].async('blob');
          const mime = fileName.endsWith('.mp4') ? 'audio/mp4' : 'audio/webm';
          await storeMediaBlob(blobId, blob, mime);
        } else if (relativePath.startsWith('media/') && !zip.files[relativePath].dir) {
          const fileName = relativePath.replace('media/', '');
          const blobId = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
          const isVideo = fileName.endsWith('.mp4');
          const blob = await zip.files[relativePath].async('blob');
          await storeMediaBlob(blobId, blob, isVideo ? 'video/mp4' : 'image/jpeg');
        }
      }

      // ノードの復元
      const importedNodes: KnowledgeNode[] = [];
      for (const feat of parsed.features || []) {
        if (feat.geometry?.type === 'Point') {
          const p = feat.properties;
          let audioUrl: string | undefined = undefined;
          if (p.audioBlobId) {
            const ab = await fetchMediaBlob(p.audioBlobId);
            if (ab) audioUrl = URL.createObjectURL(ab.blob);
          }

          const mediaList: MediaItem[] = [];
          for (const m of p.mediaMeta || []) {
            let mediaUrl: string | undefined = undefined;
            if (m.blobId) {
              const mb = await fetchMediaBlob(m.blobId);
              if (mb) mediaUrl = URL.createObjectURL(mb.blob);
            }
            mediaList.push({
              id: m.id,
              blobId: m.blobId,
              type: m.type,
              url: mediaUrl,
              checksum: m.checksum,
              mimeType: m.mimeType,
              caption: m.caption,
            });
          }

          importedNodes.push({
            id: p.id,
            areaId: p.areaId || currentAreaId,
            title: p.title,
            category: p.category,
            narrator: p.narrator,
            elevation: p.elevation,
            coordinates: [feat.geometry.coordinates[1], feat.geometry.coordinates[0]],
            audioBlobId: p.audioBlobId,
            audioChecksum: p.audioChecksum,
            audioMimeType: p.audioMimeType,
            audioUrl: audioUrl,
            duration: p.duration || '00:30',
            note: p.note,
            tags: p.tags || [],
            connections: p.connections || [],
            media: mediaList,
            createdAt: p.createdAt || new Date().toLocaleString('ja-JP'),
          });
        }
      }

      setNodes((prev) => {
        const combined = [...importedNodes, ...prev.filter((n) => !importedNodes.some((inNode) => inNode.id === n.id))];
        return combined;
      });

      showToast(`ZIPから ${importedNodes.length} 件の記録と実体を復元しました`);
    } catch (err) {
      console.error('ZIPインポート失敗:', err);
      showToast('⚠️ ZIPの読み込みに失敗しました');
    } finally {
      if (zipImportInputRef.current) zipImportInputRef.current.value = '';
    }
  };

  const exportGeoJson = () => {
    const featureCollection = {
      type: 'FeatureCollection',
      lab: 'Kumano Future Lab.',
      properties: {
        areaId: currentArea.id,
        areaName: currentArea.name,
        municipality: currentArea.municipality,
        targetElevation: currentArea.targetElevation,
        exportedAt: new Date().toISOString(),
      },
      features: [
        {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: trackCoordinates },
          properties: {
            name: `${currentArea.name} 調査歩行ルート`,
            areaId: currentArea.id,
            exportedAt: new Date().toISOString(),
          },
        },
        ...currentAreaNodes.map((node) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [node.coordinates[1], node.coordinates[0]] },
          properties: {
            id: node.id,
            areaId: node.areaId,
            title: node.title,
            category: node.category,
            narrator: node.narrator,
            elevation: node.elevation,
            note: node.note,
            tags: node.tags,
            audioChecksum: node.audioChecksum,
            mediaChecksums: (node.media || []).map((m) => m.checksum).filter(Boolean),
            connections: node.connections,
            createdAt: node.createdAt,
          },
        })),
      ],
    };

    const jsonStr = JSON.stringify(featureCollection, null, 2);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(jsonStr).catch(() => {});
    }

    try {
      const blob = new Blob([jsonStr], { type: 'application/geo+json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kumano_${currentArea.id}_${new Date().toISOString().slice(0, 10)}.geojson`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`${currentArea.name} のGeoJSONを書き出しました`);
    } catch (err) {
      showToast('クリップボードにGeoJSONをコピーしました');
    }
  };

  const copyCoordsToClipboard = (coords: [number, number], label?: string) => {
    const text = `${coords[1].toFixed(5)}, ${coords[0].toFixed(5)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    showToast(label ? `${label}の座標をコピーしました` : `座標 (${text}) をコピーしました`);
  };

  const currentNode = currentAreaNodes.find((n) => n.id === activeNodeId) || currentAreaNodes[0];
  const incomingNodes = currentNode
    ? currentAreaNodes.filter((n) => n.connections.some((c) => c.targetId === currentNode.id))
    : [];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#F8F6F0] text-[#2B2F38] font-sans select-none">
      <audio
        ref={audioElementRef}
        onEnded={() => setIsPlayingAudio(false)}
      />

      {/* 隠しZIPインポート用Input */}
      <input
        ref={zipImportInputRef}
        type="file"
        accept=".zip"
        onChange={importFullZipPackage}
        className="hidden"
      />

      {/* 1. 地図コンテナ（国土地理院 淡色地図） */}
      <div ref={mapContainerRef} className="w-full h-full z-0 bg-[#F3EFE7]" />

      {/* 2. 上部ヘッダー（モバイルでも絶対に重ならない階層レスポンシブ設計） */}
      <header className="absolute top-0 left-0 right-0 p-2 sm:p-3 pointer-events-none flex flex-col gap-1.5 z-20">
        <div className="pointer-events-auto flex items-center justify-between gap-1.5 w-full">
          {/* 左：Kumano Future Lab ロゴ ＆ 地区セレクター */}
          <div
            onClick={() => setIsAreaModalOpen(true)}
            className="bg-[#FCFBF8]/95 backdrop-blur-sm border border-[#DCD6C9] shadow-sm rounded-md px-2 py-1 flex items-center space-x-1.5 hover:bg-[#F3EFE7] transition cursor-pointer min-w-0 max-w-[50%] sm:max-w-none"
            title={lang === 'ja' ? '調査地区を切り替え / 新規作成' : 'Switch / Create Survey District'}
          >
            <div className="hidden xs:block flex-shrink-0">
              <KumanoLogo variant="lockup" />
            </div>
            <div className="xs:border-l xs:border-[#DCD6C9] xs:pl-1.5 leading-tight min-w-0">
              <div className="flex items-center space-x-1">
                <span className="text-[11px] sm:text-xs font-bold text-[#2B2F38] truncate">
                  {lang === 'en' ? currentArea.nameEn || currentArea.name : currentArea.name}
                </span>
                <ChevronDown className="w-3 h-3 text-[#2B2F38] flex-shrink-0" />
              </div>
              <span className="text-[9px] sm:text-[10px] text-[#2B2F38]/70 block font-mono truncate">
                {lang === 'en' ? currentArea.municipalityEn || currentArea.municipality : currentArea.municipality} ({currentAreaNodes.length})
              </span>
            </div>
          </div>

          {/* 右：言語スイッチャー ＆ ZIP実体保存 ＆ Gatherリンク */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 flex-shrink-0">
            {/* 言語スイッチャー (JA / EN) */}
            <div className="flex items-center border border-[#DCD6C9] bg-[#FCFBF8]/95 backdrop-blur-sm rounded p-0.5 font-mono text-[10px] sm:text-xs font-medium shadow-sm">
              <button
                type="button"
                onClick={() => changeLanguage('ja')}
                className={`px-1.5 sm:px-2 py-0.5 rounded-sm transition font-bold ${
                  lang === 'ja' ? 'bg-[#2B2F38] text-[#FCFBF8] shadow-sm' : 'text-[#2B2F38] hover:bg-[#F3EFE7]'
                }`}
                title="日本語表示に切替"
              >
                JA
              </button>
              <button
                type="button"
                onClick={() => changeLanguage('en')}
                className={`px-1.5 sm:px-2 py-0.5 rounded-sm transition font-bold ${
                  lang === 'en' ? 'bg-[#2B2F38] text-[#FCFBF8] shadow-sm' : 'text-[#2B2F38] hover:bg-[#F3EFE7]'
                }`}
                title="Switch to English"
              >
                EN
              </button>
            </div>

            {/* ZIP一括出力（音声・写真の実体同梱） */}
            <button
              type="button"
              onClick={exportFullZipPackage}
              className="h-7 sm:h-8 px-2 sm:px-2.5 rounded-md bg-[#FCFBF8] hover:bg-[#F3EFE7] text-[#2B2F38] border border-[#DCD6C9] shadow-sm text-[11px] sm:text-xs font-semibold flex items-center space-x-1 transition"
              title="音声と写真の実体をすべて同梱した完全バックアップZIPを出力"
            >
              <Archive className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#059669]" />
              <span className="hidden sm:inline">ZIP</span>
            </button>

            {/* ZIP復元インポート */}
            <button
              type="button"
              onClick={() => zipImportInputRef.current?.click()}
              className="h-7 sm:h-8 px-1.5 sm:px-2 rounded-md bg-[#FCFBF8] hover:bg-[#F3EFE7] text-[#2B2F38] border border-[#DCD6C9] shadow-sm text-[11px] sm:text-xs font-semibold flex items-center transition"
              title="別端末や過去のバックアップZIPから完全復元"
            >
              <Upload className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#2B2F38]" />
            </button>

            <a
              href="https://app.v2.gather.town/app/f2421d3e-42ec-4646-ae32-941c3b0a98c7/invite/c376433a-9ae6-4e72-b237-cac9cc817c29?copysource=peoplePanel"
              target="_blank"
              rel="noopener noreferrer"
              className="h-7 sm:h-8 px-2 sm:px-3 rounded-md bg-[#2B2F38] hover:bg-[#3A3F4B] text-[#FCFBF8] text-[11px] sm:text-xs font-medium flex items-center space-x-1 shadow-sm transition active:scale-95"
              title="存在しない研究所/Kumano Future Lab（Gather）へ移動"
            >
              <span className="hidden md:inline">{t.virtualLab}</span>
              <span className="md:hidden">{t.virtualLabShort}</span>
              <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#FCFBF8] flex-shrink-0" />
            </a>

            <button
              type="button"
              onClick={exportGeoJson}
              className="h-7 sm:h-8 px-2 sm:px-2.5 rounded-md bg-[#FCFBF8] hover:bg-[#F3EFE7] text-[#2B2F38] border border-[#DCD6C9] shadow-sm text-[11px] sm:text-xs font-semibold flex items-center space-x-1 transition"
              title="現在の地区の調査データをGeoJSON形式で保存"
            >
              <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#2B2F38]" />
              <span className="hidden sm:inline">GeoJSON</span>
            </button>
          </div>
        </div>

        {/* 中段：地図 / つながり / 記録一覧 切替タブ（スマホでも均等配置で折り返さない） */}
        <div className="pointer-events-auto w-full">
          <div className="bg-[#FCFBF8]/95 backdrop-blur-sm p-0.5 rounded-md border border-[#DCD6C9] shadow-sm grid grid-cols-3 gap-0.5">
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`py-1 rounded-sm text-[11px] sm:text-xs font-bold transition flex items-center justify-center space-x-1 ${
                viewMode === 'map' ? 'bg-[#2B2F38] text-[#FCFBF8] shadow-sm' : 'text-[#2B2F38] hover:bg-[#F3EFE7]'
              }`}
            >
              <MapIcon className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{t.mapTab}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('branch-tree')}
              className={`py-1 rounded-sm text-[11px] sm:text-xs font-bold transition flex items-center justify-center space-x-1 ${
                viewMode === 'branch-tree' ? 'bg-[#2B2F38] text-[#FCFBF8] shadow-sm' : 'text-[#2B2F38] hover:bg-[#F3EFE7]'
              }`}
            >
              <GitBranch className="w-3 h-3 text-[#059669] flex-shrink-0" />
              <span className="truncate">{t.branchTab}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('archive')}
              className={`py-1 rounded-sm text-[11px] sm:text-xs font-bold transition flex items-center justify-center space-x-1 ${
                viewMode === 'archive' ? 'bg-[#2B2F38] text-[#FCFBF8] shadow-sm' : 'text-[#2B2F38] hover:bg-[#F3EFE7]'
              }`}
            >
              <BookOpen className="w-3 h-3 text-[#0284C7] flex-shrink-0" />
              <span className="truncate">{t.recordsTab} ({currentAreaNodes.length})</span>
            </button>
          </div>
        </div>

        {/* サブバー：種別フィルター（地図画面時のみ・横スワイプ可能） */}
        {viewMode === 'map' && (
          <div className="pointer-events-auto flex items-center space-x-1 overflow-x-auto pb-0.5 scrollbar-none w-full">
            <div className="bg-[#FCFBF8]/95 backdrop-blur-sm p-1 rounded-md border border-[#DCD6C9] shadow-sm flex items-center space-x-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => setActiveCategoryFilter('all')}
                className={`px-2 py-0.5 rounded-sm text-[10px] sm:text-[11px] font-bold transition ${
                  activeCategoryFilter === 'all' ? 'bg-[#2B2F38] text-[#FCFBF8]' : 'text-[#2B2F38] hover:bg-[#F3EFE7]'
                }`}
              >
                {t.allFilter}
              </button>
              {Object.keys(CATEGORY_CONFIG).map((catKey) => {
                const cfg = CATEGORY_CONFIG[catKey];
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setActiveCategoryFilter(catKey as KnowledgeCategory)}
                    className={`px-2 py-0.5 rounded-sm text-[10px] sm:text-[11px] font-bold transition whitespace-nowrap flex items-center gap-1 ${
                      activeCategoryFilter === catKey
                        ? 'bg-[#2B2F38] text-[#FCFBF8]'
                        : 'text-[#2B2F38] hover:bg-[#F3EFE7]'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                    <span>{cfg.label[lang]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* 地図画面 右上の縦並びフローティング操作ボタン（ヘッダーと被らない位置） */}
      {viewMode === 'map' && (
        <div className="absolute top-32 sm:top-24 right-2.5 sm:right-3 z-20 pointer-events-auto flex flex-col space-y-1.5">
          <button
            type="button"
            onClick={toggleTsunamiLayer}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-md border shadow-sm flex items-center justify-center transition active:scale-95 ${
              showTsunamiLayer
                ? 'bg-[#2B2F38] text-[#FCFBF8] border-[#2B2F38]'
                : 'bg-[#FCFBF8] hover:bg-[#F3EFE7] text-[#2B2F38] border-[#DCD6C9]'
            }`}
            title="国土地理院 津波浸水想定の重ね合わせ"
          >
            <Waves className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleMapLayer}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-md border shadow-sm flex items-center justify-center transition active:scale-95 ${
              mapLayerType === 'photo'
                ? 'bg-[#2B2F38] text-[#FCFBF8] border-[#2B2F38]'
                : 'bg-[#FCFBF8] hover:bg-[#F3EFE7] text-[#2B2F38] border-[#DCD6C9]'
            }`}
            title="地図の切り替え（淡色地図 / 航空写真）"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 津波浸水深 凡例パネル（ヘッダーと被らず、スマホでも画面を塞がない） */}
      {viewMode === 'map' && showTsunamiLayer && (
        <div className="absolute top-32 sm:top-24 left-2.5 sm:left-3 z-20 pointer-events-auto transition-all">
          <div className="bg-[#FCFBF8]/95 backdrop-blur-sm border border-[#DCD6C9] shadow-lg rounded-md overflow-hidden w-48 sm:w-60 text-[#2B2F38]">
            <button
              type="button"
              onClick={() => setIsLegendExpanded(!isLegendExpanded)}
              className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 flex items-center justify-between hover:bg-[#F3EFE7] transition text-left"
              title={isLegendExpanded ? '凡例を折りたたむ' : '凡例を展開'}
            >
              <div className="flex items-center space-x-1.5 min-w-0">
                <Waves className="w-3.5 h-3.5 text-[#0284C7] flex-shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold text-[#2B2F38] truncate">{t.tsunamiDepth}</span>
              </div>
              <div className="text-[#2B2F38] p-0.5 flex-shrink-0">
                {isLegendExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            {isLegendExpanded ? (
              <div className="px-2.5 pb-2 pt-1 sm:px-3 sm:pb-2.5 space-y-1 sm:space-y-1.5 border-t border-[#E8E4DB]">
                {TSUNAMI_DEPTH_LEGEND.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[10px] sm:text-[11px]">
                    <div className="flex items-center space-x-1.5 sm:space-x-2">
                      <span
                        className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm shadow-sm border border-black/20 flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-semibold text-[#2B2F38]">{lang === 'en' ? item.labelEn : item.label}</span>
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-medium text-[#2B2F38]/70">
                      {lang === 'en' ? item.noteEn : item.note}
                    </span>
                  </div>
                ))}
                <div className="mt-1 pt-1 border-t border-[#E8E4DB] text-[9px] sm:text-[10px] text-[#2B2F38] font-bold leading-tight">
                  ※ {lang === 'en' ? currentArea.nameEn || currentArea.name : currentArea.name} {t.targetGoal}: {lang === 'en' ? currentArea.targetElevationEn || currentArea.targetElevation : currentArea.targetElevation}
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsLegendExpanded(true)}
                className="px-2.5 pb-1.5 sm:px-3 sm:pb-2 cursor-pointer"
                title="タップして詳細を展開"
              >
                <div className="flex h-1.5 sm:h-2 w-full rounded-sm overflow-hidden border border-[#DCD6C9]">
                  {TSUNAMI_DEPTH_LEGEND.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex-1 h-full"
                      style={{ backgroundColor: item.color }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[9px] text-[#2B2F38]/70 font-mono mt-0.5 px-0.5">
                  <span>0m</span>
                  <span>20m+</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 通知トースト */}
      {toastMessage && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-40 transition pointer-events-none w-[90%] sm:w-auto max-w-sm">
          <div className="bg-[#2B2F38] text-[#FCFBF8] text-xs font-semibold px-3 py-1.5 rounded-md shadow-lg flex items-center justify-center space-x-2 text-center">
            <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="truncate">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 録音インジケーター */}
      {isRecording && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
          <div className="bg-[#E11D48] text-[#FCFBF8] px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full shadow-lg flex items-center space-x-2 font-bold text-xs animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#FCFBF8]"></span>
            <span>{t.recordingVoice} {formatTime(recordingSeconds)}</span>
          </div>
        </div>
      )}

      {}
      {/* 下部統合アクションエリア（座標バッジ ＋ 操作ドックを縦に整列し、画面幅に関わらず重なりを物理的に防止） */}
      {viewMode === 'map' && (
        <div
          className={`absolute bottom-3 sm:bottom-5 left-0 right-0 px-2 sm:px-4 flex flex-col items-center pointer-events-none z-20 gap-1.5 transition duration-200 ${
            selectedNode ? 'opacity-0 translate-y-6 pointer-events-none' : 'opacity-100 translate-y-0'
          }`}
        >
          {/* 現在地 座標表示バッジ（ドック直上に中央揃えで配置） */}
          <div className="pointer-events-auto flex items-center space-x-1 sm:space-x-1.5">
            <button
              type="button"
              onClick={() => copyCoordsToClipboard(currentCoords, '現在地')}
              className="px-2.5 py-1 rounded-md bg-[#FCFBF8]/95 backdrop-blur-sm border border-[#DCD6C9] shadow-sm text-[10px] sm:text-[11px] font-mono font-bold text-[#2B2F38] hover:bg-[#F3EFE7] flex items-center space-x-1 sm:space-x-1.5 transition active:scale-95"
              title="現在地の緯度経度（タップでコピー）"
            >
              <MapPin className="w-3 h-3 text-[#0284C7] flex-shrink-0" />
              <span>{currentCoords[1].toFixed(5)}°N, {currentCoords[0].toFixed(5)}°E</span>
              {gpsAccuracy !== null && isTracking && (
                <span className="text-[9px] text-[#059669] font-bold bg-[#F3EFE7] px-1.5 py-0.2 rounded border border-[#DCD6C9]">
                  ±{gpsAccuracy}m
                </span>
              )}
            </button>
            {isTracking && lastFixTime && (
              <span className="text-[9px] font-mono text-[#2B2F38]/70 bg-[#FCFBF8]/95 backdrop-blur-sm border border-[#DCD6C9] px-2 py-1 rounded-md shadow-sm hidden xs:inline-block">
                GPS: {lastFixTime}
              </span>
            )}
          </div>

          {/* 下部操作ドック本体 */}
          <div className="pointer-events-auto bg-[#FCFBF8]/95 backdrop-blur-sm border border-[#DCD6C9] shadow-lg rounded-md p-1 sm:p-1.5 flex items-center space-x-1 sm:space-x-1.5 max-w-full overflow-hidden">
            {/* 調査開始 / 調査中 */}
            <button
              type="button"
              onClick={() => {
                const nextState = !isTracking;
                setIsTracking(nextState);
                showToast(nextState ? (lang === 'ja' ? 'GPS調査を開始しました' : 'Started GPS tracking') : (lang === 'ja' ? 'GPS調査を停止しました' : 'Stopped GPS tracking'));
              }}
              className={`flex items-center space-x-1 sm:space-x-1.5 px-2 py-1.5 sm:px-3 sm:py-2 rounded-sm text-[11px] sm:text-xs font-bold transition active:scale-95 flex-shrink-0 ${
                isTracking
                  ? 'bg-[#2B2F38] text-[#FCFBF8] shadow-sm'
                  : 'bg-[#F3EFE7] hover:bg-[#EBE6DB] text-[#2B2F38]'
              }`}
            >
              <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${isTracking ? 'bg-emerald-400 animate-ping' : 'bg-[#2B2F38]/50'}`} />
              <span className="truncate">{isTracking ? t.surveying : t.surveyStart}</span>
            </button>

            {/* 現在地ジャンプ */}
            <button
              type="button"
              onClick={handleLocateImmediate}
              className="px-2 py-1.5 sm:px-3 sm:py-2 rounded-sm bg-[#F3EFE7] hover:bg-[#EBE6DB] text-[#2B2F38] text-[11px] sm:text-xs font-bold flex items-center space-x-1 transition active:scale-95 flex-shrink-0"
              title={lang === 'ja' ? '今いる場所へ地図を瞬時に合わせる' : 'Pan to current GPS location'}
            >
              <Navigation className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#0284C7] flex-shrink-0" />
              <span className="truncate">{t.locateMe}</span>
            </button>

            {/* メモを残す */}
            <button
              type="button"
              onClick={() => openNewNodeEditor(undefined, '00:00')}
              className="px-2 py-1.5 sm:px-3 sm:py-2 rounded-sm bg-[#F3EFE7] hover:bg-[#EBE6DB] text-[#2B2F38] text-[11px] sm:text-xs font-bold flex items-center space-x-1 transition flex-shrink-0"
              title={lang === 'ja' ? 'この位置にメモを残す' : 'Add note at current location'}
            >
              <Edit3 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#2B2F38] flex-shrink-0" />
              <span className="truncate">{t.addMemo}</span>
            </button>

            {/* 声を録る / 停止 */}
            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                className="flex items-center space-x-1 sm:space-x-1.5 bg-[#E11D48] hover:bg-rose-700 text-[#FCFBF8] px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-sm text-[11px] sm:text-xs font-bold shadow-sm transition flex-shrink-0"
              >
                <Mic className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                <span className="truncate">{t.recordVoice}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="flex items-center space-x-1 sm:space-x-1.5 bg-[#2B2F38] text-[#FCFBF8] px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-sm text-[11px] sm:text-xs font-bold shadow-sm animate-pulse transition flex-shrink-0"
              >
                <Square className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                <span className="truncate">{t.stop}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 地図上のピン詳細カード */}
      {viewMode === 'map' && selectedNode && (
        <div className="fixed inset-x-0 bottom-0 max-w-lg mx-auto z-30 p-3">
          <div className="bg-[#FCFBF8] rounded-lg border border-[#E0DBD0] shadow-xl p-5 text-[#2B2F38] max-h-[82vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-3 border-b border-[#E8E4DB] pb-3">
              <div>
                <div className="flex items-center space-x-1.5 mb-1.5 flex-wrap gap-1">
                  {(() => {
                    const cfg = CATEGORY_CONFIG[selectedNode.category] || CATEGORY_CONFIG.living;
                    return (
                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded border"
                        style={{
                          borderColor: `${cfg.color}40`,
                          color: cfg.color,
                          backgroundColor: `${cfg.color}0D`
                        }}
                      >
                        {cfg.label[lang]}
                      </span>
                    );
                  })()}
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#2B2F38] text-[#FCFBF8]">
                    {selectedNode.elevation}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyCoordsToClipboard(selectedNode.coordinates, selectedNode.title)}
                    className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#F3EFE7] hover:bg-[#EBE6DB] text-[#2B2F38] border border-[#DCD6C9] flex items-center space-x-1 transition"
                    title="地点座標をコピー"
                  >
                    <span>{selectedNode.coordinates[1].toFixed(5)}°N, {selectedNode.coordinates[0].toFixed(5)}°E</span>
                  </button>
                  <span className="text-xs text-[#2B2F38]">
                    {t.narratorLabel}: <strong>{selectedNode.narrator}</strong>
                    {selectedNode.narratorAge ? ` (${selectedNode.narratorAge}${lang === 'ja' ? '歳' : 'yo'})` : ''}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#2B2F38] leading-snug">{selectedNode.title}</h3>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => openExistingNodeEditor(selectedNode)}
                  className="w-7 h-7 rounded border border-[#DCD6C9] bg-[#FCFBF8] hover:bg-[#F3EFE7] flex items-center justify-center text-[#2B2F38] transition"
                  title="この記録を編集"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedNode(null);
                    setIsPlayingAudio(false);
                  }}
                  className="w-7 h-7 rounded border border-[#DCD6C9] bg-[#FCFBF8] hover:bg-[#F3EFE7] flex items-center justify-center text-[#2B2F38] transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {selectedNode.media && selectedNode.media.length > 0 && (
              <div className="mb-3">
                <div className="flex space-x-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
                  {selectedNode.media.map((med) => (
                    <div
                      key={med.id}
                      onClick={() => setPreviewMedia(med)}
                      className="relative flex-shrink-0 w-36 h-24 rounded-md overflow-hidden bg-[#F3EFE7] border border-[#DCD6C9] cursor-pointer group shadow-sm"
                    >
                      {med.type === 'video' ? (
                        <div className="w-full h-full relative bg-[#2B2F38] flex items-center justify-center">
                          <video src={med.url} className="w-full h-full object-cover" muted />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition">
                            <Film className="w-6 h-6 text-white drop-shadow" />
                          </div>
                          <span className="absolute bottom-1 right-1 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded font-bold">
                            動画
                          </span>
                        </div>
                      ) : (
                        <img
                          src={med.url}
                          alt={med.caption || selectedNode.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                        />
                      )}
                      <div className="absolute top-1 right-1 p-1 bg-black/40 rounded-full text-white opacity-0 group-hover:opacity-100 transition">
                        <Maximize2 className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 要約・観察メモボックス */}
            <div className="p-3.5 bg-[#F3EFE7] rounded border-l-2 border-[#2B2F38] text-sm text-[#2B2F38] leading-relaxed mb-3 font-normal">
              {selectedNode.note}
            </div>

            {selectedNode.tags && selectedNode.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {selectedNode.tags.map((tag, idx) => (
                  <span key={idx} className="text-[10px] bg-[#F3EFE7] text-[#2B2F38] px-2 py-0.5 rounded border border-[#DCD6C9] font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#E8E4DB]">
              <button
                type="button"
                onClick={() => togglePlayAudio(selectedNode)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#2B2F38] text-[#FCFBF8] hover:bg-[#3A3F4B] text-xs font-bold transition"
              >
                {isPlayingAudio ? <Pause className="w-3.5 h-3.5 text-rose-400" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlayingAudio ? (lang === 'ja' ? '停止' : 'Pause') : `${t.listenVoice} (${selectedNode.duration})`}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveNodeId(selectedNode.id);
                  setViewMode('branch-tree');
                }}
                className="flex items-center space-x-1 text-xs font-bold text-[#2B2F38] hover:opacity-80"
              >
                <span>{t.seeConnections} ({selectedNode.connections.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. ローカルナレッジ・つながり探索ビュー */}
      {viewMode === 'branch-tree' && (
        <div className="absolute inset-0 z-30 bg-[#F8F6F0] flex flex-col overflow-hidden">
          <div className="bg-[#FCFBF8] border-b border-[#E2DDD3] px-4 py-2.5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className="px-3 py-1.5 rounded bg-[#2B2F38] text-[#FCFBF8] text-xs font-bold flex items-center space-x-1.5 shadow-sm hover:bg-[#3A3F4B] transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.backToMap}</span>
            </button>

            <div className="flex items-center space-x-2">
              <GitBranch className="w-4 h-4 text-[#059669]" />
              <span className="text-xs font-bold text-[#2B2F38]">{t.routeHeading}</span>
            </div>

            <button
              type="button"
              onClick={() => openNewNodeEditor(undefined, '00:00')}
              className="px-2.5 py-1.5 rounded bg-[#2B2F38] text-[#FCFBF8] text-xs font-bold flex items-center space-x-1 shadow-sm hover:bg-[#3A3F4B] transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addPointBtn}</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex justify-center">
            <div className="w-full max-w-lg space-y-4">
              {!currentNode ? (
                <div className="bg-[#FCFBF8] rounded-lg border border-dashed border-[#DCD6C9] p-8 text-center text-[#2B2F38] space-y-3">
                  <GitBranch className="w-8 h-8 text-[#2B2F38]/40 mx-auto" />
                  <h3 className="text-sm font-bold">{lang === 'ja' ? 'つながりを記録した地点がまだありません' : 'No connection points recorded yet'}</h3>
                  <p className="text-xs text-[#2B2F38]/70">
                    {lang === 'ja' ? '現地で「地点を追加」または「声を録る」から記録を作成すると、小径や避難路のつながりを整理できます。' : 'Create records using "Add Point" or "Record Voice" to organize pathway connections.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => openNewNodeEditor(undefined, '00:00')}
                    className="px-3.5 py-2 rounded bg-[#2B2F38] text-[#FCFBF8] text-xs font-bold inline-flex items-center space-x-1.5 shadow-sm hover:bg-[#3A3F4B] transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.addFirstRecord}</span>
                  </button>
                </div>
              ) : (
                <>
                  {incomingNodes.length > 0 && (
                    <div className="bg-[#FCFBF8] border border-[#E0DBD0] rounded-md p-3 space-y-1.5">
                      <div className="text-[11px] font-bold text-[#2B2F38]/70">{t.incomingRoutes}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {incomingNodes.map((inNode) => (
                          <button
                            type="button"
                            key={inNode.id}
                            onClick={() => setActiveNodeId(inNode.id)}
                            className="text-xs px-2.5 py-1 rounded bg-[#F3EFE7] hover:bg-[#EBE6DB] text-[#2B2F38] font-bold flex items-center space-x-1 transition"
                          >
                            <ArrowLeft className="w-3 h-3 text-[#2B2F38]" />
                            <span>{inNode.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-[#FCFBF8] rounded-lg border border-[#E0DBD0] shadow-sm p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                        {(() => {
                          const cfg = CATEGORY_CONFIG[currentNode.category] || CATEGORY_CONFIG.living;
                          return (
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded border"
                              style={{
                                borderColor: `${cfg.color}40`,
                                color: cfg.color,
                                backgroundColor: `${cfg.color}0D`
                              }}
                            >
                              {cfg.label}
                            </span>
                          );
                        })()}
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#2B2F38] text-[#FCFBF8]">
                          {currentNode.elevation}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyCoordsToClipboard(currentNode.coordinates, currentNode.title)}
                          className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#F3EFE7] hover:bg-[#EBE6DB] text-[#2B2F38] border border-[#DCD6C9] transition"
                          title="地点座標をコピー"
                        >
                          {currentNode.coordinates[1].toFixed(5)}°N, {currentNode.coordinates[0].toFixed(5)}°E
                        </button>
                        <span className="text-xs text-[#2B2F38]">
                          語り手: <strong>{currentNode.narrator}</strong>
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => openExistingNodeEditor(currentNode)}
                          className="w-7 h-7 rounded border border-[#DCD6C9] bg-[#FCFBF8] hover:bg-[#F3EFE7] flex items-center justify-center text-[#2B2F38] transition"
                          title="この地点を編集"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-[#2B2F38]">{currentNode.title}</h3>

                    {currentNode.media && currentNode.media.length > 0 && (
                      <div className="flex space-x-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
                        {currentNode.media.map((med) => (
                          <div
                            key={med.id}
                            onClick={() => setPreviewMedia(med)}
                            className="relative flex-shrink-0 w-28 h-20 rounded-md overflow-hidden bg-[#F3EFE7] border border-[#DCD6C9] cursor-pointer shadow-sm group"
                          >
                            {med.type === 'video' ? (
                              <div className="w-full h-full bg-[#2B2F38] flex items-center justify-center relative">
                                <video src={med.url} className="w-full h-full object-cover" muted />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                  <Film className="w-5 h-5 text-white" />
                                </div>
                              </div>
                            ) : (
                              <img
                                src={med.url}
                                alt={med.caption || currentNode.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="p-3.5 bg-[#F3EFE7] rounded border-l-2 border-[#2B2F38] text-xs text-[#2B2F38] leading-relaxed font-normal">
                      {currentNode.note}
                    </div>

                    {currentNode.tags && currentNode.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {currentNode.tags.map((tag, idx) => (
                          <span key={idx} className="text-[10px] bg-[#F3EFE7] text-[#2B2F38] border border-[#DCD6C9] px-2 py-0.5 rounded font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-[#E8E4DB] text-xs">
                      <button
                        type="button"
                        onClick={() => togglePlayAudio(currentNode)}
                        className="flex items-center space-x-1.5 text-[#2B2F38] hover:opacity-80 font-bold"
                      >
                        {isPlayingAudio ? <Pause className="w-3.5 h-3.5 text-rose-600" /> : <Play className="w-3.5 h-3.5 text-[#059669]" />}
                        <span>{isPlayingAudio ? '停止' : `証言を聴く (${currentNode.duration})`}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedNode(currentNode);
                          setViewMode('map');
                          if (mapInstanceRef.current) {
                            mapInstanceRef.current.flyTo([currentNode.coordinates[1], currentNode.coordinates[0]], 16.5, { duration: 0.8 });
                          }
                        }}
                        className="px-2.5 py-1 rounded border border-[#DCD6C9] bg-[#FCFBF8] hover:bg-[#F3EFE7] text-[#2B2F38] font-bold flex items-center space-x-1 transition"
                      >
                        <MapPin className="w-3 h-3 text-[#E11D48]" />
                        <span>地図で見る</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#2B2F38] flex items-center space-x-1">
                        <GitBranch className="w-3.5 h-3.5 text-[#059669]" />
                        <span>{t.fromHereRoutes} ({currentNode.connections.length})</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingConnection(true);
                          setTargetConnectId(nodes.find((n) => n.id !== currentNode.id)?.id || '');
                        }}
                        className="text-xs font-bold text-[#2B2F38] hover:opacity-80 flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t.addConnectionBtn}</span>
                      </button>
                    </div>

                    {currentNode.connections.length === 0 ? (
                      <div className="bg-[#FCFBF8] rounded-md border border-dashed border-[#DCD6C9] p-4 text-center text-xs text-[#2B2F38]/70">
                        {t.noConnectionsYet}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {currentNode.connections.map((conn, idx) => {
                          const target = nodes.find((n) => n.id === conn.targetId);
                          if (!target) return null;
                          const targetCfg = CATEGORY_CONFIG[target.category] || CATEGORY_CONFIG.living;

                          return (
                            <div
                              key={idx}
                              className="bg-[#FCFBF8] rounded-md border border-[#E0DBD0] shadow-sm p-3 hover:border-[#2B2F38] transition space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#2B2F38] bg-[#F3EFE7] px-2 py-0.5 rounded border border-[#DCD6C9]">
                                  {conn.relationType}
                                </span>
                                <div className="flex items-center space-x-1.5">
                                  {conn.estimatedTime && (
                                    <span className="text-[10px] text-[#2B2F38]/70 font-mono flex items-center">
                                      <Clock className="w-3 h-3 mr-0.5" />
                                      {conn.estimatedTime}
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveConnection(currentNode.id, conn.targetId)}
                                    className="text-[#2B2F38]/50 hover:text-rose-600 transition p-0.5"
                                    title={lang === 'ja' ? 'つながりを解除' : 'Remove connection'}
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {conn.description && (
                                <p className="text-[11px] text-[#2B2F38]/80 leading-tight">
                                  {conn.description}
                                </p>
                              )}

                              <div className="flex items-center justify-between pt-1 border-t border-[#E8E4DB]">
                                <div className="flex items-center space-x-1.5">
                                  <span
                                    className="text-[10px] font-bold px-1.5 py-0.2 rounded border"
                                    style={{
                                      borderColor: `${targetCfg.color}40`,
                                      color: targetCfg.color,
                                      backgroundColor: `${targetCfg.color}0D`
                                    }}
                                  >
                                    {targetCfg.label[lang]}
                                  </span>
                                  <span className="text-xs font-bold text-[#2B2F38]">{target.title}</span>
                                  <span className="text-[10px] text-[#2B2F38]/60 font-mono">({target.elevation})</span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setActiveNodeId(target.id)}
                                  className="text-xs font-bold text-[#2B2F38] hover:opacity-80 flex items-center space-x-1"
                                >
                                  <span>{t.proceedPath}</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. 記録一覧（アーカイブ・書架ビュー） */}
      {viewMode === 'archive' && (
        <div className="absolute inset-0 z-30 bg-[#F8F6F0] flex flex-col overflow-hidden">
          <div className="bg-[#FCFBF8] border-b border-[#E2DDD3] px-4 py-3 flex items-center justify-between shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className="px-3 py-1.5 rounded bg-[#2B2F38] text-[#FCFBF8] text-xs font-bold flex items-center space-x-1.5 shadow-sm hover:bg-[#3A3F4B] transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.backToMap}</span>
            </button>

            <div className="text-center">
              <h2 className="text-xs font-bold text-[#2B2F38]">{lang === 'en' ? currentArea.nameEn || currentArea.name : currentArea.name} {t.recordsHeading}</h2>
              <p className="text-[11px] text-[#2B2F38]/70">{lang === 'en' ? currentArea.municipalityEn || currentArea.municipality : currentArea.municipality}（{currentAreaNodes.length} {t.recordsSubtitle}）</p>
            </div>

            <button
              type="button"
              onClick={() => openNewNodeEditor(undefined, '00:00')}
              className="px-2.5 py-1.5 rounded bg-[#2B2F38] text-[#FCFBF8] text-xs font-bold flex items-center space-x-1 shadow-sm hover:bg-[#3A3F4B] transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addPointBtn}</span>
            </button>
          </div>

          {/* 地区選択クイックシェルフ */}
          <div className="bg-[#FCFBF8]/80 border-b border-[#E2DDD3] px-4 py-2 flex items-center space-x-2 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-bold text-[#2B2F38]/70 flex-shrink-0">{t.surveyDistrictLabel}</span>
            {areas.map((dist) => {
              const isSelected = dist.id === currentAreaId;
              const count = nodes.filter((n) => n.areaId === dist.id).length;
              return (
                <button
                  type="button"
                  key={dist.id}
                  onClick={() => handleSwitchArea(dist)}
                  className={`px-2.5 py-1 rounded text-xs font-bold whitespace-nowrap transition flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-[#2B2F38] text-[#FCFBF8] shadow-sm'
                      : 'bg-[#FCFBF8] hover:bg-[#F3EFE7] border border-[#DCD6C9] text-[#2B2F38]'
                  }`}
                >
                  <span>{lang === 'en' ? dist.nameEn || dist.name : dist.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-[#3A3F4B] text-[#FCFBF8]' : 'bg-[#F3EFE7] text-[#2B2F38]'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setIsAreaModalOpen(true)}
              className="px-2 py-1 rounded border border-dashed border-[#DCD6C9] text-[#2B2F38] hover:bg-[#F3EFE7] text-xs font-bold whitespace-nowrap flex items-center space-x-1"
            >
              <Plus className="w-3 h-3" />
              <span>{t.newDistrictBtn}</span>
            </button>
          </div>

          {/* 一覧リストエリア */}
          <div className="flex-1 overflow-y-auto p-4 flex justify-center">
            <div className="w-full max-w-xl space-y-4 pb-16">
              {currentAreaNodes.length === 0 ? (
                <div className="bg-[#FCFBF8] rounded-lg border border-dashed border-[#DCD6C9] p-8 text-center text-[#2B2F38] space-y-2 mt-4">
                  <BookOpen className="w-8 h-8 text-[#2B2F38]/30 mx-auto" />
                  <p className="text-xs font-bold">{currentArea.name} にはまだ記録がありません</p>
                  <p className="text-[11px] text-[#2B2F38]/70">現地で「声を録る」または「メモを残す」から記録を追加してみましょう</p>
                  <button
                    type="button"
                    onClick={() => openNewNodeEditor(undefined, '00:00')}
                    className="mt-3 px-3 py-1.5 rounded bg-[#2B2F38] text-[#FCFBF8] text-xs font-bold inline-flex items-center space-x-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>この地区の最初の記録を残す</span>
                  </button>
                </div>
              ) : (
                currentAreaNodes.map((item) => {
                  const cfg = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.living;
                  return (
                    <div
                      key={item.id}
                      className="bg-[#FCFBF8] rounded-lg border border-[#E0DBD0] shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-5 text-[#2B2F38] hover:border-[#2B2F38] transition space-y-3"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <div className="flex items-center space-x-1.5">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded border"
                            style={{
                              borderColor: `${cfg.color}40`,
                              color: cfg.color,
                              backgroundColor: `${cfg.color}0D`
                            }}
                          >
                            {cfg.label}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#2B2F38] text-[#FCFBF8]">
                            {item.elevation}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyCoordsToClipboard(item.coordinates, item.title)}
                            className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#F3EFE7] hover:bg-[#EBE6DB] text-[#2B2F38] border border-[#DCD6C9] transition"
                            title="座標をコピー"
                          >
                            {item.coordinates[1].toFixed(5)}°N, {item.coordinates[0].toFixed(5)}°E
                          </button>
                        </div>
                        <span className="text-[11px] text-[#2B2F38]/60 font-mono">{item.createdAt}</span>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-[#2B2F38] leading-snug">{item.title}</h3>
                        <p className="text-xs text-[#2B2F38] mt-0.5">
                          語り手: <strong>{item.narrator}</strong>
                          {item.narratorAge ? ` (${item.narratorAge}歳)` : ''}
                        </p>
                      </div>

                      {item.media && item.media.length > 0 && (
                        <div className="flex space-x-2 overflow-x-auto pb-1 pt-0.5">
                          {item.media.map((med) => (
                            <div
                              key={med.id}
                              onClick={() => setPreviewMedia(med)}
                              className="relative flex-shrink-0 w-28 h-20 rounded-md overflow-hidden bg-[#F3EFE7] border border-[#DCD6C9] cursor-pointer shadow-sm group"
                            >
                              {med.type === 'video' ? (
                                <div className="w-full h-full bg-[#2B2F38] flex items-center justify-center relative">
                                  <video src={med.url} className="w-full h-full object-cover" muted />
                                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                    <Film className="w-5 h-5 text-white" />
                                  </div>
                                </div>
                              ) : (
                                <img
                                  src={med.url}
                                  alt={med.caption || item.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="p-3.5 bg-[#F3EFE7] rounded border-l-2 border-[#2B2F38] text-xs text-[#2B2F38] leading-relaxed font-normal">
                        {item.note}
                      </div>

                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag, idx) => (
                            <span key={idx} className="text-[10px] bg-[#F3EFE7] text-[#2B2F38] border border-[#DCD6C9] px-2 py-0.5 rounded font-medium">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-[#E8E4DB] text-xs">
                        <button
                          type="button"
                          onClick={() => togglePlayAudio(item)}
                          className="flex items-center space-x-1.5 text-[#2B2F38] hover:opacity-80 font-bold"
                        >
                          <Play className="w-3.5 h-3.5 text-[#059669]" />
                          <span>声を聴く ({item.duration})</span>
                        </button>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveNodeId(item.id);
                              setViewMode('branch-tree');
                            }}
                            className="text-[#2B2F38]/70 hover:text-[#2B2F38] font-bold"
                          >
                            つながり ({item.connections.length})
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedNode(item);
                              setViewMode('map');
                              if (mapInstanceRef.current) {
                                mapInstanceRef.current.flyTo([item.coordinates[1], item.coordinates[0]], 16.5, { duration: 0.8 });
                              }
                            }}
                            className="px-2.5 py-1 rounded border border-[#DCD6C9] bg-[#FCFBF8] hover:bg-[#F3EFE7] text-[#2B2F38] font-bold flex items-center space-x-1 transition"
                          >
                            <MapPin className="w-3 h-3 text-[#E11D48]" />
                            <span>地図で見る</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* フッターブランド */}
              <div className="pt-8 pb-4 flex flex-col items-center justify-center">
                <KumanoLogo variant="full" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. ナレッジ自由編集・新規登録モーダル */}
      {isEditingNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B2F38]/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#FCFBF8] rounded-lg border border-[#DCD6C9] shadow-2xl p-6 space-y-4 text-[#2B2F38] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8E4DB] pb-3">
              <h3 className="text-sm font-bold text-[#2B2F38]">
                {editingData.id && nodes.some((n) => n.id === editingData.id) ? t.editRecord : t.addNewRecord}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingNode(false)}
                className="w-6 h-6 rounded border border-[#DCD6C9] bg-[#FCFBF8] flex items-center justify-center text-[#2B2F38] hover:bg-[#F3EFE7]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2B2F38] mb-1">{t.recordType}</label>
              <select
                value={editingData.category || 'living'}
                onChange={(e) => setEditingData({ ...editingData, category: e.target.value as KnowledgeCategory })}
                className="w-full px-3 py-2 rounded border border-[#DCD6C9] text-xs font-bold focus:outline-none focus:border-[#2B2F38] bg-[#FCFBF8]"
              >
                {Object.keys(CATEGORY_CONFIG).map((k) => (
                  <option key={k} value={k}>
                    {CATEGORY_CONFIG[k].label[lang]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2B2F38] mb-1">{t.pointTitle}</label>
              <input
                type="text"
                value={editingData.title || ''}
                onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                placeholder={lang === 'ja' ? '例: 裏山の古井戸（渇水時の命水）' : 'e.g. Hillside Well (Emergency Water)'}
                className="w-full px-3 py-2 rounded border border-[#DCD6C9] text-xs focus:outline-none focus:border-[#2B2F38] bg-[#FCFBF8]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-[#2B2F38] mb-1">{t.narratorInput}</label>
                <input
                  type="text"
                  value={editingData.narrator || ''}
                  onChange={(e) => setEditingData({ ...editingData, narrator: e.target.value })}
                  placeholder={lang === 'ja' ? '例: 笠島 留吉さん' : 'e.g. Tomokichi Kasajima'}
                  className="w-full px-3 py-2 rounded border border-[#DCD6C9] text-xs focus:outline-none focus:border-[#2B2F38] bg-[#FCFBF8]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#2B2F38] mb-1">{t.elevationInput}</label>
                <input
                  type="text"
                  value={editingData.elevation || ''}
                  onChange={(e) => setEditingData({ ...editingData, elevation: e.target.value })}
                  placeholder={lang === 'ja' ? '例: 海抜 18m' : 'e.g. 18m'}
                  className="w-full px-3 py-2 rounded border border-[#DCD6C9] text-xs focus:outline-none focus:border-[#2B2F38] bg-[#FCFBF8]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2B2F38] mb-1">{t.noteInput}</label>
              <textarea
                rows={3}
                value={editingData.note || ''}
                onChange={(e) => setEditingData({ ...editingData, note: e.target.value })}
                placeholder={lang === 'ja' ? '「昭和南海地震でも竹藪の根が張って崩れなかった」「潮の満ち引きで天気を読む」などの現地の声' : 'Oral history notes, local wisdom, and observations during fieldwork...'}
                className="w-full px-3 py-2 rounded border border-[#DCD6C9] text-xs focus:outline-none focus:border-[#2B2F38] bg-[#FCFBF8]"
              />
            </div>

            {/* 写真・動画の添付セクション */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#2B2F38] flex items-center space-x-1">
                  <Camera className="w-3.5 h-3.5 text-[#2B2F38]" />
                  <span>{t.mediaLabel}（{(editingData.media || []).length} / 3）</span>
                </label>
                {(editingData.media || []).length < 3 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded bg-[#F3EFE7] hover:bg-[#EBE6DB] text-[#2B2F38] text-[11px] font-bold border border-[#DCD6C9] flex items-center space-x-1 transition"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{t.addPhoto}</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleMediaUpload}
                  className="hidden"
                />
              </div>

              {editingData.media && editingData.media.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {editingData.media.map((med) => (
                    <div
                      key={med.id}
                      className="relative rounded-md overflow-hidden border border-[#DCD6C9] bg-[#F3EFE7] h-24 flex flex-col group"
                    >
                      <div className="flex-1 w-full relative bg-black/10 overflow-hidden">
                        {med.type === 'video' ? (
                          <div className="w-full h-full bg-[#2B2F38] flex items-center justify-center">
                            <video src={med.url} className="w-full h-full object-cover" muted />
                            <Film className="w-4 h-4 text-white absolute" />
                          </div>
                        ) : (
                          <img src={med.url} alt="" className="w-full h-full object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(med.id)}
                          className="absolute top-1 right-1 p-1 bg-[#E11D48] hover:bg-rose-700 text-white rounded transition shadow"
                          title="削除"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={med.caption || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingData((prev) => ({
                            ...prev,
                            media: (prev.media || []).map((m) =>
                              m.id === med.id ? { ...m, caption: val } : m
                            ),
                          }));
                        }}
                        placeholder={lang === 'ja' ? '説明・キャプション' : 'Caption'}
                        className="text-[10px] px-1.5 py-1 border-t border-[#DCD6C9] text-[#2B2F38] bg-[#FCFBF8] focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-[#DCD6C9] rounded-md p-3 text-center cursor-pointer hover:bg-[#F3EFE7] transition"
                >
                  <p className="text-[11px] text-[#2B2F38]/70 font-bold">
                    {t.photoUploadHint}
                  </p>
                  <p className="text-[10px] text-[#2B2F38]/50 mt-0.5">{t.photoUploadSub}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2B2F38] mb-1">{t.tagsLabel}</label>
              <input
                type="text"
                value={(editingData.tags || []).join(', ')}
                onChange={(e) =>
                  setEditingData({
                    ...editingData,
                    tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                  })
                }
                placeholder={lang === 'ja' ? '例: 湧水, 地震避難, 暮らしの歴史' : 'e.g. spring, evacuation, history'}
                className="w-full px-3 py-2 rounded border border-[#DCD6C9] text-xs focus:outline-none focus:border-[#2B2F38] bg-[#FCFBF8]"
              />
            </div>

            <div className="flex space-x-2 pt-2 border-t border-[#E8E4DB]">
              {editingData.id && nodes.some((n) => n.id === editingData.id) && (
                <button
                  type="button"
                  onClick={() => handleDeleteNode(editingData.id!)}
                  className="px-3 py-2 rounded border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsEditingNode(false)}
                className="flex-1 py-2 rounded border border-[#DCD6C9] bg-[#FCFBF8] text-[#2B2F38] text-xs font-bold hover:bg-[#F3EFE7] transition"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleSaveNode}
                className="flex-1 py-2 rounded bg-[#2B2F38] text-[#FCFBF8] text-xs font-bold hover:bg-[#3A3F4B] transition"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. つながり（関係性）追加モーダル */}
      {isAddingConnection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B2F38]/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#FCFBF8] rounded-lg border border-[#DCD6C9] shadow-2xl p-5 space-y-3 text-[#2B2F38]">
            <h3 className="text-sm font-bold text-[#2B2F38]">{t.addConnectionModalTitle}</h3>

            <div>
              <label className="block text-xs font-bold text-[#2B2F38] mb-1">{t.targetPointLabel}</label>
              <select
                value={targetConnectId}
                onChange={(e) => setTargetConnectId(e.target.value)}
                className="w-full px-3 py-2 rounded border border-[#DCD6C9] text-xs font-bold focus:outline-none focus:border-[#2B2F38] bg-[#FCFBF8]"
              >
                {nodes
                  .filter((n) => n.id !== activeNodeId)
                  .map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.title} ({CATEGORY_CONFIG[n.category]?.label[lang] || 'Lore'})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2B2F38] mb-1">{t.relationTypeLabel}</label>
              <input
                type="text"
                value={connectLabel}
                onChange={(e) => setConnectLabel(e.target.value)}
                placeholder={lang === 'ja' ? '例: 裏山竹林への抜け道、水汲み小径' : 'e.g. Hillside escape path, spring access'}
                className="w-full px-3 py-2 rounded border border-[#DCD6C9] text-xs focus:outline-none focus:border-[#2B2F38] bg-[#FCFBF8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2B2F38] mb-1">{t.routeNoteLabel}</label>
              <input
                type="text"
                value={connectDesc}
                onChange={(e) => setConnectDesc(e.target.value)}
                placeholder={lang === 'ja' ? '例: 傾斜がきついが地盤が強固。徒歩2分。' : 'e.g. Steep slope but solid footing. 2 min walk.'}
                className="w-full px-3 py-2 rounded border border-[#DCD6C9] text-xs focus:outline-none focus:border-[#2B2F38] bg-[#FCFBF8]"
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingConnection(false)}
                className="flex-1 py-2 rounded border border-[#DCD6C9] bg-[#FCFBF8] text-[#2B2F38] text-xs font-bold hover:bg-[#F3EFE7]"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleAddConnection}
                className="flex-1 py-2 rounded bg-[#2B2F38] text-[#FCFBF8] text-xs font-bold hover:bg-[#3A3F4B]"
              >
                {t.connectBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. 写真・動画 拡大表示モーダル（ライトボックス） */}
      {previewMedia && (
        <div
          onClick={() => setPreviewMedia(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B2F38]/85 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full max-h-[90vh] bg-[#FCFBF8] rounded-lg border border-[#DCD6C9] overflow-hidden flex flex-col items-center justify-center shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setPreviewMedia(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded border border-[#DCD6C9] bg-[#FCFBF8]/80 hover:bg-[#FCFBF8] text-[#2B2F38] flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>

            {previewMedia.type === 'video' ? (
              <video
                src={previewMedia.url}
                controls
                autoPlay
                className="max-w-full max-h-[75vh] w-auto h-auto rounded"
              />
            ) : (
              <img
                src={previewMedia.url}
                alt={previewMedia.caption || '拡大プレビュー'}
                className="max-w-full max-h-[75vh] object-contain rounded"
              />
            )}

            {previewMedia.caption && (
              <div className="w-full bg-[#FCFBF8] text-[#2B2F38] text-xs p-3 text-center border-t border-[#E8E4DB] font-medium">
                {previewMedia.caption}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 11. 調査地区切り替え ＆ 新規作成モーダル */}
      {isAreaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B2F38]/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#FCFBF8] rounded-lg border border-[#DCD6C9] shadow-2xl p-6 space-y-4 text-[#2B2F38] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8E4DB] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#2B2F38]">{t.areaModalTitle}</h3>
                <p className="text-[11px] text-[#2B2F38]/70">{t.areaModalSub}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAreaModalOpen(false)}
                className="w-7 h-7 rounded border border-[#DCD6C9] bg-[#FCFBF8] flex items-center justify-center text-[#2B2F38] hover:bg-[#F3EFE7]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#2B2F38]">{t.registeredDistricts}（{areas.length}）</label>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {areas.map((area) => {
                  const isSelected = area.id === currentAreaId;
                  const count = nodes.filter((n) => n.areaId === area.id).length;
                  return (
                    <div
                      key={area.id}
                      onClick={() => handleSwitchArea(area)}
                      className={`p-3 rounded-md border text-left cursor-pointer transition flex items-start justify-between ${
                        isSelected
                          ? 'border-[#2B2F38] bg-[#F3EFE7] ring-1 ring-[#2B2F38]'
                          : 'border-[#E0DBD0] hover:border-[#2B2F38] bg-[#FCFBF8] hover:bg-[#F3EFE7]'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] text-[#2B2F38]/70 font-bold">
                            {lang === 'en' ? area.municipalityEn || area.municipality : area.municipality}
                          </span>
                          {isSelected && (
                            <span className="text-[9px] bg-[#2B2F38] text-[#FCFBF8] font-bold px-1.5 py-0.2 rounded">
                              {t.surveying}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-[#2B2F38] mt-0.5">
                          {lang === 'en' ? area.nameEn || area.name : area.name}
                        </h4>
                        {area.description && (
                          <p className="text-[11px] text-[#2B2F38]/80 line-clamp-1 mt-0.5">
                            {lang === 'en' ? area.descriptionEn || area.description : area.description}
                          </p>
                        )}
                        <div className="text-[10px] text-[#2B2F38]/70 font-mono mt-1 flex items-center space-x-2">
                          <span>{t.recordsCountLabel}: {count}{t.pointsUnit}</span>
                          <span>{t.targetGoal}: {lang === 'en' ? area.targetElevationEn || area.targetElevation : area.targetElevation}</span>
                          <span>[{area.center[1].toFixed(3)}°N, {area.center[0].toFixed(3)}°E]</span>
                        </div>
                      </div>

                      {areas.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteArea(area.id, e)}
                          className="text-[#2B2F38]/40 hover:text-rose-600 p-1 transition flex-shrink-0"
                          title="この地区を削除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E4DB] space-y-2.5">
              <label className="block text-xs font-bold text-[#2B2F38] flex items-center space-x-1">
                <Plus className="w-3.5 h-3.5 text-[#059669]" />
                <span>{t.addNewDistrictHeading}</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    value={newAreaName}
                    onChange={(e) => setNewAreaName(e.target.value)}
                    placeholder={lang === 'ja' ? '地区名（例: 田並地区）' : 'District Name (e.g. Tanami)'}
                    className="w-full px-2.5 py-1.5 rounded border border-[#DCD6C9] text-xs focus:outline-none focus:border-[#2B2F38] bg-[#FCFBF8]"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={newAreaMunicipality}
                    onChange={(e) => setNewAreaMunicipality(e.target.value)}
                    placeholder={lang === 'ja' ? '自治体名（例: 和歌山県串本町）' : 'Municipality (e.g. Kushimoto)'}
                    className="w-full px-2.5 py-1.5 rounded border border-[#DCD6C9] text-xs focus:outline-none focus:border-[#2B2F38] bg-[#FCFBF8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    value={newAreaElevation}
                    onChange={(e) => setNewAreaElevation(e.target.value)}
                    placeholder={lang === 'ja' ? '避難目標（例: 海抜20m以上）' : 'Evacuation Target (e.g. ≥20m)'}
                    className="w-full px-2.5 py-1.5 rounded border border-[#DCD6C9] text-xs focus:outline-none focus:border-[#2B2F38] bg-[#FCFBF8]"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={newAreaDesc}
                    onChange={(e) => setNewAreaDesc(e.target.value)}
                    placeholder={lang === 'ja' ? '特徴（例: 港と裏山古道の調査）' : 'Feature / Notes'}
                    className="w-full px-2.5 py-1.5 rounded border border-[#DCD6C9] text-xs focus:outline-none focus:border-[#2B2F38] bg-[#FCFBF8]"
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleCreateArea(true)}
                  className="flex-1 py-2 px-2 rounded border border-[#DCD6C9] bg-[#F3EFE7] hover:bg-[#EBE6DB] text-[#2B2F38] text-xs font-bold transition flex items-center justify-center space-x-1"
                  title="現在地（GPS座標）を中心として新しい地区を作成"
                >
                  <Navigation className="w-3 h-3 text-[#0284C7]" />
                  <span>{t.createAtGps}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCreateArea(false)}
                  className="flex-1 py-2 px-2 rounded bg-[#2B2F38] hover:bg-[#3A3F4B] text-[#FCFBF8] text-xs font-bold transition flex items-center justify-center space-x-1"
                  title="地図の中心位置で新しい地区を作成"
                >
                  <MapPin className="w-3 h-3" />
                  <span>{t.createAtCenter}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}