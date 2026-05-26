import React, { useEffect, useMemo, useState } from "react";
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

const character

<div style={{ marginTop: 12 }}>
  <div style={{ fontWeight: "600", marginBottom: 6 }}>Voice Mode</div>

  <select
    value={voiceMode}
    onChange={(e) => setVoiceMode(e.target.value)}
    style={{ width: "100%", padding: 10, borderRadius: 8 }}
  >
    <option value="auto">Auto (Recommended)</option>
    <option value="manual">Choose Manually</option>
  </select>

  {voiceMode === "manual" && (
    <select
      value={voiceStyle}
      onChange={(e) => setVoiceStyle(e.target.value)}
      style={{ width: "100%", padding: 10, borderRadius: 8, marginTop: 8 }}
    >
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
  )}
</div>


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
              {sender

<div style={{ marginTop: 12 }}>
  <div style={{ fontWeight: "600", marginBottom: 6 }}>Voice Mode</div>

  <select
    value={voiceMode}
    onChange={(e) => setVoiceMode(e.target.value)}
    style={{ width: "100%", padding: 10, borderRadius: 8 }}
  >
    <option value="auto">Auto (Recommended)</option>
    <option value="manual">Choose Manually</option>
  </select>

  {voiceMode === "manual" && (
    <select
      value={voiceStyle}
      onChange={(e) => setVoiceStyle(e.target.value)}
      style={{ width: "100%", padding: 10, borderRadius: 8, marginTop: 8 }}
    >
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
  )}
</div>

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

        <button type="button" className="createBtn createBtn-generate" onClick={handleGenerateMessage}>
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




































