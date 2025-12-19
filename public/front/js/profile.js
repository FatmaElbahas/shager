// تعريف المتغيرات العامة
const token = localStorage.getItem("authToken");

const user = JSON.parse(localStorage.getItem("user"));
const dashboardBtn = document.getElementById("dashboardBtn");
const dashboardLink = document.getElementById("dashboardLink");

if (user && user.role) {
  if (user.role === "admin") {
    dashboardBtn.style.display = "inline-block";
    dashboardLink.href = "AdminDashboard.html";
  } else if (user.role === "tree_creator") {
    dashboardBtn.style.display = "inline-block";
    dashboardLink.href = "UserDashboard.html";
  } else if (user.role === "admin_assistant") {
    dashboardBtn.style.display = "inline-block";
    dashboardLink.href = "AdminAssistant.html";
  }
}

// عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch(
      `/api/user-profiles/${user.id}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error("فشل في جلب البيانات");

    const data = await response.json();

    // شوفي إذا الريسبونس فيه كائن user أو profile
    const userData = data.profile ?? data.user ?? data;

    // الاسم
    document.querySelector('input[name="name"]').value = userData.name || "";
    // الوظيفة
    document.querySelector('input[name="job"]').value = userData.job || "";
    // تاريخ الميلاد
    document.querySelector('input[name="birth_date"]').value =
      userData.birth_date ? userData.birth_date.split("T")[0] : "";
    // الهاتف
    document.querySelector('input[name="phone"]').value = userData.phone || "";

    // الحالة الاجتماعية
    if (userData.social_status === "married") {
      document.querySelector('input[id="married"]').checked = true;
    } else {
      document.querySelector('input[id="single"]').checked = true;
    }

    // حالة الحياة
    const lifeStatus = document.querySelector('select[name="life_status"]');
    if (lifeStatus && userData.life_status) {
      lifeStatus.value = userData.life_status;
    }

    // الصورة الشخصية
    if (userData.profile_picture) {
      const imgUrl = `/storage/${userData.profile_picture}`;
      document.getElementById("previewImage").src = imgUrl;
      document.querySelector(".profile").src = imgUrl;
    } else {
      const defaultImg = "images/image (25).png";
      console.log("تطبيق الصورة الافتراضية:", defaultImg);

      const previewImg = document.getElementById("previewImage");
      const profileImg = document.querySelector(".profile");

      if (previewImg) {
        previewImg.src = defaultImg;
        previewImg.onerror = function () {
          console.error("فشل في تحميل الصورة الافتراضية:", defaultImg);
          this.src = "images/Frame 38.png"; // صورة احتياطية
        };
      }

      if (profileImg) {
        profileImg.src = defaultImg;
        profileImg.onerror = function () {
          console.error("فشل في تحميل الصورة الافتراضية للهيدر:", defaultImg);
          this.src = "images/Frame 38.png"; // صورة احتياطية
        };
      }
    }

    console.log("بيانات المستخدم:", data);
  } catch (error) {
    console.error("حدث خطأ أثناء جلب بيانات المستخدم:", error);
  }

  // تم نقل وظيفة تسجيل الخروج خارج DOMContentLoaded
});

document
  .getElementById("profile_picture")
  .addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const previewImg = document.getElementById("previewImage");
        const profileImg = document.querySelector(".profile");

        if (previewImg) {
          previewImg.src = event.target.result;
        }
        if (profileImg) {
          profileImg.src = event.target.result;
        }
      };
      reader.onerror = function () {
        console.error("خطأ في قراءة الملف");
        // إعادة تطبيق الصورة الافتراضية في حالة الخطأ
        const defaultImg = "images/image (25).png";
        document.getElementById("previewImage").src = defaultImg;
        document.querySelector(".profile").src = defaultImg;
      };
      reader.readAsDataURL(file);
    }
  });

// عند إرسال النموذج للتحديث
document
  .getElementById("updateForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!user || !user.id) {
      alert("المستخدم غير موجود");
      return;
    }

    const form = e.target;
    const formData = new FormData(form);
    formData.append("_method", "PUT");

    // إنشاء عنصر التحميل
    const loadingDiv = document.createElement("div");
    loadingDiv.id = "loadingMessage";
    loadingDiv.className = "text-center my-3";
    loadingDiv.innerHTML = `
      <div class="spinner-border text-warning" role="status">
        <span class="visually-hidden">جاري التحديث...</span>
      </div>
      <p class="mt-2">جاري تحديث البيانات...</p>
    `;

    // إظهار التحميل
    form.parentNode.insertBefore(loadingDiv, form);

    try {
      const response = await fetch(
        `/api/user-profiles/${user.id}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      // إزالة التحميل
      document.getElementById("loadingMessage")?.remove();

      if (!response.ok) {
        console.error("تفاصيل الخطأ:", result.errors);
        let messages = "حدثت الأخطاء التالية:\n";

        // ✅ تحديث صورة الهيدر بعد الحفظ
        if (result.profile?.profile_picture) {
          const newImgUrl = `/storage/${result.profile.profile_picture}`;
          document.querySelector(".profile").src = newImgUrl;
        }

        if (result.errors) {
          for (const key in result.errors) {
            messages += `- ${result.errors[key].join(", ")}\n`;
          }
        } else {
          messages += result.message || "فشل التحديث";
        }

        alert(messages);
        throw new Error(result.message || "فشل التحديث");
      }

      alert("تم تحديث البيانات بنجاح");
      console.log("الملف الشخصي بعد التحديث:", result.profile);
    } catch (error) {
      console.error("حدث خطأ أثناء تحديث البيانات:", error);
      // تأكد من إزالة رسالة التحميل في حالة الخطأ أيضًا
      document.getElementById("loadingMessage")?.remove();
    }
  });

