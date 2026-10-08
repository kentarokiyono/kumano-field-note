'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  BookOpen,
  MapPin,
  Waves,
  Play,
  Pause,
  Compass,
  Download,
  ExternalLink,
  X,
  User,
  Clock,
  Camera,
  ChevronRight,
  Volume2,
  Copy,
  Check,
  Info,
  Maximize2,
  ShieldAlert,
  Mountain,
  SlidersHorizontal,
  Layers,
  Languages
} from 'lucide-react';

export type Language = 'ja' | 'en';
export type KnowledgeCategory = 'disaster' | 'living' | 'water' | 'industry' | 'culture';

export interface ConnectedPath {
  targetId: string;
  name: string;
  nameEn?: string;
  relation: string;
  relationEn?: string;
  distanceMeter: number;
}

export interface ArchiveRecord {
  id: string;
  areaId: string;
  title: string;
  titleEn?: string;
  narrator: string;
  narratorEn?: string;
  narratorAge: number;
  elevation: number;
  interviewDate: string;
  interviewDateEn?: string;
  category: KnowledgeCategory;
  coordinates: [number, number];
  summary: string;
  summaryEn?: string;
  narrative: string;
  narrativeEn?: string;
  audioMeta?: {
    duration: string;
    sampleRate?: string;
    waveformPeaks?: number[];
  };
  media: {
    type: 'photo' | 'video';
    caption: string;
    captionEn?: string;
    credit: string;
    creditEn?: string;
    aspect: 'landscape' | 'portrait';
    thumbnailBg: string;
  }[];
  connectedPaths: ConnectedPath[];
}

export interface AreaMeta {
  id: string;
  name: string;
  nameEn?: string;
  town: string;
  townEn?: string;
  center: [number, number];
  defaultZoom: number;
  evacuationTargetElevation: number;
  description: string;
  descriptionEn?: string;
  topographyNotes: string;
  topographyNotesEn?: string;
}

const UI_TEXT = {
  ja: {
    archiveBadge: '地域アーカイブ',
    areaLabel: '地区:',
    recordsTab: '記録一覧',
    mapTab: '空間地図',
    geojsonExport: 'GeoJSON出力',
    geojsonTitle: 'GeoJSON形式でデータを書き出し',
    virtualLab: '仮想研究所',
    virtualLabTitle: '仮想研究所（Gather.town）を新しいタブで開く',
    spatialElevation: '空間標高・地形図',
    targetPrefix: '/ 避難目標: 海抜 ',
    targetSuffix: 'm以上',
    tsunamiBtn: '津波浸水想定',
    tsunamiTitle: '津波浸水想定区域の重ね合わせ表示を切り替え',
    legendBtnTitle: '凡例の表示・非表示を切り替え',
    legendTitle: '分類・凡例',
    connectingPathway: '集落連絡小径・避難路',
    pinGuide: 'ピン: 標高 (m)',
    peakRefuge: '最高次避難地: 魚見の段 (海抜31m)',
    surveyDistrict: '調査対象地区',
    shelterGoal: '避難目標',
    shelterUnit: 'm以上',
    archivesCount: '件の記録',
    topographyHeading: '地形的特徴・留意点:',
    allFilter: 'すべて',
    synchronizedNote: 'スクロール連動中',
    mapSyncToggleTitle: '記事スクロールと地図の自動連動を切り替え',
    noRecord: '該当カテゴリの記録はありません。',
    ageSuffix: '歳',
    elevationPrefix: '海抜 ',
    elevationUnit: 'm',
    oralAudioHeading: '現地口述証言 音声記録',
    standbyStatus: '待機中',
    playingStatus: '再生中',
    photoBadge: '現地調査記録写真',
    expandPhoto: '拡大表示',
    connectedHeading: '連環する地点・生活避難路:',
    locateMapBtn: '地図で位置を確認',
    copyCoordsBtn: '緯度・経度をコピー',
    copiedToast: '座標をクリップボードにコピーしました:',
    exportedToast: 'GeoJSONを出力しました:',
    creditLabel: '記録・撮影:',
    playBtn: '再生',
    pauseBtn: '一時停止',
    noAreasAvailable: '登録地区なし',
    emptyAreaHeading: '調査地区が登録されていません',
    emptyAreaDesc: '現場用野帳（ui.tsx）で調査地と記録を登録すると、自動的にここに同期されます。',
    emptyRecordsHeading: 'アーカイブ記録がありません',
    emptyRecordsDesc: 'この地区にはまだ登録された口述記録・風土知がありません。野帳から記録を追加してください。',
    noExportData: '出力可能なデータがありません'
  },
  en: {
    archiveBadge: 'LOCAL ARCHIVE',
    areaLabel: 'AREA:',
    recordsTab: 'RECORDS',
    mapTab: 'MAP',
    geojsonExport: 'GEOJSON',
    geojsonTitle: 'Export spatial dataset as GeoJSON',
    virtualLab: 'VIRTUAL LAB',
    virtualLabTitle: 'Open Virtual Lab in Gather.town',
    spatialElevation: 'SPATIAL ELEVATION',
    targetPrefix: '/ TARGET: ≥',
    targetSuffix: 'M',
    tsunamiBtn: 'TSUNAMI',
    tsunamiTitle: 'Toggle Tsunami Inundation Layer',
    legendBtnTitle: 'Toggle Category Legend',
    legendTitle: 'CATEGORY LEGEND',
    connectingPathway: 'CONNECTING PATHWAYS & ROUTES',
    pinGuide: 'PIN: ELEVATION (M)',
    peakRefuge: 'PEAK SHELTER: UOMI RIDGE (31M)',
    surveyDistrict: 'SURVEY DISTRICT',
    shelterGoal: 'SHELTER',
    shelterUnit: 'M+',
    archivesCount: 'ARCHIVES',
    topographyHeading: 'TOPOGRAPHY NOTE:',
    allFilter: 'ALL',
    synchronizedNote: 'SCROLL SYNC ACTIVE',
    mapSyncToggleTitle: 'Toggle auto-camera panning on scroll',
    noRecord: 'NO MATCHING RECORDS IN THIS CATEGORY.',
    ageSuffix: 'yo',
    elevationPrefix: '',
    elevationUnit: 'M',
    oralAudioHeading: 'ORAL TESTIMONY AUDIO',
    standbyStatus: 'STANDBY',
    playingStatus: 'PLAYING',
    photoBadge: 'FIELD ARCHIVE PHOTO',
    expandPhoto: 'EXPAND',
    connectedHeading: 'CONNECTED PATHWAYS:',
    locateMapBtn: 'LOCATE ON MAP',
    copyCoordsBtn: 'Copy Coordinates',
    copiedToast: 'COPIED:',
    exportedToast: 'GEOJSON EXPORTED:',
    creditLabel: 'CREDIT:',
    playBtn: 'Play',
    pauseBtn: 'Pause',
    noAreasAvailable: 'No Districts',
    emptyAreaHeading: 'NO DISTRICTS REGISTERED',
    emptyAreaDesc: 'Survey data recorded via the field notebook (ui.tsx) will automatically sync here.',
    emptyRecordsHeading: 'NO ARCHIVED RECORDS',
    emptyRecordsDesc: 'No oral history or local knowledge records in this district yet. Add records from the notebook.',
    noExportData: 'No data available to export'
  }
};

