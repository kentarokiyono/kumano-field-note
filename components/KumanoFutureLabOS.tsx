'use client';

/* STREAMING_CHUNK:Importing React, Leaflet types, and Lucide icons */
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
} from 'lucide-react';

export type Language = 'ja' | 'en';

/* STREAMING_CHUNK:Defining distance calculation and format helpers */
// 2地点間の距離（メートル）を計算するハバーサイン公式
function calcDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// 秒数を 00:00 形式にフォーマット
export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export interface AreaConfig {
  id: string;
  name: string;
  nameEn?: string;
  municipality: string;
  municipalityEn?: string;
  center: [number, number];
  defaultZoom: number;
  targetElevation: string;
  targetElevationEn?: string;
  description: string;
  descriptionEn?: string;
}

/* STREAMING_CHUNK:Configuring registered field areas and master dictionaries */
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
    description: '島しょ部の孤立対策、段々畑と古井戸の生活史',
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
    description: '本州最南端の台地、風衝地特有の防風林と避難動線',
  },
];

export const UI_TEXT = {
  ja: {
    mapTab: '地図', branchTab: 'つながり', recordsTab: '記録一覧', virtualLab: '仮想研究所', virtualLabShort: '研究所',
    allFilter: 'すべて', tsunamiDepth: '津波浸水深', targetGoal: '避難目標', surveyStart: '調査開始', surveying: '調査中',
    locateMe: '現在地', addMemo: 'メモを残す', recordVoice: '声を録る', stop: '停止', recordingVoice: '聞き書き録音中',
    narratorLabel: '語り手', listenVoice: '証言を聴く', seeConnections: 'つながりを見る', routeHeading: '集落連絡小径・避難路の連環',
    addPointBtn: '地点を追加', incomingRoutes: 'この地点へ至るルート:', fromHereRoutes: 'ここからの小径・つながり',
    noConnectionsYet: 'つながっている小径・分岐はまだありません。', addConnectionBtn: 'つながりを追加', proceedPath: 'この先へ進む',
    viewOnMap: '地図で見る', backToMap: '地図に戻る', recordsHeading: '聞き書き記録一覧', recordsSubtitle: '件の現地記録',
    surveyDistrictLabel: '調査地区:', newDistrictBtn: '新規地区', noRecordsInDistrict: 'にはまだ記録がありません',
    addFirstRecord: 'この地区の最初の記録を残す', editRecord: '記録の編集', addNewRecord: '新しい記録を追加',
    recordType: '記録の種別', pointTitle: '地点・記録の見出し', narratorInput: '語り手 / 情報提供者', elevationInput: '標高目安',
    noteInput: '話の内容・観察メモ', mediaLabel: '現地の写真・動画', addPhoto: '写真を追加', photoUploadHint: 'タップして写真を選択',
    photoUploadSub: '※IndexedDBへ保存されます', tagsLabel: 'タグ（カンマ区切り）', cancel: 'キャンセル', save: '保存する',
    addConnectionModalTitle: '新しいつながりを追加', targetPointLabel: 'つなぎ先の地点', relationTypeLabel: '関係性・ルート名',
    routeNoteLabel: 'ルートの補足・知恵（任意）', connectBtn: '接続する', areaModalTitle: '調査地区の選択',
    registeredDistricts: '登録済み地区', addNewDistrictHeading: '新しい地区を追加する', createAtGps: '現在地で作成',
    createAtCenter: '地図中心で作成', recordsCountLabel: '記録', pointsUnit: '地点', exportZipBtn: 'ZIP保存',
    importZipBtn: 'ZIP復元', noAudioWarn: '再生できる音声ファイルがありません',
  },
  en: {
    mapTab: 'MAP', branchTab: 'CONNECTIONS', recordsTab: 'RECORDS', virtualLab: 'LAB', virtualLabShort: 'LAB',
    allFilter: 'ALL', tsunamiDepth: 'Tsunami Depth', targetGoal: 'Evacuation Goal', surveyStart: 'START', surveying: 'TRACKING',
    locateMe: 'LOCATE', addMemo: 'NOTE', recordVoice: 'RECORD', stop: 'STOP', recordingVoice: 'RECORDING',
    narratorLabel: 'Narrator', listenVoice: 'Listen', seeConnections: 'Connections', routeHeading: 'Evacuation Routes',
    addPointBtn: 'Add Point', incomingRoutes: 'Approaching routes:', fromHereRoutes: 'Connected routes',
    noConnectionsYet: 'No connections yet.', addConnectionBtn: 'Add Connection', proceedPath: 'Proceed',
    viewOnMap: 'Map', backToMap: 'Back to Map', recordsHeading: 'Field Records', recordsSubtitle: 'records',
    surveyDistrictLabel: 'District:', newDistrictBtn: 'New', noRecordsInDistrict: 'has no records',
    addFirstRecord: 'Add first record', editRecord: 'Edit Record', addNewRecord: 'New Record',
    recordType: 'Type', pointTitle: 'Title', narratorInput: 'Narrator', elevationInput: 'Elevation',
    noteInput: 'Field Notes', mediaLabel: 'Media', addPhoto: 'Add Photo', photoUploadHint: 'Tap to select photo',
    photoUploadSub: 'Saved to IndexedDB', tagsLabel: 'Tags', cancel: 'Cancel', save: 'Save',
    addConnectionModalTitle: 'Add Connection', targetPointLabel: 'Target', relationTypeLabel: 'Route Name',
    routeNoteLabel: 'Notes', connectBtn: 'Connect', areaModalTitle: 'Select District',
    registeredDistricts: 'Districts', addNewDistrictHeading: 'Add New District', createAtGps: 'At GPS',
    createAtCenter: 'At Map Center', recordsCountLabel: 'Records', pointsUnit: 'pts', exportZipBtn: 'ZIP',
    importZipBtn: 'Import ZIP', noAudioWarn: 'No audio available',
  }
};

