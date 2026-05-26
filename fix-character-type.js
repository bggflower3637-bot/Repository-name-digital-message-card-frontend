const fs = require("fs");
const p = "src/App.js";
let c = fs.readFileSync(p, "utf8");

c = c.replace(
  'type: mode === "quick" ? "quick" : "photo",',
  'type: mode,'
);

fs.writeFileSync(p, c, "utf8");
console.log("🔥 FIXED: character mode now sent correctly");
