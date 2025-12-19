let currentPage = 1;
const itemsPerPage = 6;
const token = localStorage.getItem("authToken");

// تحقق من التوكن والصلاحية
function checkAuth() {
  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user"));
  if (!token || !user || user.role !== "admin") {
    window.location.href = "login.html";
  }
}

const searchInput = document.querySelector(".search-input");
searchInput.addEventListener("input", () => {
  currentPage = 1;
  fetchSubscriptions(searchInput.value.trim());
});

async function fetchSubscriptions(search = "") {
  const res = await fetch(
    `/api/admin/subscriptions?page=${currentPage}&search=${encodeURIComponent(
      search
    )}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const data = await res.json();
  const body = document.getElementById("subscriptions-table-body");
  body.innerHTML = "";

  if (!data.data.length) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td colspan="7" class="text-center text-muted py-4">
        لا يوجد بيانات لعرضها
      </td>
    `;
    body.appendChild(row);

    // إخفاء معلومات الصفحة عند عدم وجود نتائج
    document.getElementById("items-info").textContent = "";
    document.getElementById("current-page").textContent = currentPage;
    document.getElementById("total-pages").textContent = data.last_page;
    return;
  }

  data.data.forEach((sub) => {
    const row = document.createElement("tr");

    row.innerHTML = `
    <td>
      <div class="d-flex justify-content-center text-right gap-3">
        <div>
           <img src="${
             sub.user.profile_picture
               ? `/storage/${sub.user.profile_picture}`
               : "images/tree 1.png"
           }" 
                 class="rounded-circle" width="40" height="40"
                 onerror="this.onerror=null;this.src='images/tree 1.png';">
        </div>
        <div>
          <strong>${sub.user.name}</strong>
          <p class="text-muted">${sub.user.email}</p>
        </div>
      </div>
    </td>
    <td class="text-center">${sub.family_tree?.tree_name || "غير معروف"}</td>
    <td class="text-center">${sub.start_date}</td>
    <td class="text-center">${sub.end_date}</td>
    <td class="text-center">${translatePlan(sub.plan?.plan) || "غير محددة"}</td>
    <td class="text-center">
      <span style="
        background-color: ${
          sub.status === "active"
            ? "#E8F5E9"
            : sub.status === "suspended"
            ? "#FFF8E1"
            : "#FFEBEE"
        };
        color: ${
          sub.status === "active"
            ? "#2E7D32"
            : sub.status === "suspended"
            ? "#F9A825"
            : "#C62828"
        };
        padding: 5px 12px;
        border-radius: 20px;
        font-weight: 600;
      ">
        ${translateStatus(sub.status)}
      </span>
    </td>
    <td class="text-center">
    </td>
  `;

    body.appendChild(row);
    body.classList.add("show");
  });

  document.getElementById(
    "items-info"
  ).textContent = `عرض ${data.from} - ${data.to} من ${data.total} اشتراك`;
  document.getElementById("current-page").textContent = currentPage;
  document.getElementById("total-pages").textContent = data.last_page;
}

function translatePlan(plan) {
  switch (plan) {
    case "primary":
      return "أساسية";
    case "advanced":
      return "متقدمة";
    case "custom":
      return "مخصصة";
    default:
      return plan;
  }
}

function getStatusClass(status) {
  switch (status) {
    case "active":
      return "status-active";
    case "suspended":
      return "status-suspended";
    case "expired":
      return "status-expired";
    default:
      return "text-muted";
  }
}

function translateStatus(status) {
  switch (status) {
    case "active":
      return "فعّال";
    case "suspended":
      return "موقوف";
    case "expired":
      return "منتهي";
    default:
      return status;
  }
}

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

document.getElementById("next-page").addEventListener("click", () => {
  currentPage++;
  fetchSubscriptions();
});
document.getElementById("prev-page").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    fetchSubscriptions();
  }
});

fetchSubscriptions();

// تحميل الصفحة
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
