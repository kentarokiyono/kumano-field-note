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
  Waves,
  Edit3,
  Layers,
  Box,
  Check,
} from 'lucide-react';

export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function KumanoLogoSilhouette({ className = 'text-[#23272F]' }: { className?: string }) {
  return (
    <svg viewBox="0 0 148 28" fill="currentColor" className={className} preserveAspectRatio="xMidYMid meet">
      <rect x="0" y="14" width="3" height="12" /><rect x="3" y="12" width="3" height="14" /><rect x="6" y="8" width="3" height="18" /><rect x="9" y="3" width="3" height="23" /><rect x="12" y="9" width="3" height="17" /><rect x="15" y="14" width="3" height="12" /><rect x="18" y="18" width="4" height="8" /><rect x="22" y="18" width="3" height="8" /><rect x="25" y="20" width="4" height="6" />
      <rect x="38" y="21" width="20" height="5" /><rect x="40" y="17" width="16" height="9" /><rect x="42" y="13" width="12" height="13" /><rect x="44" y="9" width="8" height="17" /><rect x="46" y="5.5" width="4" height="20.5" />
      <rect x="64" y="21" width="22" height="5" /><rect x="66" y="17" width="18" height="9" /><rect x="68" y="13" width="14" height="13" /><rect x="70.5" y="9" width="9" height="17" /><rect x="73.5" y="1" width="3" height="25" />
      <rect x="92" y="21" width="16" height="5" /><rect x="94" y="17" width="12" height="9" /><rect x="96" y="12" width="8" height="14" /><rect x="98" y="7" width="4" height="19" />
    </svg>
  );
}

