const fs = require("fs");
const p = "src/App.js";
let c = fs.readFileSync(p, "utf8");

if (!c.includes("Select Character")) {
  const marker = '      </section>\n\n      <section className="section cardWrap">\n        <h2>Message Style</h2>';

  const block = `

        {mode === "character" && (
          <>
            <h2>Select Character</h2>
            <p className="note">Choose a character to speak your message.</p>

            <div className="tabRow">
              <button
                type="button"
                className={\`tabBtn charGroupTab group-asian \${group === "asian" ? "active" : ""}\`}
                onClick={() => {
                  setGroup("asian");
                  setCharacter("aria");
                }}
              >
                Asian
              </button>

              <button
                type="button"
                className={\`tabBtn charGroupTab group-western \${group === "western" ? "active" : ""}\`}
                onClick={() => {
                  setGroup("western");
                  setCharacter("wm1");
                }}
              >
                Western
              </button>
            </div>

            <div className="grid">
              {chars.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCharacter(c.id)}
                  className={character === c.id ? "card selected" : "card"}
                >
                  <img src={c.image} alt={c.name} className="characterImage" />
                  <p>{c.name}</p>
                </button>
              ))}
            </div>

            <div className="selectedCharBox">
              Selected character: {chars.find((c) => c.id === character)?.name}
            </div>
          </>
        )}
`;

  if (!c.includes(marker)) {
    throw new Error("Could not find insert marker before Message Style.");
  }

  c = c.replace(marker, block + "\n" + marker);
}

fs.writeFileSync(p, c, "utf8");
console.log("Character select UI added.");
