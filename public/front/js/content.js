let currentPage = 1;
let currentSearch = "";
let currentFilters = {
  status: "",
  activityType: "",
  dateRange: "",
  startDate: "",
  endDate: "",
};
const token = localStorage.getItem("authToken");

// التحقق من صلاحية الأدمن
function checkAuth() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!token || !user || user.role !== "admin") {
    window.location.href = "login.html";
  }
}

// دالة مساعدة لتصحيح مسارات الصور
function getCorrectImageUrl(imagePath) {
  if (!imagePath) return null;

  // إذا كان المسار يبدأ بـ /storage/ فهو من Laravel
  if (imagePath.startsWith("/storage/")) {
    return `http://127.0.0.1:8001/${imagePath}`;
  }

  // إذا كان مسار كامل، استخدمه كما هو
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // مسار نسبي، أضف Laravel server
  return `/storage/${imagePath}`;
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

// تعديل دالة loadActivities لدعم الفلترة
async function loadActivities(page = 1, search = "", filters = {}) {
  // عرض دائرة التحميل
  showLoading();
  showFilterSpinner();

  currentPage = page;
  currentSearch = search;
  currentFilters = { ...currentFilters, ...filters };

  try {
    // بناء URL مع المعاملات
    const params = new URLSearchParams({
      page: page,
      search: search,
      ...currentFilters,
    });

    // إزالة المعاملات الفارغة
    for (let [key, value] of params.entries()) {
      if (!value) {
        params.delete(key);
      }
    }

    const response = await fetch(
      `/api/admin/activities?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`خطأ: ${response.status}`);
    }

    const data = await response.json();
    displayActivities(data.data);
    updatePaginationControls(data);
    updateResultsCount(data);
    updateActiveFilters();
  } catch (error) {
    console.error("فشل تحميل الأنشطة:", error);
    showErrorToast("حدث خطأ أثناء تحميل البيانات");
  } finally {
    // إخفاء دائرة التحميل بغض النظر عن النتيجة
    hideLoading();
    hideFilterSpinner();
  }
}

// دوال التحكم بدائرة التحميل
function showLoading() {
  // إخفاء بيانات الجدول أثناء التحميل
  document.getElementById("activityTableBody").style.visibility = "hidden";

  // إظهار overlay و spinner
  document.getElementById("loadingOverlay").style.display = "block";
  document.getElementById("loadingSpinner").style.display = "block";
}

function hideLoading() {
  // إظهار بيانات الجدول بعد الانتهاء
  document.getElementById("activityTableBody").style.visibility = "visible";

  // إخفاء overlay و spinner
  document.getElementById("loadingOverlay").style.display = "none";
  document.getElementById("loadingSpinner").style.display = "none";
}

// دوال التحكم بمؤشر الفلترة
function showFilterSpinner() {
  const spinner = document.getElementById("filterSpinner");
  if (spinner) {
    spinner.classList.remove("d-none");
  }
}

function hideFilterSpinner() {
  const spinner = document.getElementById("filterSpinner");
  if (spinner) {
    spinner.classList.add("d-none");
  }
}

// تحديث عداد النتائج
function updateResultsCount(data) {
  const resultsCount = document.getElementById("resultsCount");
  if (resultsCount && data) {
    const total = data.total || 0;
    const from = data.from || 0;
    const to = data.to || 0;
    resultsCount.textContent = `عرض ${from}-${to} من ${total} نشاط`;
  }
}

// تحديث الفلاتر النشطة
function updateActiveFilters() {
  const activeFiltersDiv = document.getElementById("activeFilters");
  const filterTagsDiv = document.getElementById("filterTags");
  const filterCountBadge = document.getElementById("filterCount");

  if (!activeFiltersDiv || !filterTagsDiv) return;

  // مسح الفلاتر السابقة
  filterTagsDiv.innerHTML = "";

  let hasActiveFilters = false;
  let filterCount = 0;

  // إضافة فلتر الحالة
  if (currentFilters.status) {
    const statusText = getStatusArabic(currentFilters.status);
    addFilterTag("الحالة", statusText, "status");
    hasActiveFilters = true;
    filterCount++;
  }

  // إضافة فلتر نوع النشاط
  if (currentFilters.activityType) {
    const typeText = getActivityTypeArabic(currentFilters.activityType);
    addFilterTag("نوع النشاط", typeText, "activityType");
    hasActiveFilters = true;
    filterCount++;
  }

  // إضافة فلتر التاريخ
  if (currentFilters.dateRange) {
    const dateText = getDateRangeArabic(currentFilters.dateRange);
    addFilterTag("الفترة الزمنية", dateText, "dateRange");
    hasActiveFilters = true;
    filterCount++;
  }

  // إضافة فلتر البحث
  if (currentSearch) {
    addFilterTag("البحث", currentSearch, "search");
    hasActiveFilters = true;
    filterCount++;
  }

  // تحديث عداد الفلاتر في الزر
  if (filterCountBadge) {
    if (filterCount > 0) {
      filterCountBadge.textContent = filterCount;
      filterCountBadge.classList.remove("d-none");
    } else {
      filterCountBadge.classList.add("d-none");
    }
  }

  // إظهار أو إخفاء قسم الفلاتر النشطة
  if (hasActiveFilters) {
    activeFiltersDiv.classList.remove("d-none");
  } else {
    activeFiltersDiv.classList.add("d-none");
  }
}

// إضافة تاج فلتر
function addFilterTag(label, value, filterType) {
  const filterTagsDiv = document.getElementById("filterTags");
  if (!filterTagsDiv) return;

  const tag = document.createElement("div");
  tag.className = "filter-tag";
  tag.innerHTML = `
    <span>${label}: ${value}</span>
    <button class="remove-filter" onclick="removeFilter('${filterType}')">
      <i class="bi bi-x"></i>
    </button>
  `;

  filterTagsDiv.appendChild(tag);
}

// إزالة فلتر محدد
function removeFilter(filterType) {
  if (filterType === "search") {
    currentSearch = "";
    document.getElementById("activitySearch").value = "";
  } else {
    currentFilters[filterType] = "";

    // إعادة تعيين العنصر في الواجهة
    const elementMap = {
      status: "statusFilter",
      activityType: "activityTypeFilter",
      dateRange: "dateFilter",
    };

    const elementId = elementMap[filterType];
    if (elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        element.value = "";
      }
    }

    // إخفاء التاريخ المخصص إذا تم إزالة فلتر التاريخ
    if (filterType === "dateRange") {
      document.getElementById("customDateRange").classList.add("d-none");
      currentFilters.startDate = "";
      currentFilters.endDate = "";
    }
  }

  // إعادة تحميل البيانات
  loadActivities(1, currentSearch, currentFilters);
}

// إعادة تعيين جميع الفلاتر
function resetAllFilters() {
  // إعادة تعيين المتغيرات
  currentSearch = "";
  currentFilters = {
    status: "",
    activityType: "",
    dateRange: "",
    startDate: "",
    endDate: "",
  };

  // إعادة تعيين عناصر الواجهة
  document.getElementById("activitySearch").value = "";
  document.getElementById("statusFilter").value = "";
  document.getElementById("activityTypeFilter").value = "";
  document.getElementById("dateFilter").value = "";
  document.getElementById("startDate").value = "";
  document.getElementById("endDate").value = "";

  // إخفاء التاريخ المخصص
  document.getElementById("customDateRange").classList.add("d-none");

  // إعادة تحميل البيانات
  loadActivities(1, "", {});

  showSuccessToast("تم إعادة تعيين جميع الفلاتر");
}

// دوال الترجمة
function getActivityTypeArabic(type) {
  const types = {
    create: "إنشاء شجرة",
    edit: "تعديل شجرة",
    delete: "حذف عضو",
    add_member: "إضافة عضو",
  };
  return types[type] || type;
}

function getDateRangeArabic(range) {
  const ranges = {
    today: "اليوم",
    week: "هذا الأسبوع",
    month: "هذا الشهر",
    custom: "تاريخ مخصص",
  };
  return ranges[range] || range;
}

// دوال الإشعارات
function showSuccessToast(message) {
  Toastify({
    text: message,
    duration: 3000,
    close: true,
    gravity: "top",
    position: "right",
    backgroundColor: "#4CAF50",
    stopOnFocus: true,
    className: "toast-success",
  }).showToast();
}

function showErrorToast(message) {
  Toastify({
    text: message,
    duration: 3000,
    close: true,
    gravity: "top",
    position: "right",
    backgroundColor: "#f44336",
    className: "toast-error",
  }).showToast();
}

// تعديل حدث البحث لإضافة تأخير (Debounce) لتحسين الأداء
let searchTimer;
document
  .getElementById("activitySearch")
  .addEventListener("input", function () {
    const search = this.value.trim();

    clearTimeout(searchTimer);

    searchTimer = setTimeout(() => {
      loadActivities(1, search, currentFilters);
    }, 500);
  });

// عرض الأنشطة في الجدول
function displayActivities(activities) {
  const container = document.getElementById("activityTableBody");
  container.innerHTML = "";

  if (!activities.length) {
    container.innerHTML =
      "<tr><td colspan='7' class='text-center'>لا توجد أنشطة</td></tr>";
    return;
  }

  activities.forEach((activity) => {
    const status = activity.status; // ✅ الحالة الآن من activity نفسه
    let badgeColor = "",
      textColor = "",
      statusText = "";

    switch (status) {
      case "pending":
        badgeColor = "#FFF3CD";
        textColor = "#856404";
        statusText = "قيد الانتظار";
        break;
      case "approving":
        badgeColor = "#D4EDDA";
        textColor = "#155724";
        statusText = "تمت الموافقة";
        break;
      case "rejected":
        badgeColor = "#F8D7DA";
        textColor = "#721C24";
        statusText = "لم تتم الموافقه";
        break;
    }

    const statusBadge = `
      <span style="
        background-color: ${badgeColor};
        color: ${textColor};
        padding: 5px 12px;
        border-radius: 20px;
        font-weight: 600;
        display: inline-block;
        min-width: 100px;
        text-align: center;
      ">
        ${statusText}
      </span>
    `;

    const row = `
      <tr id="activity-row-${activity.id}"> <!-- ✅ ID النشاط وليس المستخدم -->
     <td class="text-center">${new Date(
       activity.created_at
     ).toLocaleDateString()}</td>
<td class="text-center">${activity.family_name || "-"}</td>
<td class="text-center">${activity.type || "-"}</td>
<td>
  <div class="d-flex justify-content-center align-items-center gap-2">
    <img src="${
      activity.user?.profile_picture
        ? "/storage/" + activity.user.profile_picture
        : "images/tree%201.png"
    }" 
         alt="User" class="rounded-circle" width="40" height="40">
    <div>
      <strong>${activity.user?.name || ""}</strong>
      <p class="text-muted mb-0">${activity.user?.email || ""}</p>
    </div>
  </div>
</td>

        <td class="text-center">${statusBadge}</td>
        <td class="text-center">
          <div class="dropdown">
            <a href="#" role="button" data-bs-toggle="dropdown">
              <i class="fas fa-ellipsis-v" style="color: gray;"></i>
            </a>
            <ul class="dropdown-menu text-center">
              <li><a class="dropdown-item" href="#" onclick="confirmStatusChange(${
                activity.id
              }, 'pending')">قيد الانتظار</a></li>
              <li><a class="dropdown-item" href="#" onclick="confirmStatusChange(${
                activity.id
              }, 'approving')">تمت الموافقة</a></li>
              <li><a class="dropdown-item" href="#" onclick="confirmStatusChange(${
                activity.id
              }, 'rejected')">لم تتم الموافقة</a></li>
            </ul>
          </div>
        </td>
      </tr>
    `;

    container.innerHTML += row;
  });
}

// تأكيد تغيير الحالة
function confirmStatusChange(userId, status) {
  const confirmChange = confirm(
    `هل أنت متأكد من تغيير حالة المستخدم إلى "${getStatusArabic(status)}"؟`
  );
  if (confirmChange) {
    updateStatus(userId, status);
  }
}

// تحديث الحالة
async function updateStatus(userId, status) {
  try {
    const response = await fetch(
      `/api/admin/activities/${userId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ status }),
      }
    );

    const responseData = await response.json(); // أضف هذا السطر
    console.log("استجابة الخادم:", responseData); // طباعة الاستجابة

    if (!response.ok) throw new Error("فشل في تحديث الحالة");

    // تحديث واجهة المستخدم مباشرة
    updateActivityRowStatus(userId, status);

    // رسائل النجاح المخصصة لكل حالة
    const successMessages = {
      pending: "تم تعيين الحالة إلى 'قيد الانتظار' بنجاح",
      approving: "تمت الموافقة على الطلب بنجاح",
      rejected: "تم رفض الطلب بنجاح",
    };

    // عرض إشعار النجاح
    Toastify({
      text: successMessages[status] || "تم تحديث الحالة بنجاح",
      duration: 3000,
      close: true,
      gravity: "top",
      position: "right",
      backgroundColor: "#4CAF50",
      stopOnFocus: true,
      className: "toast-success",
    }).showToast();
  } catch (error) {
    console.error(error);
    Toastify({
      text: "حدث خطأ أثناء تحديث الحالة: " + error.message,
      duration: 3000,
      close: true,
      gravity: "top",
      position: isRTL ? "left" : "right",
      backgroundColor: "#f44336",
      className: "toast-error",
    }).showToast();
  }
}

