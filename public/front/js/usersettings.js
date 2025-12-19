// تعريف المتغيرات العامة
const token = localStorage.getItem("authToken");
const user = JSON.parse(localStorage.getItem("user"));

// تحقق من الصلاحية
function checkAuth() {
  if (!token || !user || user.role !== "tree_creator") {
    window.location.href = "login.html";
  }
}

// عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", async () => {
  checkAuth();

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
    // الصورة الشخصية
    if (userData.profile_picture) {
      // لو السيرفر راجع مسار نسبي زي "profile_picture/xxx.jpg"
      const imgUrl = `/storage/${userData.profile_picture}`;
      document.getElementById("previewImage").src = imgUrl;
    } else {
      // صورة افتراضية لو مفيش
      document.getElementById("previewImage").src =
        "images/ee70e67145f7c4e8ce7cdba6489664e620f4a5ad (3).jpg";
    }

    console.log("بيانات المستخدم:", data);
  } catch (error) {
    console.error("حدث خطأ أثناء جلب بيانات المستخدم:", error);
  }

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
  .getElementById("profile_picture")
  .addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        document.getElementById("previewImage").src = event.target.result;
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

  // ** كود تسجيل الخروج خارج اللوب **
  document
    .querySelector(".nav-link.text-danger")
    .addEventListener("click", async function (e) {
      e.preventDefault();

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
