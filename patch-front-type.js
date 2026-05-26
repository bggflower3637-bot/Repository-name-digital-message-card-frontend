const fs = require("fs");
const p = "src/App.js";
let c = fs.readFileSync(p, "utf8");

if (!c.includes("type: selectedProduct")) {
  c = c.replace(
    "const payload = {\n      email: email.trim(),",
    "const payload = {\n      email: email.trim(),\n      type: selectedProduct,"
  );
}

fs.writeFileSync(p, c, "utf8");
console.log("frontend type added");