// تحديث صف النشاط مباشرة في الواجهة
function updateActivityRowStatus(userId, status) {
  const row = document.getElementById(`activity-row-${userId}`);
  if (!row) return;

  // تحديث البادج الخاص بالحالة
  const statusCell = row.querySelector("td:nth-child(5)");
  if (statusCell) {
    let badgeColor = "",
      textColor = "",
      statusText = "";

    switch (status) {
      case "pending":
        badgeColor = "#FFF3CD";
        textColor = "#856404";
        statusText = "قيد الانتظار";
        break;
      case "approving":
        badgeColor = "#D4EDDA";
        textColor = "#155724";
        statusText = "تمت الموافقة";
        break;
      case "rejected":
        badgeColor = "rgba(201, 75, 75, 0.2)";
        textColor = "rgba(201, 75, 75, 1)";
        statusText = "لم تتم الموافقه";
        break;
      default:
        badgeColor = "rgba(222, 192, 128, 0.2)";
        textColor = "rgba(211, 171, 85, 1)";
        statusText = "قيد الانتظار";
    }

    statusCell.innerHTML = `
      <span style="
        background-color: ${badgeColor};
        color: ${textColor};
        padding: 5px 12px;
        border-radius: 20px;
        font-weight: 600;
        display: inline-block;
        min-width: 100px;
        text-align: center;
      ">
        ${statusText}
      </span>
    `;
  }
}

