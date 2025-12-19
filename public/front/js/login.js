// قاموس الترجمة لرسائل Laravel
const laravelMessages = {
  "These credentials do not match our records.": "بيانات الاعتماد غير صحيحة.",
  "The given data was invalid.": "البيانات المدخلة غير صحيحة.",
  "Too many login attempts. Please try again later.":
    "محاولات تسجيل الدخول كثيرة جدًا. حاول لاحقًا.",
};

// دالة لترجمة الرسائل
function translateLaravelMessage(message) {
  return laravelMessages[message] || message;
}

// دالة لعرض/إخفاء مؤشر التحميل
function toggleLoading(show) {
  const submitBtn = document.getElementById("submitBtn");
  const spinner = document.getElementById("spinner");

  if (show) {
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<span id="spinner" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> جاري المعالجة...';
  } else {
    submitBtn.disabled = false;
    spinner.classList.add("d-none");
    submitBtn.textContent = "تسجيل الدخول";
  }
}

// معالجة الفورم
document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    document.getElementById("error-message").innerText = "";
    toggleLoading(true); // عرض مؤشر التحميل

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // تحقق من حالة الحساب
        if (data.user.status === "banned") {
          document.getElementById("error-message").innerText =
            "تم حظر حسابك نهائيًا. يرجى التواصل مع الدعم.";
          toggleLoading(false);
          return;
        } else if (data.user.status === "suspended") {
          document.getElementById("error-message").innerText =
            "حسابك موقوف مؤقتًا. يرجى التواصل مع الدعم لإعادة التفعيل.";
          toggleLoading(false);
          return;
        }

        // حفظ التوكن والمستخدم بشكل موحد
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        const hasTree = data.hasTreeData ?? data.has_tree_data ?? false;
        localStorage.setItem("hasTreeData", hasTree ? "true" : "false");
        localStorage.setItem("userRole", data.user.role);

        // التوجيه حسب الدور
        if (data.user.role === "admin") {
          window.location.href = "AdminDashboard.html";
        } else if (data.user.role === "tree_creator") {
          if (data.hasTreeData || data.has_tree_data === true) {
            window.location.href = "shagertk.html";
          } else {
            window.location.href = "start.html";
          }
        } else if (data.user.role === "admin_assistant") {
          window.location.href = "AdminAssistant.html";
        } else {
          window.location.href = "Home.html";
        }
      } else {
        document.getElementById("error-message").innerText =
          translateLaravelMessage(data.message);
        toggleLoading(false);
      }
    } catch (error) {
      document.getElementById("error-message").innerText =
        "تعذر الاتصال بالسيرفر";
      toggleLoading(false);
    }
  });

// مسح رسالة الخطأ عند الكتابة
document.querySelectorAll("#loginForm input").forEach((input) => {
  input.addEventListener("input", () => {
    document.getElementById("error-message").innerText = "";
  });
});
