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

const form = document.getElementById("changePasswordForm");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(form);
  const data = {
    new_password: formData.get("new_password"),
    new_password_confirmation: formData.get("new_password_confirmation"),
  };

  axios
    .post("/api/change-password", data, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      alert(response.data.message);
    })
    .catch((error) => {
      if (error.response && error.response.data.errors) {
        const messages = Object.values(error.response.data.errors)
          .flat()
          .join("\n");
        alert(messages);
      } else {
        alert(error.response.data.message || "حدث خطأ");
      }
    });
});

// ✅ وظيفة حذف الحساب
const deleteBtn = document.getElementById("confirmDeleteBtn");

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

// تم نقل وظيفة تسجيل الخروج إلى logout.js المشترك
// لتجنب التكرار والتداخل

async function updateHeaderProfileImage() {
  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user"));
  const headerImg = document.querySelector(".profile");

  if (!headerImg) return;

  try {
    if (user && token) {
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
      const userData = data.profile ?? data.user ?? data;

      if (userData.profile_picture) {
        headerImg.src = `/storage/${userData.profile_picture}`;
      } else {
        headerImg.src = "images/images (25).png"; // صورة افتراضية
      }
    } else {
      headerImg.src = "images/images (25).png"; // صورة افتراضية لو مش عامل تسجيل دخول
    }
  } catch (error) {
    console.error("خطأ في تحميل صورة الهيدر:", error);
    headerImg.src = "images/images (25).png";
  }
}

updateHeaderProfileImage();

function updateFooter(settings) {
  // الشعار
  if (settings.platform_logo) {
    document.getElementById("footerLogo").src =
      settings.platform_logo + "?t=" + new Date().getTime();
  }

  // وصف المنصة
  if (settings.platform_description) {
    document.getElementById("footerDescription").textContent =
      settings.platform_description;
  }

  // رقم الهاتف
  if (settings.support_phone) {
    document.getElementById("footerPhone").textContent = settings.support_phone;
  }

  // ايميل الدعم الفني
  if (settings.support_email) {
    document.getElementById("footerEmail").textContent = settings.support_email;
  }

  // حسابات التواصل
  if (settings.facebook)
    document.getElementById("footerFacebook").href = settings.facebook;
  if (settings.instagram)
    document.getElementById("footerInstagram").href = settings.instagram;
  if (settings.twitter)
    document.getElementById("footerTwitter").href = settings.twitter;
  if (settings.youtube)
    document.getElementById("footerYoutube").href = settings.youtube;
}
updateFooter();
