const fs = require("fs");

const p = "src/App.js";
let c = fs.readFileSync(p, "utf8");

// state 추가
if (!c.includes("selectedProduct, setSelectedProduct")) {
  c = c.replace(
    'const [mode, setMode] = useState("quick");',
    'const [mode, setMode] = useState("quick");\n  const [selectedProduct, setSelectedProduct] = useState("video");'
  );
}

// 가격 UI 추가
if (!c.includes("Choose How to Send")) {
  const priceBlock = `
        {generatedMessage && (
          <div className="section cardWrap">
            <h2>Choose How to Send</h2>

            <div className="pricingBox">
              <button
                type="button"
                className={selectedProduct === "text" ? "priceCard active" : "priceCard"}
                onClick={() => setSelectedProduct("text")}
              >
                <div className="priceTitle">Text Message</div>
                <div className="priceAmount">$5.99</div>
              </button>

              <button
                type="button"
                className={selectedProduct === "video" ? "priceCard active" : "priceCard"}
                onClick={() => setSelectedProduct("video")}
              >
                <div className="priceTitle">Video Message</div>
                <div className="priceAmount">$9.99</div>
                <div className="priceTag">Most Popular</div>
              </button>
            </div>
          </div>
        )}

`;

  c = c.replace(
    "{statusMsg && <p className=\"statusMsg\">{statusMsg}</p>}",
    priceBlock + "        {statusMsg && <p className=\"statusMsg\">{statusMsg}</p>}"
  );
}

// Stripe type 전달
if (!c.includes('formData.append("type", selectedProduct);')) {
  c = c.replace(
    'formData.append("email", email.trim());',
    'formData.append("email", email.trim());\n    formData.append("type", selectedProduct);'
  );
}

fs.writeFileSync(p, c, "utf8");
console.log("Price UI patched.");
