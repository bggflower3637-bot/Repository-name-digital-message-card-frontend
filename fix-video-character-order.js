const fs = require("fs");
const path = "src/App.js";
let s = fs.readFileSync(path, "utf8");

function findSectionByTitle(title) {
  const h2Index = s.indexOf(`<h2>${title}</h2>`);
  if (h2Index < 0) throw new Error("Missing section: " + title);

  const start = s.lastIndexOf("<section", h2Index);
  let i = start;
  let depth = 0;

  while (i < s.length) {
    const open = s.indexOf("<section", i);
    const close = s.indexOf("</section>", i);

    if (close < 0) throw new Error("Missing close section: " + title);

    if (open !== -1 && open < close) {
      depth++;
      i = open + 8;
    } else {
      depth--;
      i = close + "</section>".length;
      if (depth === 0) return { start, end: i, text: s.slice(start, i) };
    }
  }
}

function findCharacterSection() {
  const marker = '{mode === "character" &&';
  const idx = s.indexOf(marker);
  if (idx < 0) throw new Error("Missing character section");

  const start = s.lastIndexOf("<section", idx);
  let i = start;
  let depth = 0;

  while (i < s.length) {
    const open = s.indexOf("<section", i);
    const close = s.indexOf("</section>", i);

    if (close < 0) throw new Error("Missing close character section");

    if (open !== -1 && open < close) {
      depth++;
      i = open + 8;
    } else {
      depth--;
      i = close + "</section>".length;
      if (depth === 0) return { start, end: i, text: s.slice(start, i) };
    }
  }
}

function removeBlocks(blocks) {
  blocks.sort((a,b) => b.start - a.start).forEach(b => {
    s = s.slice(0, b.start) + s.slice(b.end);
  });
}

const startMsg = findSectionByTitle("Start With Your Message");
const video = findSectionByTitle("Create Your Video");
const character = findCharacterSection();

removeBlocks([startMsg, video, character]);

const insertPoint = s.indexOf('<section className="section cardWrap finalCtaCard">');
if (insertPoint < 0) throw new Error("Missing final CTA insert point");

const fixedOrder = `
      ${video.text}

      ${character.text}

      ${startMsg.text}

`;

s = s.slice(0, insertPoint) + fixedOrder + s.slice(insertPoint);

fs.writeFileSync(path, s, "utf8");
console.log("Done: video section moved above message, character section moved under video.");
