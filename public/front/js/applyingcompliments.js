let users = [];

function checkAuth() {
  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user || user.role !== "tree_creator") {
    alert("يجب تسجيل الدخول بحساب Tree Creator");
    window.location.href = "login.html";
    return;
  }
}

checkAuth(); // تأكد من الصلاحية عند تحميل الصفحة

document
  .getElementById("complaintForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const token = localStorage.getItem("authToken");
    const formData = new FormData(this);

    try {
      const response = await fetch(
        "/api/tree_creator/complaints",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        // هنا يتم عرض رسالة النجاح بشكل أكثر وضوحاً
        Swal.fire({
          icon: "success",
          title: "شكراً لك",
          html: '<div style="font-size:18px">تم استلام شكواك بنجاح وسنتواصل معك قريباً</div>',
          confirmButtonText: "تم",
          timer: 3000,
        });
        this.reset();
      } else {
        const errorMessage = data.errors
          ? Object.values(data.errors).flat().join("\n")
          : data.message || "تحقق من البيانات";

        Swal.fire({
          icon: "error",
          title: "فشل في الإرسال",
          text: errorMessage,
          confirmButtonText: "حسناً",
        });
      }
    } catch (error) {
      console.error("خطأ في الطلب:", error);
      Swal.fire({
        icon: "error",
        title: "حدث خطأ",
        text: "حدث خطأ أثناء إرسال الشكوى. حاول مرة أخرى.",
        confirmButtonText: "حسناً",
      });
    }
  });
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();

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

document
  .getElementById("confirmDeleteBtn")
  .addEventListener("click", async () => {
    if (!users || !users.id) {
      alert("المستخدم غير موجود.");
      return;
    }

    try {
      const response = await fetch(
        `/api/tree_creator/delete-account/${user.id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("خطأ في حذف الحساب:", result.message || result);
        alert("حدث خطأ أثناء حذف الحساب.");
        return;
      }

      // تنظيف التخزين المحلي وتوجيه المستخدم
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      alert("تم حذف الحساب بنجاح.");
      window.location.href = "login.html";
    } catch (error) {
      console.error("خطأ غير متوقع أثناء الحذف:", error);
      alert("فشل حذف الحساب. حاول مرة أخرى.");
    }
  });

const deleteBtn = document.getElementById("confirmDeleteBtn");

deleteBtn.addEventListener("click", async function () {
  const userId = JSON.parse(localStorage.getItem("user")).id;
  const token = localStorage.getItem("authToken");

  try {
    const res = await axios.delete(
      `/api/user-profiles/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
    // مسح بيانات المستخدم والتوكن
    alert(res.data.message);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    window.location.href = "/Home.html";
  } catch (error) {
    alert(error.response?.data?.message || "حدث خطأ أثناء الحذف");
  }
});

// وظيفة حذف الحساب المحسنة
document.addEventListener("DOMContentLoaded", function () {
  const deleteBtn = document.getElementById("confirmDeleteBtn");

  if (deleteBtn) {
    deleteBtn.addEventListener("click", async function () {
      // تأكيد إضافي قبل الحذف
      const finalConfirm = confirm(
        "هذا هو التأكيد الأخير!\n\nهل أنت متأكد 100% من رغبتك في حذف حسابك نهائياً؟\n\nلن تتمكن من استرداد أي من بياناتك بعد هذه الخطوة."
      );

      if (!finalConfirm) {
        return; // إلغاء العملية إذا لم يؤكد المستخدم
      }

      // إظهار مؤشر التحميل
      const originalText = deleteBtn.innerHTML;
      deleteBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        جاري الحذف...
      `;
      deleteBtn.disabled = true;

      try {
        const userId = user?.id;

        if (!userId || !token) {
          throw new Error("بيانات المستخدم غير صحيحة");
        }

        const response = await fetch(
          `/api/user-profiles/${userId}`,
          {
            method: "DELETE",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "فشل في حذف الحساب");
        }

        // إظهار رسالة نجاح
        showSuccessMessage(
          "تم حذف الحساب بنجاح. سيتم توجيهك إلى الصفحة الرئيسية..."
        );

        // تنظيف البيانات المحفوظة
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        localStorage.removeItem("mapPreferences");

        // إغلاق المودال
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("deleteModal")
        );
        if (modal) {
          modal.hide();
        }

        // التوجيه بعد 2 ثانية
        setTimeout(() => {
          window.location.href = "Home.html";
        }, 2000);
      } catch (error) {
        console.error("خطأ في حذف الحساب:", error);
        showErrorMessage(
          error.message || "حدث خطأ أثناء حذف الحساب. حاول مرة أخرى."
        );

        // استعادة النص الأصلي للزر
        deleteBtn.innerHTML = originalText;
        deleteBtn.disabled = false;
      }
    });
  }
});

// وظائف مساعدة لإظهار الرسائل
function showSuccessMessage(message) {
  const alertDiv = document.createElement("div");
  alertDiv.className =
    "alert alert-success alert-dismissible fade show position-fixed";
  alertDiv.style.cssText = `
    top: 20px;
    right: 20px;
    z-index: 9999;
    min-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  alertDiv.innerHTML = `
    <i class="bi bi-check-circle-fill me-2"></i>
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(alertDiv);

  // إزالة تلقائية بعد 5 ثوان
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.remove();
    }
  }, 5000);
}

function showErrorMessage(message) {
  const alertDiv = document.createElement("div");
  alertDiv.className =
    "alert alert-danger alert-dismissible fade show position-fixed";
  alertDiv.style.cssText = `
    top: 20px;
    right: 20px;
    z-index: 9999;
    min-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  alertDiv.innerHTML = `
    <i class="bi bi-exclamation-triangle-fill me-2"></i>
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(alertDiv);

  // إزالة تلقائية بعد 5 ثوان
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.remove();
    }
  }, 5000);
}
