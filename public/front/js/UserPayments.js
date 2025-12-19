document.addEventListener("DOMContentLoaded", function () {
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
});

// active class
document.querySelectorAll(".sidebar li").forEach((li) => {
  li.addEventListener("click", () => {
    document
      .querySelectorAll(".sidebar li")
      .forEach((item) => item.classList.remove("active"));
    li.classList.add("active");
  });
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

// ------------------ TRANSACTIONS -------------------
let currentPage = 1;
let totalPages = 1;
let currentSearch = "";

async function fetchTransactions(page = 1, search = "") {
  try {
    currentSearch = search;
    const url = new URL("/api/viewPayments", window.location.origin);
    url.searchParams.append("page", page);
    if (search) url.searchParams.append("search", search);

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
    });

    if (!response.ok) throw new Error("فشل تحميل البيانات");
    const data = await response.json();

    renderTransactions(data.data);
    updatePagination(data);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    document.getElementById(
      "transactionsTableBody"
    ).innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">تعذر تحميل البيانات.</td></tr>`;
  }
}

function renderTransactions(transactions) {
  const tableBody = document.getElementById("transactionsTableBody");
  tableBody.innerHTML = "";

  if (!transactions.length) {
    tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">لا توجد معاملات حالياً.</td></tr>`;
    return;
  }

  // تحويل أسماء الخطط من الإنجليزية إلى العربية
  const planTranslations = {
    primary: "الخطة الأساسية",
    advanced: "الخطة المتقدمة",
    custom: "الخطة المخصصة",
    featured: "الخطة المميزة",
  };

  transactions.forEach((txn) => {
    const statusClass =
      {
        active: "bg-success text-white",
        expired: "bg-secondary text-white",
        suspended: "bg-warning text-dark",
      }[txn.status] || "bg-light text-dark";

    const user = txn.user || {};
    const plan = txn.plan || {};
    const planNameAr = planTranslations[plan.plan] || "—";

    // تنسيق التاريخ بالإنجليزية (Month Day, Year)
    const formatDate = (dateStr) =>
      new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>#${txn.id}</td>
      <td class="text-start">
        <div class="d-flex align-items-center gap-2">
          <img src="${
            user.profile_picture
              ? "/storage/" + user.profile_picture
              : "images/tree%201.png"
          }" alt="Avatar" width="40" height="40" class="rounded-circle">
          <div>
            <strong>${user.name || "غير معروف"}</strong><br>
            <small class="text-muted">${user.email || ""}</small>
          </div>
        </div>
      </td>
      <td style="font-family: 'Poppins', sans-serif; font-weight: 500;">
        ${formatDate(txn.start_date)} - ${formatDate(txn.end_date)}
      </td>
      <td>${planNameAr}</td>
      <td class="fw-bold text-dark d-flex align-items-center justify-content-center gap-1">
        ${plan.price || "0.00"} 
<img src="images/Vector (14).png" alt="" style="width: 16px; height: 16px;">      <td>
        <span class="badge ${statusClass} px-3 py-2">
          ${
            txn.status === "active"
              ? "نشط"
              : txn.status === "expired"
              ? "منتهي"
              : txn.status === "suspended"
              ? "معلق"
              : "غير محدد"
          }
        </span>
      </td>
      <td>بطاقة ائتمان</td>
    `;

    tableBody.appendChild(row);
  });
}

function updatePagination(data) {
  document.getElementById("current-page").textContent = data.current_page;
  document.getElementById("total-pages").textContent = data.last_page;
  document.getElementById(
    "items-info"
  ).textContent = `عرض ${data.from}-${data.to} من ${data.total} معاملة`;

  currentPage = data.current_page;
  totalPages = data.last_page;
}

document.getElementById("prev-page").addEventListener("click", () => {
  if (currentPage > 1) fetchTransactions(currentPage - 1, currentSearch);
});
document.getElementById("next-page").addEventListener("click", () => {
  if (currentPage < totalPages)
    fetchTransactions(currentPage + 1, currentSearch);
});

// دالة رئيسية لتحميل كل البيانات
function initDashboardData() {
  fetchTransactions();
}

// تنفيذ الدالة عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  initDashboardData();

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

// تم حذف جميع الدوال القديمة لتجنب التكرار - النظام الجديد موجود أدناه

// ===== نظام رفع الصور المحسن =====

// متغيرات عامة لنظام رفع الصور
const defaultCardImage = "images/Group (14).png";
let currentImageFile = null;

// تهيئة نظام رفع الصور عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 تحميل الصفحة - بدء التهيئة...");

  // تأخير بسيط للتأكد من تحميل المودال
  setTimeout(() => {
    initImageUploadSystem();
    loadUploadedCardImage(); // تحميل الصورة المرفوعة المحفوظة
  }, 100);

  // تأخير إضافي للتأكد من تحميل جميع العناصر
  setTimeout(() => {
    loadUploadedCardImage(); // محاولة ثانية للتأكد
  }, 500);
});

// تحميل إضافي عند اكتمال تحميل النافذة
window.addEventListener("load", function () {
  console.log("🌐 اكتمل تحميل النافذة - تحميل الصورة...");
  setTimeout(() => {
    loadUploadedCardImage();
  }, 200);
});

// دالة تهيئة نظام رفع الصور
function initImageUploadSystem() {
  console.log("🔧 تهيئة نظام رفع الصور...");

  const imageContainer = document.querySelector(".image-upload-container");
  const uploadOverlay = document.querySelector(".upload-overlay");
  const dragOverlay = document.getElementById("dragOverlay");

  console.log("📦 العناصر المطلوبة:", {
    imageContainer: !!imageContainer,
    uploadOverlay: !!uploadOverlay,
    dragOverlay: !!dragOverlay,
  });

  if (imageContainer && uploadOverlay) {
    console.log("✅ تم العثور على العناصر - إعداد الأحداث...");

    // تأثيرات hover
    imageContainer.addEventListener("mouseenter", function () {
      uploadOverlay.style.opacity = "1";
      this.querySelector(".card-preview").style.filter = "brightness(0.7)";
    });

    imageContainer.addEventListener("mouseleave", function () {
      uploadOverlay.style.opacity = "0";
      this.querySelector(".card-preview").style.filter = "brightness(1)";
    });

    // إعداد السحب والإفلات
    setupDragAndDropNew(imageContainer, dragOverlay);
    console.log("🎯 تم إعداد نظام رفع الصور بنجاح!");
  } else {
    console.error("❌ لم يتم العثور على العناصر المطلوبة لنظام رفع الصور");
  }
}

// دالة معاينة الصورة المحسنة
function previewCardImage(input) {
  console.log("📸 تم استدعاء دالة معاينة الصورة...");

  if (input.files && input.files[0]) {
    const file = input.files[0];
    console.log(
      "📁 تم اختيار ملف:",
      file.name,
      "حجم:",
      (file.size / 1024).toFixed(2) + "KB"
    );

    // التحقق من صحة الملف
    if (validateAndPreviewImage(file)) {
      previewSelectedImage(file);
      showFileInfo(file);
      showImageControls();
      showUploadAlert("تم رفع الصورة بنجاح! 📸", "success");
      console.log("✅ تم رفع الصورة بنجاح!");
    } else {
      console.error("❌ فشل في التحقق من صحة الملف");
    }
  } else {
    console.warn("⚠️ لم يتم اختيار أي ملف");
  }
}

// دالة التحقق من صحة الملف ومعاينته
function validateAndPreviewImage(file) {
  // التحقق من نوع الملف
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  if (!allowedTypes.includes(file.type)) {
    showUploadAlert(
      "يرجى اختيار ملف صورة صحيح (PNG, JPG, JPEG, GIF, WebP) ❌",
      "error"
    );
    return false;
  }

  // التحقق من حجم الملف (5MB)
  if (file.size > 5 * 1024 * 1024) {
    showUploadAlert(
      "حجم الصورة كبير جداً! يرجى اختيار صورة أقل من 5 ميجابايت ⚠️",
      "error"
    );
    return false;
  }

  return true;
}

// دالة معاينة الصورة المحددة
function previewSelectedImage(file) {
  const reader = new FileReader();
  const preview = document.getElementById("cardImagePreview");

  reader.onload = function (e) {
    const imageUrl = e.target.result;

    // تحديث صورة المعاينة في المودال فقط
    preview.src = imageUrl;
    preview.classList.add("image-uploaded");

    // لا نعرض الصورة في المكان المحدد هنا - سيتم عرضها بعد الحفظ

    // تأثير بصري
    preview.style.transform = "scale(1.05)";
    setTimeout(() => {
      preview.style.transform = "scale(1)";
      preview.classList.remove("image-uploaded");
    }, 500);
  };

  reader.readAsDataURL(file);
  currentImageFile = file;
}

// دالة عرض الصورة المرفوعة في المكان المحدد
function displayUploadedCardImage(imageUrl) {
  const uploadedDisplay = document.getElementById("uploadedCardDisplay");
  const noImageMessage = document.getElementById("noImageMessage");
  const controlButtons = document.getElementById("imageControlButtons");

  if (uploadedDisplay && noImageMessage) {
    console.log("🖼️ عرض الصورة المرفوعة...");

    // حفظ الصورة في localStorage مع معلومات إضافية
    const imageData = {
      url: imageUrl,
      timestamp: Date.now(),
      saved: true,
    };
    localStorage.setItem("uploadedCardImage", imageUrl);
    localStorage.setItem("uploadedCardImageData", JSON.stringify(imageData));

    // إخفاء رسالة عدم وجود صورة
    noImageMessage.style.display = "none";

    // عرض الصورة
    uploadedDisplay.src = imageUrl;
    uploadedDisplay.style.display = "block";

    // إظهار أزرار التحكم
    if (controlButtons) {
      controlButtons.style.display = "block";
    }

    // تأثير بصري
    uploadedDisplay.style.opacity = "0";
    uploadedDisplay.style.transform = "scale(0.8)";

    setTimeout(() => {
      uploadedDisplay.style.opacity = "1";
      uploadedDisplay.style.transform = "scale(1)";
      uploadedDisplay.style.transition = "all 0.5s ease";
    }, 100);

    console.log("✅ تم عرض وحفظ الصورة المرفوعة بنجاح!");
  }
}

// دالة استدعاء الصورة من الباك إند
async function fetchCardImageFromBackend() {
  console.log("🌐 استدعاء الصورة من الباك إند...");

  try {
    // استدعاء آخر صورة بطاقة تم رفعها
    const response = await fetch("/api/payment/get-latest-card-image", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
    });

    console.log("📡 حالة الاستجابة:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("📡 استجابة الباك إند:", data);

      if (data.success && data.card_image) {
        console.log("✅ تم العثور على صورة في الباك إند");

        // إذا كانت الصورة مسار نسبي، أضف المسار الكامل
        let imageUrl = data.card_image;
        if (!imageUrl.startsWith("http") && !imageUrl.startsWith("data:")) {
          imageUrl =
            window.location.origin + "/" + imageUrl.replace(/^\/+/, "");
        }

        console.log("🖼️ رابط الصورة:", imageUrl);
        return imageUrl;
      } else {
        console.log(
          "ℹ️ لا توجد صورة في الباك إند:",
          data.message || "لا توجد بيانات"
        );
        return null;
      }
    } else {
      console.warn(
        "⚠️ خطأ في استدعاء الصورة من الباك إند:",
        response.status,
        response.statusText
      );

      // محاولة قراءة رسالة الخطأ
      try {
        const errorData = await response.json();
        console.log("📄 تفاصيل الخطأ:", errorData);
      } catch (e) {
        console.log("📄 لا يمكن قراءة تفاصيل الخطأ");
      }

      return null;
    }
  } catch (error) {
    console.error("❌ خطأ في الاتصال بالباك إند:", error);
    return null;
  }
}

// دالة استدعاء جميع البطاقات المحفوظة (اختيارية)
async function fetchAllCardImages() {
  console.log("🌐 استدعاء جميع صور البطاقات من الباك إند...");

  try {
    const response = await fetch("/api/payment/get-all-cards", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("📡 جميع البطاقات:", data);

      if (data.success && data.cards && data.cards.length > 0) {
        // إرجاع آخر بطاقة تم رفعها
        const latestCard = data.cards[data.cards.length - 1];
        return latestCard.card_image;
      }
    }

    return null;
  } catch (error) {
    console.error("❌ خطأ في استدعاء البطاقات:", error);
    return null;
  }
}

// دالة تحميل الصورة المحفوظة عند تحميل الصفحة
async function loadUploadedCardImage() {
  const uploadedDisplay = document.getElementById("uploadedCardDisplay");
  const noImageMessage = document.getElementById("noImageMessage");

  console.log("🔍 البحث عن صورة محفوظة...", {
    hasDisplay: !!uploadedDisplay,
    hasMessage: !!noImageMessage,
  });

  // أولاً: محاولة استدعاء الصورة من الباك إند
  const backendImageUrl = await fetchCardImageFromBackend();

  if (backendImageUrl && uploadedDisplay && noImageMessage) {
    console.log("📂 تم العثور على صورة في الباك إند - عرضها...");

    // عرض الصورة من الباك إند
    displayImageFromBackend(backendImageUrl);
    return;
  }

  // ثانياً: إذا لم توجد صورة في الباك إند، تحقق من localStorage
  const savedImage = localStorage.getItem("uploadedCardImage");
  const savedImageData = localStorage.getItem("uploadedCardImageData");

  console.log("🔍 البحث في التخزين المحلي...", {
    hasImage: !!savedImage,
    hasData: !!savedImageData,
  });

  // التحقق من صحة البيانات المحفوظة
  let isValidData = false;
  if (savedImageData) {
    try {
      const imageData = JSON.parse(savedImageData);
      isValidData = imageData.saved === true && imageData.url === savedImage;
      console.log("📊 بيانات الصورة المحلية:", imageData);
    } catch (e) {
      console.warn("⚠️ بيانات الصورة تالفة:", e);
    }
  }

  if (
    savedImage &&
    uploadedDisplay &&
    noImageMessage &&
    (isValidData || !savedImageData)
  ) {
    console.log("📂 تم العثور على صورة محفوظة محلياً - عرضها...");

    // إخفاء رسالة عدم وجود صورة
    noImageMessage.style.display = "none";

    // عرض الصورة المحفوظة
    uploadedDisplay.src = savedImage;
    uploadedDisplay.style.display = "block";
    uploadedDisplay.style.opacity = "1";
    uploadedDisplay.style.transform = "scale(1)";

    console.log("✅ تم تحميل الصورة المحفوظة محلياً!");
  } else if (!savedImage && !backendImageUrl) {
    console.log("ℹ️ لا توجد صورة محفوظة - عرض الرسالة الافتراضية");
    if (noImageMessage) {
      noImageMessage.style.display = "block";
    }
    if (uploadedDisplay) {
      uploadedDisplay.style.display = "none";
    }
  } else {
    console.error("❌ مشكلة في تحميل الصورة:", {
      uploadedDisplay: !!uploadedDisplay,
      noImageMessage: !!noImageMessage,
      validData: isValidData,
    });
  }
}

// دالة عرض الصورة من الباك إند
function displayImageFromBackend(imageUrl) {
  const uploadedDisplay = document.getElementById("uploadedCardDisplay");
  const noImageMessage = document.getElementById("noImageMessage");
  const controlButtons = document.getElementById("imageControlButtons");

  if (uploadedDisplay && noImageMessage) {
    console.log("🖼️ عرض الصورة من الباك إند...");

    // إخفاء رسالة عدم وجود صورة
    noImageMessage.style.display = "none";

    // عرض الصورة
    uploadedDisplay.src = imageUrl;
    uploadedDisplay.style.display = "block";

    // إظهار أزرار التحكم
    if (controlButtons) {
      controlButtons.style.display = "block";
    }

    // تأثير بصري
    uploadedDisplay.style.opacity = "0";
    uploadedDisplay.style.transform = "scale(0.8)";

    setTimeout(() => {
      uploadedDisplay.style.opacity = "1";
      uploadedDisplay.style.transform = "scale(1)";
      uploadedDisplay.style.transition = "all 0.5s ease";
    }, 100);

    console.log("✅ تم عرض الصورة من الباك إند بنجاح!");
  }
}

// دالة تحديث الصورة من الباك إند يدوياً
async function refreshImageFromBackend() {
  console.log("🔄 تحديث الصورة من الباك إند يدوياً...");

  // إظهار مؤشر التحميل
  const refreshBtn = document.querySelector(
    'button[onclick="refreshImageFromBackend()"]'
  );
  if (refreshBtn) {
    const originalHTML = refreshBtn.innerHTML;
    refreshBtn.innerHTML =
      '<i class="bi bi-arrow-clockwise spin"></i> جاري التحميل...';
    refreshBtn.disabled = true;
  }

  try {
    const backendImageUrl = await fetchCardImageFromBackend();

    if (backendImageUrl) {
      displayImageFromBackend(backendImageUrl);
      showUploadAlert("تم تحديث الصورة من الباك إند بنجاح! 🌐", "success");
    } else {
      showUploadAlert("لم يتم العثور على صورة في الباك إند ⚠️", "warning");
    }
  } catch (error) {
    console.error("❌ خطأ في تحديث الصورة:", error);
    showUploadAlert("حدث خطأ في تحديث الصورة من الباك إند ❌", "error");
  } finally {
    // استعادة الزر
    if (refreshBtn) {
      setTimeout(() => {
        refreshBtn.innerHTML =
          '<i class="bi bi-cloud-download me-2"></i>تحميل من الباك إند';
        refreshBtn.disabled = false;
      }, 1000);
    }
  }
}

// دالة إعداد السحب والإفلات المحسنة
function setupDragAndDropNew(container, dragOverlay) {
  // منع السلوك الافتراضي
  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    container.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
  });

  // تأثيرات بصرية عند السحب
  ["dragenter", "dragover"].forEach((eventName) => {
    container.addEventListener(eventName, highlight, false);
  });

  ["dragleave", "drop"].forEach((eventName) => {
    container.addEventListener(eventName, unhighlight, false);
  });

  // معالجة الإفلات
  container.addEventListener("drop", handleDrop, false);

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function highlight(e) {
    container.classList.add("drag-over");
    if (dragOverlay) {
      dragOverlay.style.display = "flex";
    }
  }

  function unhighlight(e) {
    container.classList.remove("drag-over");
    if (dragOverlay) {
      dragOverlay.style.display = "none";
    }
  }

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0) {
      const file = files[0];

      if (validateAndPreviewImage(file)) {
        previewSelectedImage(file);
        showFileInfo(file);
        showImageControls();
        showUploadAlert("تم رفع الصورة بنجاح! 🎉", "success");
      }
    }
  }
}

// دالة عرض معلومات الملف
function showFileInfo(file) {
  const fileInfo = document.getElementById("fileInfo");
  const fileName = document.getElementById("fileName");
  const fileSize = document.getElementById("fileSize");

  if (fileInfo && fileName && fileSize) {
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    fileInfo.style.display = "block";

    // تأثير ظهور
    fileInfo.style.opacity = "0";
    setTimeout(() => {
      fileInfo.style.opacity = "1";
    }, 100);
  }
}

// دالة تنسيق حجم الملف
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// دالة إظهار أزرار التحكم
function showImageControls() {
  const controls = document.getElementById("imageControls");
  if (controls) {
    controls.style.display = "block";
  }
}

// دالة إخفاء أزرار التحكم
function hideImageControls() {
  const controls = document.getElementById("imageControls");
  if (controls) {
    controls.style.display = "none";
  }
}

// دالة إعادة تعيين الصورة
function resetCardImage() {
  const preview = document.getElementById("cardImagePreview");
  const input = document.getElementById("cardImageInput");
  const fileInfo = document.getElementById("fileInfo");

  // إعادة تعيين القيم
  preview.src = defaultCardImage;
  input.value = "";
  currentImageFile = null;

  // إخفاء الصورة المرفوعة في الصفحة الرئيسية
  hideUploadedCardImage();

  // إخفاء العناصر
  if (fileInfo) {
    fileInfo.style.display = "none";
  }
  hideImageControls();

  // تأثير بصري
  preview.style.opacity = "0.5";
  setTimeout(() => {
    preview.style.opacity = "1";
  }, 200);

  showUploadAlert("تم إعادة تعيين الصورة 🔄", "info");
}

// دالة إخفاء الصورة المرفوعة وإظهار الرسالة
function hideUploadedCardImage() {
  const uploadedDisplay = document.getElementById("uploadedCardDisplay");
  const noImageMessage = document.getElementById("noImageMessage");
  const controlButtons = document.getElementById("imageControlButtons");

  if (uploadedDisplay && noImageMessage) {
    console.log("🔄 إخفاء الصورة المرفوعة...");

    // حذف الصورة المحفوظة من localStorage
    localStorage.removeItem("uploadedCardImage");
    localStorage.removeItem("uploadedCardImageData");

    // إخفاء الصورة
    uploadedDisplay.style.display = "none";
    uploadedDisplay.src = "";

    // إخفاء أزرار التحكم
    if (controlButtons) {
      controlButtons.style.display = "none";
    }

    // إظهار رسالة عدم وجود صورة
    noImageMessage.style.display = "block";

    console.log("✅ تم إخفاء الصورة وحذف البيانات المحفوظة!");
  }
}

// دالة إظهار رسائل التنبيه المحسنة
function showUploadAlert(message, type = "success") {
  const alertDiv = document.createElement("div");
  const alertClass =
    {
      success: "alert-success",
      error: "alert-danger",
      info: "alert-info",
      warning: "alert-warning",
    }[type] || "alert-success";

  const iconClass =
    {
      success: "bi-check-circle-fill",
      error: "bi-exclamation-triangle-fill",
      info: "bi-info-circle-fill",
      warning: "bi-exclamation-triangle-fill",
    }[type] || "bi-check-circle-fill";

  alertDiv.className = `alert ${alertClass} alert-dismissible fade show upload-alert`;
  alertDiv.innerHTML = `
    <i class="bi ${iconClass} me-2"></i>
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

  document.body.appendChild(alertDiv);

  // إزالة تلقائية بعد 4 ثوان
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.remove();
    }
  }, 4000);
}

