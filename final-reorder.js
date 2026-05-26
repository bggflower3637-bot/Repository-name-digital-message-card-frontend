const fs = require("fs");
const path = "src/App.js";
let s = fs.readFileSync(path, "utf8");

function findSectionByTitle(title) {
  const h2 = `<h2>${title}</h2>`;
  const h2Index = s.indexOf(h2);
  if (h2Index < 0) throw new Error("Missing section: " + title);

  const start = s.lastIndexOf("<section", h2Index);
  if (start < 0) throw new Error("Missing section start: " + title);

  let i = start;
  let depth = 0;
  while (i < s.length) {
    const nextOpen = s.indexOf("<section", i);
    const nextClose = s.indexOf("</section>", i);

    if (nextClose < 0) throw new Error("Missing section close: " + title);

    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      i = nextOpen + 8;
    } else {
      depth--;
      i = nextClose + "</section>".length;
      if (depth === 0) {
        return { start, end: i, text: s.slice(start, i) };
      }
    }
  }

  throw new Error("Could not parse section: " + title);
}

function removeRange(block) {
  s = s.slice(0, block.start) + s.slice(block.end);
}

const startMsg = findSectionByTitle("Start With Your Message");
const video = findSectionByTitle("Create Your Video");
const style = findSectionByTitle("Message Style");
const sender = findSectionByTitle("Sender Info");
const recipient = findSectionByTitle("Recipient Info");

[startMsg, video, style, sender, recipient]
  .sort((a, b) => b.start - a.start)
  .forEach(removeRange);

const insertPoint = s.indexOf("<section className=\"section demoSection\">");
if (insertPoint < 0) throw new Error("Missing demo section insert point");

const finalCtaMatch = recipient.text.match(/\s*<button[\s\S]*?Create My Video[\s\S]*?<\/button>\s*<div className="actionNote">[\s\S]*?<\/div>/);

let recipientClean = recipient.text;
let finalCta = "";

if (finalCtaMatch) {
  recipientClean = recipientClean.replace(finalCtaMatch[0], "");
  finalCta = `
      <section className="section cardWrap finalCtaCard">
${finalCtaMatch[0]}
      </section>

`;
}

const newOrder = `
      ${sender.text.replace('<section className="section cardWrap"', '<section className="section cardWrap compactInfo"')}

      ${recipientClean.replace('<section className="section cardWrap"', '<section className="section cardWrap compactInfo"')}

      ${style.text.replace('<section className="section cardWrap"', '<section className="section cardWrap compactStyle"')}

      ${startMsg.text}

      ${video.text}

${finalCta}`;

s = s.slice(0, insertPoint) + newOrder + s.slice(insertPoint);

fs.writeFileSync(path, s, "utf8");
console.log("Done: latest App.js reordered.");
