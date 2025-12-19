let users = [];

const token = localStorage.getItem("authToken");

function checkAuth() {
  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user"));
  if (!token || !user || user.role !== "admin") {
    window.location.href = "login.html";
  }
}

async function fetchSubscriberCount() {
  try {
    const response = await fetch(
      "/api/admin/subscriptions/count",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      }
    );
    const data = await response.json();
    document.getElementById("subscriber-count").textContent =
      data.total_subscribers;
  } catch (error) {
    console.error("فشل في جلب عدد المشتركين:", error);
  }
}

async function fetchPlanCount() {
  try {
    const response = await fetch("/api/admin/count", {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    const data = await response.json();
    document.getElementById("plans-count").textContent = data.count;
  } catch (error) {
    console.error("فشل في جلب عدد الخطط:", error);
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

async function fetchRevenueData() {
  try {
    const response = await fetch(
      "/api/admin/subscriptions/revenue",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      }
    );
    const data = await response.json();
    const revenue = data.total;
    const change = data.percentage_change;
    const trend = data.trend;

    document.getElementById(
      "revenue-count"
    ).innerHTML = `${revenue} <img src="images/Group%201984077694.png" alt="" style="width: 16px; height: 16px;">`;
    const changeElement = document.getElementById("revenue-change");
    changeElement.textContent = `${change > 0 ? "+" : ""}${change.toFixed(2)}%`;

    if (trend === "increase") {
      changeElement.style.color = "green";
    } else if (trend === "decrease") {
      changeElement.style.color = "red";
    } else {
      changeElement.style.color = "gray";
    }
  } catch (error) {
    console.error("فشل في جلب الأرباح:", error);
  }
}

async function fetchNewUsersCount() {
  try {
    const response = await fetch(
      "/api/admin/users/new/last-7-days",
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    document.getElementById("new-users-count").textContent =
      data.new_users_count;
  } catch (error) {
    console.error("فشل في جلب عدد المستخدمين الجدد:", error);
  }
}

fetch("/api/admin/subscriptions/monthly-revenue", {
  method: "GET",
  headers: {
    Accept: "application/json",
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  },
})
  .then((response) => response.json())
  .then((data) => {
    const monthTranslations = {
      January: "يناير",
      February: "فبراير",
      March: "مارس",
      April: "أبريل",
      May: "مايو",
      June: "يونيو",
      July: "يوليو",
      August: "أغسطس",
      September: "سبتمبر",
      October: "أكتوبر",
      November: "نوفمبر",
      December: "ديسمبر",
    };

    const labels = Object.keys(data.monthly_revenues).map(
      (month) => monthTranslations[month] || month
    );

    const values = Object.values(data.monthly_revenues);

    // تحديث رقم الإجمالي
    const total = values.reduce((acc, val) => acc + val, 0).toFixed(2);
    document.querySelector(
      ".total"
    ).innerHTML = `${total} <img src="images/Vector%20(14).png" alt="" style="width: 16px; height: 16px;">`;

    const ctx = document.getElementById("revenueChart").getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "الإيرادات (ريال)",
            data: values,
            backgroundColor: "#b7924f",
            borderColor: "#b7924f",
            borderWidth: 1,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `${value} ريال`,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
  })
  .catch((err) => {
    console.error("فشل تحميل البيانات:", err);
  });

// subscribers chart

let enrollmentsChartInstance = null;

function fetchEnrollmentData() {
  const type = document.getElementById("filterType").value;

  fetch(`/api/admin/enrollments?filter=${type}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const labels = Object.keys(data.enrollments);
      const values = Object.values(data.enrollments);
      drawEnrollmentsChart(labels, values);
    })
    .catch((err) => {
      console.error("فشل تحميل بيانات الاشتراكات:", err);
    });
}

function drawEnrollmentsChart(labels, values) {
  const ctx = document.getElementById("enrollmentsChart").getContext("2d");

  if (enrollmentsChartInstance) {
    enrollmentsChartInstance.destroy();
  }

  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, "rgba(183, 146, 79, 0.2)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  enrollmentsChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          data: values,
          fill: true,
          backgroundColor: gradient,
          borderColor: "#b7924f",
          borderWidth: 2,
          pointBackgroundColor: "#b7924f",
          pointRadius: 4,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: "index",
          intersect: false,
          backgroundColor: "#263238",
          titleColor: "#fff",
          bodyColor: "#fff",
          borderColor: "#fff",
          borderWidth: 1,
          callbacks: {
            label: (context) => `${context.formattedValue} مشترك`,
          },
        },
      },
      hover: {
        mode: "index",
        intersect: false,
      },
      scales: {
        x: {
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `${value}`,
          },
          grid: {
            drawBorder: false,
            color: "rgba(0,0,0,0.05)",
          },
        },
      },
    },
  });
}

// ------------------ TRANSACTIONS -------------------
let currentPage = 1;
let totalPages = 1;
let currentSearch = "";

async function fetchTransactions(page = 1, search = "") {
  try {
    currentSearch = search;
    const url = new URL("/api/admin/subscriptions", window.location.origin);
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
<img src="images/Vector%20(14).png" alt="" style="width: 16px; height: 16px;">      <td>
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

document.getElementById("searchButton").addEventListener("click", () => {
  const query = document.getElementById("searchInput").value.trim();
  fetchTransactions(1, query);
});
document.getElementById("searchButton").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const query = e.target.value.trim();
    fetchTransactions(1, query);
  }
});

// دالة رئيسية لتحميل كل البيانات
function initDashboardData() {
  checkAuth();
  fetchSubscriberCount();
  fetchPlanCount();
  fetchRevenueData();
  fetchNewUsersCount();
  fetchEnrollmentData();
  fetchTransactions();
  loadSettings();
}

// تنفيذ الدالة عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
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
