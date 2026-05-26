const fs = require("fs");
const p = "src/App.js";
let c = fs.readFileSync(p, "utf8");

const oldText =
'      const res = await fetch(`${API_BASE}/create-checkout-session`, {\n' +
'        method: "POST",\n' +
'        headers: {\n' +
'          "Content-Type": "application/json"\n' +
'        },\n' +
'        body: JSON.stringify(payload)\n' +
'      });';

const newText =
'      const checkoutFormData = new FormData();\n' +
'      checkoutFormData.append("email", payload.email);\n' +
'      checkoutFormData.append("type", payload.type);\n' +
'      checkoutFormData.append("messageData", JSON.stringify(payload.messageData));\n\n' +
'      if (mode === "photo" && photoFile) {\n' +
'        checkoutFormData.append("photo", photoFile);\n' +
'      }\n\n' +
'      const res = await fetch(`${API_BASE}/create-checkout-session`, {\n' +
'        method: "POST",\n' +
'        body: checkoutFormData\n' +
'      });';

if (!c.includes('checkoutFormData.append("photo", photoFile)')) {
  if (!c.includes(oldText)) {
    throw new Error("Could not find checkout JSON fetch block.");
  }
  c = c.replace(oldText, newText);
}

fs.writeFileSync(p, c, "utf8");
console.log("Checkout FormData patch applied.");
