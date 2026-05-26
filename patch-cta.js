const fs = require("fs");

const p = "src/App.js";
let c = fs.readFileSync(p, "utf8");

if (!c.includes("Continue to Payment")) {
  const btn = `
          <button
            type="button"
            className="createBtn createBtn-submit"
            onClick={handleProceedToPayment}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Continue to Payment"}
          </button>
`;

  c = c.replace(
    '{statusMsg && <p className="statusMsg">{statusMsg}</p>}',
    btn + '\n        {statusMsg && <p className="statusMsg">{statusMsg}</p>}'
  );
}

fs.writeFileSync(p, c, "utf8");
console.log("Payment CTA added.");