export const TSUNAMI_DEPTH_LEGEND = [
  { label: '20.0m 以上', labelEn: '≥ 20.0m', note: '4階屋根以上', noteEn: '4th floor roof+', color: '#4a0040' },
  { label: '10.0m 〜 20.0m', labelEn: '10.0m – 20.0m', note: '3〜4階水没', noteEn: '3-4 floors submerged', color: '#721b65' },
  { label: '5.0m 〜 10.0m', labelEn: '5.0m – 5.0m', note: '2階屋根まで', noteEn: 'Up to 2nd floor roof', color: '#b23b8c' },
  { label: '3.0m 〜 5.0m', labelEn: '3.0m – 5.0m', note: '2階軒下まで', noteEn: 'Up to 2nd floor eaves', color: '#e60012' },
  { label: '0.5m 〜 3.0m', labelEn: '0.5m – 3.0m', note: '1階軒下まで', noteEn: 'Up to 1st floor eaves', color: '#f7be85' },
  { label: '0.5m 未満', labelEn: '< 0.5m', note: '床下・大人の膝', noteEn: 'Under floor / adult knees', color: '#ffffb3' },
];

export const CATEGORY_CONFIG: Record<string, { label: { ja: string; en: string }; color: string }> = {
  disaster: { label: { ja: '防災・避難知', en: 'Disaster' }, color: '#E11D48' },
  living: { label: { ja: '暮らし・住まい', en: 'Living' }, color: '#D97706' },
  water: { label: { ja: '水脈・井戸', en: 'Water' }, color: '#0284C7' },
  industry: { label: { ja: '生業・山海', en: 'Livelihood' }, color: '#059669' },
  culture: { label: { ja: '歴史・風土伝承', en: 'History' }, color: '#4F46E5' },
};

/* STREAMING_CHUNK:Setting up IndexedDB storage for offline field media */
const DB_NAME = 'kumano_field_media_db_v1';
const STORE_NAME = 'media_blobs';

function openMediaDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) return reject(new Error('IndexedDB not supported'));
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function storeMediaBlob(id: string, blob: Blob, mimeType: string): Promise<string> {
  const db = await openMediaDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({ id, blob, mimeType, createdAt: new Date().toISOString() });
    tx.oncomplete = () => resolve('ok-' + id);
    tx.onerror = () => reject(tx.error);
  });
}

