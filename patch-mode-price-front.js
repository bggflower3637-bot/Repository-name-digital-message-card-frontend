const fs = require("fs");
const p = "src/App.js";
let c = fs.readFileSync(p, "utf8");

// 1. 별도 가격 선택 UI 제거
c = c.replace(/\s*\{generatedMessage && \(\s*<div className="section cardWrap">\s*<h2>Choose How to Send<\/h2>[\s\S]*?<\/div>\s*\)\}/, "");

// 2. Quick / Photo 버튼에 가격 표시
c = c.replace(
  '<div className="modeTitle">Quick Video</div>\n            <div className="modeDesc">Fast emotional video message.</div>',
  '<div className="modeTitle">Quick Video — $4.99</div>\n            <div className="modeDesc">Voice, music, and message video. No photo needed.</div>'
);

c = c.replace(
  '<div className="modeTitle">Photo Video</div>\n            <div className="modeDesc">Upload a real photo for a personal video.</div>',
  '<div className="modeTitle">Photo Video — $9.99</div>\n            <div className="modeDesc">Upload a real photo for a personal talking video.</div>'
);

// 3. selectedProduct 대신 mode 기준으로 type 전달
c = c.replace(/type: selectedProduct,\n?/g, "");
c = c.replace(
  "const payload = {\n      email: email.trim(),",
  'const payload = {\n      email: email.trim(),\n      type: mode === "photo" ? "photo" : "quick",'
);

// 4. messageData에도 productType 저장
if (!c.includes("productType: mode ===")) {
  c = c.replace(
    "messageData: {\n        mode,",
    'messageData: {\n        mode,\n        productType: mode === "photo" ? "photo" : "quick",'
  );
}

fs.writeFileSync(p, c, "utf8");
console.log("Frontend mode price fixed.");