// تحويل الحالة إلى عربي
function getStatusArabic(status) {
  switch (status) {
    case "pending":
      return "قيد الانتظار";
    case "approving":
      return "تمت الموافقة";
    case "rejected":
      return "لم تتم الموافقه";
  }
}

// إعداد الصفحات
function updatePaginationControls(data) {
  const totalPages = data.last_page;
  const totalItems = data.total;
  const from = data.from || 0;
  const to = data.to || 0;

  // تحديث النص: عرض x - y من z نشاط
  document.getElementById(
    "items-info"
  ).textContent = `عرض ${from}-${to} من ${totalItems} نشاط`;

  // تحديث أرقام الصفحات
  document.getElementById("current-page").textContent = data.current_page;
  document.getElementById("total-pages").textContent = totalPages;

  // تفعيل / تعطيل الأزرار
  document.getElementById("prev-page").disabled = data.current_page <= 1;
  document.getElementById("next-page").disabled =
    data.current_page >= totalPages;
}

// إعداد مستمعي أحداث الفلاتر
function setupFilterListeners() {
  // زر فتح نافذة الفلاتر
  const filterToggleBtn = document.getElementById("filterToggleBtn");
  if (filterToggleBtn) {
    filterToggleBtn.addEventListener("click", openFilterModal);
  }

  // زر إغلاق النافذة
  const closeFilterModal = document.getElementById("closeFilterModal");
  if (closeFilterModal) {
    closeFilterModal.addEventListener("click", closeFilterModal);
  }

  // إغلاق النافذة عند النقر خارجها
  const filterModal = document.getElementById("filterModal");
  if (filterModal) {
    filterModal.addEventListener("click", function (e) {
      if (e.target === this) {
        closeFilterModal();
      }
    });
  }

  // فلتر التاريخ - إظهار التاريخ المخصص
  const dateFilter = document.getElementById("dateFilter");
  if (dateFilter) {
    dateFilter.addEventListener("change", function () {
      const customDateRange = document.getElementById("customDateRange");
      if (this.value === "custom") {
        customDateRange.classList.remove("d-none");
      } else {
        customDateRange.classList.add("d-none");
      }
    });
  }

  // زر تطبيق الفلاتر
  const applyFilters = document.getElementById("applyFilters");
  if (applyFilters) {
    applyFilters.addEventListener("click", applyFiltersFromModal);
  }

  // زر مسح جميع الفلاتر
  const clearAllFilters = document.getElementById("clearAllFilters");
  if (clearAllFilters) {
    clearAllFilters.addEventListener("click", clearAllFiltersFromModal);
  }

  // زر إعادة تعيين الفلاتر (في الهيدر)
  const resetFilters = document.getElementById("resetFilters");
  if (resetFilters) {
    resetFilters.addEventListener("click", resetAllFilters);
  }

  // زر تحديث البيانات
  const refreshData = document.getElementById("refreshData");
  if (refreshData) {
    refreshData.addEventListener("click", function () {
      this.classList.add("pulse-animation");
      loadActivities(currentPage, currentSearch, currentFilters);

      setTimeout(() => {
        this.classList.remove("pulse-animation");
      }, 2000);
    });
  }

  // ربط البحث في المودال مع البحث الرئيسي
  const modalSearchInput = document.getElementById("modalSearchInput");
  if (modalSearchInput) {
    modalSearchInput.addEventListener("input", function () {
      document.getElementById("activitySearch").value = this.value;
    });
  }
}

