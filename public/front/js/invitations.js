let currentPage = 1;
const itemsPerPage = 6;
let totalPages = 1;
let invitations = [];
let searchKeyword = "";
const typingDelay = 300;
let typingTimer;

const token = localStorage.getItem("authToken");

// ✅ التحقق من الصلاحيات
function checkAuth() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!token || !user || user.role !== "admin") {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

// ✅ تحميل المستخدمين للفورم
async function loadUsers() {
  try {
    const token = localStorage.getItem("authToken");
    const res = await fetch("/api/admin/show_users", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const select = document.getElementById("userSelect");
    select.innerHTML = '<option value="">اختر مستخدم</option>';
    data.forEach((user) => {
      select.innerHTML += `<option value="${user.id}">${user.name}</option>`;
    });
  } catch (err) {
    console.error(err);
  }
}

// ✅ جلب الدعوات مع pagination و search
async function fetchInvitations() {
  try {
    document.getElementById("invitation-table-body").innerHTML = `
      <tr><td colspan="7" class="text-center p-4">
        <div class="spinner-border text-warning"></div>
      </td></tr>
    `;

    let url = `/api/admin/invitations?page=${currentPage}`;
    if (searchKeyword) url += `&name=${encodeURIComponent(searchKeyword)}`;

    const response = await fetch(url, {
      headers: { Authorization: "Bearer " + localStorage.getItem("authToken") },
    });

    if (!response.ok) throw new Error("فشل في تحميل البيانات");

    const result = await response.json();
    invitations = result.data;
    totalPages = result.last_page;

    if (searchKeyword && invitations.length === 0) {
      showNoResultsMessage(searchKeyword);
    } else {
      renderInvitations(invitations);
    }

    updatePagination(result);
  } catch (error) {
    console.error(error);
    showErrorState(error.message);
  }
}

// ✅ عرض بيانات الدعوات
function renderInvitations(data) {
  const tbody = document.getElementById("invitation-table-body");
  tbody.innerHTML = "";

  data.forEach((invitation) => {
    const user = invitation.user || {};
    const family = invitation.family || {};

    const row = `
      <tr>
        <td>
          <div class="d-flex justify-content-center text-right g-4">
            <img src="images/tree 1.png" width="40" height="40" class="rounded-circle" />
            <div>
              <strong>${user.name || "غير معروف"}</strong><br>
              <small class="text-muted">${user.email || ""}</small>
            </div>
          </div>
        </td>
        <td class="text-center">${new Date(
          invitation.sending_date
        ).toLocaleDateString()}</td>
        <td class="text-center">${invitation.usage_limit}</td>
        <td class="text-center">${getStatusBadge(invitation.status)}</td>
        <td class="text-center">
          <div class="dropdown">
            <a href="#" class="text-secondary" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="fas fa-ellipsis-v fa-lg"></i>
            </a>
            <ul class="dropdown-menu dropdown-menu-end text-end shadow rounded-3">
              <li><a class="dropdown-item" href="#" onclick="updateStatus(${
                invitation.id
              }, 'active')">فعال</a></li>
              <li><a class="dropdown-item" href="#" onclick="updateStatus(${
                invitation.id
              }, 'expired')">منتهي</a></li>
              <li><hr class="dropdown-divider" /></li>
              <li><a class="dropdown-item text-danger" href="#" onclick="deleteInvitation(${
                invitation.id
              })">حذف</a></li>
            </ul>
          </div>
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

// ✅ ترجمة الحالة + لون البادج
function getStatusBadge(status) {
  const statusStyles = {
    active: { color: "#2E7D32", bg: "#E8F5E9", label: "فعال" },
    pending: { color: "#F9A825", bg: "#FFF8E1", label: "معلق" },
    expired: { color: "#C62828", bg: "#FFEBEE", label: "منتهي" },
  };

  const style = statusStyles[status] || {
    color: "#6c757d",
    bg: "#f8f9fa",
    label: status,
  };
  return `<span style="background-color:${style.bg}; color:${style.color}; padding:5px 12px; border-radius:20px; font-weight:600;">${style.label}</span>`;
}

// ✅ عرض حالة الخطأ
function showErrorState(message) {
  const tbody = document.getElementById("invitation-table-body");
  tbody.innerHTML = `
    <tr>
      <td colspan="7" class="text-center py-5 text-danger">
        <i class="bi bi-exclamation-triangle-fill fs-1"></i>
        <h5 class="mt-3">${message}</h5>
        <button class="btn btn-sm btn-outline-warning mt-2" onclick="fetchInvitations()">
          <i class="bi bi-arrow-repeat"></i> إعادة المحاولة
        </button>
      </td>
    </tr>
  `;
}

// ✅ رسالة عند عدم وجود نتائج
function showNoResultsMessage(keyword) {
  document.getElementById("invitation-table-body").innerHTML = `
    <tr>
      <td colspan="7" class="text-center py-4">
        <i class="bi bi-search fs-3 text-muted"></i>
        <p class="mt-2">لا توجد نتائج لـ "<strong>${keyword}</strong>"</p>
      </td>
    </tr>
  `;
}

// ✅ حذف دعوة
async function deleteInvitation(id) {
  if (!confirm("هل أنت متأكد من حذف هذه الدعوة؟")) return;

  try {
    const res = await fetch(
      `/api/admin/invitations/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("authToken"),
        },
      }
    );
    await res.json();
    fetchInvitations();
  } catch (err) {
    console.error(err);
  }
}

