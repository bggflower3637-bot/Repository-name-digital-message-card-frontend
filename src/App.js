import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  process.env.REACT_APP_API_URL ||
  "https://digital-message-card-server.onrender.com";

const characterGroups = {
  asian: [
    { id: "aria", name: "Aria", image: "/characters/asian/aria.jpg" },
    { id: "jae", name: "Jae", image: "/characters/asian/jae.jpg" },
    { id: "mina", name: "Mina", image: "/characters/asian/mina.jpg" },
    { id: "reo", name: "Reo", image: "/characters/asian/reo.jpg" },
    { id: "ryu", name: "Ryu", image: "/characters/asian/ryu.jpg" },
    { id: "soo", name: "Soo", image: "/characters/asian/soo.jpg" }
  ],
  western: [
    { id: "wm1", name: "Daniel", image: "/characters/western/wm1.jpg" },
    { id: "wm2", name: "Chris", image: "/characters/western/wm2.jpg" },
    { id: "bm1", name: "Marcus", image: "/characters/western/bm1.jpg" },
    { id: "wf1", name: "Emma", image: "/characters/western/wf1.jpg" },
    { id: "wf2", name: "Sophie", image: "/characters/western/wf2.jpg" },
    { id: "bf1", name: "Ava", image: "/characters/western/bf1.jpg" }
  ]
};

const tones = [
  { id: "warm", label: "Warm", desc: "Soft and heartfelt" },
  { id: "romantic", label: "Romantic", desc: "Sweet and loving" },
  { id: "sympathy", label: "Sympathy", desc: "Gentle and comforting" },
  { id: "playful", label: "Playful", desc: "Fun and cheerful" },
  { id: "calm", label: "Calm", desc: "Peaceful and reassuring" }
];

const demos = {
  birthday: { label: "Birthday", src: "/demo/birthday-v1.mp4" },
  romantic: { label: "Romantic", src: "/demo/romantic-v1.mp4" },
  sympathy: { label: "Sympathy", src: "/demo/sympathy-v1.mp4" },
  kpop: { label: "K-Pop Style", src: "/demo/kpop-style.mp4" },
  quick: { label: "Quick Message", src: "/demo/quick-message-fixed.mp4" }
};