// فتح نافذة الفلاتر
function openFilterModal() {
  const modal = document.getElementById("filterModal");
  const toggleBtn = document.getElementById("filterToggleBtn");

  if (modal) {
    modal.classList.add("show");
    toggleBtn.classList.add("active");

    // تحديث قيم الفلاتر في النافذة
    updateModalFilters();

    // منع التمرير في الخلفية
    document.body.style.overflow = "hidden";
  }
}

// إغلاق نافذة الفلاتر
function closeFilterModal() {
  const modal = document.getElementById("filterModal");
  const toggleBtn = document.getElementById("filterToggleBtn");

  if (modal) {
    modal.classList.remove("show");
    toggleBtn.classList.remove("active");

    // إعادة تفعيل التمرير
    document.body.style.overflow = "auto";
  }
}

// تحديث قيم الفلاتر في النافذة
function updateModalFilters() {
  document.getElementById("statusFilter").value = currentFilters.status || "";
  document.getElementById("activityTypeFilter").value =
    currentFilters.activityType || "";
  document.getElementById("dateFilter").value = currentFilters.dateRange || "";
  document.getElementById("startDate").value = currentFilters.startDate || "";
  document.getElementById("endDate").value = currentFilters.endDate || "";
  document.getElementById("modalSearchInput").value = currentSearch || "";

  // إظهار التاريخ المخصص إذا كان محدد
  const customDateRange = document.getElementById("customDateRange");
  if (currentFilters.dateRange === "custom") {
    customDateRange.classList.remove("d-none");
  } else {
    customDateRange.classList.add("d-none");
  }
}

