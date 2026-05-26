const fs = require("fs");
const p = "src/App.js";
let c = fs.readFileSync(p, "utf8");

const oldBlock = `      const res = await fetch(\`${API_BASE}/create-checkout-session\`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });`;

const newBlock = `      const formData = new FormData();
      formData.append("email", payload.email);
      formData.append("type", payload.type);
      formData.append("messageData", JSON.stringify(payload.messageData));

      if (mode === "photo" && photoFile) {
        formData.append("photo", photoFile);
      }

      const res = await fetch(\`${API_BASE}/create-checkout-session\`, {
        method: "POST",
        body: formData
      });`;

if (!c.includes('formData.append("messageData"')) {
  c = c.replace(oldBlock, newBlock);
}

fs.writeFileSync(p, c, "utf8");
console.log("Photo FormData checkout fix applied.");