export function KumanoLogoSilhouette({ className = 'text-[#23272F]' }: { className?: string }) {
  return (
    <svg viewBox="0 0 148 28" fill="currentColor" className={className} preserveAspectRatio="xMidYMid meet" shapeRendering="crispEdges">
      <rect x="0" y="14" width="3" height="12" /><rect x="3" y="12" width="3" height="14" /><rect x="6" y="8" width="3" height="18" /><rect x="9" y="3" width="3" height="23" /><rect x="12" y="9" width="3" height="17" /><rect x="15" y="14" width="3" height="12" /><rect x="18" y="18" width="4" height="8" /><rect x="22" y="18" width="3" height="8" /><rect x="25" y="20" width="4" height="6" />
      <rect x="38" y="21" width="20" height="5" /><rect x="40" y="17" width="16" height="9" /><rect x="42" y="13" width="12" height="13" /><rect x="44" y="9" width="8" height="17" /><rect x="46" y="5.5" width="4" height="20.5" />
      <rect x="64" y="21" width="22" height="5" /><rect x="66" y="17" width="18" height="9" /><rect x="68" y="13" width="14" height="13" /><rect x="70.5" y="9" width="9" height="17" /><rect x="73.5" y="1" width="3" height="25" />
      <rect x="92" y="21" width="16" height="5" /><rect x="94" y="17" width="12" height="9" /><rect x="96" y="12" width="8" height="14" /><rect x="98" y="7" width="4" height="19" />
    </svg>
  );
}

