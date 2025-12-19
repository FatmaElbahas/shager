const token = localStorage.getItem("authToken");
const user = JSON.parse(localStorage.getItem("user")); // ✅ جلب بيانات المستخدم

// دالة مساعدة لتصحيح مسارات الصور
function getCorrectImageUrl(imagePath) {
  if (!imagePath) return null;
  
  // إذا كان المسار يبدأ بـ /storage/ فهو من Laravel
  if (imagePath.startsWith('/storage/')) {
    return `http://127.0.0.1:8001/${imagePath}`;
  }
  
  // إذا كان مسار كامل، استخدمه كما هو
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // مسار نسبي، أضف Laravel server
  return `/storage/${imagePath}`;
}
// ✅ التحقق من صلاحية الدخول
function checkAuth() {
  if (!token || !user || user.role !== "tree_creator") {
    window.location.href = "login.html";
  }
}

// تحميل الإعدادات
async function loadSettings() {
  try {
    const response = await fetch("/api/admin/settings", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("فشل تحميل الإعدادات");
    const settings = await response.json();

    // بيانات المنصة
    document.querySelector('input[placeholder="www.shajaraTech.com"]').value =
      settings.platform_link || "";
    document.querySelector("textarea").value =
      settings.platform_description || "";
    if (settings.platform_logo) {
      document.getElementById("platformLogoPreview").src = getCorrectImageUrl(settings.platform_logo);
    }

    // الأمان
    document.getElementById("setting1").checked = !!settings.encryption_enabled;
    document.getElementById("setting2").checked =
      !!settings.security_provider_integration;
    document.getElementById("setting3").checked = !!settings.ssl_protection;
    document.getElementById("setting4").checked = !!settings.ddos_protection;

    // الدعم الفني
    document.querySelector('input[placeholder="+966 59 533 8665"]').value =
      settings.support_phone || "";
    document.querySelector('input[placeholder="shaigratech@gmail.com"]').value =
      settings.support_email || "";

    // حسابات التواصل
    document.querySelector('input[placeholder="حساب فيس بوك"]').value =
      settings.facebook || "";
    document.querySelector('input[placeholder="حساب انستجرام"]').value =
      settings.instagram || "";
    document.querySelector('input[placeholder="حساب تويتر"]').value =
      settings.twitter || "";
    document.querySelector('input[placeholder="رابط اليوتيوب"]').value =
      settings.youtube || "";
  } catch (err) {
    console.error("خطأ في تحميل الإعدادات:", err);
    alert("تعذر تحميل الإعدادات");
  }
}

async function saveSettings(formData) {
  try {
    const response = await fetch(
      "/api/admin/settings/update",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: formData,
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "فشل حفظ الإعدادات");

    alert("تم تحديث الإعدادات بنجاح");

    if (data.settings && data.settings.platform_logo) {
      const logoUrl = getCorrectImageUrl(data.settings.platform_logo);
      document.getElementById("platformLogoPreview").src = logoUrl + "?t=" + new Date().getTime();
    }
  } catch (err) {
    console.error("خطأ في تحديث الإعدادات:", err);
    alert("تعذر تحديث الإعدادات");
  }
}

// ربط الأحداث
document.addEventListener("DOMContentLoaded", () => {
  loadSettings();

  const platformLogoInput = document.getElementById("platformLogoInput");
  const platformLogoPreview = document.getElementById("platformLogoPreview");

  // زر تغيير الشعار
  document.getElementById("changeLogoBtn").addEventListener("click", (e) => {
    e.preventDefault();
    platformLogoInput.click();
  });

  // معاينة الشعار الجديد
  platformLogoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        platformLogoPreview.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // زر حفظ بيانات المنصة
  document
    .querySelector(".platform-card .btn.btn-custom")
    .addEventListener("click", (e) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append(
        "platform_link",
        document.querySelector('input[placeholder="www.shajaraTech.com"]').value
      );
      formData.append(
        "platform_description",
        document.querySelector("textarea").value
      );
      const logoFile = platformLogoInput.files[0];
      if (logoFile) formData.append("platform_logo", logoFile);
      saveSettings(formData);
    });

  // زر حفظ الأمان
  document
    .querySelector(".settings-card .btn.btn-custom")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append(
        "encryption_enabled",
        document.getElementById("setting1").checked ? 1 : 0
      );
      formData.append(
        "security_provider_integration",
        document.getElementById("setting2").checked ? 1 : 0
      );
      formData.append(
        "ssl_protection",
        document.getElementById("setting3").checked ? 1 : 0
      );
      formData.append(
        "ddos_protection",
        document.getElementById("setting4").checked ? 1 : 0
      );
      saveSettings(formData);
    });

  // زر حفظ الدعم الفني
  document
    .querySelector(".support-card .btn.btn-custom")
    .addEventListener("click", (e) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append(
        "support_phone",
        document.querySelector('input[placeholder="+966 59 533 8665"]').value
      );
      formData.append(
        "support_email",
        document.querySelector('input[placeholder="shaigratech@gmail.com"]')
          .value
      );
      saveSettings(formData);
    });

  // زر حفظ حسابات التواصل
  document
    .querySelector(".social-card .btn.btn-custom")
    .addEventListener("click", (e) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append(
        "facebook",
        document.querySelector('input[placeholder="حساب فيس بوك"]').value
      );
      formData.append(
        "instagram",
        document.querySelector('input[placeholder="حساب انستجرام"]').value
      );
      formData.append(
        "twitter",
        document.querySelector('input[placeholder="حساب تويتر"]').value
      );
      formData.append(
        "youtube",
        document.querySelector('input[placeholder="رابط اليوتيوب"]').value
      );
      saveSettings(formData);
    });

  // Sidebar toggle
  const sidebar = document.getElementById("sidebar");
  const toggler = document.querySelector(".navbar-toggler");
  const closeBtn = document.getElementById("close");

  toggler?.addEventListener("click", () => {
    sidebar.classList.toggle("show");
  });

  closeBtn?.addEventListener("click", () => {
    sidebar.classList.remove("show");
  });

  // تفعيل الـ active class للأصناف في الشريط الجانبي
  document.querySelectorAll(".sidebar li").forEach((li) => {
    li.addEventListener("click", () => {
      document
        .querySelectorAll(".sidebar li")
        .forEach((item) => item.classList.remove("active"));
      li.classList.add("active");
    });
  });

  // ** كود تسجيل الخروج خارج اللوب **
  document
    .querySelector(".nav-link.text-danger")
    .addEventListener("click", async function (e) {
      e.preventDefault();

      const token = localStorage.getItem("authToken");

      if (!token) {
        window.location.href = "login.html";
        return;
      }

      try {
        const response = await fetch("/api/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (response.ok) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          window.location.href = "login.html";
        } else {
          alert("فشل تسجيل الخروج");
        }
      } catch (error) {
        alert("خطأ في الاتصال بالسيرفر");
      }
    });
});
