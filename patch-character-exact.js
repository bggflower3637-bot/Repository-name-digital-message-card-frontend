const fs = require("fs");
const p = "src/App.js";
let c = fs.readFileSync(p, "utf8");

if (!c.includes("Character Video")) {
  const photoTitle = '<div className="modeTitle">Photo Video — $9.99</div>';
  const photoIndex = c.indexOf(photoTitle);

  if (photoIndex === -1) {
    throw new Error("Photo Video title not found.");
  }

  const buttonEnd = c.indexOf("</button>", photoIndex);

  if (buttonEnd === -1) {
    throw new Error("Photo Video button end not found.");
  }

  const insertAt = buttonEnd + "</button>".length;

  const characterButton = `

          <button
            type="button"
            className={\`modeCard mode-character \${mode === "character" ? "active" : ""}\`}
            onClick={() => setMode("character")}
          >
            <div className="modeTitle">Character Video — $9.99</div>
            <div className="modeDesc">Choose a ready-made character for the video.</div>
          </button>`;

  c = c.slice(0, insertAt) + characterButton + c.slice(insertAt);
}

fs.writeFileSync(p, c, "utf8");
console.log("Character Video button inserted.");
