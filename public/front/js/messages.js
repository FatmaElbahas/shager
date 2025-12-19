let currentPage = 1;
let totalPages = 1;
let currentSearch = "";
let currentFilters = {
  messageType: "",
  status: "",
  treeName: "",
  userName: ""
};
let isFilterActive = false;
let allMessages = []; // تخزين جميع الرسائل من الباك اند
const token = localStorage.getItem("authToken");

// التحقق من صلاحية المستخدم
function checkAuth() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!token || !user || user.role !== "admin") {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

// إنشاء شارة الحالة
function getStatusBadge(status) {
  const statusStyles = {
    resolved: { color: "#2E7D32", bg: "#E8F5E9", label: "تم الرد" },
    pending: { color: "#F9A825", bg: "#FFF8E1", label: "تحت المراجعة" },
  };

  const style = statusStyles[status] || statusStyles.unanswered;
  return `<span style="background-color:${style.bg}; color:${style.color}; padding:5px 12px; border-radius:20px; font-weight:600;">${style.label}</span>`;
}

// تحويل نوع الشكوى لنص مقروء
function getTypeText(type) {
  const types = {
    behavioral: "سلوكية",
    technical: "فنية",
    financial: "مالية",
    inquiry: "استفسار",
    other: "أخرى",
  };
  return types[type] || types.other;
}

// تحويل مصطلحات البحث العربية إلى إنجليزية
function normalizeSearchQuery(searchText) {
  const typeMap = {
    سلوكي: "behavioral",
    سلوكية: "behavioral",
    تقني: "technical",
    فني: "technical",
    فنية: "technical",
    مالي: "financial",
    مالية: "financial",
    أخرى: "other",
    استفسار: "inquiry",
  };

  const statusMap = {
    "تحت المراجعة": "pending",
    "تم الرد": "resolved",
  };

  // تحقق إذا كان النص يطابق أي من الأنواع أو الحالات بالعربية
  for (const [arabic, english] of Object.entries(typeMap)) {
    if (searchText.includes(arabic)) {
      return english;
    }
  }

  for (const [arabic, english] of Object.entries(statusMap)) {
    if (searchText.includes(arabic)) {
      return english;
    }
  }

  return searchText; // إذا لم يكن هناك تطابق، نعيد النص كما هو
}

// دالة مساعدة لتصحيح مسارات الصور
function getCorrectImageUrl(imagePath) {
  if (!imagePath) return null;

  // إذا كان المسار يبدأ بـ /storage/ فهو من Laravel
  if (imagePath.startsWith("/storage/")) {
    return `https://testnixt.com${imagePath}`;
  }

  // إذا كان مسار كامل، استخدمه كما هو
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // مسار نسبي، أضف Laravel server
  return `http://27.0.0.1:8001/storage/${imagePath}`;
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

// عرض حالة التحميل
function showLoadingState() {
  const tableBody = document.querySelector(".fade-table");
  tableBody.innerHTML = `
    <tr>
      <td colspan="6" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">جاري التحميل...</span>
        </div>
        <p class="mt-2">جاري ${
          currentSearch ? `البحث عن "${currentSearch}"` : "تحميل البيانات"
        }</p>
      </td>
    </tr>
  `;
}

// جلب الرسائل من الخادم
function fetchMessages(page = 1, search = "") {
  if (!checkAuth()) return;

  showLoadingState();

  const url = new URL("/api/messages", window.location.origin);

  url.searchParams.append("only_complaints", "1");
  url.searchParams.append("page", page);

  if (search && search.trim() !== "") {
    const normalizedSearch = normalizeSearchQuery(search.trim());
    url.searchParams.append("search", encodeURIComponent(normalizedSearch));
  }

  fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      "Accept-Language": "ar",
    },
  })
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      currentPage = data.current_page || 1;
      totalPages = data.last_page || 1;
      
      // تخزين جميع الرسائل
      allMessages = data || [];
      // تطبيق الفلاتر إذا كانت نشطة
      const messagesToShow = isFilterActive ? applyLocalFilters(allMessages) : allMessages;
      
      renderMessages(messagesToShow);
      updatePagination(data);
      updateFilterCount();
    })
    .catch((error) => {
      console.error("فشل تحميل البيانات:", error);
      showAlert("حدث خطأ أثناء جلب البيانات", "danger");
      renderMessages([]);
    });
}

