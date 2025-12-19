document.querySelector("form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const emailInput = document.querySelector('input[type="email"]');
  const email = emailInput.value.trim();

  if (!email) {
    alert("يرجى إدخال البريد الإلكتروني.");
    return;
  }

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
      localStorage.setItem("resetEmail", email);
      alert("تم إرسال رمز التحقق.");
      window.location.href = "otp.html";
    } else {
      alert(data.message || "فشل الإرسال.");
    }
  } catch (error) {
    console.error("Network error:", error);
    alert("تعذر الاتصال بالسيرفر.");
  }
});