const CATEGORY_MAP: Record<
  KnowledgeCategory,
  {
    label: { ja: string; en: string };
    code: string;
    color: string;
    badgeBorder: string;
    badgeText: string;
  }
> = {
  disaster: {
    label: { ja: '防災・避難知', en: 'Disaster & Evacuation' },
    code: 'DISASTER',
    color: '#E11D48',
    badgeBorder: 'border-rose-500/40',
    badgeText: 'text-rose-700'
  },
  living: {
    label: { ja: '暮らし・住まい', en: 'Living & Housing' },
    code: 'LIVING',
    color: '#D97706',
    badgeBorder: 'border-amber-500/40',
    badgeText: 'text-amber-800'
  },
  water: {
    label: { ja: '水脈・井戸', en: 'Water & Wells' },
    code: 'WATER',
    color: '#0284C7',
    badgeBorder: 'border-sky-500/40',
    badgeText: 'text-sky-800'
  },
  industry: {
    label: { ja: '生業・山海', en: 'Livelihood & Commons' },
    code: 'INDUSTRY',
    color: '#059669',
    badgeBorder: 'border-emerald-500/40',
    badgeText: 'text-emerald-800'
  },
  culture: {
    label: { ja: '歴史・風土伝承', en: 'History & Lore' },
    code: 'CULTURE',
    color: '#4F46E5',
    badgeBorder: 'border-indigo-500/40',
    badgeText: 'text-indigo-800'
  }
};

const DEFAULT_MAP_CENTER: [number, number] = [33.475, 135.78];
const DEFAULT_MAP_ZOOM = 14;

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

export interface KumanoLogoProps {
  variant?: 'full' | 'lockup' | 'silhouette-only';
  className?: string;
  src?: string;
}