// ✅ تحديث حالة الدعوة
// ✅ تحديث حالة الدعوة
async function updateStatus(id, newStatus) {
  try {
    const res = await fetch(
      `/api/admin/invitations/${id}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("authToken"),
        },
        body: JSON.stringify({ status: newStatus }),
      }
    );

    if (!res.ok) throw new Error("فشل في تحديث الحالة");

    const result = await res.json();

    // ✅ إذا تم تغيير الحالة لـ expired، نعرض رسالة تنبيهية
    if (newStatus === "expired") {
      alert("تم انتهاء الدعوة! دور المستخدم المرتبط تم تغييره إلى 'user'.");
    }

    fetchInvitations();
  } catch (error) {
    console.error(error);
    alert("حدث خطأ أثناء تحديث الحالة");
  }
}

// ✅ نسخ كود الدعوة
function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => alert("تم نسخ كود الدعوة بنجاح!"))
    .catch((err) => console.error("فشل النسخ:", err));
}

// ✅ تحديث بيانات الصفحات
function updatePagination(result) {
  const from = result.from || 0;
  const to = result.to || 0;
  const total = result.total || 0;
  document.getElementById(
    "items-info"
  ).textContent = `عرض ${from}-${to} من ${total} دعوة`;
  document.getElementById("current-page").textContent = currentPage;
  document.getElementById("total-pages").textContent = totalPages;
}

// ✅ التحكم في الصفحات
function setupPaginationButtons() {
  document.getElementById("prev-page").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      fetchInvitations();
    }
  });
  document.getElementById("next-page").addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchInvitations();
    }
  });
}

// ✅ البحث عند الكتابة
const searchInput = document.querySelector(".search-input");
searchInput.addEventListener("input", (e) => {
  searchKeyword = e.target.value.trim();
  console.log("Search Keyword:", searchKeyword); // للتجربة
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    currentPage = 1;
    fetchInvitations();
  }, typingDelay);
});

// ✅ إرسال دعوة
function setupInviteForm() {
  document
    .getElementById("inviteForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = Object.fromEntries(new FormData(e.target).entries());
      try {
        const res = await fetch("/api/admin/invitations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("authToken"),
          },
          body: JSON.stringify(formData),
        });
        const result = await res.json();
        if (res.ok) {
          alert(result.message);
          e.target.reset();
          fetchInvitations(); // تحديث الجدول
        } else {
          alert(result.message || "حدث خطأ");
        }
      } catch (err) {
        console.error(err);
        alert("خطأ في الاتصال بالسيرفر");
      }
    });
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

// ✅ بدء التنفيذ عند تحميل الصفحة
window.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  loadUsers();
  fetchInvitations();
  setupPaginationButtons();
  setupInviteForm();
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
