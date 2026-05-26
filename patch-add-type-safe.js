const fs = require("fs");

const p = "src/App.js";
let c = fs.readFileSync(p, "utf8");

// BOM 제거
c = c.replace(/^\uFEFF/, "");

// 1) FormData 방식이면 type 추가
if (!c.includes('formData.append("type", selectedProduct);')) {
  c = c.replace(
    'formData.append("email", email.trim());',
    'formData.append("email", email.trim());\n    formData.append("type", selectedProduct);'
  );
}

// 2) JSON payload 방식이면 type 추가
if (!c.includes('type: selectedProduct')) {
  c = c.replace(
    'const payload = {\n      email: email.trim(),',
    'const payload = {\n      email: email.trim(),\n      type: selectedProduct,'
  );
}

fs.writeFileSync(p, c, "utf8");
console.log("type patch checked.");
