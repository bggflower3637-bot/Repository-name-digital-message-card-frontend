import React from "react";
import "./WatercolorCards.css";

const cards = [
  { image: "single-bloom", tone: "warm", title: "Quiet thank-you", message: "Simply, thank you." },
  { image: "violet-stems", tone: "calm", title: "Thinking of you", message: "You’re in my thoughts." },
];

export default function WatercolorCards({ onChoose }) {
  return (
    <section className="watercolor-collection" id="quiet-cards" aria-labelledby="watercolor-title">
      <h2 id="watercolor-title">The Quiet Collection</h2>
      <div className="watercolor-grid">
        {cards.map(({ image, tone, title, message }) => (
          <a className="watercolor-option" key={image} href="#create-card" onClick={() => onChoose(tone)}>
            <span className="watercolor-art">
              <img src={`/occasions-watercolor/${image}.webp`} alt="" width="720" height="960" decoding="async" />
              <span className="watercolor-message">{message}</span>
            </span>
            <strong>{title} <span aria-hidden="true">↗</span></strong>
          </a>
        ))}
      </div>
    </section>
  );
}
