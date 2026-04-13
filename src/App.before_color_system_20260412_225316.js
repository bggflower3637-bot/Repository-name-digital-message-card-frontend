import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_BASE =
  process.env.REACT_APP_API_BASE_URL ||
  "http://localhost:10000";

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
  const [mode, setMode] = useState("photo");
  const [tone, setTone] = useState("warm");
  const [group, setGroup] = useState("asian");
  const [character, setCharacter] = useState("aria");

  const [inputMode, setInputMode] = useState("situation");
  const [situation, setSituation] = useState("");
  const [customText, setCustomText] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");

  const [senderName, setSenderName] = useState("");
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

    const timer = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/video-status/${jobId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch status");
        }

        if (data.status === "completed") {
          setStatusMsg("✅ Video completed.");
          clearInterval(timer);
        } else if (data.status === "error") {
          setStatusMsg(`❌ Failed: ${data.error || "Unknown error"}`);
          clearInterval(timer);
        } else {
          setStatusMsg(`Processing... ${data.progress ?? 0}%`);
        }
      } catch (err) {
        console.error(err);
        setStatusMsg("Failed to check video status.");
        clearInterval(timer);
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [jobId]);

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

  const handleGenerateMessage = () => {
    if (inputMode === "exact") {
      if (!customText.trim()) {
        alert("Please type your exact message first.");
        return;
      }
      setGeneratedMessage(customText.trim());
      return;
    }

    if (!situation.trim()) {
      alert("Please describe the situation first.");
      return;
    }

    const message = buildGeneratedMessage();
    setGeneratedMessage(message);
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

    const formData = new FormData();
    formData.append("mode", mode);
    formData.append("tone", tone);
    formData.append("inputMode", inputMode);
    formData.append("group", mode === "character" ? group : "");
    formData.append("character", mode === "character" ? character : "");
    formData.append("senderName", senderName.trim());
    formData.append("recipientName", recipientName.trim());
    formData.append("email", email.trim());
    formData.append("senderPhone", senderPhone.trim());
    formData.append("recipientPhone", recipientPhone.trim());
    formData.append("recipientEmail", recipientEmail.trim());
    formData.append("situation", inputMode === "situation" ? situation.trim() : "");
    formData.append("customText", inputMode === "exact" ? customText.trim() : "");
    formData.append("finalMessage", finalMessage);
    formData.append("voice", "female");

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

  return (
    <div className="app">
      <section className="hero">
        <div className="badge">AI Talking Message</div>
        <h1>Create a Talking Video Message That Feels Personal</h1>
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
              className={selectedDemo === key ? "tabBtn active" : "tabBtn"}
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
            className={mode === "photo" ? "modeCard active" : "modeCard"}
            onClick={() => setMode("photo")}
          >
            <div className="modeTitle">Photo Mode</div>
            <div className="modeDesc">Upload a real photo and receive the result by email.</div>
          </button>

          <button
            type="button"
            className={mode === "quick" ? "modeCard active" : "modeCard"}
            onClick={() => setMode("quick")}
          >
            <div className="modeTitle">Quick Mode</div>
            <div className="modeDesc">No photo needed. Fast message-style video generation.</div>
          </button>

          <button
            type="button"
            className={mode === "character" ? "modeCard active" : "modeCard"}
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
              className={group === "asian" ? "tabBtn active" : "tabBtn"}
              onClick={() => {
                setGroup("asian");
                setCharacter("aria");
              }}
            >
              Asian
            </button>

            <button
              type="button"
              className={group === "western" ? "tabBtn active" : "tabBtn"}
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
            className={inputMode === "situation" ? "tabBtn active" : "tabBtn"}
            onClick={() => setInputMode("situation")}
          >
            AI Write It For Me
          </button>

          <button
            type="button"
            className={inputMode === "exact" ? "tabBtn active" : "tabBtn"}
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
            <p className="note">
              Enter sender and recipient details first, then describe the situation.
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

        <button type="button" className="createBtn" onClick={handleGenerateMessage}>
          Generate Message
        </button>

        <div className="actionNote">
          Preview the message first so you can review the wording before creating the video.
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
          className="createBtn"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create My Video"}
        </button>

        <div className="actionNote">
          Video generation can take a little time. When it is ready, we will send it to the email you entered.
        </div>
      </section>
    </div>
  );
}

export default App;



