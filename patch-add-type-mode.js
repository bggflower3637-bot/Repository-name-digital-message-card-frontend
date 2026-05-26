const fs = require("fs");
const p = "src/App.js";
let c = fs.readFileSync(p, "utf8");

// payload에 type 추가
if (!c.includes('type: mode === "photo" ? "photo" : "quick"')) {
  c = c.replace(
    "const payload = {\n      email: email.trim(),",
    'const payload = {\n      email: email.trim(),\n      type: mode === "photo" ? "photo" : "quick",'
  );
}

fs.writeFileSync(p, c, "utf8");
console.log("type added correctly.");
