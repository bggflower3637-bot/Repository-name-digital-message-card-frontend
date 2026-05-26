const fs = require("fs");

const p = "src/App.js";
let c = fs.readFileSync(p, "utf8");

// 1) 가격 밑에 잘못 추가된 Continue to Payment 버튼 제거
c = c.replace(
/\s*<button\s+type="button"\s+className="createBtn createBtn-submit"\s+onClick=\{handleProceedToPayment\}\s+disabled=\{isSubmitting\}\s*>\s*\{isSubmitting \? "Processing\.\.\." : "Continue to Payment"\}\s*<\/button>\s*/g,
"\n"
);

// 2) 혹시 남아있는 Continue 문구 정리
c = c.replace(/Continue to Payment/g, "Create My Video");
c = c.replace(/Proceed to Payment/g, "Create My Video");

// 3) 최종 버튼이 Stripe 결제로 연결되는지 보장
c = c.replace(
/onClick=\{handleSubmit\}/g,
"onClick={handleProceedToPayment}"
);

// 4) Stripe에 type 전달 보장
if (!c.includes('formData.append("type", selectedProduct);')) {
  c = c.replace(
    'formData.append("email", email.trim());',
    'formData.append("email", email.trim());\n    formData.append("type", selectedProduct);'
  );
}

fs.writeFileSync(p, c, "utf8");
console.log("Frontend payment flow cleaned.");