// عرض الرسائل في الجدول
function renderMessages(messages) {
  console.log(messages)
  const tableBody = document.querySelector(".fade-table");
  tableBody.innerHTML = "";

  if (messages.length === 0) {
    const hasSearchOrFilter = currentSearch || isFilterActive;
    const iconClass = hasSearchOrFilter ? "fa-search" : "fa-inbox";
    let message = "لا توجد رسائل لعرضها";
    let details = "";
    
    if (currentSearch && isFilterActive) {
      message = "لا توجد نتائج مطابقة للبحث والفلاتر";
      details = `<small class="text-muted">البحث: ${currentSearch} | الفلاتر النشطة: ${Object.values(currentFilters).filter(v => v !== "").length}</small>`;
    } else if (currentSearch) {
      message = "لا توجد نتائج مطابقة للبحث";
      details = `<small class="text-muted">بحثت عن: ${currentSearch}</small>`;
    } else if (isFilterActive) {
      message = "لا توجد رسائل مطابقة للفلاتر";
      const activeFilters = Object.values(currentFilters).filter(v => v !== "").length;
      details = `<small class="text-muted">الفلاتر النشطة: ${activeFilters} | <button class="btn btn-sm btn-outline-primary" onclick="clearFilters()">مسح الفلاتر</button></small>`;
    }
    
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-4">
          <i class="fas ${iconClass} fs-1 text-muted mb-2"></i>
          <p class="mb-2">${message}</p>
          ${details}
        </td>
      </tr>
    `;
    return;
  }

  messages.forEach((message) => {
    const user = message.user || {};
    tableBody.innerHTML += `
      <tr>
        <td>
          <div class="d-flex justify-content-center text-right g-4">
            <img src="${
              user.profile_picture
                ? `http://27.0.0.1:8001/storage/${user.profile_picture}`
                : "images/tree 1.png"
            }" 
                 class="rounded-circle user-avatar-clickable" width="40" height="40"
                 style="cursor: pointer;"
                 onclick="viewMessageDetails(${message.id}, ${user.id || 0})"
                 onerror="this.onerror=null;this.src='images/tree 1.png';">
            <div class="mx-2">
              <strong>${user.name || "غير معروف"}</strong><br>
              <small class="text-muted">${user.email || "-"}</small>
            </div>
          </div>
        </td>
        <td class="text-center">${user.phone || "-"}</td>
<td class="text-center">${
      message.family_tree ? message.family_tree.tree_name : "-"
    }</td>
        <td class="text-center">${
          message.translated_type || getTypeText(message.type)
        }</td>
        <td class="text-center">${getStatusBadge(message.status)}</td>
        <td class="text-center">
          <div class="dropdown">
            <a href="#" class="text-secondary" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="fas fa-ellipsis-v fa-lg"></i>
            </a>
            <ul class="dropdown-menu dropdown-menu-end text-end shadow rounded-3">
              <li><a class="dropdown-item" href="#" onclick="updateStatus(${
                message.id
              }, 'resolved')">تم الرد</a></li>
              <li><a class="dropdown-item" href="#" onclick="updateStatus(${
                message.id
              }, 'pending')">تحت المراجعة</a></li>
            </ul>
          </div>
        </td>
      </tr>
    `;
  });
}

// تحديث واجهة الترقيم
function updatePagination(data) {
  const infoSpan = document.getElementById("items-info");
  const currentPageElement = document.getElementById("current-page");
  const totalPagesElement = document.getElementById("total-pages");
  const prevBtn = document.getElementById("prev-page");
  const nextBtn = document.getElementById("next-page");

  currentPageElement.textContent = data.current_page || 1;
  totalPagesElement.textContent = data.last_page || 1;

  const from = data.from || 0;
  const to = data.to || 0;
  const total = data.total || 0;
  infoSpan.textContent = `عرض ${from}-${to} من ${total} رسائل`;

  prevBtn.disabled = data.current_page === 1;
  nextBtn.disabled = data.current_page === data.last_page;

  prevBtn.querySelector("i").style.color = prevBtn.disabled
    ? "#6c757d"
    : "gold";
  nextBtn.querySelector("i").style.color = nextBtn.disabled
    ? "#6c757d"
    : "gold";
}

// تحديث حالة الرسالة
function updateStatus(id, status) {
  if (!confirm("هل أنت متأكد من تغيير حالة هذه الرسالة؟")) return;

  fetch(`/api/admin/messages/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
    body: JSON.stringify({ status }),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then(() => {
      fetchMessages(currentPage, currentSearch);
      showAlert("تم تحديث حالة الرسالة بنجاح", "success");
    })
    .catch((error) => {
      console.error("فشل تحديث الحالة:", error);
      showAlert("حدث خطأ أثناء تحديث الحالة", "danger");
    });
}

