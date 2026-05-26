const fs = require("fs");

const path = "src/App.js";
let s = fs.readFileSync(path, "utf8");

const target = '      const res = await fetch(`${API_BASE}/polish-message`, {';

const insert = `      console.log("POLISH BODY", {
        situation: situation.trim(),
        tone,
        sender: senderName.trim(),
        recipient: recipientName.trim()
      });

      const res = await fetch(\`\${API_BASE}/polish-message\`, {`;

if (!s.includes(target)) {
  throw new Error("fetch line not found");
}

s = s.replace(target, insert);

fs.writeFileSync(path, s, "utf8");
console.log("POLISH BODY log added");
