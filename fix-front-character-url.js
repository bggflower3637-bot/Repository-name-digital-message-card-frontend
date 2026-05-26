const fs = require("fs");
const p = "src/App.js";
let c = fs.readFileSync(p, "utf8");

c = c.replace(
  'group: "",\n        character: "",',
  'group: mode === "character" ? group : "",\n        character: mode === "character" ? character : "",\n        characterImageUrl: mode === "character" ? `${window.location.origin}/characters/${group}/${character}.jpg` : "",'
);

fs.writeFileSync(p, c, "utf8");
console.log("front character image url added");
