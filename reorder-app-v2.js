const fs = require("fs");
const path = "src/App.js";

let s = fs.readFileSync(path, "utf8");

function sectionByH2(title) {
  const re = new RegExp(String.raw`[ \t]*<section className="section cardWrap">[\s\S]*?<h2>\s*${title}\s*<\/h2>[\s\S]*?[ \t]*<\/section>`, "m");
  const m = s.match(re);
  if (!m) throw new Error("Cannot find section: " + title);
  return m[0];
}

function removeBlock(block) {
  s = s.replace(block, "");
}

const sender = sectionByH2("Sender Info");
const recipient = sectionByH2("Recipient Info");
const style = sectionByH2("Message Style");
const start = sectionByH2("Start With Your Message");
const video = sectionByH2("Create Your Video");

removeBlock(sender);
removeBlock(recipient);
removeBlock(style);
removeBlock(start);
removeBlock(video);

const heroEnd = s.indexOf('<section className="section cardWrap">');
if (heroEnd < 0) throw new Error("Cannot find insert point after hero.");

const newOrder = `
${sender}

${recipient}

${style}

${start}

${video}
`;

s = s.slice(0, heroEnd) + newOrder + s.slice(heroEnd);

fs.writeFileSync(path, s, "utf8");
console.log("Done: reordered only.");
