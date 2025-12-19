let currentPage = 1;
let totalPages = 1;
let users = [];
const token = localStorage.getItem("authToken");

// تحقق من التوكن والصلاحية
function checkAuth() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!token || !user || user.role !== "admin_assistant") {
    window.location.href = "login.html";
  }
}

// البحث
const searchInput = document.querySelector(".search-input");
searchInput.addEventListener("input", () => {
  currentPage = 1;
  fetchUsers(searchInput.value, currentPage);
});

// جلب المستخدمين من السيرفر
async function fetchUsers(name = "", page = 1) {
  try {
    const response = await fetch(
      `/api/admin_assistant/users?name=${encodeURIComponent(
        name
      )}&page=${page}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      }
    );

    if (!response.ok) throw new Error("فشل في جلب البيانات");
    const data = await response.json();

    users = data.data;
    totalPages = data.last_page;
    currentPage = data.current_page;

    updatePaginationInfo(data.from, data.to, data.total);
    renderUsers(users);
  } catch (error) {
    console.error("Error:", error);
    alert("حدث خطأ أثناء تحميل البيانات");
  }
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

// عرض المستخدمين
function renderUsers(users) {
  const tableBody = document.getElementById("users-table-body");
  tableBody.classList.remove("show");

  setTimeout(() => {
    tableBody.innerHTML = "";

    if (!users || users.length === 0) {
      tableBody.innerHTML =
        "<tr><td colspan='8' class='text-center'>لا يوجد بيانات</td></tr>";
    } else {
      users.forEach((user) => {
        const rowClass =
          user.status === "active"
            ? "table-success"
            : user.status === "suspended"
            ? "table-warning"
            : "table-danger";

        const statusBadge = `
          <span style="
            background-color: ${
              user.status === "active"
                ? "#E8F5E9"
                : user.status === "suspended"
                ? "#FFF8E1"
                : "#FFEBEE"
            };
            color: ${
              user.status === "active"
                ? "#2E7D32"
                : user.status === "suspended"
                ? "#F9A825"
                : "#C62828"
            };
            padding: 5px 12px;
            border-radius: 20px;
            font-weight: 600;
          ">
            ${
              user.status === "active"
                ? "نشط"
                : user.status === "suspended"
                ? "موقوف"
                : "محظور"
            }
          </span>
        `;

        const row = document.createElement("tr");
        row.className = rowClass;

        row.innerHTML = `
          <td class="text-center">${
            new Date(user.created_at).toLocaleDateString() || "-"
          }</td>
          <td>
            <div class="d-flex justify-content-center text-right g-4">
              <div>
                <img src="${
                  user.profile_picture
                    ? `/storage/${user.profile_picture}`
                    : "images/tree 1.png"
                }"
                class="rounded-circle" width="40" height="40"
                onerror="this.onerror=null;this.src='images/tree 1.png';">
              </div>
              <div>
                <strong>${user.name || "-"}</strong><br>
                <small class="text-muted">${user.email || "-"}</small>
              </div>
            </div>
          </td>
          <td class="text-center">${user.phone || "-"}</td>
          <td class="text-center">${user.job || "-"}</td>
<td class="text-center">
  ${
    user.family_trees && user.family_trees.length > 0
      ? user.family_trees[0].tree_name
      : "-"
  }
</td>
          <td class="text-center">${statusBadge}</td>
          <td>
            <div class="dropdown text-center">
              <a href="#" class="text-secondary" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="fas fa-ellipsis-v fa-lg"></i>
              </a>
              <ul class="dropdown-menu dropdown-menu-end text-end shadow rounded-3">
                <li><a class="dropdown-item" href="#" onclick="confirmStatusChange(${
                  user.id
                }, 'active')">تفعيل</a></li>
                <li><a class="dropdown-item" href="#" onclick="confirmStatusChange(${
                  user.id
                }, 'suspended')">إيقاف مؤقت</a></li>
                <li><a class="dropdown-item" href="#" onclick="confirmStatusChange(${
                  user.id
                }, 'banned')">حظر</a></li>
                <li><a class="dropdown-item text-danger" href="#" onclick="deleteUser(${
                  user.id
                })">حذف</a></li>
              </ul>
            </div>
          </td>`;
        tableBody.appendChild(row);
      });
    }

    console.log(users);

    tableBody.classList.add("show");
  }, 200);
}

// حذف المستخدم
async function deleteUser(userId) {
  if (!confirm("هل أنت متأكد أنك تريد حذف هذا المستخدم؟")) return;

  try {
    const response = await fetch(
      `/api/admin_assistant/users/${userId}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      }
    );

    if (!response.ok) throw new Error("فشل في حذف المستخدم");

    const data = await response.json();
    alert(data.message || "تم حذف المستخدم بنجاح");

    fetchUsers(searchInput.value, currentPage);
  } catch (error) {
    console.error("Error:", error);
    alert("حدث خطأ أثناء حذف المستخدم");
  }
}

// تأكيد تغيير الحالة
function confirmStatusChange(userId, status) {
  const confirmChange = confirm(
    `هل أنت متأكد من تغيير حالة المستخدم إلى "${status}"؟`
  );
  if (confirmChange) {
    updateStatus(userId, status);
  }
}

// تحديث الحالة
async function updateStatus(userId, status) {
  try {
    const response = await fetch(
      `/api/admin_assistant/users/${userId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) throw new Error("فشل في تحديث الحالة");
    alert("تم تحديث الحالة بنجاح");
    fetchUsers(searchInput.value, currentPage);
  } catch (error) {
    console.error(error);
    alert("حدث خطأ أثناء تحديث الحالة");
  }
}

// تحديث معلومات الصفحات
function updatePaginationInfo(from, to, total) {
  document.getElementById("current-page").textContent = currentPage;
  document.getElementById("total-pages").textContent = totalPages;
  document.getElementById(
    "items-info"
  ).textContent = `عرض ${from}-${to} من ${total} مستخدم`;
}

// التنقل بين الصفحات
function nextPage() {
  if (currentPage < totalPages) {
    fetchUsers(searchInput.value, currentPage + 1);
  }
}

function prevPage() {
  if (currentPage > 1) {
    fetchUsers(searchInput.value, currentPage - 1);
  }
}

// ربط الأزرار
document.getElementById("next-page").addEventListener("click", nextPage);
document.getElementById("prev-page").addEventListener("click", prevPage);

// تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  fetchUsers();
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
