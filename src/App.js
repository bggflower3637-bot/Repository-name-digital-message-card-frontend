import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import CheckoutReturn from "./CheckoutReturn";
import CollectionStudio, {CollectionPicker,collection} from "./CollectionStudio";

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  process.env.REACT_APP_API_URL ||
  "https://digital-message-card-server.onrender.com";

const characterGroups = {
  asian: [
    { id: "aria", name: "Aria", image: "./characters/asian/aria.jpg" },
    { id: "jae", name: "Jae", image: "./characters/asian/jae.jpg" },
    { id: "mina", name: "Mina", image: "./characters/asian/mina.jpg" },
    { id: "reo", name: "Reo", image: "./characters/asian/reo.jpg" },
    { id: "ryu", name: "Ryu", image: "./characters/asian/ryu.jpg" },
    { id: "soo", name: "Soo", image: "./characters/asian/soo.jpg" }
  ],
  western: [
    { id: "wm1", name: "Daniel", image: "./characters/western/wm1.jpg" },
    { id: "wm2", name: "Chris", image: "./characters/western/wm2.jpg" },
    { id: "bm1", name: "Marcus", image: "./characters/western/bm1.jpg" },
    { id: "wf1", name: "Emma", image: "./characters/western/wf1.jpg" },
    { id: "wf2", name: "Sophie", image: "./characters/western/wf2.jpg" },
    { id: "bf1", name: "Ava", image: "./characters/western/bf1.jpg" }
  ]
};





function FormatIcon({type}) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {type === "photo" ? <><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="8.5" r="1.5"/><path d="m3 17 5-5 4 4 3-3 6 6"/><path d="m17 2 .8-1M21 5l1-.5"/></> : type === "quick" ? <><rect x="3" y="4" width="18" height="16" rx="3"/><path d="m10 9 5 3-5 3V9Z"/></> : <><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1M3 3l.5-1M1 5h1"/></>}
  </svg>;
}


function readDraft() {
  try {
    const draft=JSON.parse(sessionStorage.getItem("dmc:draft") || "null");
    return draft && Date.now()-draft.savedAt<86400000 ? draft : {};
  } catch { return {}; }
}
const savedDraft=readDraft();
const draftText=(key,fallback="")=>typeof savedDraft[key]==="string" ? savedDraft[key] : fallback;
async function requestApi(url,options={}) {
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),70000);
  try { return await fetch(url,{...options,signal:controller.signal}); }
  catch(error) { if(error.name==="AbortError")throw Error("The connection timed out. Please try again; do not make another payment if you already paid.");throw error; }
  finally { clearTimeout(timeout); }
}