// تطبيق الفلاتر من النافذة
function applyFiltersFromModal() {
  // جمع قيم الفلاتر
  currentFilters.status = document.getElementById("statusFilter").value;
  currentFilters.activityType =
    document.getElementById("activityTypeFilter").value;
  currentFilters.dateRange = document.getElementById("dateFilter").value;
  currentFilters.startDate = document.getElementById("startDate").value;
  currentFilters.endDate = document.getElementById("endDate").value;

  // تحديث البحث
  currentSearch = document.getElementById("modalSearchInput").value;
  document.getElementById("activitySearch").value = currentSearch;

  // تطبيق الفلاتر
  loadActivities(1, currentSearch, currentFilters);

  // إغلاق النافذة
  closeFilterModal();

  // إظهار رسالة نجاح
  showSuccessToast("تم تطبيق الفلاتر بنجاح");
}

// مسح جميع الفلاتر من النافذة
function clearAllFiltersFromModal() {
  // مسح جميع القيم
  document.getElementById("statusFilter").value = "";
  document.getElementById("activityTypeFilter").value = "";
  document.getElementById("dateFilter").value = "";
  document.getElementById("startDate").value = "";
  document.getElementById("endDate").value = "";
  document.getElementById("modalSearchInput").value = "";

  // إخفاء التاريخ المخصص
  document.getElementById("customDateRange").classList.add("d-none");

  showSuccessToast("تم مسح جميع الفلاتر");
}

// البحث المباشر
document.addEventListener("DOMContentLoaded", function () {
  checkAuth();
  loadActivities();
  loadSettings();
  setupFilterListeners();

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

document.getElementById("prev-page").addEventListener("click", () => {
  if (currentPage > 1)
    loadActivities(currentPage - 1, currentSearch, currentFilters);
});

document.getElementById("next-page").addEventListener("click", () => {
  const total = parseInt(document.getElementById("total-pages").textContent);
  if (currentPage < total)
    loadActivities(currentPage + 1, currentSearch, currentFilters);
});
