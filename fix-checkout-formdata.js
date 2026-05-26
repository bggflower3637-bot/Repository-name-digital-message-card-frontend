const fs = require("fs");
const p = "src/App.js";
let c = fs.readFileSync(p, "utf8");

const oldText = `      const res = await fetch(\`${API_BASE}/create-checkout-session\`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });`;

const newText = `      const checkoutFormData = new FormData();
      checkoutFormData.append("email", payload.email);
      checkoutFormData.append("type", payload.type);
      checkoutFormData.append("messageData", JSON.stringify(payload.messageData));

      if (mode === "photo" && photoFile) {
        checkoutFormData.append("photo", photoFile);
      }

      const res = await fetch(\`${API_BASE}/create-checkout-session\`, {
        method: "POST",
        body: checkoutFormData
      });`;

if (!c.includes('checkoutFormData.append("photo", photoFile)')) {
  if (!c.includes(oldText)) {
    throw new Error("Could not find checkout JSON fetch block.");
  }
  c = c.replace(oldText, newText);
}

fs.writeFileSync(p, c, "utf8");
console.log("Checkout FormData patch applied.");
