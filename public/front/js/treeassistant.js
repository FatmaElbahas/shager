let currentPage = 1;
let currentSearch = "";
const token = localStorage.getItem("authToken");

// التحقق من صلاحية الأدمن
function checkAuth() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!token || !user || user.role !== "admin_assistant") {
    window.location.href = "login.html";
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

// تعديل دالة loadActivities لدعم عرض تحميل
async function loadActivities(page = 1, search = "") {
  // عرض دائرة التحميل
  showLoading();

  currentPage = page;
  currentSearch = search;

  try {
    const response = await fetch(
      `/api/admin_assistant/activities?page=${page}&search=${encodeURIComponent(
        search
      )}`,
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
  } catch (error) {
    console.error("فشل تحميل الأنشطة:", error);
    Toastify({
      text: "حدث خطأ أثناء تحميل البيانات",
      duration: 3000,
      backgroundColor: "#f44336",
    }).showToast();
  } finally {
    // إخفاء دائرة التحميل بغض النظر عن النتيجة
    hideLoading();
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

// تعديل حدث البحث لإضافة تأخير (Debounce) لتحسين الأداء
let searchTimer;
document
  .getElementById("activitySearch")
  .addEventListener("input", function () {
    const search = this.value.trim();

    clearTimeout(searchTimer);

    searchTimer = setTimeout(() => {
      loadActivities(1, search);
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
      `/api/admin_assistant/activities/${userId}`,
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

// البحث المباشر
document.addEventListener("DOMContentLoaded", function () {
  checkAuth();
  loadActivities();
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

document.getElementById("prev-page").addEventListener("click", () => {
  if (currentPage > 1) loadActivities(currentPage - 1);
});

document.getElementById("next-page").addEventListener("click", () => {
  const total = parseInt(document.getElementById("total-pages").textContent);
  if (currentPage < total) loadActivities(currentPage + 1);
});
