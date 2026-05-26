const fs = require("fs");
const path = "src/App.js";
let s = fs.readFileSync(path, "utf8");

const start = s.indexOf("{!isListening ? (");
const marker = "🎙 Say it in your own words";
const markerIndex = s.indexOf(marker);

if (start < 0 || markerIndex < 0 || markerIndex < start) {
  throw new Error("Could not find voice button block.");
}

const endMarker = ")}</";
let end = s.indexOf(")}", markerIndex);
end = s.indexOf(")}", end + 2);

if (end < 0) {
  throw new Error("Could not find end of voice button block.");
}

end = end + 2;

const newBlock = `{isListening ? (
              <div className="micRecordArea">
                <button
                  type="button"
                  className="micCircleBtn recording"
                  onClick={finishVoiceRecording}
                  aria-label="Stop recording"
                >
                  ■
                </button>

                <div className="voiceWaveBars active">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((bar) => (
                    <span
                      key={bar}
                      style={{
                        height: Math.max(8, Math.min(44, micLevel / 2 + ((bar % 5) * 4)))
                      }}
                    />
                  ))}
                </div>

                <p className="micRecordText">Recording... tap the button when finished</p>
              </div>
            ) : (
              <div className="micRecordArea">
                <button
                  type="button"
                  className="micCircleBtn"
                  onClick={handleSpeakSituation}
                  aria-label="Start recording"
                >
                  🎙
                </button>

                <div className="voiceWaveBars">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((bar) => (
                    <span key={bar} style={{ height: 8 }} />
                  ))}
                </div>

                <p className="micRecordText">Tap the mic and say it in your own words</p>
              </div>
            )}`;

s = s.slice(0, start) + newBlock + s.slice(end);

fs.writeFileSync(path, s, "utf8");
console.log("Forced mic UI replacement done.");