// عرض تنبيه
function showAlert(message, type) {
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
  alertDiv.style.zIndex = "1100";
  alertDiv.role = "alert";
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  document.body.appendChild(alertDiv);
  setTimeout(() => alertDiv.remove(), 5000);
}

// إعداد واجهة المستخدم
function setupUI() {
  // التنقل بين الصفحات
  document.getElementById("next-page").addEventListener("click", () => {
    if (currentPage < totalPages) fetchMessages(currentPage + 1, currentSearch);
  });

  document.getElementById("prev-page").addEventListener("click", () => {
    if (currentPage > 1) fetchMessages(currentPage - 1, currentSearch);
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

  // نظام البحث مع تأخير 500 مللي ثانية
  const searchInput = document.querySelector(".search-input");
  let searchTimeout;

  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentSearch = e.target.value.trim();
      if (currentSearch === "") {
        fetchMessages(1);
      } else {
        fetchMessages(1, currentSearch);
      }
    }, 500);
  });

  // تسجيل الخروج
  document
    .querySelector(".nav-link.text-danger")
    ?.addEventListener("click", async (e) => {
      e.preventDefault();
      if (!confirm("هل أنت متأكد من تسجيل الخروج؟")) return;

      try {
        const response = await fetch("/api/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            Accept: "application/json",
          },
        });

        if (response.ok) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          window.location.href = "login.html";
        } else {
          throw new Error("فشل تسجيل الخروج");
        }
      } catch (error) {
        console.error("Error:", error);
        showAlert("حدث خطأ أثناء تسجيل الخروج", "danger");
      }
    });
}

// عرض تفاصيل الرسالة
function viewMessageDetails(messageId, userId) {
  // حفظ معرف المستخدم في localStorage للوصول إليه في الصفحة التالية
  localStorage.setItem('selectedUserId', userId);
  localStorage.setItem('selectedMessageId', messageId); // نحتفظ بـ message_id أيضاً للرد
  
  // التوجه لصفحة تفاصيل الرسالة
  window.location.href = 'messagesingleprofile.html';
}

// ========== دوال الفلتر ==========

// تطبيق الفلاتر محلياً على البيانات
function applyLocalFilters(messages) {
  return messages.filter(message => {
    // فلتر نوع الرسالة
    if (currentFilters.messageType && message.type !== currentFilters.messageType) {
      return false;
    }
    
    // فلتر الحالة
    if (currentFilters.status && message.status !== currentFilters.status) {
      return false;
    }
    
    // فلتر اسم الشجرة
    if (currentFilters.treeName) {
      const treeName = message.tree_name || message.tree?.name || '';
      if (!treeName.toLowerCase().includes(currentFilters.treeName.toLowerCase())) {
        return false;
      }
    }
    
    // فلتر اسم المستخدم
    if (currentFilters.userName) {
      const userName = message.user?.name || message.user_name || '';
      if (!userName.toLowerCase().includes(currentFilters.userName.toLowerCase())) {
        return false;
      }
    }
    
    return true;
  });
}

// تبديل عرض لوحة الفلاتر
function toggleFilterPanel() {
  const filterPanel = document.getElementById('filterPanel');
  const filterToggle = document.getElementById('filterToggle');
  
  if (filterPanel.style.display === 'none' || filterPanel.style.display === '') {
    filterPanel.style.display = 'block';
    filterToggle.classList.add('active');
  } else {
    filterPanel.style.display = 'none';
    filterToggle.classList.remove('active');
  }
}

// تطبيق الفلاتر
function applyFilters() {
  // جمع قيم الفلاتر
  currentFilters.messageType = document.getElementById('messageTypeFilter').value;
  currentFilters.status = document.getElementById('statusFilter').value;
  currentFilters.treeName = document.getElementById('treeNameFilter').value.trim();
  currentFilters.userName = document.getElementById('userNameFilter').value.trim();
  
  // تحديد ما إذا كان هناك فلاتر نشطة
  isFilterActive = Object.values(currentFilters).some(value => value !== "");
  
  // تطبيق الفلاتر على البيانات المحفوظة
  const filteredMessages = isFilterActive ? applyLocalFilters(allMessages) : allMessages;
  
  // عرض النتائج المفلترة
  renderMessages(filteredMessages);
  
  // تحديث عداد الفلاتر
  updateFilterCount();
  
  // تحديث مظهر الزر
  updateFilterButtonState();
  
  // إخفاء لوحة الفلاتر
  document.getElementById('filterPanel').style.display = 'none';
  document.getElementById('filterToggle').classList.remove('active');
  
  // عرض رسالة نجاح
  showAlert(`تم تطبيق الفلاتر - عرض ${filteredMessages.length} من ${allMessages.length} رسالة`, 'success');
}

