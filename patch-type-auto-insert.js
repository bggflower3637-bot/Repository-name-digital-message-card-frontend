const fs = require("fs");

const p = "src/App.js";
let c = fs.readFileSync(p, "utf8");

if (!c.includes('type: mode === "photo" ? "photo" : "quick"')) {
  const payloadIndex = c.indexOf("const payload = {");

  if (payloadIndex === -1) {
    throw new Error("Could not find const payload block.");
  }

  const emailLine = 'email: email.trim(),';
  const emailIndex = c.indexOf(emailLine, payloadIndex);

  if (emailIndex === -1) {
    throw new Error("Could not find email line inside payload.");
  }

  const insertAt = emailIndex + emailLine.length;

  c =
    c.slice(0, insertAt) +
    '\n      type: mode === "photo" ? "photo" : "quick",' +
    c.slice(insertAt);
}

fs.writeFileSync(p, c, "utf8");
console.log("Inserted type into payload successfully.");
