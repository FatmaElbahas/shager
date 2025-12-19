const token = localStorage.getItem("authToken");

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

function checkAuth() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!token || !user || user.role !== "admin") {
    window.location.href = "login.html";
  }
}


async function loadSettings() {
  try {
    const response = await fetch("/api/admin/settings", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("فشل تحميل الإعدادات");

    const settings = await response.json();

    // تحديث صورة اللوجو في الصفحة
    if (settings.platform_logo) {
      document.getElementById("platformLogo").src = getCorrectImageUrl(
        settings.platform_logo
      );
    }
  } catch (err) {
    console.error("خطأ في تحميل الإعدادات:", err);
  }
}


async function fetchCoupons() {
  const container = document.getElementById("couponsContainer");

  // إظهار مؤشر التحميل
  container.innerHTML = `
    <div class="col-12">
      <div class="coupon-loading">
        <div class="spinner"></div>
        <p class="text-muted">جاري تحميل الكوبونات...</p>
      </div>
    </div>
  `;

  try {
    const response = await fetch("/api/admin/coupons", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });

    const text = await response.text();
    console.log("Raw coupons response:", text);

    if (!response.ok) {
      throw new Error(`خطأ من السيرفر (${response.status}): ${text}`);
    }

    const coupons = JSON.parse(text);
    renderCoupons(coupons);
  } catch (error) {
    console.error("Error fetching coupons:", error);

    // عرض رسالة خطأ في الحاوية
    container.innerHTML = `
      <div class="col-12">
        <div class="text-center py-5">
          <div class="mb-3" style="font-size: 4rem; opacity: 0.3; color: #dc3545;">⚠️</div>
          <h5 class="text-danger mb-2">خطأ في تحميل الكوبونات</h5>
          <p class="text-muted mb-3">${error.message}</p>
          <button class="btn btn-custom" onclick="fetchCoupons()">
            <i class="fas fa-redo me-2"></i>إعادة المحاولة
          </button>
        </div>
      </div>
    `;

    showToast("تعذر تحميل الكوبونات: " + error.message, "error");
  }
}

function renderCoupons(coupons) {
  const container = document.getElementById("couponsContainer");
  container.innerHTML = "";

  if (!Array.isArray(coupons) || !coupons.length) {
    container.innerHTML = `
      <div class="col-12">
        <div class="no-coupons-container text-center">
          <div class="mb-4" style="font-size: 5rem; opacity: 0.4;">🎫</div>
          <h4 class="text-muted mb-3">لا توجد كوبونات متاحة</h4>
          <p class="text-muted mb-4">قم بإنشاء كوبون جديد لبدء عرض الخصومات لعملائك</p>
          <button class="btn btn-custom px-4 py-2" data-bs-toggle="modal" data-bs-target="#addCouponModal">
            <i class="fas fa-plus me-2"></i>إضافة كوبون جديد
          </button>
        </div>
      </div>
    `;
    return;
  }

  coupons.forEach((coupon) => {
    const isExpired = new Date(coupon.end_date) < new Date();
    const discountText =
      coupon.client_discount_type === "percentage"
        ? `${coupon.discount_value}%`
        : `${coupon.discount_value} ريال`;

    const card = document.createElement("div");
    card.className = "col-12 col-sm-6 col-lg-4 mb-4";
    card.innerHTML = `
      <div class="coupon-card ${isExpired ? "expired" : ""}" data-coupon-id="${
      coupon.id
    }">
        <!-- شارة الحالة -->
        <div class="coupon-status ${isExpired ? "expired" : ""}">
          ${isExpired ? "منتهي الصلاحية" : "نشط"}
        </div>
        
        <!-- تفاصيل الكوبون -->
        <div class="coupon-details">
          <h5 class="coupon-title">
            خصم ${discountText}
          </h5>
          
          <!-- كود الكوبون -->
          <div class="coupon-code" onclick="copyToClipboard('${
            coupon.code
          }')" title="انقر للنسخ">
            ${coupon.code}
          </div>
          
          <!-- وصف الكوبون -->
          <p class="coupon-description">
            ينتهي في: ${new Date(coupon.end_date).toLocaleDateString("ar-EG")}
          </p>
          
          <!-- معلومات إضافية -->
          <div class="coupon-info mt-2">
            <small class="text-muted d-block">
              <i class="fas fa-users me-1"></i>
              استخدام: ${coupon.usage_count || 0}/${coupon.usage_limit_total}
            </small>
            <small class="text-muted d-block">
              <i class="fas fa-tag me-1"></i>
              ${
                coupon.product_discount_type === "subscription"
                  ? "اشتراك"
                  : "خطة"
              }
            </small>
          </div>
        </div>
        
        <!-- الفاصل المنقط -->
        <div class="dotted-divider"></div>
        
        <!-- شعار الكوبون -->
        <div class="coupon-logo">
          <img src="${
            coupon.logo
              ? "/storage/" + coupon.logo
              : "images/Rectangle (1).png"
          }"
               alt="شعار الكوبون" onerror="this.src='images/Rectangle (1).png'">
        </div>
        
      
      </div>
    `;
    container.appendChild(card);
  });
}

