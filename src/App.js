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

const characterGenderMap = {
  aria: "female",
  jae: "male",
  mina: "female",
  reo: "male",
  ryu: "male",
  soo: "female",
  wm1: "male",
  wm2: "male",
  bm1: "male",
  wf1: "female",
  wf2: "female",
  bf1: "female"
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
  const [mode, setMode] = useState("photo");
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
  const [jobId, setJobId] = useState("");
  const [isListening, setIsListening] = useState(false);

  const mediaRecorderRef = useRef(null);
  const recordingStreamRef = useRef(null);
  const voiceChunksRef = useRef([]);
  

  const chars = characterGroups[group];

  const previewUrl = useMemo(() => {
    if (!photoFile) return "";
    return URL.createObjectURL(photoFile);
  }, [photoFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!jobId) return;

    let stopped = false;

    const timer = setInterval(async () => {
      if (stopped) return;

      try {
        const res = await fetch(`${API_BASE}/video-status/${jobId}`, {
          cache: "no-store"
        });

        if (!res.ok) {
          console.warn("Status check temporary failed:", res.status);
          setStatusMsg("Checking video status again...");
          return;
        }

        const data = await res.json();

        if (data.status === "completed") {
          setStatusMsg("Video completed. Please check your email.");
          clearInterval(timer);
          stopped = true;
        } else if (data.status === "error") {
          setStatusMsg(`Failed: ${data.error || "Unknown error"}`);
          clearInterval(timer);
          stopped = true;
        } else {
          setStatusMsg(`Processing... ${data.progress ?? 0}%`);
        }
      } catch (err) {
        console.error("Status polling error:", err);
        setStatusMsg("Checking video status again...");
      }
    }, 3000);

    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [jobId]);

  const getSelectedVoice = () => {
    if (mode === "character") {
      return characterGenderMap[character] || "female";
    }

    return "female";
  };

  const buildGeneratedMessage = () => {
    if (inputMode === "exact") {
      return customText.trim();
    }

    const sender = senderName.trim() || "I";
    const recipient = recipientName.trim() || "you";
    const situationText = situation.trim();

    if (!situationText) return "";

    switch (tone) {
      case "romantic":
        return `Hi ${recipient}, it's ${sender}. ${situationText} I just wanted to remind you how much you mean to me. I'm always thinking of you, and I hope to talk to you soon.`;
      case "sympathy":
        return `Hi ${recipient}, it's ${sender}. ${situationText} I just wanted to reach out and let you know that I'm here for you. Please take care, and remember you're not alone.`;
      case "playful":
        return `Hey ${recipient}, it's ${sender}. ${situationText} I just wanted to send you a little message and make you smile. Hope we can talk soon.`;
      case "calm":
        return `Hi ${recipient}, it's ${sender}. ${situationText} I just wanted to gently reach out and let you know I'm thinking about you. I hope we can talk soon.`;
      case "warm":
      default:
        return `Hi ${recipient}, it's ${sender}. ${situationText} I just wanted to tell you that I've been thinking about you a lot lately, and I miss you. I hope we can talk soon.`;
    }
  };

  const stopVoiceRecording = () => {
    const recorder = mediaRecorderRef.current;

    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
      setStatusMsg("Recording finished. Turning your voice into text...");
    }
  };

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

      setStatusMsg("Recording... speak now, then click Done speaking.");
      setIsListening(true);
      voiceChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingStreamRef.current = stream;

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

          setStatusMsg("Your words were added. Review them, then click ✨ Polish My Message.");
        } catch (error) {
          console.error(error);
          setStatusMsg(error.message || "Voice input failed. Please type instead.");
          setIsListening(false);
        } finally {
          mediaRecorderRef.current = null;
          voiceChunksRef.current = [];
        }
      };

      recorder.start();
    } catch (error) {
      console.error(error);
      setIsListening(false);
      setStatusMsg("Microphone error. Please allow microphone access or type instead.");
    }
  };

  const handleGenerateMessage = async () => {
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
        situation,
        tone,
        sender: senderName.trim(), recipient: recipientName.trim()
      })
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      throw new Error(data.error || "Failed to ✨ Polish My Message");
    }

    setGeneratedMessage(data.message);
    setStatusMsg("Message ready ✨");

  } catch (error) {
    console.error(error);
    setStatusMsg("Failed to ✨ Polish My Message.");
  }
};

  const handleSubmit = async () => {
    if (!email.trim()) {
      alert("Please enter your email.");
      return;
    }

    if (inputMode === "situation" && !situation.trim()) {
      alert("Please describe the situation.");
      return;
    }

    if (inputMode === "exact" && !customText.trim()) {
      alert("Please type your exact message.");
      return;
    }

    if (mode === "photo" && !photoFile) {
      alert("Please upload a photo.");
      return;
    }

    if (inputMode === "situation" && !generatedMessage.trim()) {
      alert("Please generate the message first.");
      return;
    }

    const finalMessage =
      inputMode === "exact" ? customText.trim() : generatedMessage.trim();

    const selectedVoice = getSelectedVoice();

    const formData = new FormData();
    formData.append("mode", mode);
    formData.append("tone", tone);
    formData.append("inputMode", inputMode);
    formData.append("group", mode === "character" ? group : "");
    formData.append("character", mode === "character" ? character : "");
    formData.append("senderName", senderName.trim());
    formData.append("senderGender", senderGender);
    formData.append("voiceMode", voiceMode);
    formData.append("voiceStyle", voiceStyle);
    formData.append("senderGender", senderGender);
    formData.append("voiceMode", voiceMode);
    formData.append("voiceStyle", voiceStyle);
    formData.append("recipientName", recipientName.trim());
    formData.append("email", email.trim());
    formData.append("senderPhone", senderPhone.trim());
    formData.append("recipientPhone", recipientPhone.trim());
    formData.append("recipientEmail", recipientEmail.trim());
    formData.append("situation", inputMode === "situation" ? situation.trim() : "");
    formData.append("customText", inputMode === "exact" ? customText.trim() : "");
    formData.append("finalMessage", finalMessage);
    formData.append("voice", selectedVoice);

    if (photoFile) {
      formData.append("photo", photoFile);
    }

    try {
      setIsSubmitting(true);
      setStatusMsg("Creating your video...");
      setJobId("");

      const res = await fetch(`${API_BASE}/create-video`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to create video.");
      }

      setJobId(data.jobId);
      setStatusMsg("Processing started...");
    } catch (err) {
      console.error(err);
      setStatusMsg(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!email.trim()) {
      alert("Please enter your email.");
      return;
    }

    if (inputMode === "situation" && !situation.trim()) {
      alert("Please describe the situation.");
      return;
    }

    if (inputMode === "exact" && !customText.trim()) {
      alert("Please type your exact message.");
      return;
    }

    if (inputMode === "situation" && !generatedMessage.trim()) {
      alert("Please generate the message first.");
      return;
    }

    

    const finalMessage =
      inputMode === "exact" ? customText.trim() : generatedMessage.trim();

    const selectedVoice = getSelectedVoice();

    const payload = {
      email: email.trim(),
      messageData: {
        mode,
        tone,
        inputMode,
        group: mode === "character" ? group : "",
        character: mode === "character" ? character : "",
        senderName: senderName.trim(),
        senderGender: senderGender,
        voiceMode: voiceMode,
        voiceStyle: voiceStyle,
        recipientName: recipientName.trim(),
        recipientEmail: recipientEmail.trim(),
        senderPhone: senderPhone.trim(),
        recipientPhone: recipientPhone.trim(),
        situation: inputMode === "situation" ? situation.trim() : "",
        customText: inputMode === "exact" ? customText.trim() : "",
        finalMessage,
        voice: selectedVoice
      }
    };

    try {
      setIsSubmitting(true);
      setStatusMsg("Redirecting to payment...");

      const res = await fetch(`${API_BASE}/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Checkout failed");
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setStatusMsg(err.message || "Payment error.");
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
          Upload a photo, choose a character, or make a quick emotional video message.
        </p>
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

      <section className="section">
        <h2>Choose Mode</h2>
        <div className="modeGrid">
          <button
            type="button"
            className={`modeCard mode-photo ${mode === "photo" ? "active" : ""}`}
            onClick={() => setMode("photo")}
          >
            <div className="modeTitle">Photo Mode</div>
            <div className="modeDesc">Upload a real photo and receive the result by email.</div>
          </button>

          <button
            type="button"
            className={`modeCard mode-quick ${mode === "quick" ? "active" : ""}`}
            onClick={() => setMode("quick")}
          >
            <div className="modeTitle">Quick Mode</div>
            <div className="modeDesc">No photo needed. Fast message-style video generation.</div>
          </button>

          <button
            type="button"
            className={`modeCard mode-character ${mode === "character" ? "active" : ""}`}
            onClick={() => setMode("character")}
          >
            <div className="modeTitle">Character Option</div>
            <div className="modeDesc">Choose a character, then write the message below.</div>
          </button>
        </div>
      </section>

      {mode === "photo" && (
        <section className="section cardWrap">
          <h2>Upload Photo</h2>
          <input
            className="input"
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
          />
          <p className="note">Your final talking video will be delivered by email.</p>

          {previewUrl && (
            <div className="previewBox">
              <img src={previewUrl} alt="preview" className="previewImage" />
            </div>
          )}
        </section>
      )}

      {mode === "character" && (
        <section className="section cardWrap">
          <h2>Select Character</h2>
          <p className="note">
            Choose a character first. The selected character will be used as the talking speaker.
          </p>

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
        </section>
      )}

      <section className="section cardWrap">
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

        <label className="label">Phone</label>
        <input
          className="input"
          type="text"
          placeholder="Your phone"
          value={senderPhone}
          onChange={(e) => setSenderPhone(e.target.value)}
        />

        <label className="label">Email</label>
        <input
          className="input"
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </section>

      <section className="section cardWrap">
        <h2>Recipient Info</h2>

        <label className="label">Name</label>
        <input
          className="input"
          type="text"
          placeholder="Recipient name"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
        />

        <label className="label">Phone</label>
        <input
          className="input"
          type="text"
          placeholder="Recipient phone"
          value={recipientPhone}
          onChange={(e) => setRecipientPhone(e.target.value)}
        />

        <label className="label">Recipient Email</label>
        <input
          className="input"
          type="email"
          placeholder="Recipient email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
        />
      </section>

      <section className="section cardWrap">
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
        <h2>Message Input</h2>

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
              placeholder="Example: It's my wife's birthday and I want a warm, loving message from me."
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
            />

                        {!isListening ? (
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
            )}
            <p className="note">
              Speak for a few seconds. Your words will appear here after recording.
            </p>
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
            <p className="note">This mode uses your wording directly.</p>
          </>
        )}

        {inputMode === "situation" && (
  <button className="createBtn" onClick={handleGenerateMessage}>
    ✨ Polish My Message
  </button>
)}

        <div className="actionNote">
          Preview the message first so you can review the wording before creating the video.

{inputMode === "exact" && (
  <div style={{marginTop:8, fontSize:13, opacity:0.7}}>
    Your exact words will be used in the video.
  </div>
)}
        </div>

        {generatedMessage && (
          <>
            <label className="label">Generated Message</label>
            <textarea
              className="input"
              rows="5"
              value={generatedMessage}
              onChange={(e) => setGeneratedMessage(e.target.value)}
            />
          </>
        )}

        {statusMsg && <p className="statusMsg">{statusMsg}</p>}

        <button
          type="button"
          className="createBtn createBtn-submit"
          onClick={handleProceedToPayment}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Proceed to Payment"}
        </button>

        <div className="actionNote">
          {mode === "photo"
            ? "Photo mode is still using the direct creation flow."
            : "After payment, your video will be created and sent to your email."}
        </div>
      </section>
    </div>
  );
}

export default App;
























































