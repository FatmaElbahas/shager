// قاموس الترجمة للرسائل القادمة من Laravel
const laravelMessages = {
  "The email has already been taken.": "هذا البريد الإلكتروني مستخدم بالفعل.",
  "The given data was invalid.": "البيانات المدخلة غير صحيحة.",
  "These credentials do not match our records.":
    "بيانات الاعتماد هذه غير متطابقة مع سجلاتنا.",
  "Password confirmation does not match.": "تأكيد كلمة المرور غير متطابق.",
  "The password must be at least 8 characters.":
    "كلمة المرور يجب أن تكون 8 أحرف على الأقل.",
  "Too many login attempts. Please try again later.":
    "محاولات تسجيل الدخول كثيرة جدًا. يرجى المحاولة لاحقًا.",
  "registration failed. Please check the errors below.":
    "فشل التسجيل. يرجى التحقق من الأخطاء أدناه.",
};

// دالة لترجمة الرسائل
function translateLaravelMessage(message) {
  return laravelMessages[message] || message;
}

// معالجة الفورم
document
  .getElementById("registerForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    // مسح رسالة الخطأ السابقة
    document.getElementById("error-message").innerText = "";

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      document.getElementById("error-message").innerText =
        "كلمة المرور غير متطابقة";
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
          password_confirmation: confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // حفظ التوكن
        localStorage.setItem("authToken", data.token);

        // إظهار نافذة التحميل
        document.getElementById("loadingModal").style.display = "flex";

        // التحويل بعد ثانية
        setTimeout(() => {
          window.location.href = "/front/login.html";
        }, 1000);
      } else {
        // جلب الرسائل بشكل صحيح
        let errorMessage = data.message;
        if (data.errors) {
          errorMessage = Object.values(data.errors).flat().join(" ");
        }
        document.getElementById("error-message").innerText =
          translateLaravelMessage(errorMessage);
      }
    } catch (error) {
      document.getElementById("error-message").innerText =
        "تعذر الاتصال بالسيرفر";
    }
  });

// مسح رسالة الخطأ عند الكتابة
const inputs = document.querySelectorAll("#registerForm input");
inputs.forEach((input) => {
  input.addEventListener("input", () => {
    document.getElementById("error-message").innerText = "";
  });
});

// تسجيل الدخول بجوجل
document
  .getElementById("googleLoginBtn")
  .addEventListener("click", function () {
    window.location.href = "/api/auth/google/redirect";
  });
