const email = localStorage.getItem("resetEmail");
const emailDisplay = document.getElementById("email-display");
if (!email) window.location.href = "forgeturpassword.html";
else emailDisplay.innerText = `تم إرسال رمز التحقق إلى "${email}"`;
emailDisplay.style.cssText =
  "text-align: right; direction: rtl; display: block;";

// عداد
let timeLeft = 30;
const timerElement = document.getElementById("timer");
const resendLink = document.getElementById("resend-link");

let countdown = setInterval(updateTimer, 1000);

function updateTimer() {
  if (timeLeft <= 0) {
    clearInterval(countdown);
    timerElement.innerText = "يمكنك إعادة إرسال الرمز الآن";
    resendLink.style.pointerEvents = "auto";
    resendLink.style.color = "#007bff";
  } else {
    timerElement.innerText = `00:${timeLeft < 10 ? "0" : ""}${timeLeft} ثانية`;
    timeLeft--;
  }
}

// إعادة الإرسال
resendLink.addEventListener("click", async () => {
  if (timeLeft > 0) return;

  try {
    const response = await fetch(
      "/api/password/request-reset",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );

    const data = await response.json();
    if (response.ok) {
      alert("تم إرسال رمز جديد.");
      timeLeft = 30;
      resendLink.style.pointerEvents = "none";
      resendLink.style.color = "gray";
      countdown = setInterval(updateTimer, 1000);
    } else {
      alert(data.message || "خطأ أثناء إعادة الإرسال.");
    }
  } catch (error) {
    console.error("Network error:", error);
    alert("تعذر الاتصال بالسيرفر.");
  }
});

// تحقق من الـ OTP
document.querySelector("form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const otp = Array.from(document.querySelectorAll(".otp-box"))
    .map((input) => input.value.replace(/\s+/g, "").trim()) // إزالة المسافات
    .join("")
    .toString(); // تأكيد أن القيمة نص

  if (otp.length !== 4 || !/^\d{4}$/.test(otp)) {
    alert("يرجى إدخال رمز تحقق مكون من 4 أرقام.");
    return;
  }

  console.log("OTP sent:", otp);

  try {
    const response = await fetch(
      "/api/password/verify-otp-only",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      alert("تم التحقق بنجاح. سيتم تحويلك.");
      window.location.href = "Home.html";
    } else {
      alert(data.message || "رمز التحقق غير صحيح.");
    }
  } catch (error) {
    console.error("Network error:", error);
    alert("تعذر الاتصال بالسيرفر.");
  }
});