export function KumanoLogo({ variant = 'full', className = '', src }: KumanoLogoProps) {
  if (src) {
    if (variant === 'silhouette-only') {
      return (
        <div className={`overflow-hidden h-7 flex items-center ${className}`}>
          <img src={src} alt="Kumano Future Lab." className="h-full w-auto object-contain" />
        </div>
      );
    }
    if (variant === 'lockup') {
      return (
        <div className={`flex items-center gap-2 ${className}`}>
          <img src={src} alt="Kumano Future Lab." className="h-6 w-auto object-contain" />
        </div>
      );
    }
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <img src={src} alt="Kumano Future Lab." className="h-14 sm:h-16 w-auto object-contain" />
      </div>
    );
  }

  if (variant === 'silhouette-only') {
    return <KumanoLogoSilhouette className={`w-32 h-6 text-[#23272F] ${className}`} />;
  }

  if (variant === 'lockup') {
    return (
      <div className={`flex flex-col items-start select-none ${className}`}>
        <KumanoLogoSilhouette className="w-28 sm:w-32 h-auto text-[#23272F]" />
        <span className="text-[9px] font-mono tracking-[0.28em] text-[#23272F] mt-1.5 uppercase font-semibold -mr-[0.28em]">
          Kumano Future Lab.
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-4 select-none ${className}`}>
      <KumanoLogoSilhouette className="w-48 sm:w-56 h-auto text-[#23272F]" />
      <span className="text-xs sm:text-[13px] font-sans tracking-[0.34em] text-[#23272F] uppercase font-medium -mr-[0.34em] text-center">
        K U M A N O &nbsp; F U T U R E &nbsp; L A B .
      </span>
    </div>
  );
}

export default function KumanoArchiveApp() {
  const [lang, setLang] = useState<Language>('ja');
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [areas, setAreas] = useState<AreaMeta[]>([]);
  const [records, setRecords] = useState<ArchiveRecord[]>([]);

  const [activeCategory, setActiveCategory] = useState<KnowledgeCategory | 'all'>('all');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [highlightedRecordId, setHighlightedRecordId] = useState<string | null>(null);

  const [showTsunamiLayer, setShowTsunamiLayer] = useState<boolean>(true);
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(false);
  const [isMapSyncEnabled, setIsMapSyncEnabled] = useState<boolean>(true);
  const [leafletReady, setLeafletReady] = useState<boolean>(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<{ [id: string]: any }>({});
  const tsunamiLayerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const isProgrammaticScrollRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<any>(null);

  const [mobileTab, setMobileTab] = useState<'map' | 'articles'>('articles');

  const [playingRecordId, setPlayingRecordId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const audioIntervalRef = useRef<any>(null);

  const [activeLightboxMedia, setActiveLightboxMedia] = useState<{
    caption: string;
    credit: string;
    title: string;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const t = UI_TEXT[lang];

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedLang = localStorage.getItem('kumano_lang_pref') as Language;
        if (savedLang === 'ja' || savedLang === 'en') {
          setLang(savedLang);
        }

        const storedAreas = localStorage.getItem('kumano_field_areas_v1');
        const storedKnowledge = localStorage.getItem('kumano_field_knowledge_v1');

        if (storedAreas) {
          const parsed = JSON.parse(storedAreas);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const normalizedAreas = parsed.map((a: any) => {
              const center = a.center;
              const isLngLat = center && center[0] > 90;
              return {
                ...a,
                center: isLngLat ? [center[1], center[0]] : center
              };
            });
            setAreas(normalizedAreas);
            setSelectedAreaId(normalizedAreas[0]?.id || null);
          }
        }
        if (storedKnowledge) {
          const parsed = JSON.parse(storedKnowledge);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const normalized = parsed.map((item: any) => {
              const coords = item.coordinates;
              const isLngLat = coords && coords[0] > 90;
              return {
                ...item,
                coordinates: isLngLat ? [coords[1], coords[0]] : coords,
                elevation:
                  typeof item.elevation === 'string'
                    ? parseInt(item.elevation.replace(/[^0-9]/g, ''), 10) || 0
                    : item.elevation ?? 0,
                summary: item.summary || (item.note ? item.note.slice(0, 70) + '...' : ''),
                narrative: item.narrative || item.note || '',
                connectedPaths:
                  item.connectedPaths ||
                  item.connections?.map((c: any) => ({
                    targetId: c.targetId,
                    name: c.relationType || c.name || '連絡小径',
                    relation: c.description || '',
                    distanceMeter: c.distanceMeter || 150
                  })) ||
                  []
              };
            });
            setRecords(normalized);
            setSelectedRecordId(normalized[0]?.id || null);
          }
        }
      }
    } catch (err) {
      console.warn('LocalStorage load failed, using fallbacks:', err);
    }
  }, []);

  const changeLanguage = (nextLang: Language) => {
    setLang(nextLang);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('kumano_lang_pref', nextLang);
      }
    } catch (e) {
      // ignore
    }
  };

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  }, []);

  const currentArea = useMemo(() => {
    if (areas.length === 0) return null;
    return areas.find((a) => a.id === selectedAreaId) || areas[0] || null;
  }, [areas, selectedAreaId]);

  const currentAreaRecords = useMemo(() => {
    if (!currentArea) {
      return records;
    }
    return records.filter((r) => r.areaId === currentArea.id);
  }, [records, currentArea]);

  const filteredRecords = useMemo(() => {
    if (activeCategory === 'all') return currentAreaRecords;
    return currentAreaRecords.filter((r) => r.category === activeCategory);
  }, [currentAreaRecords, activeCategory]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const cssId = 'leaflet-cdn-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    const jsId = 'leaflet-cdn-js';
    if ((window as any).L) {
      setLeafletReady(true);
      return;
    }

    if (!document.getElementById(jsId)) {
      const script = document.createElement('script');
      script.id = jsId;
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.crossOrigin = '';
      script.onload = () => {
        setLeafletReady(true);
      };
      document.body.appendChild(script);
    } else {
      const existing = document.getElementById(jsId);
      existing?.addEventListener('load', () => setLeafletReady(true));
    }
  }, []);

  useEffect(() => {
    if (!leafletReady || !mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (!leafletMapRef.current) {
      const centerCoords = currentArea ? currentArea.center : DEFAULT_MAP_CENTER;
      const zoomLevel = currentArea ? currentArea.defaultZoom : DEFAULT_MAP_ZOOM;

      const map = L.map(mapContainerRef.current, {
        center: centerCoords,
        zoom: zoomLevel,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png', {
        maxZoom: 18,
        minZoom: 12,
        attribution: '国土地理院'
      }).addTo(map);

      const tsunamiLayer = L.tileLayer(
        'https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_data/{z}/{x}/{y}.png',
        {
          opacity: 0.6,
          maxZoom: 17,
          minZoom: 12,
          zIndex: 400
        }
      );
      if (showTsunamiLayer) {
        tsunamiLayer.addTo(map);
      }
      tsunamiLayerRef.current = tsunamiLayer;
      leafletMapRef.current = map;
    } else {
      const map = leafletMapRef.current;
      if (currentArea) {
        map.setView(currentArea.center, currentArea.defaultZoom, { animate: true });
      }
    }
  }, [leafletReady, currentArea]);

  useEffect(() => {
    if (!leafletMapRef.current || !tsunamiLayerRef.current) return;
    const map = leafletMapRef.current;
    const layer = tsunamiLayerRef.current;

    if (showTsunamiLayer) {
      if (!map.hasLayer(layer)) {
        layer.addTo(map);
      }
    } else {
      if (map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    }
  }, [showTsunamiLayer]);

  useEffect(() => {
    if (!leafletReady || !leafletMapRef.current) return;
    const L = (window as any).L;
    const map = leafletMapRef.current;

    Object.values(markersRef.current).forEach((marker: any) => marker.remove());
    markersRef.current = {};

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    const sortedPoints = [...currentAreaRecords]
      .sort((a, b) => a.elevation - b.elevation)
      .map((r) => r.coordinates);

    if (sortedPoints.length > 1) {
      const line = L.polyline(sortedPoints, {
        color: '#23272F',
        weight: 2,
        dashArray: '4, 4',
        opacity: 0.95
      }).addTo(map);
      polylineRef.current = line;
    }

    currentAreaRecords.forEach((record) => {
      const cat = CATEGORY_MAP[record.category] || CATEGORY_MAP.disaster;
      const isSelected = record.id === selectedRecordId;
      const isHovered = record.id === highlightedRecordId;

      const recordTitle = lang === 'en' ? record.titleEn || record.title : record.title;
      const recordSummary = lang === 'en' ? record.summaryEn || record.summary : record.summary;

      const pinLabel = `${record.elevation}m`;
      const popupCategoryBadge =
        lang === 'ja'
          ? `${cat.label.ja} / 海抜 ${record.elevation}m`
          : `${cat.code} / ${record.elevation}M`;

      const iconHtml = `
        <div style="
          display: flex;
          align-items: center;
          background: ${isSelected ? '#2B2F38' : '#FCFBF8'};
          color: ${isSelected ? '#FCFBF8' : '#2B2F38'};
          border: 1px solid ${isSelected ? '#2B2F38' : '#CDC8BD'};
          border-left: 4px solid ${cat.color};
          border-radius: 3px;
          padding: 3px 7px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: -0.01em;
          box-shadow: 0 1px 4px rgba(43,47,56,0.12);
          white-space: nowrap;
          cursor: pointer;
          transform: ${isSelected || isHovered ? 'scale(1.08)' : 'scale(1)'};
          transition: transform 0.15s ease, background-color 0.15s ease;
        ">
          <span>${pinLabel}</span>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-kumano-pin',
        iconSize: [44, 24],
        iconAnchor: [22, 12]
      });

      const marker = L.marker(record.coordinates, { icon: customIcon }).addTo(map);

      const popupContent = `
        <div style="padding: 6px 4px; min-width: 190px; font-family: ui-sans-serif, system-ui, sans-serif; background: #FCFBF8; border-radius: 4px;">
          <div style="font-size: 10px; font-weight: 700; font-family: monospace; letter-spacing: 0.08em; color: ${cat.color}; text-transform: uppercase; margin-bottom: 4px;">
            ${popupCategoryBadge}
          </div>
          <div style="font-weight: 700; font-size: 13px; color: #2B2F38; margin-bottom: 5px; line-height: 1.35;">
            ${recordTitle}
          </div>
          <div style="font-size: 12px; color: #2B2F38; line-height: 1.5; font-weight: 500;">
            ${recordSummary.slice(0, 56)}...
          </div>
        </div>
      `;
      marker.bindPopup(popupContent, { offset: [0, -10] });

      marker.on('click', () => {
        setSelectedRecordId(record.id);
        setMobileTab('articles');
        const el = document.getElementById(`record-${record.id}`);
        if (el) {
          isProgrammaticScrollRef.current = true;
          if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          scrollTimeoutRef.current = setTimeout(() => {
            isProgrammaticScrollRef.current = false;
          }, 800);
        }
      });

      markersRef.current[record.id] = marker;
    });
  }, [leafletReady, currentAreaRecords, selectedRecordId, highlightedRecordId, lang]);

  useEffect(() => {
    if (typeof window === 'undefined' || !isMapSyncEnabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScrollRef.current) return;

        const intersecting = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (intersecting.length > 0) {
          const topEntry = intersecting[0];
          const recId = topEntry.target.id.replace('record-', '');
          if (recId && recId !== selectedRecordId) {
            setSelectedRecordId(recId);
            const targetRec = currentAreaRecords.find((r) => r.id === recId);
            if (targetRec && leafletMapRef.current) {
              leafletMapRef.current.panTo(targetRec.coordinates, {
                animate: true,
                duration: 0.7
              });
              const marker = markersRef.current[recId];
              if (marker) {
                marker.openPopup();
              }
            }
          }
        }
      },
      {
        root: null,
        rootMargin: '-20% 0px -40% 0px',
        threshold: [0.1, 0.4]
      }
    );

    currentAreaRecords.forEach((rec) => {
      const el = document.getElementById(`record-${rec.id}`);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [currentAreaRecords, isMapSyncEnabled, selectedRecordId]);

  const handleSelectRecord = useCallback(
    (recordId: string, shouldPan = true) => {
      setSelectedRecordId(recordId);
      const target = currentAreaRecords.find((r) => r.id === recordId);
      if (target && shouldPan && leafletMapRef.current) {
        leafletMapRef.current.flyTo(target.coordinates, 17, { duration: 0.6 });
        const marker = markersRef.current[recordId];
        if (marker) {
          marker.openPopup();
        }
      }
    },
    [currentAreaRecords]
  );

  const togglePlayAudio = (recordId: string) => {
    if (playingRecordId === recordId) {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      setPlayingRecordId(null);
    } else {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      setPlayingRecordId(recordId);
      setAudioProgress(0);

      audioIntervalRef.current = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            clearInterval(audioIntervalRef.current);
            setPlayingRecordId(null);
            return 0;
          }
          return prev + 2;
        });
      }, 350);
    }
  };

  useEffect(() => {
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, []);

  const handleExportGeoJSON = () => {
    if (!currentArea && currentAreaRecords.length === 0) {
      showToast(t.noExportData);
      return;
    }
    const areaName = currentArea
      ? (lang === 'en' ? currentArea.nameEn || currentArea.name : currentArea.name)
      : 'all';

    const geojsonData = {
      type: 'FeatureCollection',
      lab: 'Kumano Future Lab.',
      language: lang,
      areaMeta: currentArea,
      features: currentAreaRecords.map((r) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [r.coordinates[1], r.coordinates[0]]
        },
        properties: {
          id: r.id,
          title: lang === 'en' ? r.titleEn || r.title : r.title,
          area: areaName,
          category: r.category,
          elevation_m: r.elevation,
          narrator: lang === 'en' ? r.narratorEn || r.narrator : r.narrator,
          narrator_age: r.narratorAge,
          interview_date: lang === 'en' ? r.interviewDateEn || r.interviewDate : r.interviewDate,
          summary: lang === 'en' ? r.summaryEn || r.summary : r.summary,
          narrative: lang === 'en' ? r.narrativeEn || r.narrative : r.narrative,
          connected_paths: r.connectedPaths
        }
      }))
    };

    const blob = new Blob([JSON.stringify(geojsonData, null, 2)], {
      type: 'application/geo+json;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `kumano_${currentArea?.id || 'all'}_${lang}_archive.geojson`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`${t.exportedToast} ${areaName} (${currentAreaRecords.length} records)`);
  };

  const copyCoordinates = (coords: [number, number]) => {
    const text = `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`${t.copiedToast} ${text}`);
    }
  };

  const currentAreaDisplayName = currentArea
    ? (lang === 'en' ? currentArea.nameEn || currentArea.name : currentArea.name)
    : '';
  const currentAreaDescription = currentArea
    ? (lang === 'en' ? currentArea.descriptionEn || currentArea.description : currentArea.description)
    : '';
  const currentAreaTopography = currentArea
    ? (lang === 'en' ? currentArea.topographyNotesEn || currentArea.topographyNotes : currentArea.topographyNotes)
    : '';

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#2B2F38] font-sans antialiased flex flex-col selection:bg-[#2B2F38] selection:text-[#FCFBF8]">
      <header className="sticky top-0 z-50 bg-[#FCFBF8]/95 backdrop-blur-sm border-b border-[#E2DDD3] px-4 md:px-8 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="max-w-[1680px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-4">
              <div
                className="cursor-pointer transition-opacity hover:opacity-80 py-0.5"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                title="Kumano Future Lab. Top"
              >
                <KumanoLogo variant="lockup" />
              </div>

              <div className="hidden sm:flex items-center pl-3 border-l border-[#DCD6C9]">
                <span className="text-[11px] font-mono font-semibold tracking-wider text-[#2B2F38] uppercase">
                  {t.archiveBadge}
                </span>
              </div>
            </div>

            <div className="flex md:hidden items-center border border-[#DCD6C9] rounded p-0.5 text-xs font-mono font-medium bg-[#F3EFE7]">
              <button
                type="button"
                onClick={() => setMobileTab('articles')}
                className={`px-3 py-1 rounded-sm transition ${
                  mobileTab === 'articles' ? 'bg-[#2B2F38] text-[#FCFBF8] shadow-sm' : 'text-[#2B2F38] hover:opacity-75'
                }`}
              >
                {t.recordsTab}
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('map'); setTimeout(() => { leafletMapRef.current?.invalidateSize(); }, 60); setTimeout(() => { leafletMapRef.current?.invalidateSize(); }, 300);}
                className={`px-3 py-1 rounded-sm transition ${
                  mobileTab === 'map' ? 'bg-[#2B2F38] text-[#FCFBF8] shadow-sm' : 'text-[#2B2F38] hover:opacity-75'
                }`}
              >
                {t.mapTab}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto justify-between md:justify-end text-xs">
            <div className="flex items-center border border-[#DCD6C9] bg-[#FCFBF8] rounded p-0.5 font-mono text-xs font-medium shadow-sm">
              <button
                type="button"
                onClick={() => changeLanguage('ja')}
                className={`px-2.5 py-1 rounded-sm transition ${
                  lang === 'ja' ? 'bg-[#2B2F38] text-[#FCFBF8] shadow-sm' : 'text-[#2B2F38] hover:opacity-75'
                }`}
                title="日本語表示に切替"
              >
                日本語
              </button>
              <button
                type="button"
                onClick={() => changeLanguage('en')}
                className={`px-2.5 py-1 rounded-sm transition ${
                  lang === 'en' ? 'bg-[#2B2F38] text-[#FCFBF8] shadow-sm' : 'text-[#2B2F38] hover:opacity-75'
                }`}
                title="Switch to English"
              >
                EN
              </button>
            </div>

            <div className="flex items-center border border-[#DCD6C9] bg-[#FCFBF8] rounded px-2.5 py-1.5 shadow-sm">
              <span className="text-[11px] font-semibold tracking-wider text-[#2B2F38] uppercase mr-2 hidden lg:inline">
                {t.areaLabel}
              </span>
              <select
                value={selectedAreaId || ''}
                disabled={areas.length === 0}
                onChange={(e) => {
                  setSelectedAreaId(e.target.value);
                  const firstOfArea = records.find((r) => r.areaId === e.target.value);
                  if (firstOfArea) setSelectedRecordId(firstOfArea.id);
                }}
                className="bg-transparent text-xs font-semibold text-[#2B2F38] focus:outline-none cursor-pointer disabled:opacity-50"
              >
                {areas.length === 0 ? (
                  <option value="">{t.noAreasAvailable}</option>
                ) : (
                  areas.map((area) => {
                    const aName = lang === 'en' ? area.nameEn || area.name : area.name;
                    const aTown = lang === 'en' ? area.townEn || area.town : ((area.town ? (area.town.split("東牟婁郡")[1] || area.town) : ""));
                    return (
                      <option key={area.id} value={area.id}>
                        {aName} ({aTown})
                      </option>
                    );
                  })
                )}
              </select>
            </div>

            <button
              type="button"
              onClick={handleExportGeoJSON}
              className="inline-flex items-center gap-1.5 bg-[#FCFBF8] hover:bg-[#F3EFE7] text-[#2B2F38] border border-[#DCD6C9] rounded px-3 py-1.5 text-xs font-semibold transition shadow-sm"
              title={t.geojsonTitle}
            >
              <Download className="w-3.5 h-3.5 text-[#2B2F38]" />
              <span className="hidden sm:inline">{t.geojsonExport}</span>
            </button>

            <a
              href="https://app.v2.gather.town/app/f2421d3e-42ec-4646-ae32-941c3b0a98c7/invite/c376433a-9ae6-4e72-b237-cac9cc817c29?copysource=peoplePanel"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#2B2F38] hover:bg-[#3A3F4B] text-[#FCFBF8] border border-[#2B2F38] rounded px-3.5 py-1.5 text-xs font-medium tracking-wide transition shadow-sm"
              title={t.virtualLabTitle}
            >
              <span>{t.virtualLab}</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#FCFBF8]" />
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row max-w-[1680px] w-full mx-auto relative items-start">
        <section
          className={`w-full md:w-[45%] md:h-[calc(100vh-62px)] md:sticky md:top-[62px] flex flex-col border-r border-[#E2DDD3] bg-[#FCFBF8] z-20 shrink-0 ${
            mobileTab === 'map' ? 'flex flex-col w-full h-[calc(100dvh-115px)]' : 'hidden md:flex'
          }`}
        >
          <div className="bg-[#FCFBF8] border-b border-[#E2DDD3] px-4 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#2B2F38]">
              <Compass className="w-4 h-4 text-[#2B2F38]" />
              <span className="tracking-wide font-bold">{t.spatialElevation}</span>
              {currentArea && (
                <span className="text-xs text-[#2B2F38] font-mono font-medium hidden xl:inline">
                  {t.targetPrefix}{currentArea.evacuationTargetElevation}{t.targetSuffix}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowTsunamiLayer(!showTsunamiLayer)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded border transition ${
                  showTsunamiLayer
                    ? 'bg-[#2B2F38] text-[#FCFBF8] border-[#2B2F38] shadow-sm'
                    : 'bg-[#FCFBF8] text-[#2B2F38] border-[#DCD6C9] hover:bg-[#F3EFE7]'
                }`}
                title={t.tsunamiTitle}
              >
                <Waves className="w-3.5 h-3.5" />
                <span>{t.tsunamiBtn}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsLegendOpen(!isLegendOpen)}
                className="p-1 border border-[#DCD6C9] rounded bg-[#FCFBF8] hover:bg-[#F3EFE7] text-[#2B2F38] transition shadow-sm"
                title={t.legendBtnTitle}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 relative w-full h-full min-h-[400px]">
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />

            {isLegendOpen && (
              <div className="absolute top-3 left-3 z-20 bg-[#FCFBF8]/95 backdrop-blur-sm border border-[#DCD6C9] rounded-md p-4 shadow-lg max-w-xs text-xs font-sans">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#E8E4DB]">
                  <span className="text-xs tracking-wider font-bold text-[#2B2F38] uppercase">
                    {t.legendTitle}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsLegendOpen(false)}
                    className="text-[#2B2F38] hover:opacity-70"
                    title={lang === 'ja' ? '閉じる' : 'Close'}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2 text-xs text-[#2B2F38]">
                  {(Object.keys(CATEGORY_MAP) as KnowledgeCategory[]).map((key) => {
                    const c = CATEGORY_MAP[key];
                    return (
                      <div key={key} className="flex items-center gap-2.5">
                        <span
                          className="w-3 h-3 inline-block shrink-0 rounded-sm"
                          style={{ backgroundColor: c.color }}
                        />
                        <span className="font-semibold">{c.label[lang]}</span>
                        {lang === 'en' && (
                          <span className="text-[10px] font-mono text-[#2B2F38] uppercase">[{c.code}]</span>
                        )}
                      </div>
                    );
                  })}
                  <div className="flex items-center gap-2 pt-2 border-t border-dashed border-[#DCD6C9] text-[#2B2F38] text-[11px] font-medium">
                    <span className="w-4 h-0.5 bg-[#2B2F38] inline-block" />
                    <span>{t.connectingPathway}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-none flex justify-center">
              <div className="pointer-events-auto bg-[#FCFBF8]/95 backdrop-blur-sm border border-[#DCD6C9] rounded-md px-3.5 py-1.5 text-xs flex items-center gap-3 text-[#2B2F38] font-semibold shadow-md">
                <span className="font-mono text-[#2B2F38]">{t.pinGuide}</span>
                <span className="w-px h-3 bg-[#DCD6C9]" />
                <div className="flex items-center gap-1.5 text-[#2B2F38]">
                  <Mountain className="w-3.5 h-3.5 text-[#2B2F38]" />
                  <span>
                    {currentArea ? `${currentArea.name}: ${currentArea.evacuationTargetElevation}m+` : t.surveyDistrict}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className={`w-full md:w-[55%] px-4 md:px-8 py-6 bg-[#F8F6F0] flex flex-col ${
            mobileTab === 'articles' ? 'block' : 'hidden md:flex'
          }`}
        >
          {currentArea ? (
            <div className="mb-6 p-6 bg-[#FCFBF8] border border-[#E0DBD0] rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#E8E4DB] pb-3 mb-4">
                <div>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#2B2F38] block mb-0.5">
                    {t.surveyDistrict}
                  </span>
                  <h2 className="text-2xl font-bold text-[#2B2F38] tracking-tight">
                    {currentAreaDisplayName}
                  </h2>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#2B2F38]">
                  <div className="flex items-center gap-1 font-semibold text-[#2B2F38]">
                    <ShieldAlert className="w-4 h-4 text-[#D97706]" />
                    <span>
                      {t.shelterGoal}: {t.elevationPrefix}{currentArea.evacuationTargetElevation}{t.shelterUnit}
                    </span>
                  </div>
                  <span className="text-[#DCD6C9]">/</span>
                  <span className="font-semibold">
                    {currentAreaRecords.length} {t.archivesCount}
                  </span>
                </div>
              </div>

              <p className="text-[15px] text-[#2B2F38] leading-relaxed mb-4 font-normal">
                {currentAreaDescription}
              </p>
              <div className="bg-[#F3EFE7] p-3.5 rounded border-l-2 border-[#2B2F38] text-xs text-[#2B2F38]">
                <span className="text-[#2B2F38] font-bold tracking-wide block mb-1">
                  {t.topographyHeading}
                </span>
                <p className="font-sans text-[#2B2F38] leading-relaxed font-normal">{currentAreaTopography}</p>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-6 bg-[#FCFBF8] border border-[#E0DBD0] rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <div className="flex items-center gap-2 mb-2 text-[#2B2F38]">
                <Info className="w-5 h-5 text-[#2B2F38]" />
                <h3 className="text-base font-bold">{t.emptyAreaHeading}</h3>
              </div>
              <p className="text-xs text-[#2B2F38] leading-relaxed font-normal">
                {t.emptyAreaDesc}
              </p>
            </div>
          )}

          <div className="mb-6 flex items-center justify-between flex-wrap gap-2 border-b border-[#E2DDD3] pb-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 max-w-full text-xs">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1.5 rounded transition border font-semibold shrink-0 ${
                  activeCategory === 'all'
                    ? 'bg-[#2B2F38] text-[#FCFBF8] border-[#2B2F38] shadow-sm'
                    : 'bg-[#FCFBF8] text-[#2B2F38] border-[#DCD6C9] hover:border-[#2B2F38]'
                }`}
              >
                {t.allFilter} ({currentAreaRecords.length})
              </button>

              {(Object.keys(CATEGORY_MAP) as KnowledgeCategory[]).map((catKey) => {
                const conf = CATEGORY_MAP[catKey];
                const count = currentAreaRecords.filter((r) => r.category === catKey).length;
                const isSelected = activeCategory === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setActiveCategory(catKey)}
                    className={`px-3 py-1.5 rounded transition border flex items-center gap-1.5 shrink-0 font-semibold ${
                      isSelected
                        ? 'bg-[#2B2F38] text-[#FCFBF8] border-[#2B2F38] shadow-sm'
                        : 'bg-[#FCFBF8] text-[#2B2F38] border-[#DCD6C9] hover:border-[#2B2F38]'
                    }`}
                  >
                    <span
                      className="w-2 h-2 inline-block rounded-full"
                      style={{ backgroundColor: conf.color }}
                    />
                    <span>{conf.label[lang]}</span>
                    <span className="text-xs font-mono opacity-85">[{count}]</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsMapSyncEnabled(!isMapSyncEnabled)}
              className={`text-xs font-mono font-semibold tracking-wide px-2.5 py-1 rounded border transition flex items-center gap-1.5 shrink-0 ${
                isMapSyncEnabled
                  ? 'bg-[#FCFBF8] text-[#2B2F38] border-[#2B2F38] shadow-sm'
                  : 'bg-[#FCFBF8] text-[#2B2F38] border-[#E0DBD0]'
              }`}
              title={t.mapSyncToggleTitle}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isMapSyncEnabled ? 'bg-emerald-600 animate-pulse' : 'bg-[#DCD6C9]'}`} />
              <span>{t.synchronizedNote}</span>
            </button>
          </div>

          <div className="space-y-6">
            {filteredRecords.length === 0 ? (
              <div className="py-16 text-center text-sm font-semibold text-[#2B2F38] border border-[#E0DBD0] rounded-lg bg-[#FCFBF8] px-4">
                <div className="max-w-md mx-auto space-y-2">
                  <p className="text-base font-bold">{t.emptyRecordsHeading}</p>
                  <p className="text-xs font-normal text-[#2B2F38] opacity-80 leading-relaxed">
                    {t.emptyRecordsDesc}
                  </p>
                </div>
              </div>
            ) : (
              filteredRecords.map((record) => {
                const catConf = CATEGORY_MAP[record.category] || CATEGORY_MAP.disaster;
                const isSelected = record.id === selectedRecordId;
                const isPlaying = playingRecordId === record.id;

                const recTitle = lang === 'en' ? record.titleEn || record.title : record.title;
                const recNarrator = lang === 'en' ? record.narratorEn || record.narrator : record.narrator;
                const recDate = lang === 'en' ? record.interviewDateEn || record.interviewDate : record.interviewDate;
                const recSummary = lang === 'en' ? record.summaryEn || record.summary : record.summary;
                const recNarrative = lang === 'en' ? record.narrativeEn || record.narrative : record.narrative;

                return (
                  <article
                    id={`record-${record.id}`}
                    key={record.id}
                    onClick={() => handleSelectRecord(record.id, false)}
                    className={`bg-[#FCFBF8] rounded-lg transition-all duration-200 p-6 md:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03)] border ${
                      isSelected
                        ? 'border-[#2B2F38] ring-1 ring-[#2B2F38]/20 shadow-md'
                        : 'border-[#E0DBD0] hover:border-[#2B2F38] hover:shadow-sm'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded border"
                          style={{
                            borderColor: `${catConf.color}40`,
                            color: catConf.color,
                            backgroundColor: `${catConf.color}0D`
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: catConf.color }}
                          />
                          {catConf.label[lang]}
                        </span>

                        <span className="inline-flex items-center text-xs font-mono font-bold bg-[#2B2F38] text-[#FCFBF8] px-2 py-0.5 rounded">
                          {t.elevationPrefix}{record.elevation}{t.elevationUnit}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#2B2F38]">
                        <span className="font-bold">
                          {recNarrator} ({record.narratorAge}{t.ageSuffix})
                        </span>
                        <span className="text-[#DCD6C9]">/</span>
                        <span className="font-mono text-xs font-medium">{recDate}</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-[#2B2F38] mb-3 leading-snug tracking-tight">
                      {recTitle}
                    </h3>

                    <div className="p-3.5 bg-[#F3EFE7] rounded border-l-2 border-[#2B2F38] text-sm text-[#2B2F38] font-normal leading-relaxed mb-5">
                      {recSummary}
                    </div>

                    {record.audioMeta && (
                      <div className="mb-5 bg-[#F3EFE7] border border-[#DDD8CD] rounded-md p-3.5 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-[#2B2F38]">
                            <Volume2 className="w-4 h-4 text-[#2B2F38]" />
                            <span className="font-bold tracking-wide text-xs">
                              {t.oralAudioHeading}
                            </span>
                            <span className="text-xs text-[#2B2F38] font-mono font-medium opacity-80">
                              [{record.audioMeta.duration} / {record.audioMeta.sampleRate}]
                            </span>
                          </div>
                          <span className="text-xs text-[#2B2F38] font-mono font-bold">
                            {isPlaying ? `${Math.round(audioProgress)}% ${t.playingStatus}` : t.standbyStatus}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePlayAudio(record.id);
                            }}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition shadow-sm ${
                              isPlaying
                                ? 'bg-rose-600 text-[#FCFBF8] hover:bg-rose-700'
                                : 'bg-[#2B2F38] text-[#FCFBF8] hover:opacity-90'
                            }`}
                            title={isPlaying ? t.pauseBtn : t.playBtn}
                          >
                            {isPlaying ? (
                              <Pause className="w-3 h-3" />
                            ) : (
                              <Play className="w-3 h-3 ml-0.5" />
                            )}
                          </button>

                          <div className="flex-1 flex items-end gap-1 h-6 px-1">
                            {record.audioMeta.waveformPeaks?.map((peak, idx) => {
                              const activeCount = Math.floor(
                                ((record.audioMeta?.waveformPeaks?.length || 1) * audioProgress) / 100
                              );
                              const isPast = isPlaying && idx <= activeCount;
                              return (
                                <div
                                  key={idx}
                                  className="flex-1 rounded-t-sm transition-all duration-150"
                                  style={{
                                    height: `${Math.max(18, peak)}%`,
                                    backgroundColor: isPast ? '#2B2F38' : '#D0C9BC'
                                  }}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {record.media && record.media.length > 0 && (
                      <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {record.media.map((item, mIdx) => {
                          const itemCaption = lang === 'en' ? item.captionEn || item.caption : item.caption;
                          const itemCredit = lang === 'en' ? item.creditEn || item.credit : item.credit;
                          return (
                            <div
                              key={mIdx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveLightboxMedia({
                                  caption: itemCaption,
                                  credit: itemCredit,
                                  title: recTitle
                                });
                              }}
                              className="cursor-pointer group/media relative overflow-hidden border border-[#DDD8CD] rounded-md bg-[#F3EFE7] aspect-[16/10] flex flex-col justify-end p-3 transition hover:shadow-md"
                            >
                              <div
                                className={`absolute inset-0 bg-gradient-to-tr ${item.thumbnailBg} opacity-90 group-hover/media:scale-102 transition-transform duration-200 flex items-center justify-center`}
                              >
                                <Camera className="w-6 h-6 text-[#2B2F38]/40" />
                              </div>

                              <div className="absolute inset-0 bg-gradient-to-t from-[#2B2F38]/90 via-[#2B2F38]/30 to-transparent" />

                              <div className="relative z-10 text-[#FCFBF8]">
                                <p className="text-xs font-medium line-clamp-2 leading-snug drop-shadow-sm">
                                  {itemCaption}
                                </p>
                                <div className="flex items-center justify-between text-[11px] text-[#FCFBF8]/80 font-normal mt-1.5 drop-shadow-sm">
                                  <span>{itemCredit}</span>
                                  <span className="inline-flex items-center gap-1 text-[#FCFBF8] font-medium">
                                    <Maximize2 className="w-3 h-3" />
                                    {t.expandPhoto}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="text-[#2B2F38] text-[15px] leading-relaxed whitespace-pre-line mb-5 font-normal">
                      {recNarrative}
                    </div>

                    {record.connectedPaths && record.connectedPaths.length > 0 && (
                      <div className="pt-4 border-t border-[#E8E4DB] flex flex-col gap-2">
                        <span className="text-xs font-bold text-[#2B2F38] tracking-wide uppercase">
                          {t.connectedHeading}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {record.connectedPaths.map((path) => {
                            const pathName = lang === 'en' ? path.nameEn || path.name : path.name;
                            return (
                              <button
                                key={path.targetId}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectRecord(path.targetId, true);
                                  const targetEl = document.getElementById(`record-${path.targetId}`);
                                  if (targetEl) {
                                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  }
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FCFBF8] hover:bg-[#F3EFE7] border border-[#DCD6C9] rounded text-xs text-[#2B2F38] transition font-semibold shadow-sm"
                              >
                                <ChevronRight className="w-3.5 h-3.5 text-[#2B2F38]" />
                                <span>{pathName}</span>
                                <span className="text-xs font-mono text-[#2B2F38] opacity-75">
                                  [{path.distanceMeter}m]
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="mt-5 pt-3 border-t border-[#E8E4DB] flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectRecord(record.id, true);
                          setMobileTab('map'); setTimeout(() => { leafletMapRef.current?.invalidateSize(); }, 60); setTimeout(() => { leafletMapRef.current?.invalidateSize(); }, 300);;
                        }}
                        className="inline-flex items-center gap-1.5 text-[#2B2F38] hover:opacity-75 font-bold text-xs"
                      >
                        <MapPin className="w-3.5 h-3.5 text-[#2B2F38]" />
                        <span>{t.locateMapBtn}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyCoordinates(record.coordinates);
                        }}
                        className="inline-flex items-center gap-1.5 text-[#2B2F38] hover:bg-[#F3EFE7] border border-[#DCD6C9] rounded px-2.5 py-1 transition font-mono font-semibold text-xs shadow-sm"
                        title={t.copyCoordsBtn}
                      >
                        <Copy className="w-3.5 h-3.5 text-[#2B2F38]" />
                        <span>
                          {record.coordinates[0].toFixed(4)}, {record.coordinates[1].toFixed(4)}
                        </span>
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <footer className="mt-16 pt-10 border-t border-[#E2DDD3] text-center flex flex-col items-center pb-14 bg-[#F8F6F0]">
            <KumanoLogo variant="full" />
          </footer>
        </section>
      </main>

      {activeLightboxMedia && (
        <div
          className="fixed inset-0 z-[100] bg-[#2B2F38]/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveLightboxMedia(null)}
        >
          <div
            className="max-w-2xl w-full bg-[#FCFBF8] border border-[#DCD6C9] rounded-lg p-6 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E8E4DB]">
              <h4 className="font-bold text-[#2B2F38] text-base tracking-tight">
                {activeLightboxMedia.title}
              </h4>
              <button
                type="button"
                onClick={() => setActiveLightboxMedia(null)}
                className="p-1 hover:bg-[#F3EFE7] text-[#2B2F38] transition border border-[#DCD6C9] rounded"
                title={lang === 'ja' ? '閉じる' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-[16/10] bg-[#F3EFE7] flex items-center justify-center relative overflow-hidden mb-4 border border-[#DDD8CD] rounded-md">
              <Camera className="w-12 h-12 text-[#2B2F38]/30" />
              <div className="absolute bottom-3 left-3 bg-[#2B2F38] text-[#FCFBF8] text-xs font-medium px-2.5 py-1 rounded">
                {t.photoBadge}
              </div>
            </div>

            <p className="text-sm text-[#2B2F38] font-medium leading-relaxed mb-2">
              {activeLightboxMedia.caption}
            </p>
            <div className="text-xs text-[#2B2F38] font-medium opacity-80">
              {t.creditLabel} {activeLightboxMedia.credit}
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[110] bg-[#2B2F38] text-[#FCFBF8] border border-[#2B2F38] rounded-md px-4 py-2.5 text-xs font-mono font-medium flex items-center gap-2 shadow-xl">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
