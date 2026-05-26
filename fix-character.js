const fs = require("fs");
const path = "src/App.js";
let s = fs.readFileSync(path, "utf8");

const target = "group: \"\",";
const replacement = `
group: group,
character: character,
characterImageUrl: chars.find(c => c.id === character)?.image || "",
`;

if (!s.includes("group: \"\"")) {
  console.log("Already fixed or pattern changed");
} else {
  s = s.replace(target, replacement);
  fs.writeFileSync(path, s, "utf8");
  console.log("✅ character payload FIXED");
}
