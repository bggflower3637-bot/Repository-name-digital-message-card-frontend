const fs = require("fs");
const path = "src/App.js";
let s = fs.readFileSync(path, "utf8");

const old1 = `>
                  🎙
                </button>`;

const old2 = `>
                  🎤
                </button>`;

const svg = `>
                  <svg
                    className="micIconSvg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="9" y="3" width="6" height="10" rx="3" />
                    <path d="M5 10v2a7 7 0 0 0 14 0v-2" />
                    <path d="M12 19v3" />
                    <path d="M8 22h8" />
                  </svg>
                </button>`;

if (s.includes(old1)) {
  s = s.replace(old1, svg);
} else if (s.includes(old2)) {
  s = s.replace(old2, svg);
} else {
  console.log("Mic emoji not found. It may already be replaced.");
}

fs.writeFileSync(path, s, "utf8");
console.log("Mic icon replaced with SVG.");
