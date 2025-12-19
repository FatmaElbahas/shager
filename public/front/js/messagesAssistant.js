let currentPage = 1;
let totalPages = 1;
let currentSearch = "";
const token = localStorage.getItem("authToken");

// التحقق من صلاحية المستخدم
function checkAuth() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!token || !user || user.role !== "admin_assistant") {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

// إنشاء شارة الحالة
function getStatusBadge(status) {
  const statusStyles = {
    answered: { color: "#2E7D32", bg: "#E8F5E9", label: "تم الرد" },
    under_review: { color: "#F9A825", bg: "#FFF8E1", label: "تحت المراجعة" },
    unanswered: { color: "#C62828", bg: "#FFEBEE", label: "لم يتم الرد" },
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
    "لم يتم الرد": "unanswered",
    "تحت المراجعة": "under_review",
    "تم الرد": "answered",
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

async function loadSettings() {
  try {
    const response = await fetch(
      "/api/admin_assistant/settings",
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) throw new Error("فشل تحميل الإعدادات");

    const settings = await response.json();

    // تحديث صورة اللوجو في الصفحة
    if (settings.platform_logo) {
      document.getElementById("platformLogo").src = settings.platform_logo;
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

  const url = new URL("/api/admin_assistant/messages", window.location.origin);
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
      renderMessages(data.data || []);
      updatePagination(data);
    })
    .catch((error) => {
      console.error("فشل تحميل البيانات:", error);
      showAlert("حدث خطأ أثناء جلب البيانات", "danger");
      renderMessages([]);
    });
}

// عرض الرسائل في الجدول
function renderMessages(messages) {
  const tableBody = document.querySelector(".fade-table");
  tableBody.innerHTML = "";

  if (messages.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-4">
          <i class="fas ${
            currentSearch ? "fa-search" : "fa-inbox"
          } fs-1 text-muted mb-2"></i>
          <p class="mb-0">${
            currentSearch
              ? "لا توجد نتائج مطابقة للبحث"
              : "لا توجد رسائل لعرضها"
          }</p>
          ${
            currentSearch
              ? `<small class="text-muted">بحثت عن: ${currentSearch}</small>`
              : ""
          }
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
                ? `/storage/${user.profile_picture}`
                : "images/tree 1.png"
            }" 
                 class="rounded-circle" width="40" height="40"
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
              }, 'answered')">تم الرد</a></li>
              <li><a class="dropdown-item" href="#" onclick="updateStatus(${
                message.id
              }, 'under_review')">تحت المراجعة</a></li>
              <li><a class="dropdown-item" href="#" onclick="updateStatus(${
                message.id
              }, 'unanswered')">لم يتم الرد</a></li>
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

  fetch(`/api/admin_assistant/messages/${id}`, {
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

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  if (checkAuth()) {
    setupUI();
    fetchMessages();
    loadSettings();
  }
});