function App() {
  const [mode, setMode] = useState(draftText("mode","photo"));
  const [tone, setTone] = useState(draftText("tone","warm"));
  const [group, setGroup] = useState(draftText("group","asian"));
  const [character, setCharacter] = useState(draftText("character","aria"));
  const [inputMode, setInputMode] = useState(draftText("inputMode","exact"));

  const [situation, setSituation] = useState(draftText("situation",""));
  const [customText, setCustomText] = useState(draftText("customText",""));
  const [generatedMessage, setGeneratedMessage] = useState(draftText("generatedMessage",""));

  const [senderName, setSenderName] = useState(draftText("senderName",""));
  const [senderGender, setSenderGender] = useState(draftText("senderGender","female"));
  const [voiceMode, setVoiceMode] = useState(draftText("voiceMode","auto"));
  const [voiceStyle, setVoiceStyle] = useState(draftText("voiceStyle",""));

  const [recipientName, setRecipientName] = useState(draftText("recipientName",""));
  const [email, setEmail] = useState(draftText("email",""));
  const [senderPhone, setSenderPhone] = useState(draftText("senderPhone",""));
  const [recipientPhone, setRecipientPhone] = useState(draftText("recipientPhone",""));
  const [recipientEmail, setRecipientEmail] = useState(draftText("recipientEmail",""));

  const [photoFile, setPhotoFile] = useState(null);
  const [musicEnabled,setMusicEnabled] = useState(savedDraft.musicEnabled !== false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [isListening, setIsListening] = useState(false);

  const checkoutAttemptRef = useRef(null);
  const polishAttemptRef = useRef(0);
  const initialPolishRef = useRef(true);
  const [isPolishing,setIsPolishing] = useState(false);
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

  const finishVoiceRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === "recording") {
      setStatusMsg("Recording finished. Turning your voice into text...");
      recorder.stop();
    }
  };

  const handleSpeakSituation = async () => {
    if (process.env.REACT_APP_ENABLE_LIVE_CHECKOUT !== "true") { setStatusMsg("Voice input is available in the live service. Type your message to explore this preview."); return; }
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert("Microphone recording is not supported on this browser.");
        return;
      }

      setStatusMsg("Please allow microphone access.");
      voiceChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingStreamRef.current = stream;

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

          const recordedMime=recorder.mimeType || voiceChunksRef.current[0]?.type || "audio/webm";
          const audioBlob = new Blob(voiceChunksRef.current, { type: recordedMime });
          if (!audioBlob.size) {
            setStatusMsg("No voice was recorded. Please try again.");
            return;
          }

          const formData = new FormData();
          formData.append("audio", audioBlob, recordedMime.includes("mp4") ? "voice.m4a" : "voice.webm");

          setStatusMsg("Turning your voice into text...");

          const res = await requestApi(`${API_BASE}/transcribe-audio`, {
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

          setStatusMsg("Your words were added. Review them, then choose Help write my message.");
        } catch (error) {
          console.error(error);
          setStatusMsg(error.message || "Voice input failed. Please type instead.");
        } finally {
          mediaRecorderRef.current = null;
          voiceChunksRef.current = [];
          setIsListening(false);
        }
      };

      recorder.start();
    } catch (error) {
      console.error(error);
      setIsListening(false);
      recordingStreamRef.current?.getTracks().forEach(track=>track.stop());
      recordingStreamRef.current=null;
      setStatusMsg("Microphone error. Please allow microphone access or type instead.");
    }
  };

  const handlePolishMessage = async () => {
    if (process.env.REACT_APP_ENABLE_LIVE_CHECKOUT !== "true") { setStatusMsg("AI writing is available in the live service. Choose Write my own to explore this preview."); return; }
    if (!situation.trim()) {
      alert("Please describe the situation first.");
      return;
    }

    try {
      const attempt=++polishAttemptRef.current;
      setIsPolishing(true);
      setStatusMsg("Writing your message...");
const res = await requestApi(`${API_BASE}/polish-message`, {
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

      if (!res.ok || !data.ok || typeof data.message !== "string" || !data.message.trim()) {
        throw new Error(data.error || "Failed to generate message.");
      }

      if(attempt!==polishAttemptRef.current)return;
      setGeneratedMessage(data.message);
      setIsPolishing(false);
      setStatusMsg("Message ready ✨");
    } catch (error) {
      console.error(error);
      setIsPolishing(false);
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
    if (process.env.REACT_APP_ENABLE_LIVE_CHECKOUT !== "true") return;
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
        musicEnabled,
        inputMode,
        
group: group,
character: character,
characterImageUrl: chars.find(c => c.id === character)?.image || "",

        photoConsent,
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

      const healthResponse=await requestApi(API_BASE+"/health");
      const capabilities=await healthResponse.json();
      if(!healthResponse.ok || capabilities.checkoutVersion!==2)throw Error("Checkout is being updated. Please try again shortly.");
      const checkoutFormData = new FormData();
      checkoutFormData.append("email", payload.email);
      checkoutFormData.append("type", payload.type);
      const fingerprint=JSON.stringify(payload)+(photoFile ? photoFile.name+":"+photoFile.size+":"+photoFile.lastModified : "");
      if(checkoutAttemptRef.current?.fingerprint!==fingerprint) checkoutAttemptRef.current={fingerprint,id:crypto.randomUUID()};
      checkoutFormData.append("requestId",checkoutAttemptRef.current.id);
      checkoutFormData.append("messageData",     JSON.stringify(payload.messageData));

if (mode === "photo" && photoFile) {
  checkoutFormData.append("photo", photoFile);
}

const res = await requestApi(`${API_BASE}/create-checkout-session`, {
  method: "POST",
  body: checkoutFormData
});
      const data = await res.json();

      if (!res.ok || !data.url) {
        if(res.status===409)checkoutAttemptRef.current=null;
        throw new Error(data.error || "Checkout failed.");
      }

      if(data.accessToken){try{sessionStorage.setItem("dmc:order:"+data.orderId,data.accessToken);}catch{}}
      const checkoutUrl=new URL(data.url);
      if(checkoutUrl.protocol!=="https:" && !["localhost","127.0.0.1"].includes(checkoutUrl.hostname))throw Error("Checkout returned an invalid address.");
      window.location.href = checkoutUrl.href;
    } catch (error) {
      console.error(error);
      setStatusMsg(error.message || "Payment error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [photoConsent, setPhotoConsent] = useState(false);
  const [previewComplete, setPreviewComplete] = useState(false);
  const stepTitleRef = useRef(null);
  const liveEnabled = process.env.REACT_APP_ENABLE_LIVE_CHECKOUT === "true";
  const localTest = liveEnabled && API_BASE.startsWith("http://127.0.0.1:");
  const steps = ["Your video", "Your words", "Delivery & review"];
  const modeName = { photo: "Talking photo", quick: "Classic video", character: "Character video" }[mode];
  const price = mode === "quick" ? "$4.99" : "$9.99";
  const changeStep = (next) => {
    setError("");
    setStep(next);
    requestAnimationFrame(() => stepTitleRef.current?.focus());
  };
  const nextStep = () => {
    if (step === 0 && mode === "photo" && !photoFile) return setError("Choose a photo to continue.");
    if (step === 0 && mode === "photo" && !photoConsent) return setError("Please confirm you have permission to use this photo.");
    if (step === 1 && !getFinalMessage()) return setError("Add your message before continuing.");
    changeStep(step + 1);
  };
  const uploadPhoto = (file) => {
    setError("");
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return setError("Please choose a JPG, PNG, or WebP photo.");
    if (file.size > 10 * 1024 * 1024) return setError("Please choose a photo smaller than 10 MB.");
    setPhotoFile(file);
  };
  useEffect(()=>{
    if(!liveEnabled)return;
    try {sessionStorage.setItem("dmc:draft",JSON.stringify({musicEnabled,mode,tone,group,character,inputMode,situation,customText,generatedMessage,senderName,senderGender,voiceMode,voiceStyle,recipientName,email,senderPhone,recipientPhone,recipientEmail,hadPhoto:!!photoFile,savedAt:Date.now()}));}catch{}
  },[liveEnabled,musicEnabled,mode,tone,group,character,inputMode,situation,customText,generatedMessage,senderName,senderGender,voiceMode,voiceStyle,recipientName,email,senderPhone,recipientPhone,recipientEmail,photoFile]);
  useEffect(()=>()=>{recordingStreamRef.current?.getTracks().forEach(track=>track.stop());},[]);
  useEffect(()=>{setVoiceStyle("");},[senderGender]);
  useEffect(()=>{if(initialPolishRef.current){initialPolishRef.current=false;return;}setGeneratedMessage("");polishAttemptRef.current+=1;setIsPolishing(false);},[situation,tone,senderName,recipientName]);

  const reviewOrder = () => {
    setError("");
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Enter a valid email so we can send your video.");
    if (recipientEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail.trim())) return setError("Check the recipient’s email address.");
    if (!getFinalMessage()) return setError("Your message is missing. Return to Your words.");
    if (mode === "photo" && (!photoFile || !photoConsent)) return setError("Return to Your video to check your photo and permission.");
    if (!liveEnabled) { setPreviewComplete(true); return; }
    handleProceedToPayment();
  };

  if (["/success","/cancel"].includes(window.location.pathname)) return <CheckoutReturn apiBase={API_BASE} enabled={liveEnabled} />;

  return (
    <div className="app">
      {(!liveEnabled || localTest) && <div className="preview-banner">{localTest ? "LOCAL INTEGRATION TEST" : "DESIGN PREVIEW"} <span>{localTest ? "Test providers · No real payment or email" : "Design review · Payments and generation are off"}</span></div>}
      <header className="site-header">
        <a className="brand" href="#top" aria-label="DMC home"><span className="brand-mark">dmc<span>✦</span></span><span className="brand-caption">Digital Message Card</span></a>
        <a className="header-link" href="#examples">See an example <span aria-hidden="true">↗</span></a>
      </header>

      <main id="top">
        <section className="intro">
          <p className="eyebrow"><span className="tiny-star">✦</span> A PERSONAL MESSAGE, BEAUTIFULLY GIVEN</p>
          <h1>Your photo. Your words.<br /><em>A gift they can feel.</em></h1>
          <p className="intro-copy">Create an AI video of a familiar face speaking your message.<br className="desktop-break" /> Made to send with flowers, gifts, or simply a little love.</p>
          <div className="intro-details"><span>Photo to talking video</span><span>Your words, brought to life</span><span>Delivered by email</span></div>
        </section>

        <div className="studio-layout">
          <section className="studio" id="create-card" aria-label="Create your message card">
            <nav className="step-nav" aria-label="Creation progress">
              {steps.map((label, index) => <button type="button" key={label} className={step === index ? "step current" : index < step ? "step completed" : "step"} aria-current={step === index ? "step" : undefined} disabled={index > step || isSubmitting} onClick={() => changeStep(index)}><span className="step-number">{index < step ? "✓" : index + 1}</span><span>{label}</span></button>)}
            </nav>
            <div className="studio-body">
              <p className="eyebrow muted">STEP 0{step + 1} OF 03</p>
              <h2 ref={stepTitleRef} tabIndex="-1">{["Make it personal.", "Say it from the heart.", "One last thoughtful detail."][step]}</h2>
              <p className="section-intro">{["Start with a photo, or choose another way to tell your story.", "Write what you want them to hear. A few honest words are enough.", "Check your message and tell us where to send the finished video."][step]}</p>

              {step === 0 && <>
                {savedDraft.hadPhoto && !photoFile && <p className="field-hint">Your text was restored. Please choose your photo again.</p>}
                <div className="format-options" aria-label="Video type">
                  {[{id:"photo",title:"Talking photo",desc:"Bring your photo to life",icon:"▧"},{id:"quick",title:"Classic video",desc:"Words, music & a backdrop",icon:"▷"},{id:"character",title:"Character",desc:"Choose a virtual presenter",icon:"♧"}].map(item => <button type="button" key={item.id} className={"format-card " + (mode === item.id ? "selected" : "")} aria-pressed={mode === item.id} onClick={() => {setMode(item.id);setError("");}}><span className="format-icon"><FormatIcon type={item.id} /></span><strong>{item.title}</strong><small>{item.desc}</small><span className="format-price">{item.id === "quick" ? "$4.99" : "$9.99"}</span><span className="radio-dot" aria-hidden="true" /></button>)}
                </div>

                {mode === "photo" && <>
                  <div className={"upload-zone " + (previewUrl ? "has-photo" : "")}>
                    {previewUrl ? <img src={previewUrl} className="uploaded-photo" alt="Selected portrait" /> : <span className="upload-symbol" aria-hidden="true">↥</span>}
                    <strong>{photoFile ? photoFile.name : "A familiar face. An unforgettable message."}</strong>
                    <p>{photoFile ? "Your photo is ready. You can change it below." : "Choose a clear photo of one person, facing the camera."}</p>
                    <label className="upload-button" htmlFor="photo-upload">{photoFile ? "Change photo" : "Choose a photo"} <span aria-hidden="true">＋</span></label>
                    <input id="photo-upload" className="file-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={e => uploadPhoto(e.target.files?.[0])} />
                    <small>JPG, PNG or WebP · Up to 10 MB</small>
                  </div>
                  <label className="consent"><input type="checkbox" checked={photoConsent} onChange={e => setPhotoConsent(e.target.checked)} /><span>I have permission to use this photo and create an AI video of the person shown.</span></label>
                </>}

                {mode === "quick" && <div className="quiet-panel"><span className="panel-symbol">✦</span><h3>Let your words take the spotlight.</h3><p>Your message is paired with an AI voice, music, and a video backdrop. No photo needed.</p></div>}
                {mode === "character" && <div className="character-picker"><div className="segmented">{Object.keys(characterGroups).map(key => <button type="button" className={group === key ? "active" : ""} key={key} aria-pressed={group === key} onClick={() => {setGroup(key);setCharacter(characterGroups[key][0].id);}}>{key === "asian" ? "Collection 01" : "Collection 02"}</button>)}</div><div className="character-grid">{chars.map(c => <button key={c.id} type="button" className={character === c.id ? "chosen" : ""} aria-pressed={character === c.id} onClick={() => setCharacter(c.id)}><img src={c.image} alt="" /><span>{c.name}</span></button>)}</div></div>}
              </>}

              {step === 1 && <>
                <div className="field-row"><label className="field">From <span className="optional">(optional)</span><input value={senderName} autoComplete="given-name" placeholder="Your name" onChange={e => setSenderName(e.target.value)} /></label><label className="field">To <span className="optional">(optional)</span><input value={recipientName} placeholder="Their name" onChange={e => setRecipientName(e.target.value)} /></label></div>
                <div className="field-label">The atmosphere</div><CollectionPicker compact tone={tone} onChange={setTone}/><label className="music-toggle"><input type="checkbox" checked={musicEnabled} onChange={e=>setMusicEnabled(e.target.checked)}/><span>Include background music<small>A quiet accompaniment to your message.</small></span></label>
                <div className="segmented message-mode"><button type="button" className={inputMode === "exact" ? "active" : ""} aria-pressed={inputMode === "exact"} onClick={() => setInputMode("exact")}>Write my own</button><button type="button" className={inputMode === "situation" ? "active" : ""} aria-pressed={inputMode === "situation"} onClick={() => setInputMode("situation")}>Help me find the words <span>✦</span></button></div>
                {inputMode === "exact" ? <><label className="field">Your message<textarea maxLength={3000} rows="6" placeholder="Happy birthday, Mom. I wish I could be there to give you these flowers in person…" value={customText} onChange={e => setCustomText(e.target.value)} /></label><p className="field-hint">These are the words the person in your video will say.</p></> : <><label className="field">What would you like to say?<textarea maxLength={3000} rows="4" placeholder="Who is it for? What are you celebrating, or what do you want them to know?" value={situation} onChange={e => {setSituation(e.target.value);setGeneratedMessage("");}} /></label><div className="writing-actions"><button className="secondary-button" type="button" onClick={isListening ? finishVoiceRecording : handleSpeakSituation}>{isListening ? "Stop recording" : "Use voice input"}</button><button className="secondary-button dark-outline" type="button" onClick={handlePolishMessage} disabled={isPolishing || !situation.trim()}>{isPolishing ? "Writing your message…" : "Help write my message ✦"}</button></div>{generatedMessage && <label className="field">Review and edit your message<textarea maxLength={3000} rows="5" value={generatedMessage} onChange={e => setGeneratedMessage(e.target.value)} /></label>}</>}
                <details className="advanced"><summary>Voice preferences <span>Optional</span></summary><label className="field">Voice<select value={senderGender} onChange={e=>setSenderGender(e.target.value)}><option value="female">Female voice</option><option value="male">Male voice</option></select></label><label className="field">Style<select value={voiceMode} onChange={e=>setVoiceMode(e.target.value)}><option value="auto">Match the feeling automatically</option><option value="manual">Choose a style</option></select></label>{voiceMode === "manual" && <label className="field">Voice style<select value={voiceStyle} onChange={e=>setVoiceStyle(e.target.value)}><option value="">Choose a voice</option>{(senderGender==="male"?[["male_deep","Deep"],["male_gentle","Gentle"],["male_friendly","Friendly"]]:[["female_soft","Soft"],["female_elegant","Elegant"],["female_bright","Bright"]]).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>}</details>
              </>}

              {step === 2 && <>
                <label className="field">Your email<input type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} /></label><p className="field-hint">We’ll send the finished video here so you can share it with your gift.</p>
                <details className="advanced"><summary>Recipient & phone details <span>Optional</span></summary><label className="field">Recipient email<input type="email" value={recipientEmail} onChange={e=>setRecipientEmail(e.target.value)} placeholder="recipient@example.com" /></label><div className="field-row"><label className="field">Your phone<input type="tel" autoComplete="tel" value={senderPhone} onChange={e=>setSenderPhone(e.target.value)} /></label><label className="field">Recipient phone<input type="tel" value={recipientPhone} onChange={e=>setRecipientPhone(e.target.value)} /></label></div></details>
                <div className="order-review"><p>Delivery: {email || "Your email"}{recipientEmail ? " and "+recipientEmail : ""}</p><div className="review-heading"><h3>Your message</h3><button className="text-button" type="button" onClick={()=>changeStep(1)}>Edit</button></div><blockquote>“{getFinalMessage()}”</blockquote><div className="order-line"><span>{modeName} · {collection[tone]?.name} · {musicEnabled ? "Music" : "Voice only"}</span><strong>{price}</strong></div><p>Video creation starts after payment. Your finished video will arrive by email. Photo videos may take longer to prepare.</p></div>
                {previewComplete && <div className="preview-result" role="status"><strong>Your design walkthrough is complete.</strong><p>No payment was taken and no video was generated. This preview is ready for your feedback.</p></div>}
              </>}

              {(error || statusMsg) && <p className={error ? "form-error" : "form-status"} role={error ? "alert" : "status"}>{error || statusMsg}</p>}
              <div className="studio-actions">{step > 0 ? <button type="button" className="back-button" disabled={isSubmitting} onClick={()=>changeStep(step-1)}>← Back</button> : <span className="action-caption">A small gesture.<br /><strong>A very personal gift.</strong></span>}<button className="primary-button" type="button" disabled={isSubmitting} onClick={step < 2 ? nextStep : reviewOrder}>{step < 2 ? "Continue" : liveEnabled ? isSubmitting ? "Opening checkout…" : "Continue to payment" : "Finish preview"}<span aria-hidden="true">→</span></button></div>
              {step === 2 && liveEnabled && <p className="checkout-note">You’ll review the final total securely with Stripe before paying.</p>}
            </div>
          </section>

          <aside className="side-column">
            <div className={"keepsake collection-keepsake theme-"+tone} style={{"--collection-color":collection[tone]?.color}}>
              <div className="keepsake-topline"><span>A MESSAGE, MADE PERSONAL</span><span>✦</span></div>
              <div className="portrait-frame">{previewUrl ? <img src={previewUrl} alt="Selected portrait on your card" /> : <div className="paper-art" aria-hidden="true"><svg viewBox="0 0 220 240" fill="none"><path d="M108 225C112 158 112 99 143 45M110 219C102 164 81 121 53 100M113 193C131 153 154 130 184 113" stroke="#647856" strokeWidth="3"/><path d="M130 84C99 55 122 27 143 45C166 14 190 48 159 69C151 75 144 81 130 84Z" fill="#D4A09C"/><path d="M76 135C47 147 24 119 53 100C43 72 82 65 91 101L76 135Z" fill="#DDBBB2"/><path d="M151 158C140 127 162 105 184 113C209 100 217 136 188 147L151 158Z" fill="#C18A81"/><path d="M110 170C92 169 79 152 84 141C106 141 119 155 110 170ZM117 152C119 129 138 119 147 127C147 148 130 158 117 152Z" fill="#8C9D7A"/><path d="M111 219L88 185L135 185L111 219Z" fill="#EADCC3" opacity=".8"/></svg><span>For someone<br /><em>who means everything.</em></span></div>}</div>
              <div className="keepsake-message"><span>{recipientName ? "FOR " + recipientName.toUpperCase() : "MORE THAN WORDS"}</span><p>{getFinalMessage() ? getFinalMessage().slice(0,145)+(getFinalMessage().length>145?"…":"") : "A familiar face. A voice to remember. A little closer, even from far away."}</p><small>{senderName ? "With love, " + senderName : "Made with a little thought. Sent with a lot of love."}</small></div>
              <div className="keepsake-bottom"><span>DMC</span><span>{photoFile ? "YOUR PHOTO · CARD LAYOUT" : "YOUR PERSONAL MESSAGE CARD"}</span></div>
            </div>
            <p className="preview-caption">{collection[tone]?.name} · {musicEnabled ? "With music" : "Voice only"} · Layout preview</p>
            <div className="how-it-works"><p className="eyebrow muted">THOUGHTFUL. SIMPLE. PERSONAL.</p><div><span>01</span><p><strong>Make it yours</strong>Add a photo and your message.</p></div><div><span>02</span><p><strong>We bring it to life</strong>AI turns your words into a video.</p></div><div><span>03</span><p><strong>Send a little joy</strong>Receive it by email, ready to share.</p></div></div>
          </aside>
        </div>

        <CollectionStudio tone={tone} onChange={setTone} musicEnabled={musicEnabled} setMusicEnabled={setMusicEnabled}/>
      </main>
      <footer><a className="brand-mark" href="#top">dmc<span>✦</span></a><p>A little more personal.</p><span>Digital Message Card</span></footer>
    </div>
  );
}
export default App;