/* STREAMING_CHUNK:Declaring KumanoFutureLabOS main component and state */
export default function KumanoFutureLabOS() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const tsunamiLayerRef = useRef<any>(null);
  const trackPolylineRef = useRef<any>(null);
  const trackDotsLayerRef = useRef<any>(null); // パターンB: ドット列レイヤー
  const userMarkerRef = useRef<any>(null);
  const nodeMarkersMapRef = useRef<{ [key: string]: any }>({});

  const [lang] = useState<Language>('ja');
  const t = UI_TEXT[lang];

  const [areas] = useState<AreaConfig[]>(REGISTERED_AREAS);
  const [currentAreaId] = useState<string>('kushimoto-hori-kasajima');
  const currentArea = areas.find((a) => a.id === currentAreaId) || areas[0];

  const [nodes, setNodes] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const s = localStorage.getItem('kumano_field_knowledge_v1');
        if (s) return JSON.parse(s);
      } catch (e) {}
    }
    return [];
  });

  const currentAreaNodes = nodes.filter((n) => (n.areaId ? n.areaId === currentAreaId : true));
  const [currentCoords, setCurrentCoords] = useState<[number, number]>(currentArea.center);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  // 軌跡座標
  const [trackCoordinates, setTrackCoordinates] = useState<[number, number][]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const s = localStorage.getItem(`kumano_field_track_v1_${currentAreaId}`);
        if (s) return JSON.parse(s);
      } catch (e) {}
    }
    return [currentArea.center];
  });

  useEffect(() => {
    try {
      localStorage.setItem(`kumano_field_track_v1_${currentAreaId}`, JSON.stringify(trackCoordinates));
    } catch (e) {}
  }, [trackCoordinates, currentAreaId]);

  const [isEditingNode, setIsEditingNode] = useState<boolean>(false);
  const [editingData, setEditingData] = useState<any>({});

  // 録音ステート
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage((p) => (p === msg ? null : p)), 2800);
  };

  useEffect(() => {
    try {
      const sanitized = nodes.map((n) => ({ ...n, audioUrl: undefined }));
      localStorage.setItem('kumano_field_knowledge_v1', JSON.stringify(sanitized));
    } catch (e) {}
  }, [nodes]);

  /* STREAMING_CHUNK:Initializing Leaflet map and layer groups */
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;
    const win = window as any;
    if (!win.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initLeaflet;
      document.body.appendChild(script);
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    } else {
      initLeaflet();
    }

    function initLeaflet() {
      const L = (window as any).L;
      if (!L || !mapContainerRef.current || mapInstanceRef.current) return;
      const map = L.map(mapContainerRef.current, {
        center: [currentArea.center[1], currentArea.center[0]],
        zoom: currentArea.defaultZoom,
        zoomControl: false,
        attributionControl: false,
      });

      tileLayerRef.current = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png', {
        maxZoom: 18,
        minZoom: 4,
      }).addTo(map);

      // ガイド用点線
      trackPolylineRef.current = L.polyline([[currentArea.center[1], currentArea.center[0]]], {
        color: '#0284C7',
        weight: 1.5,
        opacity: 0.35,
        dashArray: '3, 6',
      }).addTo(map);

      // パターンB: ドット列用レイヤーグループ
      trackDotsLayerRef.current = L.layerGroup().addTo(map);

      userMarkerRef.current = L.marker([currentArea.center[1], currentArea.center[0]]).addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  /* STREAMING_CHUNK:Rendering Pattern B circular dots and trail */
  useEffect(() => {
    const win = window as any;
    const L = win?.L;

    // ガイド点線の同期
    if (trackPolylineRef.current) {
      trackPolylineRef.current.setLatLngs(trackCoordinates.map((c) => [c[1], c[0]]));
    }

    // パターンB: 歩行軌跡を「丸ドット列」でプロット
    if (trackDotsLayerRef.current && L) {
      trackDotsLayerRef.current.clearLayers();
      trackCoordinates.forEach((c, idx) => {
        if (idx > 0) {
          L.circleMarker([c[1], c[0]], {
            radius: 3.5,
            color: '#0284C7',
            weight: 1.5,
            fillColor: '#FFFFFF',
            fillOpacity: 0.95,
          }).addTo(trackDotsLayerRef.current);
        }
      });
    }

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([currentCoords[1], currentCoords[0]]);
    }
  }, [trackCoordinates, currentCoords]);

  /* STREAMING_CHUNK:Running GPS measurement engine with 3.5m jitter filter */
  useEffect(() => {
    let timerId: any = null;
    let isCancelled = false;

    const measure = () => {
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

          // 精度が35m以上悪いデータはジッター防止のため除外
          if (pos.coords.accuracy <= 35) {
            setTrackCoordinates((prev) => {
              const last = prev[prev.length - 1];
              if (last) {
                const movedMeters = calcDistanceMeters(last[1], last[0], newLngLat[1], newLngLat[0]);
                // 3.5m未満の揺らぎ（静止中のブレ）はプロットしない
                if (movedMeters < 3.5) {
                  return prev;
                }
              }
              return [...prev, newLngLat];
            });
          }

          if (mapInstanceRef.current) {
            mapInstanceRef.current.panTo([newLngLat[1], newLngLat[0]], { animate: true });
          }

          if (!isCancelled && isTracking) {
            timerId = setTimeout(measure, 1000);
          }
        },
        () => {
          if (!isCancelled && isTracking) timerId = setTimeout(measure, 1000);
        },
        { enableHighAccuracy: true, timeout: 3000, maximumAge: 0 }
      );
    };

    if (isTracking) measure();
    return () => {
      isCancelled = true;
      if (timerId) clearTimeout(timerId);
    };
  }, [isTracking]);

  const handleLocateImmediate = () => {
    if (!('geolocation' in navigator)) return showToast('位置情報に対応していません');
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
        showToast(`現在地を捕捉 (±${Math.round(pos.coords.accuracy)}m)`);
      },
      () => showToast('現在地を取得できませんでした'),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  /* STREAMING_CHUNK:Handling robust Safari and Chrome voice recording */
  const startRecording = async () => {
    showToast('マイクを起動しています...');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('⚠️ お使いのブラウザはマイク録音に対応していません');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      let recorder: any;
      try {
        recorder = new MediaRecorder(stream);
      } catch (e: any) {
        alert('MediaRecorder 初期化失敗: ' + e.message);
        return;
      }

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event: any) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => setRecordingSeconds((p) => p + 1), 1000);
      showToast('音声聞き書きを録音中');
    } catch (err: any) {
      alert('マイクアクセス失敗: ' + (err.message || err.name));
    }
  };

  const stopRecording = () => {
    if (!isRecording) return;
    setIsRecording(false);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);

    const mins = Math.floor(recordingSeconds / 60);
    const secs = recordingSeconds % 60;
    const durationStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    const finalDuration = durationStr === '00:00' ? '00:05' : durationStr;

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = async () => {
        const mimeType = recorder.mimeType || 'audio/mp4';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const audioBlobId = 'audio-' + Date.now();
        try {
          await storeMediaBlob(audioBlobId, audioBlob, mimeType);
          const audioUrl = URL.createObjectURL(audioBlob);
          openNewNodeEditor(audioUrl, finalDuration, audioBlobId, mimeType);
        } catch (e) {
          showToast('⚠️ 音声の保存に失敗しました');
        }

        try {
          if (recorder.stream) {
            recorder.stream.getTracks().forEach((track: any) => track.stop());
          }
        } catch (e) {}
      };
      recorder.stop();
    } else {
      openNewNodeEditor(undefined, finalDuration);
    }
  };

  const openNewNodeEditor = (audioUrl?: string, duration: string = '00:30', audioBlobId?: string, audioMimeType?: string) => {
    setEditingData({
      id: `k-node-${Date.now()}`,
      areaId: currentAreaId,
      title: '',
      category: 'living',
      narrator: '地域住民の方',
      elevation: '海抜 15m',
      coordinates: [...currentCoords],
      audioUrl,
      audioBlobId,
      audioMimeType,
      duration,
      note: '',
      tags: ['風土知'],
      connections: [],
      media: [],
      createdAt: new Date().toLocaleString('ja-JP'),
    });
    setIsEditingNode(true);
  };

  const handleSaveNode = () => {
    if (!editingData.title?.trim()) {
      showToast('タイトルを入力してください');
      return;
    }
    const completeNode = {
      ...editingData,
      title: editingData.title.trim(),
    };
    setNodes((prev) => [completeNode, ...prev.filter((n) => n.id !== completeNode.id)]);
    setSelectedNode(completeNode);
    setIsEditingNode(false);
    showToast('記録を保存しました');
  };

  const togglePlayAudio = (node: any) => {
    if (!node?.audioUrl) return showToast('再生できる音声がありません');
    if (isPlayingAudio) {
      audioElementRef.current?.pause();
      setIsPlayingAudio(false);
    } else {
      if (audioElementRef.current) {
        audioElementRef.current.src = node.audioUrl;
        audioElementRef.current.play().catch(() => showToast('再生エラー'));
        setIsPlayingAudio(true);
      }
    }
  };

  /* STREAMING_CHUNK:Rendering full viewport UI structure */
  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#F8F6F0] text-[#2B2F38] font-sans select-none">
      <audio ref={audioElementRef} onEnded={() => setIsPlayingAudio(false)} />

      {/* 地図コンテナ */}
      <div ref={mapContainerRef} className="w-full h-full z-0 bg-[#F3EFE7]" />

      {/* 上部ヘッダー */}
      <header className="absolute top-0 left-0 right-0 p-3 pointer-events-none flex flex-col gap-1.5 z-20">
        <div className="pointer-events-auto flex items-center justify-between w-full">
          <div className="bg-[#FCFBF8]/95 border border-[#DCD6C9] shadow-sm rounded-md px-3 py-1.5 flex items-center space-x-2">
            <KumanoLogoSilhouette className="w-24 h-auto text-[#2B2F38]" />
            <span className="text-xs font-bold border-l border-[#DCD6C9] pl-2">{currentArea.name}</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-xs bg-[#FCFBF8] border border-[#DCD6C9] px-2 py-1 rounded font-mono font-bold">
              記録: {currentAreaNodes.length}件
            </span>
          </div>
        </div>

        {/* 録音インジケーター */}
        {isRecording && (
          <div className="pointer-events-none flex justify-center mt-2">
            <div className="bg-[#E11D48] text-white px-4 py-1.5 rounded-full shadow-lg flex items-center space-x-2 font-bold text-xs animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
              <span>録音中: {formatTime(recordingSeconds)}</span>
            </div>
          </div>
        )}
      </header>

      {/* 下部操作ドック */}
      <div className="absolute bottom-5 left-0 right-0 px-4 flex flex-col items-center pointer-events-none z-20 gap-2">
        {/* 座標バッジ */}
        <div className="pointer-events-auto flex items-center space-x-1.5">
          <div className="px-2.5 py-1 rounded-md bg-[#FCFBF8]/95 border border-[#DCD6C9] shadow-sm text-[10px] font-mono font-bold flex items-center space-x-1">
            <MapPin className="w-3 h-3 text-[#0284C7]" />
            <span>{currentCoords[1].toFixed(5)}°N, {currentCoords[0].toFixed(5)}°E</span>
            {gpsAccuracy !== null && isTracking && (
              <span className="text-[9px] text-[#059669] bg-[#F3EFE7] px-1 rounded border border-[#DCD6C9]">
                ±{gpsAccuracy}m
              </span>
            )}
          </div>
        </div>

        <div className="pointer-events-auto bg-[#FCFBF8]/95 border border-[#DCD6C9] shadow-lg rounded-md p-1.5 flex items-center space-x-2">
          {/* 調査開始 / 停止 */}
          <button
            type="button"
            onClick={() => {
              const next = !isTracking;
              setIsTracking(next);
              showToast(next ? '調査追従を開始しました' : '調査追従を停止しました');
            }}
            className={`flex items-center space-x-1 px-3 py-2 rounded text-xs font-bold transition ${
              isTracking ? 'bg-[#2B2F38] text-white' : 'bg-[#F3EFE7] text-[#2B2F38]'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-emerald-400 animate-ping' : 'bg-[#2B2F38]/50'}`} />
            <span>{isTracking ? t.surveying : t.surveyStart}</span>
          </button>

          {/* 現在地ジャンプ */}
          <button
            type="button"
            onClick={handleLocateImmediate}
            className="px-3 py-2 rounded bg-[#F3EFE7] hover:bg-[#EBE6DB] text-[#2B2F38] text-xs font-bold flex items-center space-x-1"
          >
            <Navigation className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>{t.locateMe}</span>
          </button>

          {/* メモを残す */}
          <button
            type="button"
            onClick={() => openNewNodeEditor(undefined, '00:00')}
            className="px-3 py-2 rounded bg-[#F3EFE7] hover:bg-[#EBE6DB] text-xs font-bold flex items-center space-x-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>メモを残す</span>
          </button>

          {/* 声を録る / 停止ボタン */}
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="flex items-center space-x-1.5 bg-[#E11D48] hover:bg-rose-700 text-white px-4 py-2 rounded text-xs font-bold shadow transition active:scale-95"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>声を録る</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center space-x-1.5 bg-[#2B2F38] text-white px-4 py-2 rounded text-xs font-bold shadow animate-pulse"
            >
              <Square className="w-3.5 h-3.5" />
              <span>録音停止</span>
            </button>
          )}
        </div>
      </div>

      {/* 記録詳細カード */}
      {selectedNode && (
        <div className="fixed inset-x-0 bottom-0 max-w-md mx-auto z-30 p-3">
          <div className="bg-[#FCFBF8] rounded-lg border border-[#E0DBD0] shadow-xl p-5 text-[#2B2F38] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">{selectedNode.title}</h3>
              <button type="button" onClick={() => setSelectedNode(null)} className="p-1"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs">語り手: <strong>{selectedNode.narrator}</strong> ({selectedNode.elevation})</p>
            <div className="p-3 bg-[#F3EFE7] rounded text-xs leading-relaxed">{selectedNode.note || 'メモなし'}</div>
            {selectedNode.audioUrl && (
              <button
                type="button"
                onClick={() => togglePlayAudio(selectedNode)}
                className="w-full py-2 rounded bg-[#2B2F38] text-white text-xs font-bold flex items-center justify-center space-x-1.5"
              >
                {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlayingAudio ? '停止' : `証言を聴く (${selectedNode.duration})`}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* メモ・録音保存モーダル */}
      {isEditingNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B2F38]/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#FCFBF8] rounded-lg border border-[#DCD6C9] shadow-2xl p-5 space-y-3 text-[#2B2F38]">
            <h3 className="text-sm font-bold border-b border-[#E8E4DB] pb-2">記録の保存</h3>
            <div>
              <label className="block text-xs font-bold mb-1">タイトル</label>
              <input
                type="text"
                value={editingData.title || ''}
                onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                placeholder="例: 裏山の古井戸"
                className="w-full px-2.5 py-1.5 rounded border border-[#DCD6C9] text-xs bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">語り手</label>
              <input
                type="text"
                value={editingData.narrator || ''}
                onChange={(e) => setEditingData({ ...editingData, narrator: e.target.value })}
                placeholder="例: 笠島さん"
                className="w-full px-2.5 py-1.5 rounded border border-[#DCD6C9] text-xs bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">内容・メモ</label>
              <textarea
                rows={3}
                value={editingData.note || ''}
                onChange={(e) => setEditingData({ ...editingData, note: e.target.value })}
                placeholder="現地の知恵や証言..."
                className="w-full px-2.5 py-1.5 rounded border border-[#DCD6C9] text-xs bg-white"
              />
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingNode(false)}
                className="flex-1 py-1.5 rounded border border-[#DCD6C9] text-xs font-bold"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleSaveNode}
                className="flex-1 py-1.5 rounded bg-[#2B2F38] text-white text-xs font-bold"
              >
                保存する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* トースト */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-[#2B2F38] text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-lg flex items-center space-x-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
