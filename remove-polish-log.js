const fs = require("fs");

const path = "src/App.js";
let s = fs.readFileSync(path, "utf8");

s = s.replace(/\s*console\.log\("POLISH BODY", \{\s*situation: situation\.trim\(\),\s*tone,\s*sender: senderName\.trim\(\),\s*recipient: recipientName\.trim\(\)\s*\}\);\s*/m, "\n");

fs.writeFileSync(path, s, "utf8");
console.log("✅ POLISH BODY log removed");
