const fs = require("fs");
const path = "src/App.js";
let s = fs.readFileSync(path, "utf8");

// 필요한 state/ref 추가
if (!s.includes("const [micLevel, setMicLevel]")) {
  s = s.replace(
    "const [isListening, setIsListening] = useState(false);",
    "const [isListening, setIsListening] = useState(false);\n  const [micLevel, setMicLevel] = useState(0);"
  );
}

if (!s.includes("audioContextRef")) {
  s = s.replace(
    "const mediaRecorderRef = useRef(null);",
    "const mediaRecorderRef = useRef(null);\n  const audioContextRef = useRef(null);\n  const analyserRef = useRef(null);\n  const waveAnimationRef = useRef(null);"
  );
}

// 파형 함수 추가
if (!s.includes("const startMicWave =")) {
  s = s.replace(
    "const previewUrl = useMemo(() => {",
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

// 녹음 시작 시 파형 시작
if (!s.includes("startMicWave(stream);")) {
  s = s.replace(
    "recordingStreamRef.current = stream;",
    "recordingStreamRef.current = stream;\n      startMicWave(stream);"
  );
}

// recorder stop 쪽에 파형 종료 추가
if (!s.includes("stopMicWave();")) {
  s = s.replace(
    "setIsListening(false);\n\n          const audioBlob",
    "setIsListening(false);\n          stopMicWave();\n\n          const audioBlob"
  );
}

// 기존 버튼 블록 정확히 교체
const oldRegex = /\{!isListening \? \(\s*<button[\s\S]*?🎙 Say it in your own words[\s\S]*?<\/button>\s*\) : \(\s*<button[\s\S]*?✅ Done speaking[\s\S]*?<\/button>\s*\)\}/;

const newBlock = `{isListening ? (
              <div className="micRecordArea">
                <button
                  type="button"
                  className="micCircleBtn recording"
                  onClick={finishVoiceRecording}
                  aria-label="Stop recording"
                >
                  ■
                </button>

                <div className="voiceWaveBars active">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((bar) => (
                    <span
                      key={bar}
                      style={{
                        height: Math.max(8, Math.min(44, micLevel / 2 + ((bar % 5) * 4)))
                      }}
                    />
                  ))}
                </div>

                <p className="micRecordText">Recording... tap the button when finished</p>
              </div>
            ) : (
              <div className="micRecordArea">
                <button
                  type="button"
                  className="micCircleBtn"
                  onClick={handleSpeakSituation}
                  aria-label="Start recording"
                >
                  🎙
                </button>

                <div className="voiceWaveBars">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((bar) => (
                    <span key={bar} style={{ height: 8 }} />
                  ))}
                </div>

                <p className="micRecordText">Tap the mic and say it in your own words</p>
              </div>
            )}`;

if (!oldRegex.test(s)) {
  throw new Error("Voice button block not found.");
}

s = s.replace(oldRegex, newBlock);

fs.writeFileSync(path, s, "utf8");
console.log("Mic UI fixed safely.");