// مسح جميع الفلاتر
function clearFilters() {
  // مسح قيم الفلاتر
  document.getElementById('messageTypeFilter').value = '';
  document.getElementById('statusFilter').value = '';
  document.getElementById('treeNameFilter').value = '';
  document.getElementById('userNameFilter').value = '';
  
  // إعادة تعيين متغيرات الفلتر
  currentFilters = {
    messageType: "",
    status: "",
    treeName: "",
    userName: ""
  };
  isFilterActive = false;
  
  // عرض جميع الرسائل
  renderMessages(allMessages);
  
  // تحديث عداد الفلاتر
  updateFilterCount();
  
  // تحديث مظهر الزر
  updateFilterButtonState();
  
  // عرض رسالة نجاح
  showAlert('تم مسح جميع الفلاتر', 'info');
}

// إخفاء لوحة الفلاتر
function hideFilters() {
  document.getElementById('filterPanel').style.display = 'none';
  document.getElementById('filterToggle').classList.remove('active');
}

// تحديث عداد الفلاتر
function updateFilterCount() {
  const filterCount = document.getElementById('filterCount');
  const activeFiltersCount = Object.values(currentFilters).filter(value => value !== "").length;
  
  if (activeFiltersCount > 0) {
    const wasHidden = filterCount.style.display === 'none';
    filterCount.textContent = activeFiltersCount;
    filterCount.style.display = 'flex';
    
    // إضافة تأثير pulse عند التحديث
    if (wasHidden) {
      filterCount.style.animation = 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    } else {
      filterCount.classList.add('pulse');
      setTimeout(() => filterCount.classList.remove('pulse'), 800);
    }
  } else {
    filterCount.style.display = 'none';
  }
}

// تحديث حالة زر الفلتر
function updateFilterButtonState() {
  const filterToggle = document.getElementById('filterToggle');
  const mobileFilterToggle = document.getElementById('mobileFilterToggle');
  
  if (isFilterActive) {
    filterToggle.classList.add('active');
    mobileFilterToggle.classList.remove('btn-outline-primary');
    mobileFilterToggle.classList.add('btn-success');
  } else {
    filterToggle.classList.remove('active');
    mobileFilterToggle.classList.remove('btn-success');
    mobileFilterToggle.classList.add('btn-outline-primary');
  }
}

// إعداد مستمعي الأحداث للفلاتر
function setupFilterEventListeners() {
  // زر تبديل الفلتر (Desktop)
  const filterToggle = document.getElementById('filterToggle');
  if (filterToggle) {
    filterToggle.addEventListener('click', toggleFilterPanel);
  }
  
  // زر تبديل الفلتر (Mobile)
  const mobileFilterToggle = document.getElementById('mobileFilterToggle');
  if (mobileFilterToggle) {
    mobileFilterToggle.addEventListener('click', toggleFilterPanel);
  }
  
  // زر تطبيق الفلاتر
  const applyBtn = document.getElementById('applyFilters');
  if (applyBtn) {
    applyBtn.addEventListener('click', applyFilters);
  }
  
  // زر مسح الفلاتر
  const clearBtn = document.getElementById('clearFilters');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearFilters);
  }
  
  // زر إخفاء الفلاتر
  const hideBtn = document.getElementById('hideFilters');
  if (hideBtn) {
    hideBtn.addEventListener('click', hideFilters);
  }
  
  // تطبيق الفلاتر عند الضغط على Enter في حقول النص
  const treeNameFilter = document.getElementById('treeNameFilter');
  if (treeNameFilter) {
    treeNameFilter.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        applyFilters();
      }
    });
  }
  
  const userNameFilter = document.getElementById('userNameFilter');
  if (userNameFilter) {
    userNameFilter.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        applyFilters();
      }
    });
  }
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  if (checkAuth()) {
    setupUI();
    setupFilterEventListeners(); // إعداد مستمعي أحداث الفلاتر
    fetchMessages();
    loadSettings();
  }
});
