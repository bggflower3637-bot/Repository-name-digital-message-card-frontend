const fs = require("fs");
const path = "src/App.js";

let s = fs.readFileSync(path, "utf8");

function take(startText, nextText) {
  const start = s.indexOf(startText);
  if (start < 0) throw new Error("Missing start: " + startText);
  const end = s.indexOf(nextText, start + startText.length);
  if (end < 0) throw new Error("Missing next after: " + startText);
  return { text: s.slice(start, end), start, end };
}

function takeLast(startText, nextText) {
  const start = s.lastIndexOf(startText);
  if (start < 0) throw new Error("Missing start: " + startText);
  const end = s.indexOf(nextText, start + startText.length);
  if (end < 0) throw new Error("Missing next after: " + startText);
  return { text: s.slice(start, end), start, end };
}

const hero = take('      <section className="hero">', '      <section className="section cardWrap">');
const startMsg = take('      <section className="section cardWrap">\n        <h2>Start With Your Message</h2>', '      <section className="section cardWrap">\n        <h2>Create Your Video</h2>');
const createVideo = take('      <section className="section cardWrap">\n        <h2>Create Your Video</h2>', '      \n      <section className="section cardWrap">');
const characterSec = take('      \n      <section className="section cardWrap">\n        {mode === "character"', '<section className="section cardWrap">\n        <h2>Message Style</h2>');
const messageStyle = take('<section className="section cardWrap">\n        <h2>Message Style</h2>', '      <section className="section cardWrap">\n        <h2>Sender Info</h2>');
const senderInfo = take('      <section className="section cardWrap">\n        <h2>Sender Info</h2>', '      <section className="section cardWrap">\n        <h2>Recipient Info</h2>');
const recipientInfoRaw = take('      <section className="section cardWrap">\n        <h2>Recipient Info</h2>', '      <section className="section demoSection">');
const demo = s.slice(s.indexOf('      <section className="section demoSection">'));

let recipientInfo = recipientInfoRaw.text;

const ctaMatch = recipientInfo.match(/\n\s*<button[\s\S]*?Create My Video[\s\S]*?<\/button>\s*\n\s*<div className="actionNote">[\s\S]*?<\/div>/);

let finalCta = "";
if (ctaMatch) {
  finalCta = `
      <section className="section cardWrap">
${ctaMatch[0]}
      </section>

`;
  recipientInfo = recipientInfo.replace(ctaMatch[0], "");
}

const beforeReturn = s.slice(0, s.indexOf('      <section className="hero">'));

const rebuilt =
  beforeReturn +
  hero.text +
  senderInfo.text +
  recipientInfo +
  messageStyle.text +
  startMsg.text +
  createVideo.text +
  characterSec.text +
  finalCta +
  demo;

fs.writeFileSync(path, rebuilt, "utf8");
console.log("Done: App.js reordered only.");