// دالة نسخ كود الكوبون
function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      // إظهار رسالة نجاح
      showToast("تم نسخ كود الكوبون: " + text, "success");
    })
    .catch(() => {
      // fallback للمتصفحات القديمة
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      showToast("تم نسخ كود الكوبون: " + text, "success");
    });
}

// دالة تعديل الكوبون
function editCoupon(couponId) {
  // يمكن إضافة منطق التعديل هنا
  showToast("ميزة التعديل قيد التطوير", "info");
}

// دالة حذف الكوبون
function deleteCoupon(couponId) {
  if (confirm("هل أنت متأكد من حذف هذا الكوبون؟")) {
    deleteCouponFromServer(couponId);
  }
}

// دالة حذف الكوبون من السيرفر
async function deleteCouponFromServer(couponId) {
  try {
    const response = await fetch(
      `/api/admin/coupons/${couponId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          Accept: "application/json",
        },
      }
    );

    if (response.ok) {
      showToast("تم حذف الكوبون بنجاح", "success");
      fetchCoupons(); // إعادة تحميل الكوبونات
    } else {
      throw new Error("فشل في حذف الكوبون");
    }
  } catch (error) {
    console.error("Error deleting coupon:", error);
    showToast("تعذر حذف الكوبون: " + error.message, "error");
  }
}

// دالة إظهار الرسائل التوضيحية
function showToast(message, type = "info") {
  // إنشاء عنصر الرسالة
  const toast = document.createElement("div");
  toast.className = `alert alert-${
    type === "success" ? "success" : type === "error" ? "danger" : "info"
  } position-fixed`;
  toast.style.cssText = `
    top: 20px;
    right: 20px;
    z-index: 9999;
    min-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    border-radius: 8px;
    animation: slideInRight 0.3s ease;
  `;
  toast.innerHTML = `
    <div class="d-flex align-items-center">
      <i class="fas fa-${
        type === "success"
          ? "check-circle"
          : type === "error"
          ? "exclamation-circle"
          : "info-circle"
      } me-2"></i>
      ${message}
    </div>
  `;

  document.body.appendChild(toast);

  // إزالة الرسالة بعد 3 ثواني
  setTimeout(() => {
    toast.style.animation = "slideOutRight 0.3s ease";
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

// إضافة أنيميشن CSS للرسائل
const style = document.createElement("style");
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", fetchCoupons);

// عند إضافة كوبون جديد
document
  .querySelector("#couponForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const formData = new FormData(this);

    try {
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: formData,
      });

      const text = await response.text();
      console.log("Raw add coupon response:", text);

      if (!response.ok) {
        throw new Error(`خطأ (${response.status}): ${text}`);
      }

      showToast("تم إنشاء الكوبون بنجاح! 🎉", "success");
      bootstrap.Modal.getInstance(
        document.getElementById("addCouponModal")
      ).hide();
      this.reset();
      fetchCoupons();
    } catch (error) {
      console.error("Error adding coupon:", error);
      showToast("تعذر إضافة الكوبون: " + error.message, "error");
    }
  });

// ------------------ PROMOTIONS -------------------
async function fetchPromotions() {
  const container = document.getElementById("promotionsContainer");
  
  // إظهار مؤشر التحميل
  container.innerHTML = `
    <div class="col-12">
      <div class="promotions-loading">
        <div class="spinner"></div>
        <p class="text-muted">جاري تحميل العروض...</p>
      </div>
    </div>
  `;
  
  try {
    const response = await fetch("/api/admin/promotions", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });

    const text = await response.text();
    console.log("Raw promotions response:", text);

    if (!response.ok) {
      throw new Error(`خطأ من السيرفر (${response.status}): ${text}`);
    }

    const promotions = JSON.parse(text);
    renderPromotions(promotions);
  } catch (error) {
    console.error("Error fetching promotions:", error);
    
    // عرض رسالة خطأ في الحاوية
    container.innerHTML = `
      <div class="col-12">
        <div class="text-center py-5">
          <div class="mb-3" style="font-size: 4rem; opacity: 0.3; color: #dc3545;">🎁</div>
          <h5 class="text-danger mb-2">خطأ في تحميل العروض</h5>
          <p class="text-muted mb-3">${error.message}</p>
          <button class="btn btn-custom" onclick="fetchPromotions()">
            <i class="fas fa-redo me-2"></i>إعادة المحاولة
          </button>
        </div>
      </div>
    `;
    
    showToast("تعذر تحميل العروض: " + error.message, "error");
  }
}

function renderPromotions(promotions) {
  const container = document.getElementById("promotionsContainer");
  container.innerHTML = "";

  if (!Array.isArray(promotions) || !promotions.length) {
    container.innerHTML = `
      <div class="col-12">
        <div class="no-promotions-container text-center">
          <div class="mb-4" style="font-size: 5rem; opacity: 0.4;">🎁</div>
          <h4 class="text-muted mb-3">لا توجد عروض ترويجية متاحة</h4>
          <p class="text-muted mb-4">قم بإنشاء عرض ترويجي جديد لجذب العملاء الجدد</p>
          <button class="btn btn-custom px-4 py-2" data-bs-toggle="modal" data-bs-target="#addPromotionModal">
            <i class="fas fa-plus me-2"></i>إضافة عرض جديد
          </button>
        </div>
      </div>
    `;
    return;
  }

  promotions.forEach((promo) => {
    const isExpired = new Date(promo.end_date) < new Date();
    const discountText = promo.discount_type === "percentage" 
      ? `${promo.discount_value}%` 
      : `${promo.discount_value} ريال`;
    
    const card = document.createElement("div");
    card.className = "col-12 col-sm-6 col-lg-4 mb-4";
    card.innerHTML = `
      <div class="promotions-card ${isExpired ? 'expired' : ''}" data-promo-id="${promo.id}">
        <!-- شارة الحالة -->
        <div class="promo-status ${isExpired ? 'expired' : ''}">
          ${isExpired ? 'منتهي الصلاحية' : 'نشط'}
        </div>
        
        <!-- أيقونة العرض -->
        <div class="promo-icon">
          🎁
        </div>
        
        <!-- تفاصيل العرض -->
        <div class="promo-content">
          <h4 class="promo-title">
            خصم ${discountText}
          </h4>
          
          <p class="promo-subtitle">
            على أول اشتراك في
          </p>
          
          <div class="promo-service">
            ${promo.title}
          </div>
          
          <!-- معلومات إضافية -->
          <div class="promo-details mt-3">
            <div class="promo-date">
              <i class="fas fa-calendar-alt me-2"></i>
              ينتهي في: ${new Date(promo.end_date).toLocaleDateString("ar-EG")}
            </div>
            
            <div class="promo-usage mt-2">
              <i class="fas fa-users me-2"></i>
              استخدام: ${promo.usage_count || 0}/${promo.usage_limit || 'غير محدود'}
            </div>
          </div>
          
          <!-- زر العمل -->
          <div class="promo-action mt-4">
            <button class="btn-promo-action" onclick="copyPromoCode('${promo.code || 'PROMO' + promo.id}')">
              <i class="fas fa-copy me-2"></i>نسخ الكود
            </button>
          </div>
        </div>
        
        <!-- أزرار الإجراءات -->
        <div class="promo-actions">
          <button class="promo-action-btn edit" onclick="editPromotion(${promo.id})" title="تعديل">
            <i class="fas fa-edit"></i>
          </button>
          <button class="promo-action-btn delete" onclick="deletePromotion(${promo.id})" title="حذف">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// دالة نسخ كود العرض
function copyPromoCode(code) {
  navigator.clipboard.writeText(code).then(() => {
    showToast('تم نسخ كود العرض: ' + code, 'success');
  }).catch(() => {
    // fallback للمتصفحات القديمة
    const textArea = document.createElement('textarea');
    textArea.value = code;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showToast('تم نسخ كود العرض: ' + code, 'success');
  });
}

// دالة تعديل العرض
function editPromotion(promoId) {
  // يمكن إضافة منطق التعديل هنا
  showToast('ميزة تعديل العروض قيد التطوير', 'info');
}

// دالة حذف العرض
function deletePromotion(promoId) {
  if (confirm('هل أنت متأكد من حذف هذا العرض الترويجي؟')) {
    deletePromotionFromServer(promoId);
  }
}

// دالة حذف العرض من السيرفر
async function deletePromotionFromServer(promoId) {
  try {
    const response = await fetch(`/api/admin/promotions/${promoId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      showToast('تم حذف العرض بنجاح', 'success');
      fetchPromotions(); // إعادة تحميل العروض
    } else {
      throw new Error('فشل في حذف العرض');
    }
  } catch (error) {
    console.error('Error deleting promotion:', error);
    showToast('تعذر حذف العرض: ' + error.message, 'error');
  }
}

document.addEventListener("DOMContentLoaded", fetchPromotions);

document
  .querySelector("#promotionForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const formData = new FormData(this);

    try {
      const response = await fetch(
        "/api/admin/promotions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: formData,
        }
      );

      const text = await response.text();
      console.log("Raw add promotion response:", text);

      if (!response.ok) {
        throw new Error(`خطأ (${response.status}): ${text}`);
      }

      showToast("تم إنشاء العرض الترويجي بنجاح! 🎊", "success");
      bootstrap.Modal.getInstance(
        document.getElementById("addPromotionModal")
      ).hide();
      this.reset();
      fetchPromotions();
    } catch (error) {
      console.error("Error adding promotion:", error);
      showToast("تعذر إضافة العرض: " + error.message, "error");
    }
  });


// تنفيذ الدالة عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  loadSettings();

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
