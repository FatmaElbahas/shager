let users = [];

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

async function loadVisitorsChart() {
  try {
    const response = await fetch("/api/admin/visitors", {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });

    const data = await response.json();

    // تأكد أن البيانات موجودة
    if (!data || data.length === 0) return;

    const labels = data.map((item) => item.date);
    const counts = data.map((item) => item.count);

    const ctx = document.getElementById("visitorsChart").getContext("2d");
    new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "زوار الموقع",
            data: counts,
            borderColor: "#b7924f",
            backgroundColor: "#b7924f",
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: "top" },
          tooltip: { mode: "index", intersect: false },
        },
        scales: {
          y: { beginAtZero: true },
          x: { ticks: { autoSkip: true, maxTicksLimit: 10 } },
        },
      },
    });
  } catch (error) {
    console.error("Error loading visitors chart:", error);
  }
}

async function loadCountryPieChart() {
  try {
    const response = await fetch(
      "/api/admin/visitors/country",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      }
    );

    const data = await response.json();

    if (!data || data.length === 0) return;

    const labels = data.map((item) => item.country);
    const counts = data.map((item) => item.count);
    
    // ألوان متدرجة وجميلة
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
    ];

    const ctx = document.getElementById("countryPieChart").getContext("2d");
    new Chart(ctx, {
      type: "doughnut", // تغيير من pie إلى doughnut للشكل الأفضل
      data: {
        labels: labels,
        datasets: [
          {
            data: counts,
            backgroundColor: colors.slice(0, labels.length),
            borderColor: '#ffffff',
            borderWidth: 3,
            hoverBorderWidth: 5,
            hoverOffset: 10, // تأثير الانتفاخ عند hover
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%', // حجم الفتحة في المنتصف
        plugins: {
          legend: { 
            position: "bottom",
            labels: {
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle',
              font: {
                size: 12,
                family: 'Arial, sans-serif'
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#b7924f',
            borderWidth: 2,
            cornerRadius: 10,
            displayColors: true,
            callbacks: {
              label: function (context) {
                const item = data[context.dataIndex];
                return `${item.country}: ${item.count} زائر (${item.percentage}%)`;
              },
            },
          },
        },
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 2000,
          easing: 'easeOutQuart'
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      },
    });
  } catch (error) {
    console.error("Error loading country pie chart:", error);
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
    ).innerHTML = `${revenue} <img src="images/Group 1984077694.png" alt="" style="width: 16px; height: 16px;">`;
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
    ).innerHTML = `${total} <img src="images/Vector (14).png" alt="" style="width: 16px; height: 16px;">`;

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

// export data
function exportAnalytics() {
  const token = localStorage.getItem("authToken");
  fetch("/api/admin/analytics/export", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) throw new Error("فشل التصدير");
      return response.blob();
    })
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "analytics_report.xlsx"; // أو .csv حسب نوع الملف
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    })
    .catch((err) => {
      alert("حدث خطأ أثناء التصدير: " + err.message);
    });
}

// دالة رئيسية لتحميل كل البيانات
function initDashboardData() {
  fetchSubscriberCount();
  fetchPlanCount();
  fetchRevenueData();
  fetchNewUsersCount();
  fetchEnrollmentData();
  loadVisitorsChart();
  loadCountryPieChart();
}

// تنفيذ الدالة عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  console.log("loaded");
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