function App() {
  const [mode, setMode] = useState("quick");
  const [selectedProduct, setSelectedProduct] = useState("video");
  const [tone, setTone] = useState("warm");
  const [group, setGroup] = useState("asian");
  const [character, setCharacter] = useState("aria");
  const [inputMode, setInputMode] = useState("situation");

  const [situation, setSituation] = useState("");
  const [customText, setCustomText] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");

  const [senderName, setSenderName] = useState("");
  const [senderGender, setSenderGender] = useState("female");
  const [voiceMode, setVoiceMode] = useState("auto");
  const [voiceStyle, setVoiceStyle] = useState("");

  const [recipientName, setRecipientName] = useState("");
  const [email, setEmail] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");

  const [photoFile, setPhotoFile] = useState(null);
  const [selectedDemo, setSelectedDemo] = useState("birthday");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [isListening, setIsListening] = useState(false);
const [micLevel, setMicLevel] = useState(0);

  const mediaRecorderRef = useRef(null);
const audioContextRef = useRef(null);
const analyserRef = useRef(null);
const waveAnimationRef = useRef(null);
  const recordingStreamRef = useRef(null);
  const voiceChunksRef = useRef([]);

  const chars = characterGroups[group];

  const startMicWave = (stream) => {
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

  const previewUrl = useMemo(() => {
    if (!photoFile) return "";
    return URL.createObjectURL(photoFile);
  }, [photoFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const finishVoiceRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === "recording") {
      setStatusMsg("Recording finished. Turning your voice into text...");
      recorder.stop();
    }
  };

  const handleSpeakSituation = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert("Microphone recording is not supported on this browser.");
        return;
      }

      setStatusMsg("Please allow microphone access.");
      voiceChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingStreamRef.current = stream;
      startMicWave(stream);

      setIsListening(true);
      setStatusMsg("Recording... speak now, then click Done speaking.");

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          voiceChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        try {
          if (recordingStreamRef.current) {
            recordingStreamRef.current.getTracks().forEach((track) => track.stop());
            recordingStreamRef.current = null;
          }

          setIsListening(false);
          stopMicWave();

          const audioBlob = new Blob(voiceChunksRef.current, { type: "audio/webm" });
          if (!audioBlob.size) {
            setStatusMsg("No voice was recorded. Please try again.");
            return;
          }

          const formData = new FormData();
          formData.append("audio", audioBlob, "voice.webm");

          setStatusMsg("Turning your voice into text...");

          const res = await fetch(`${API_BASE}/transcribe-audio`, {
            method: "POST",
            body: formData
          });

          const data = await res.json();

          if (!res.ok || !data.ok || !data.text) {
            throw new Error(data.error || "Could not understand voice.");
          }

          setSituation((prev) => {
            const base = prev.trim();
            return base ? `${base} ${data.text}` : data.text;
          });

          setStatusMsg("Your words were added. Review them, then click Make My Message Beautiful.");
        } catch (error) {
          console.error(error);
          setStatusMsg(error.message || "Voice input failed. Please type instead.");
        } finally {
          mediaRecorderRef.current = null;
          voiceChunksRef.current = [];
          setIsListening(false);
          stopMicWave();
        }
      };

      recorder.start();
    } catch (error) {
      console.error(error);
      setIsListening(false);
          stopMicWave();
      setStatusMsg("Microphone error. Please allow microphone access or type instead.");
    }
  };

  const handlePolishMessage = async () => {
    if (!situation.trim()) {
      alert("Please describe the situation first.");
      return;
    }

    try {
      setStatusMsg("Writing your message...");
const res = await fetch(`${API_BASE}/polish-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          situation: situation.trim(),
          tone,
          sender: senderName.trim(),
          recipient: recipientName.trim()
        })
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to generate message.");
      }

      setGeneratedMessage(data.message);
      setStatusMsg("Message ready ✨");
    } catch (error) {
      console.error(error);
      setStatusMsg(error.message || "Failed to generate message.");
    }
  };

  const getFinalMessage = () => {
    if (inputMode === "exact") return customText.trim();
    return generatedMessage.trim();
  };

  const getSelectedVoice = () => {
    if (voiceMode === "manual" && voiceStyle) return voiceStyle;
    return "";
  };

  const handleProceedToPayment = async () => {
    if (!email.trim()) {
      alert("Please enter your email.");
      return;
    }

    if (inputMode === "situation" && !generatedMessage.trim()) {
      alert("Please make your message beautiful first.");
      return;
    }

    if (inputMode === "exact" && !customText.trim()) {
      alert("Please type your exact message.");
      return;
    }

    const finalMessage = getFinalMessage();

    const payload = {
      email: email.trim(),
      type: mode,
      messageData: {
        mode,
        tone,
        inputMode,
        
group: group,
character: character,
characterImageUrl: chars.find(c => c.id === character)?.image || "",

        character: "",
        senderName: senderName.trim(),
        senderGender,
        voiceMode,
        voiceStyle,
        recipientName: recipientName.trim(),
        recipientEmail: recipientEmail.trim(),
        senderPhone: senderPhone.trim(),
        recipientPhone: recipientPhone.trim(),
        situation: inputMode === "situation" ? situation.trim() : "",
        customText: inputMode === "exact" ? customText.trim() : "",
        finalMessage,
        voice: getSelectedVoice()
      }
    };

    try {
      setIsSubmitting(true);
      setStatusMsg("Redirecting to payment...");

      const checkoutFormData = new FormData();
      checkoutFormData.append("email", payload.email);
      checkoutFormData.append("type", payload.type);
      checkoutFormData.append("messageData",     JSON.stringify(payload.messageData));

if (mode === "photo" && photoFile) {
  checkoutFormData.append("photo", photoFile);
}

const res = await fetch(`${API_BASE}/create-checkout-session`, {
  method: "POST",
  body: checkoutFormData
});
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Checkout failed.");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      setStatusMsg(error.message || "Payment error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app">
      <section className="hero">
        <div className="badge">AI Talking Message</div>
        <h1>Not sure what to say?</h1>
        <p className="subtitle">
          Say a few words. We’ll turn them into a beautiful talking video message.
        </p>
      </section>

      

      

      
      



      

      

      
      <section className="section cardWrap compactInfo">
        <h2>Sender Info</h2>

        <label className="label">Name</label>
        <input
          className="input"
          type="text"
          placeholder="Your name"
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
        />

        <label className="label">Gender</label>
        <select
          className="input"
          value={senderGender}
          onChange={(e) => setSenderGender(e.target.value)}
        >
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>

        <label className="label">Voice Mode</label>
        <select
          className="input"
          value={voiceMode}
          onChange={(e) => setVoiceMode(e.target.value)}
        >
          <option value="auto">Auto match tone</option>
          <option value="manual">Choose manually</option>
        </select>

        {voiceMode === "manual" && (
          <>
            <label className="label">Voice Style</label>
            <select
              className="input"
              value={voiceStyle}
              onChange={(e) => setVoiceStyle(e.target.value)}
            >
              <option value="">Select a voice</option>
              {senderGender === "male" ? (
                <>
                  <option value="male_deep">Deep</option>
                  <option value="male_gentle">Gentle</option>
                  <option value="male_friendly">Friendly</option>
                </>
              ) : (
                <>
                  <option value="female_soft">Soft</option>
                  <option value="female_elegant">Elegant</option>
                  <option value="female_bright">Bright</option>
                </>
              )}
            </select>
          </>
        )}

        <label className="label">Email</label>
        <input
          className="input"
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="label">Phone</label>
        <input
          className="input"
          type="text"
          placeholder="Your phone"
          value={senderPhone}
          onChange={(e) => setSenderPhone(e.target.value)}
        />
      </section>

      <section className="section cardWrap compactInfo">
        <h2>Recipient Info</h2>

        <label className="label">Name</label>
        <input
          className="input"
          type="text"
          placeholder="Recipient name"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
        />

        <label className="label">Recipient Email</label>
        <input
          className="input"
          type="email"
          placeholder="Recipient email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
        />

        <label className="label">Recipient Phone</label>
        <input
          className="input"
          type="text"
          placeholder="Recipient phone"
          value={recipientPhone}
          onChange={(e) => setRecipientPhone(e.target.value)}
        />
      </section>

      <section className="section cardWrap compactStyle">
        <h2>Message Style</h2>
        <div className="toneGrid">
          {tones.map((t) => (
            <button
              type="button"
              key={t.id}
              className={tone === t.id ? `toneCard active tone-${t.id}` : `toneCard tone-${t.id}`}
              onClick={() => setTone(t.id)}
            >
              <strong>{t.label}</strong>
              <span>{t.desc}</span>
            </button>
          ))}
        </div>
      </section>

      

      


      
      <section className="section cardWrap">
        <h2>Create Your Video</h2>

        <div className="modeGrid">
          <button
            type="button"
            className={`modeCard mode-quick ${mode === "quick" ? "active" : ""}`}
            onClick={() => setMode("quick")}
          >
            <div className="modeTitle">Quick Video — $4.99</div>
            <div className="modeDesc">Text or voice input. We add voice, music, and video.</div>
          </button>

          <button
            type="button"
            className={`modeCard mode-photo ${mode === "photo" ? "active" : ""}`}
            onClick={() => setMode("photo")}
          >
            <div className="modeTitle">Photo Video — $9.99</div>
            <div className="modeDesc">Upload a photo for a talking photo video.</div>
          </button>

          <button
            type="button"
            className={`modeCard mode-character ${mode === "character" ? "active" : ""}`}
            onClick={() => setMode("character")}
          >
            <div className="modeTitle">Character Video — $9.99</div>
            <div className="modeDesc">Choose a ready-made character for the video.</div>
          </button>
        </div>

        {mode === "photo" && (
          <>
            <label className="label">Upload Photo</label>
            <input
              className="input"
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
            />
            <p className="note">Photo mode may take longer and will be delivered by email.</p>

            {previewUrl && (
              <div className="previewBox">
                <img src={previewUrl} alt="preview" className="previewImage" />
              </div>
            )}
          </>
        )}
      </section>

      <section className="section cardWrap">
        {mode === "character" && (
          <>
            <h2>Select Character</h2>
            <p className="note">Choose a character to speak your message.</p>

            <div className="tabRow">
              <button
                type="button"
                className={`tabBtn charGroupTab group-asian ${group === "asian" ? "active" : ""}`}
                onClick={() => {
                  setGroup("asian");
                  setCharacter("aria");
                }}
              >
                Asian
              </button>

              <button
                type="button"
                className={`tabBtn charGroupTab group-western ${group === "western" ? "active" : ""}`}
                onClick={() => {
                  setGroup("western");
                  setCharacter("wm1");
                }}
              >
                Western
              </button>
            </div>

            <div className="grid">
              {chars.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCharacter(c.id)}
                  className={character === c.id ? "card selected" : "card"}
                >
                  <img src={c.image} alt={c.name} className="characterImage" />
                  <p>{c.name}</p>
                </button>
              ))}
            </div>

            <div className="selectedCharBox">
              Selected character: {chars.find((c) => c.id === character)?.name}
            </div>
          </>
        )}
      </section>

      <section className="section cardWrap">
        <h2>Start With Your Message</h2>

        <div className="tabRow">
          <button
            type="button"
            className={`tabBtn inputTab input-ai ${inputMode === "situation" ? "active" : ""}`}
            onClick={() => setInputMode("situation")}
          >
            AI Write It For Me
          </button>

          <button
            type="button"
            className={`tabBtn inputTab input-exact ${inputMode === "exact" ? "active" : ""}`}
            onClick={() => setInputMode("exact")}
          >
            Use My Exact Text
          </button>
        </div>

        {inputMode === "situation" && (
          <>
            <label className="label">Describe the Situation</label>
            <textarea
              className="input"
              rows="5"
              placeholder="Example: I want to say sorry to my friend and tell her I miss her."
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
            />

            {isListening ? (
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
                  <svg
                    className="micIconSvg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="9" y="3" width="6" height="10" rx="3" />
                    <path d="M5 10v2a7 7 0 0 0 14 0v-2" />
                    <path d="M12 19v3" />
                    <path d="M8 22h8" />
                  </svg>
                </button>

                <div className="voiceWaveBars">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((bar) => (
                    <span key={bar} style={{ height: 8 }} />
                  ))}
                </div>

                <p className="micRecordText">Tap the mic and say it in your own words</p>
              </div>
            )}

            <p className="note">
              Speak or type a few words. Your words will appear here first.
            </p>

            <button
              type="button"
              className="createBtn createBtn-generate"
              onClick={handlePolishMessage}
            >
              ✨ Make My Message Beautiful
            </button>
          </>
        )}

        {inputMode === "exact" && (
          <>
            <label className="label">Your Exact Message</label>
            <textarea
              className="input"
              rows="5"
              placeholder="Type the exact words you want in the video..."
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
            />
            <p className="note">
              We’ll use your exact words in the video without rewriting them.
            </p>
          </>
        )}

        {generatedMessage && inputMode === "situation" && (
          <>
            <label className="label">Your Beautiful Message</label>
            <textarea
              className="input"
              rows="5"
              value={generatedMessage}
              onChange={(e) => setGeneratedMessage(e.target.value)}
            />
          </>
        )}
{statusMsg && <p className="statusMsg">{statusMsg}</p>}
      </section>

<section className="section cardWrap finalCtaCard">


        <button
          type="button"
          className="createBtn createBtn-submit"
          onClick={handleProceedToPayment}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Create My Video"}
        </button>

        <div className="actionNote">
          After payment, your video will be created and sent to your email.
        </div>
      </section>

<section className="section demoSection">
        <div className="demoHeader">
          <h2>See the Demo</h2>
          <p className="demoSub">Preview different styles before creating your own video.</p>
        </div>

        <div className="demoTabs">
          {Object.keys(demos).map((key) => (
            <button
              type="button"
              key={key}
              className={`tabBtn demoTab demo-${key} ${selectedDemo === key ? "active" : ""}`}
              onClick={() => setSelectedDemo(key)}
            >
              {demos[key].label}
            </button>
          ))}
        </div>

        <div className="demoVideoWrap">
          <video
            key={selectedDemo}
            controls
            className={selectedDemo === "quick" ? "demoVideo contain" : "demoVideo"}
          >
            <source src={demos[selectedDemo].src} type="video/mp4" />
          </video>
        </div>
      </section>
    </div>
  );
}

export default App;

