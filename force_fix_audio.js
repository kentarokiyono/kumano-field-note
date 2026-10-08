const fs = require("fs");
const file = "components/KumanoFutureLabOS.tsx";
let code = fs.readFileSync(file, "utf8");

// 1. 不要になった古い参照やタグを完全除去
code = code.replace(/const nativeAudioInputRef[^;]*;\n?/g, "");
code = code.replace(/const handleNativeAudioFile = async[\s\S]*?if \(nativeAudioInputRef\.current\) nativeAudioInputRef\.current\.value = "";\s*};\s*/g, "");
code = code.replace(/<input ref=\{nativeAudioInputRef\}[^>]*\/>\s*/g, "");

// 2. startRecording 〜 handleMediaUpload の直前までをごっそり完全置換
const regex = /const startRecording =[\s\S]*?(?=const handleMediaUpload =)/;

const bulletproofRecordingCode = `const startRecording = async () => {
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

  `;

if (regex.test(code)) {
  code = code.replace(regex, bulletproofRecordingCode);
  fs.writeFileSync(file, code, "utf8");
  console.log("SUCCESS: Audio engine completely replaced!");
} else {
  console.error("ERROR: startRecording regex did not match!");
}