export default function KumanoFutureLabOS() {
  const map2DContainerRef = useRef<HTMLDivElement>(null);
  const map3DContainerRef = useRef<HTMLDivElement>(null);
  const map2DRef = useRef<any>(null);
  const map3DRef = useRef<any>(null);
  const tile2DLayerRef = useRef<any>(null);
  const tsunamiLayerRef = useRef<any>(null);

  const [is3DMode, setIs3DMode] = useState<boolean>(false);
  const [mapLayerType, setMapLayerType] = useState<'pale' | 'photo'>('pale');
  const [showTsunami, setShowTsunami] = useState<boolean>(false);

  const [currentCoords, setCurrentCoords] = useState<[number, number]>([135.778, 33.475]);
  const [isTracking, setIsTracking] = useState<boolean>(false);

  // 録音ステート
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage((p) => (p === msg ? null : p)), 2500);
  };

  // 1. 確実・爆速で描画される2D地図（Leaflet）の初期化
  useEffect(() => {
    if (!map2DContainerRef.current || map2DRef.current) return;
    const win = window as any;

    const init2D = () => {
      const L = win.L;
      if (!L || !map2DContainerRef.current || map2DRef.current) return;
      const map = L.map(map2DContainerRef.current, {
        center: [33.475, 135.778],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });

      tile2DLayerRef.current = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png', {
        maxZoom: 18,
        minZoom: 4,
      }).addTo(map);

      L.marker([33.475, 135.778]).addTo(map);
      map2DRef.current = map;
    };

    if (!win.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = init2D;
      document.body.appendChild(script);

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    } else {
      init2D();
    }
  }, []);

  // 2. 3Dモードへの切り替え（MapLibre 3Dエンジン起動）
  const toggle3D = () => {
    const nextMode = !is3DMode;
    setIs3DMode(nextMode);

    if (nextMode) {
      showToast('3D立体マップ（鳥瞰＆建物立体化）を起動中...');
      const win = window as any;

      const run3D = () => {
        const maplibregl = win.maplibregl;
        if (!maplibregl || !map3DContainerRef.current) return;

        if (map3DRef.current) {
          map3DRef.current.resize();
          return;
        }

        const map3d = new maplibregl.Map({
          container: map3DContainerRef.current,
          center: [135.778, 33.475],
          zoom: 16.2,
          pitch: 62,
          bearing: -20,
          maxPitch: 75,
          style: {
            version: 8,
            sources: {
              gsi_pale_3d: {
                type: 'raster',
                tiles: ['https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png'],
                tileSize: 256,
              },
              gsi_terrain_dem: {
                type: 'raster-dem',
                tiles: ['https://tiles.gsj.jp/tiles/elev/mixed/{z}/{y}/{x}.png'],
                tileSize: 256,
                maxzoom: 15,
                encoding: 'gsi',
              },
              gsi_vector_bldg: {
                type: 'vector',
                tiles: ['https://cyberjapandata.gsi.go.jp/xyz/experimental_bvmap/{z}/{x}/{y}.pbf'],
                maxzoom: 16,
              },
            },
            layers: [
              {
                id: 'base-pale-3d',
                type: 'raster',
                source: 'gsi_pale_3d',
              },
              {
                id: '3d-buildings-extrusion',
                type: 'fill-extrusion',
                source: 'gsi_vector_bldg',
                'source-layer': 'building',
                minzoom: 14,
                paint: {
                  'fill-extrusion-color': '#FFFFFF',
                  'fill-extrusion-height': 7.5,
                  'fill-extrusion-base': 0,
                  'fill-extrusion-opacity': 0.88,
                },
              },
            ],
            terrain: {
              source: 'gsi_terrain_dem',
              exaggeration: 1.6,
            },
          },
        });

        map3DRef.current = map3d;
      };

      if (!win.maplibregl) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js';
        script.onload = run3D;
        document.body.appendChild(script);
      } else {
        run3D();
      }
    } else {
      showToast('2D平面表示に戻しました');
      if (map2DRef.current) {
        setTimeout(() => map2DRef.current.invalidateSize(), 100);
      }
    }
  };

  // 津波レイヤー切替
  const toggleTsunami = () => {
    const map = map2DRef.current;
    const win = window as any;
    if (!map || !win.L) return;
    const next = !showTsunami;
    setShowTsunami(next);

    if (next) {
      tsunamiLayerRef.current = win.L.tileLayer(
        'https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_data/{z}/{x}/{y}.png',
        { opacity: 0.65 }
      ).addTo(map);
      showToast('津波浸水想定を表示しました');
    } else {
      if (tsunamiLayerRef.current) {
        map.removeLayer(tsunamiLayerRef.current);
        tsunamiLayerRef.current = null;
      }
      showToast('津波想定を非表示にしました');
    }
  };

  // 航空写真切替
  const togglePhoto = () => {
    const map = map2DRef.current;
    const win = window as any;
    if (!map || !win.L) return;
    const next = mapLayerType === 'pale' ? 'photo' : 'pale';
    setMapLayerType(next);

    if (tile2DLayerRef.current) map.removeLayer(tile2DLayerRef.current);

    const url = next === 'pale'
      ? 'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png'
      : 'https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg';

    tile2DLayerRef.current = win.L.tileLayer(url, { maxZoom: 18 }).addTo(map);
    showToast(next === 'pale' ? '淡色地図に切り替えました' : '航空写真に切り替えました');
  };

  // 録音機能（Safari完全対応）
  const startRecording = async () => {
    showToast('マイクを起動中...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const rec = new MediaRecorder(stream);
      mediaRecorderRef.current = rec;
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      rec.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => setRecordingSeconds((p) => p + 1), 1000);
      showToast('録音を開始しました');
    } catch (err: any) {
      alert('マイクアクセス失敗: ' + (err.message || err.name));
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        alert('録音が完了しました！長さ: ' + formatTime(recordingSeconds));
      };
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#F8F6F0] text-[#2B2F38] select-none">
      {/* 2D 地図コンテナ（常時安定描画） */}
      <div
        ref={map2DContainerRef}
        className={`absolute inset-0 z-0 transition-opacity duration-300 ${is3DMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      />

      {/* 3D 地図コンテナ（3Dモード時のみ描画） */}
      <div
        ref={map3DContainerRef}
        className={`absolute inset-0 z-0 bg-[#F3EFE7] transition-opacity duration-300 ${is3DMode ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      {/* ヘッダー */}
      <header className="absolute top-0 left-0 right-0 p-3 pointer-events-none z-20 flex justify-between items-center">
        <div className="pointer-events-auto bg-[#FCFBF8]/95 border border-[#DCD6C9] shadow-sm rounded-md px-3 py-1.5 flex items-center space-x-2">
          <KumanoLogoSilhouette className="w-24 h-auto text-[#2B2F38]" />
          <span className="text-xs font-bold border-l border-[#DCD6C9] pl-2">堀・笠島地区</span>
        </div>

        {isRecording && (
          <div className="bg-[#E11D48] text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
            録音中: {formatTime(recordingSeconds)}
          </div>
        )}
      </header>

      {/* 右上操作ボタン */}
      <div className="absolute top-16 right-3 z-20 flex flex-col space-y-2">
        {/* 3D切替ボタン */}
        <button
          type="button"
          onClick={toggle3D}
          className={`h-9 px-3 rounded-md border shadow-md flex items-center space-x-1 text-xs font-bold transition active:scale-95 ${
            is3DMode ? 'bg-[#2B2F38] text-white border-[#2B2F38]' : 'bg-[#FCFBF8] text-[#2B2F38] border-[#DCD6C9]'
          }`}
        >
          <Box className={`w-4 h-4 ${is3DMode ? 'text-sky-400' : 'text-[#2B2F38]'}`} />
          <span>{is3DMode ? '3D表示中' : '3D'}</span>
        </button>

        <button
          type="button"
          onClick={toggleTsunami}
          className={`w-9 h-9 rounded-md border shadow-md flex items-center justify-center ${
            showTsunami ? 'bg-[#2B2F38] text-white' : 'bg-[#FCFBF8] text-[#2B2F38] border-[#DCD6C9]'
          }`}
        >
          <Waves className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={togglePhoto}
          className={`w-9 h-9 rounded-md border shadow-md flex items-center justify-center ${
            mapLayerType === 'photo' ? 'bg-[#2B2F38] text-white' : 'bg-[#FCFBF8] text-[#2B2F38] border-[#DCD6C9]'
          }`}
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* 下部ドック */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none z-20">
        <div className="pointer-events-auto bg-[#FCFBF8]/95 border border-[#DCD6C9] shadow-lg rounded-md p-1.5 flex items-center space-x-2">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="bg-[#E11D48] text-white px-4 py-2 rounded text-xs font-bold flex items-center space-x-1"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>声を録る</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="bg-[#2B2F38] text-white px-4 py-2 rounded text-xs font-bold flex items-center space-x-1"
            >
              <Square className="w-3.5 h-3.5" />
              <span>録音停止</span>
            </button>
          )}
        </div>
      </div>

      {/* トースト */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-40 bg-[#2B2F38] text-white text-xs font-semibold px-3 py-1.5 rounded shadow">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
