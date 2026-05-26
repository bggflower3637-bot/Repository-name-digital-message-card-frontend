const fs = require("fs");
const p = "src/App.js";
let c = fs.readFileSync(p, "utf8");

// 1) Quick / Photo 버튼에 가격 표시
c = c.replace(
  '<div className="modeTitle">Quick Video</div>',
  '<div className="modeTitle">Quick Video — $4.99</div>'
);

c = c.replace(
  '<div className="modeDesc">Fast emotional video message.</div>',
  '<div className="modeDesc">Text or voice input. We add voice, music, and video.</div>'
);

c = c.replace(
  '<div className="modeTitle">Photo Video</div>',
  '<div className="modeTitle">Photo Video — $9.99</div>'
);

c = c.replace(
  '<div className="modeDesc">Upload a real photo for a personal video.</div>',
  '<div className="modeDesc">Upload a photo for a talking photo video.</div>'
);

// 2) 기존 selectedProduct 관련 type 제거
c = c.replace(/^\s*type:\s*selectedProduct,\s*\r?\n/gm, "");

// 3) payload에 mode 기준 type 추가
if (!c.includes('type: mode === "photo" ? "photo" : "quick"')) {
  c = c.replace(
    "const payload = {\n      email: email.trim(),",
    'const payload = {\n      email: email.trim(),\n      type: mode === "photo" ? "photo" : "quick",'
  );
}

// 4) messageData에도 productType 추가
if (!c.includes('productType: mode === "photo" ? "photo" : "quick"')) {
  c = c.replace(
    "messageData: {\n        mode,",
    'messageData: {\n        mode,\n        productType: mode === "photo" ? "photo" : "quick",'
  );
}

fs.writeFileSync(p, c, "utf8");
console.log("Frontend quick/photo price patch done.");
