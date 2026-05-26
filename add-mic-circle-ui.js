const fs = require("fs");
const path = "src/App.js";
let s = fs.readFileSync(path, "utf8");

// 1) micLevel/state/ref 확실히 추가
if (!s.includes("const [micLevel, setMicLevel]")) {
  s = s.replace(
    `const [isListening, setIsListening] = useState(false);`,
    `const [isListening, setIsListening] = useState(false);
  const [micLevel, setMicLevel] = useState(0);`
  );
}

if (!s.includes("audioContextRef")) {
  s = s.replace(
    `const mediaRecorderRef = useRef(null);`,
    `const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const waveAnimationRef = useRef(null);`
  );
}

// 2) 파형 함수 없으면 추가
if (!s.includes("const startMicWave =")) {
  s = s.replace(
    `const previewUrl = useMemo(() => {`,
    `const startMicWave = (stream) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateWave = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        setMicLevel(Math.min(100, Math.round(average)));
        waveAnimationRef.current = requestAnimationFrame(updateWave);
      };

      updateWave();
    } catch (error) {
      console.error("Mic wave failed:", error);
    }
  };

  const stopMicWave = () => {
    if (waveAnimationRef.current) {
      cancelAnimationFrame(waveAnimationRef.current);
      waveAnimationRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    setMicLevel(0);
  };

  const previewUrl = useMemo(() => {`
  );
}

// 3) getUserMedia 후 파형 시작
if (!s.includes("startMicWave(stream);")) {
  s = s.replace(
    `recordingStreamRef.current = stream;`,
    `recordingStreamRef.current = stream;
      startMicWave(stream);`
  );
}

// 4) stop 시 파형 종료
if (!s.includes("stopMicWave();")) {
  s = s.replaceAll(
    `setIsListening(false);`,
    `setIsListening(false);
          stopMicWave();`
  );
}

// 5) 기존 버튼 UI를 동그란 마이크 UI로 교체
const oldBlock = `{!isListening ? (
              <button
                type="button"
                className="createBtn"
                onClick={handleSpeakSituation}
              >
                🎙 Say it in your own words
              </button>
            ) : (
              <button
                type="button"
                className="createBtn"
                onClick={finishVoiceRecording}
              >
                ✅ Done speaking
              </button>
            )}`;

const newBlock = `<div className="micRecordArea">
              <button
                type="button"
                className={isListening ? "micCircleBtn recording" : "micCircleBtn"}
                onClick={isListening ? finishVoiceRecording : handleSpeakSituation}
                aria-label={isListening ? "Stop recording" : "Start recording"}
              >
                {isListening ? "■" : "🎙"}
              </button>

              <div className={isListening ? "voiceWaveBars active" : "voiceWaveBars"}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((bar) => (
                  <span
                    key={bar}
                    style={{
                      height: isListening
                        ? Math.max(8, Math.min(44, micLevel / 2 + ((bar % 5) * 4)))
                        : 8
                    }}
                  />
                ))}
              </div>

              <p className="micRecordText">
                {isListening ? "Recording... tap the button when finished" : "Tap the mic and say it in your own words"}
              </p>
            </div>`;

if (s.includes(oldBlock)) {
  s = s.replace(oldBlock, newBlock);
} else {
  console.log("Old button block not found. UI may already be partially changed.");
}

fs.writeFileSync(path, s, "utf8");
console.log("Mic circle UI added.");
