const fs = require("fs");

const p = "src/App.js";
let c = fs.readFileSync(p, "utf8");

// 이미 있으면 패스
if (!c.includes('formData.append("type", selectedProduct);')) {

  c = c.replace(
    'formData.append("email", email.trim());',
    'formData.append("email", email.trim());\n    formData.append("type", selectedProduct);'
  );

}

fs.writeFileSync(p, c, "utf8");
console.log("type field added.");
