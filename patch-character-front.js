const fs = require("fs");
const p = "src/App.js";
let c = fs.readFileSync(p, "utf8");

// 1) Character data 추가
if (!c.includes("const characterGroups")) {
  c = c.replace(
    "const tones = [",
`const characterGroups = {
  asian: [
    { id: "aria", name: "Aria", image: "/characters/asian/aria.jpg" },
    { id: "jae", name: "Jae", image: "/characters/asian/jae.jpg" },
    { id: "mina", name: "Mina", image: "/characters/asian/mina.jpg" },
    { id: "reo", name: "Reo", image: "/characters/asian/reo.jpg" },
    { id: "ryu", name: "Ryu", image: "/characters/asian/ryu.jpg" },
    { id: "soo", name: "Soo", image: "/characters/asian/soo.jpg" }
  ],
  western: [
    { id: "wm1", name: "Daniel", image: "/characters/western/wm1.jpg" },
    { id: "wm2", name: "Chris", image: "/characters/western/wm2.jpg" },
    { id: "bm1", name: "Marcus", image: "/characters/western/bm1.jpg" },
    { id: "wf1", name: "Emma", image: "/characters/western/wf1.jpg" },
    { id: "wf2", name: "Sophie", image: "/characters/western/wf2.jpg" },
    { id: "bf1", name: "Ava", image: "/characters/western/bf1.jpg" }
  ]
};

const tones = [`
  );
}

// 2) state 추가
if (!c.includes('const [group, setGroup] = useState("asian");')) {
  c = c.replace(
    'const [tone, setTone] = useState("warm");',
    'const [tone, setTone] = useState("warm");\n  const [group, setGroup] = useState("asian");\n  const [character, setCharacter] = useState("aria");'
  );
}

// 3) chars 변수 추가
if (!c.includes("const chars = characterGroups[group];")) {
  c = c.replace(
    "const voiceChunksRef = useRef([]);",
    "const voiceChunksRef = useRef([]);\n\n  const chars = characterGroups[group];"
  );
}

// 4) Character Video 버튼 추가
if (!c.includes("Character Video")) {
  c = c.replace(
`          <button
            type="button"
            className={\`modeCard mode-photo \${mode === "photo" ? "active" : ""}\`}
            onClick={() => setMode("photo")}
          >
            <div className="modeTitle">Photo Video — $9.99</div>
            <div className="modeDesc">Upload a photo for a talking photo video.</div>
          </button>`,
`          <button
            type="button"
            className={\`modeCard mode-photo \${mode === "photo" ? "active" : ""}\`}
            onClick={() => setMode("photo")}
          >
            <div className="modeTitle">Photo Video - $9.99</div>
            <div className="modeDesc">Upload a photo for a talking photo video.</div>
          </button>

          <button
            type="button"
            className={\`modeCard mode-character \${mode === "character" ? "active" : ""}\`}
            onClick={() => setMode("character")}
          >
            <div className="modeTitle">Character Video - $9.99</div>
            <div className="modeDesc">Choose a ready-made character for the video.</div>
          </button>`
  );
}

// 5) Character 선택 UI 추가
if (!c.includes("Select Character")) {
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

  c = c.replace(
    "      </section>\n\n      <section className=\"section cardWrap\">\n        <h2>Message Style</h2>",
    block + "\n      </section>\n\n      <section className=\"section cardWrap\">\n        <h2>Message Style</h2>"
  );
}

// 6) 결제 type: quick은 4.99, photo/character는 9.99
c = c.replace(
  'type: mode === "photo" ? "photo" : "quick",',
  'type: mode === "quick" ? "quick" : "photo",'
);

// 7) messageData에 character 정보 전달
c = c.replace(
  'group: "",\n        character: "",',
  'group: mode === "character" ? group : "",\n        character: mode === "character" ? character : "",\n        characterImageUrl: mode === "character" ? `${window.location.origin}/characters/${group}/${character}.jpg` : "",'
);

fs.writeFileSync(p, c, "utf8");
console.log("Character mode frontend added.");
