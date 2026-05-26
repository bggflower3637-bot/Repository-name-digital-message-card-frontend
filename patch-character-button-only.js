const fs = require("fs");
const p = "src/App.js";
let c = fs.readFileSync(p, "utf8");

if (!c.includes("Character Video")) {
  const marker = `          <button
            type="button"
            className={\`modeCard mode-photo \${mode === "photo" ? "active" : ""}\`}
            onClick={() => setMode("photo")}
          >
            <div className="modeTitle">Photo Video - $9.99</div>
            <div className="modeDesc">Upload a photo for a talking photo video.</div>
          </button>`;

  const add = marker + `

          <button
            type="button"
            className={\`modeCard mode-character \${mode === "character" ? "active" : ""}\`}
            onClick={() => setMode("character")}
          >
            <div className="modeTitle">Character Video - $9.99</div>
            <div className="modeDesc">Choose a ready-made character for the video.</div>
          </button>`;

  c = c.replace(marker, add);
}

fs.writeFileSync(p, c, "utf8");
console.log("Character button added.");