// ✅ وظيفة حذف الحساب
const deleteBtn = document.getElementById("confirmDeleteBtnfinally");

console.log("البحث عن زر حذف الحساب:", deleteBtn);

if (deleteBtn) {
  console.log("تم العثور على زر حذف الحساب، إضافة event listener");
  deleteBtn.addEventListener("click", async function (e) {
    e.preventDefault();
    console.log("تم النقر على زر حذف الحساب");

    const userId = JSON.parse(localStorage.getItem("user")).id;
    const token = localStorage.getItem("authToken");

    console.log("User ID:", userId);
    console.log("Token:", token ? "موجود" : "غير موجود");

    // إظهار رسالة تحميل
    deleteBtn.disabled = true;
    deleteBtn.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2"></span>جاري الحذف...';

    try {
      console.log("إرسال طلب حذف الحساب...");
      const res = await axios.delete(
        `/api/user-profiles/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      console.log("تم حذف الحساب بنجاح:", res.data);

      // إظهار رسالة نجاح
      alert("تم حذف الحساب بنجاح");

      // مسح بيانات المستخدم والتوكن
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.removeItem("hasTreeData");
      localStorage.removeItem("userRole");

      // إعادة توجيه للصفحة الرئيسية
      window.location.href = "Home.html";
    } catch (error) {
      console.error("خطأ في حذف الحساب:", error);

      // إعادة تفعيل الزر
      deleteBtn.disabled = false;
      deleteBtn.innerHTML = "نعم ، احذف الحساب";

      // إظهار رسالة الخطأ
      const errorMessage =
        error.response?.data?.message ||
        "حدث خطأ أثناء حذف الحساب. يرجى المحاولة مرة أخرى.";
      alert(errorMessage);
    }
  });
} else {
  console.error("لم يتم العثور على زر حذف الحساب!");
}

async function updateFooterSettings() {
  const token = localStorage.getItem("authToken");
  if (!token) return; // إذا لم يكن هناك توكن، نتوقف

  try {
    const response = await fetch("/api/admin/settings", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("فشل تحميل إعدادات Footer");

    const settings = await response.json();

    document.getElementById("description").textContent =
      settings.platform_description ||
      "منصة رقمية تجمع القبائل والعائلات في مكان واحد، تتيح لك بناء شجرة عائلتك، استكشاف الجذور، متابعة المناسبات، والتواصل مع مجتمعك بكل سهولة.";
    document.getElementById("footerPhone").textContent =
      settings.support_phone || "+966 59 533 8665";
    document.getElementById("footerEmail").textContent =
      settings.support_email || "shaigratech@gmail.com";

    document.getElementById("footerYoutube").href = settings.youtube || "#";
    document.getElementById("footerTwitter").href = settings.twitter || "#";
    document.getElementById("footerInstagram").href = settings.instagram || "#";
    document.getElementById("footerFacebook").href = settings.facebook || "#";

    console.log("تم تحديث إعدادات Footer بنجاح");
  } catch (error) {
    console.error("خطأ في تحديث Footer:", error);
  }
}

// نجعل الدالة متاحة في جميع الصفحات
window.updateFooterSettings = updateFooterSettings;

updateFooterSettings();

// تم نقل وظيفة تسجيل الخروج إلى logout.js المشترك
// لتجنب التكرار والتداخل
