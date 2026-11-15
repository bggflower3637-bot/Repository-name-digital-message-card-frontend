import React from "react";
import "./WatercolorCards.css";

const cards = [
  { image: "single-bloom", tone: "warm", title: "Pink poppy" },
  { image: "violet-stems", tone: "calm", title: "Violet blooms" },
  { image: "golden-poppies", tone: "playful", title: "Golden poppies" },
  { image: "coral-lilies", tone: "romantic", title: "Coral lilies" },
  { image: "lavender-sprigs", tone: "calm", title: "Lavender sprigs" },
];

export default function WatercolorCards({ onChoose }) {
  return (
    <section className="watercolor-collection" id="quiet-cards" aria-labelledby="watercolor-title">
      <h2 id="watercolor-title">The Quiet Collection</h2>
      <div className="watercolor-grid">
        {cards.map(({ image, tone, title }) => (
          <a className="watercolor-option" key={image} href="#create-card" onClick={() => onChoose(tone)}>
            <span className="watercolor-art">
              <img src={`/occasions-watercolor/${image}.webp`} alt="" width="720" height="960" loading="lazy" decoding="async" />
              <span className="watercolor-message">Just for you</span>
            </span>
            <strong>{title} <span aria-hidden="true">↗</span></strong>
          </a>
        ))}
      </div>
    </section>
  );
}