// دالة إعادة تعيين النظام عند إغلاق المودال
document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("addPaymentModal");

  if (modal) {
    // عند إغلاق المودال
    modal.addEventListener("hidden.bs.modal", function () {
      resetImageUpload();
    });

    // عند فتح المودال - تأكد من تهيئة النظام
    modal.addEventListener("shown.bs.modal", function () {
      setTimeout(() => {
        initImageUploadSystem();
      }, 100);
    });
  }
});

// دالة إعادة تعيين نظام الرفع (مع حذف الصورة المعروضة)
function resetImageUpload() {
  const preview = document.getElementById("cardImagePreview");
  const input = document.getElementById("cardImageInput");
  const fileInfo = document.getElementById("fileInfo");

  if (preview) preview.src = defaultCardImage;
  if (input) input.value = "";
  if (fileInfo) fileInfo.style.display = "none";

  // إخفاء الصورة المرفوعة أيضاً
  hideUploadedCardImage();

  hideImageControls();
  currentImageFile = null;
}

// دالة إعادة تعيين المودال فقط (بدون حذف الصورة المعروضة)
function resetImageUploadOnly() {
  const preview = document.getElementById("cardImagePreview");
  const input = document.getElementById("cardImageInput");
  const fileInfo = document.getElementById("fileInfo");

  if (preview) preview.src = defaultCardImage;
  if (input) input.value = "";
  if (fileInfo) fileInfo.style.display = "none";

  // لا نحذف الصورة المعروضة هنا لأنها تم حفظها بنجاح

  hideImageControls();
  currentImageFile = null;
}

