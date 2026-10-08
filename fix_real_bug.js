const fs = require('fs');
const file = 'components/KumanoFutureLabOS.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. 欠落していた formatTime 関数を確実に定義
if (!code.includes('function formatTime') && !code.includes('const formatTime =')) {
  const helperCode = `
// 秒数を 00:00 形式にフォーマットする安全なヘルパー関数
function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return \`\${String(m).padStart(2, '0')}:\${String(s).padStart(2, '0')}\`;
}
`;
  code = helperCode + code;
}

// 2. 不要な古い input や参照を完全削除
code = code.replace(/const nativeAudioInputRef[^;]*;\n?/g, "");
code = code.replace(/const handleNativeAudioFile[\s\S]*?finally\s*\{[\s\S]*?\}\s*\};\n?/g, "");
code = code.replace(/<input ref=\{nativeAudioInputRef\}[^>]*\/>\s*/g, "");

// 3. 全ブラウザ（Safari/Chrome/iPad/PC）共通の確実な録音処理に置換
const startIdx = code.indexOf('const startRecording');
const endIdx = code.indexOf('const handleMediaUpload');

if (startIdx !== -1 && endIdx !== -1) {
  const fixedRecording = `const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showToast("⚠️ マイクに対応していません");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      // Safari/Chrome 双方で安全な録音設定
      let mimeType = "";
      if (typeof MediaRecorder !== "undefined" && typeof MediaRecorder.isTypeSupported === "function") {
        if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        } else if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          mimeType = "audio/webm;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/webm")) {
          mimeType = "audio/webm";
        }
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recordedMimeTypeRef.current = recorder.mimeType || mimeType || "audio/mp4";
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => setRecordingSeconds((prev) => prev + 1), 1000);
      showToast("音声聞き書きを録音中");
    } catch (err: any) {
      console.warn("録音エラー:", err);
      showToast("⚠️ マイクへのアクセスが拒否されました");
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
          showToast("⚠️ 音声の保存に失敗しました");
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

  `;

  code = code.substring(0, startIdx) + fixedRecording + code.substring(endIdx);
  fs.writeFileSync(file, code, 'utf8');
  console.log("SUCCESS: formatTime defined and rock-solid recorder installed!");
} else {
  console.error("ERROR: startRecording block not found");
}
