import React, { useState } from 'react';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('video'); // ?? ??

  const handleGenerate = () => {
    if (!inputText) return;
    setGeneratedText("This is your beautifully polished message: " + inputText);
  };

  const handleCheckout = () => {
    const price = selectedProduct === 'video' ? 999 : 599;

    alert(
      selectedProduct === 'video'
        ? "Proceeding to Video (.99)"
        : "Proceeding to Text (.99)"
    );

    // ?? ??? Stripe ?? ?
    // fetch('/create-checkout-session', {
    //   method: 'POST',
    //   body: JSON.stringify({ type: selectedProduct })
    // })
  };

  return (
    <div className="container">

      {/* STEP 1 */}
      <h1>Say it in your own words</h1>

      <textarea
        placeholder="Type or speak your message..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />

      <button className="primary" onClick={handleGenerate}>
        ? Make My Message Beautiful
      </button>

      {/* STEP 2 */}
      {generatedText && (
        <>
          <h2>Imagine they receive this…</h2>
          <div className="result-box">{generatedText}</div>

          {/* ?? ?? ?? UI */}
          <div className="pricing-box">

            <div
              className={
                selectedProduct === 'text'
                  ? 'price-card selected'
                  : 'price-card'
              }
              onClick={() => setSelectedProduct('text')}
            >
              <h3>Text Message</h3>
              <p className="price">.99</p>
              <p>Beautiful written message</p>
            </div>

            <div
              className={
                selectedProduct === 'video'
                  ? 'price-card selected'
                  : 'price-card'
              }
              onClick={() => setSelectedProduct('video')}
            >
              <h3>Video Message ?</h3>
              <p className="price">.99</p>
              <p>Voice + Music + Emotion</p>
              <p className="tag">Most Popular</p>
            </div>

          </div>

          {/* CTA ?? */}
          <button className="cta" onClick={handleCheckout}>
            {selectedProduct === 'video'
              ? '?? Send This as a Video (.99)'
              : '?? Send This as Text (.99)'}
          </button>
        </>
      )}
    </div>
  );
}

export default App;
