const fs = require("fs");
const path = "src/App.js";
let s = fs.readFileSync(path, "utf8");

// 1) state/ref 추가
s = s.replace(
`  const [isListening, setIsListening] = useState(false);

  const mediaRecorderRef = useRef(null);`,
`  const [isListening, setIsListening] = useState(false);
  const [micLevel, setMicLevel] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const waveAnimationRef = useRef(null);`
);

// 2) waveform helper 추가
s = s.replace(
`  const previewUrl = useMemo(() => {`,
`  const startMicWave = (stream) => {
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

// 3) stream 받은 직후 파형 시작
s = s.replace(
`      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingStreamRef.current = stream;`,
`      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingStreamRef.current = stream;
      startMicWave(stream);`
);

// 4) 녹음 종료 시 파형 중지
s = s.replace(
`          setIsListening(false);

          const audioBlob = new Blob`,
`          setIsListening(false);
          stopMicWave();

          const audioBlob = new Blob`
);

// 5) 에러/마무리에도 파형 중지
s = s.replace(
`          setIsListening(false);
        }
      };`,
`          setIsListening(false);
          stopMicWave();
        }
      };`
);

s = s.replace(
`      setIsListening(false);
      setStatusMsg("Microphone error. Please allow microphone access or type instead.");`,
`      setIsListening(false);
      stopMicWave();
      setStatusMsg("Microphone error. Please allow microphone access or type instead.");`
);

// 6) Done speaking 버튼 아래 파형 UI 추가
s = s.replace(
`              <button
                type="button"
                className="createBtn"
                onClick={finishVoiceRecording}
              >
                ✅ Done speaking
              </button>
            )}`,
`              <>
                <button
                  type="button"
                  className="createBtn"
                  onClick={finishVoiceRecording}
                >
                  ✅ Done speaking
                </button>

                <div className="voiceWaveBox">
                  <div className="voiceWaveBars">
                    {[0, 1, 2, 3, 4, 5, 6].map((bar) => (
                      <span
                        key={bar}
                        style={{
                          height: Math.max(8, Math.min(42, micLevel / 2 + bar * 3))
                        }}
                      />
                    ))}
                  </div>
                  <p className="voiceWaveText">Listening... speak naturally</p>
                </div>
              </>
            )}`
);

fs.writeFileSync(path, s, "utf8");
console.log("Voice waveform added.");