// تحديث دالة إرسال النموذج لتشمل الصورة
document.addEventListener("DOMContentLoaded", function () {
  const cardForm = document.getElementById("cardForm");
  console.log("🔍 البحث عن النموذج:", !!cardForm);

  if (cardForm) {
    console.log("✅ تم العثور على النموذج - إضافة معالج الإرسال...");

    cardForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      console.log("📤 تم إرسال النموذج...");

      const form = e.target;
      const formData = new FormData(form);

      console.log("📋 بيانات النموذج:");
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }

      // إضافة الصورة إذا كانت موجودة
      if (currentImageFile) {
        formData.append("card_image", currentImageFile);
      }

      // إظهار مؤشر التحميل
      const submitBtn = document.querySelector(
        'button[type="submit"][form="cardForm"]'
      );
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2"></span>
        جاري الحفظ...
      `;
      submitBtn.disabled = true;

      try {
        const response = await fetch(
          "/api/tree_creator/payments/cards",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
            body: formData,
          }
        );

        const data = await response.json();

        if (response.ok) {
          showUploadAlert("تم حفظ البطاقة بنجاح! ✅", "success");
          console.log(data);

          // عرض الصورة في المكان المحدد بعد الحفظ الناجح
          console.log(
            "💾 تم حفظ البيانات بنجاح - استدعاء الصورة من الباك إند..."
          );

          // محاولة استدعاء الصورة من الباك إند أولاً
          setTimeout(async () => {
            const backendImageUrl = await fetchCardImageFromBackend();

            if (backendImageUrl) {
              console.log("🌐 تم استدعاء الصورة من الباك إند بنجاح!");
              displayImageFromBackend(backendImageUrl);
            } else if (currentImageFile) {
              console.log("📱 استخدام الصورة المحلية كبديل...");
              const reader = new FileReader();
              reader.onload = function (e) {
                displayUploadedCardImage(e.target.result);
                console.log("🖼️ تم عرض الصورة المحلية بعد الحفظ!");
              };
              reader.readAsDataURL(currentImageFile);
            } else {
              console.log("ℹ️ لا توجد صورة لعرضها");
            }
          }, 1000); // تأخير للسماح للباك إند بحفظ الصورة

          // إغلاق المودال بعد ثانيتين
          setTimeout(() => {
            const modal = bootstrap.Modal.getInstance(
              document.getElementById("addPaymentModal")
            );
            if (modal) {
              modal.hide();
            }
          }, 2000);

          // إعادة تعيين النموذج (بدون حذف الصورة المعروضة لأنها تم حفظها)
          form.reset();
          resetImageUploadOnly(); // دالة جديدة لإعادة تعيين المودال فقط
        } else {
          showUploadAlert(
            "خطأ: " + (data.message || "حدث خطأ في الحفظ") + " ❌",
            "error"
          );
          console.log(data.errors);
        }
      } catch (error) {
        console.error("Error:", error);
        showUploadAlert("حدث خطأ في الاتصال بالسيرفر ⚠️", "error");
      } finally {
        // استعادة النص الأصلي للزر
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }
});
