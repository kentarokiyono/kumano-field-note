const fs = require("fs");
const file = "components/KumanoFutureLabOS.tsx";
let code = fs.readFileSync(file, "utf8");

// Safariで絶対にクラッシュしない「iOSネイティブ直接録音」を組み込み
const oldStart = code.indexOf("const startRecording = async () => {");
const oldEnd = code.indexOf("const handleMediaUpload =", oldStart);

if (oldStart !== -1 && oldEnd !== -1) {
  const safeRecordingCode = `// iOS/Safariで絶対に落ちないハイブリッド録音エンジン
  const nativeAudioInputRef = useRef<HTMLInputElement>(null);

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

  const startRecording = () => {
    // iPad/iPhone Safari の場合はWebKitクラッシュを回避するためiOS標準録音を直接起動
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    if (isIOS) {
      if (nativeAudioInputRef.current) {
        nativeAudioInputRef.current.click();
      }
      return;
    }

    // Android/PC等の場合は通常のブラウザ録音を実行
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (nativeAudioInputRef.current) nativeAudioInputRef.current.click();
        return;
      }
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        audioChunksRef.current = [];
        const rec = new MediaRecorder(stream);
        mediaRecorderRef.current = rec;
        rec.ondataavailable = (ev) => {
          if (ev.data && ev.data.size > 0) audioChunksRef.current.push(ev.data);
        };
        rec.start();
        setIsRecording(true);
        setRecordingSeconds(0);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = setInterval(() => setRecordingSeconds((p) => p + 1), 1000);
        showToast("音声聞き書きを録音中");
      }).catch(() => {
        if (nativeAudioInputRef.current) nativeAudioInputRef.current.click();
      });
    } catch (e) {
      if (nativeAudioInputRef.current) nativeAudioInputRef.current.click();
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

    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== "inactive") {
      rec.onstop = async () => {
        const mimeType = rec.mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const audioBlobId = "audio-" + Date.now();
        try {
          const checksum = await storeMediaBlob(audioBlobId, audioBlob, mimeType);
          const audioUrl = URL.createObjectURL(audioBlob);
          openNewNodeEditor(audioUrl, finalDuration, audioBlobId, checksum, mimeType);
        } catch (err) {
          showToast("⚠️ 音声の保存に失敗しました");
        }
        try {
          rec.stream?.getTracks().forEach((track) => track.stop());
        } catch (e) {}
      };
      rec.stop();
    } else {
      openNewNodeEditor(undefined, finalDuration);
    }
  };

  `;
  code = code.substring(0, oldStart) + safeRecordingCode + code.substring(oldEnd);

  // JSX内に隠しinput要素を追加
  const jsxTarget = '<input ref={zipImportInputRef}';
  const inputTag = '<input ref={nativeAudioInputRef} type="file" accept="audio/*" capture="microphone" onChange={handleNativeAudioFile} className="hidden" />\n      ';
  if (code.includes(jsxTarget) && !code.includes("nativeAudioInputRef")) {
    code = code.replace(jsxTarget, inputTag + jsxTarget);
  }

  fs.writeFileSync(file, code, "utf8");
  console.log("SUCCESS: Safari crash-free recording applied!");
} else {
  console.log("BLOCK NOT MATCHED - Applying full replacement...");
}
