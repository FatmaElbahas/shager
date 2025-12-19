const token = localStorage.getItem("authToken");
const user = JSON.parse(localStorage.getItem("user"));

function updateUIBasedOnAuth() {
  const token = localStorage.getItem("authToken");
  const before = document.getElementById("before");
  const after = document.getElementById("after");

  if (before && after) {
    before.style.display = token ? "none" : "flex";
    after.style.display = token ? "flex" : "none";
  }
}

async function updateHeaderProfileImage() {
  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user"));
  const headerImg = document.querySelector(".profile");

  if (!headerImg) return;

  try {
    if (user && token) {
      const response = await fetch(
        `/api/user-profiles/${user.id}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("فشل في جلب البيانات");

      const data = await response.json();
      const userData = data.profile ?? data.user ?? data;

      if (userData.profile_picture) {
        headerImg.src = `/storage/${userData.profile_picture}`;
      } else {
        headerImg.src = "images/image (25).png"; // صورة افتراضية
      }
    } else {
      headerImg.src = "images/image (25).png"; // صورة افتراضية لو مش عامل تسجيل دخول
    }
  } catch (error) {
    console.error("خطأ في تحميل صورة الهيدر:", error);
    headerImg.src = "images/image (25).png";
  }
}

updateHeaderProfileImage();

// footer.js

async function updateFooterSettings() {
  const token = localStorage.getItem("authToken");
  if (!token) return; // إذا لم يكن هناك توكن، نتوقف

  try {
    const response = await fetch("/api/admin/settings", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("فشل تحميل إعدادات Footer");

    const settings = await response.json();

    document.getElementById("description").textContent =
      settings.platform_description ||
      "منصة رقمية تجمع القبائل والعائلات في مكان واحد، تتيح لك بناء شجرة عائلتك، استكشاف الجذور، متابعة المناسبات، والتواصل مع مجتمعك بكل سهولة.";
    document.getElementById("footerPhone").textContent =
      settings.support_phone || "+966 59 533 8665";
    document.getElementById("footerEmail").textContent =
      settings.support_email || "shaigratech@gmail.com";

    document.getElementById("footerYoutube").href = settings.youtube || "#";
    document.getElementById("footerTwitter").href = settings.twitter || "#";
    document.getElementById("footerInstagram").href = settings.instagram || "#";
    document.getElementById("footerFacebook").href = settings.facebook || "#";

    console.log("تم تحديث إعدادات Footer بنجاح");
  } catch (error) {
    console.error("خطأ في تحديث Footer:", error);
  }
}

// نجعل الدالة متاحة في جميع الصفحات
window.updateFooterSettings = updateFooterSettings;

document.addEventListener("DOMContentLoaded", () => {
  updateFooterSettings();
});

const container = document.getElementById("occasionsContainer");
const paginationContainer = document.querySelector(".custom-pagination");

let occasions = []; // لتخزين كل المناسبات
let currentPage = 1;
const itemsPerPage = 6; // عدد المناسبات لكل صفحة

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };

  return date.toLocaleDateString("ar-EG", options).replace("،", " ,");
}

// عرض صفحة معينة
function showPage(page) {
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  container.innerHTML = "";

  const pageItems = occasions.slice(start, end);

  if (pageItems.length === 0) {
    container.innerHTML = `<p class="text-muted">لا توجد مناسبات لعرضها</p>`;
    return;
  }

  pageItems.forEach((o) => {
    container.innerHTML += `
      <div class="col-md-4 col-lg-4">
        <div class="photo-card my-3 bg-white shadow-sm">
          <img src="${
            o.cover_image
              ? "/storage/" + o.cover_image
              : "images/Frame 1410126302.png"
          }" class="card-img-top">
          <div class="body py-3 px-3">
            <p class="photo-title">${o.details}</p>
  <p class="photo-date"><span>    <img src="images/uiw_date.svg" alt="" style="width: 24px; height: 24px;">
</span>${formatDate(o.occasion_date)}</p>          </div>
        </div>
      </div>
    `;
  });

  renderPagination();
}

// إنشاء أزرار الباجينيشن
function renderPagination() {
  const totalPages = Math.ceil(occasions.length / itemsPerPage);
  paginationContainer.innerHTML = "";

  // زر السابق
  const prevLi = document.createElement("li");
  prevLi.className = "page-item" + (currentPage === 1 ? " disabled" : "");
  const prevA = document.createElement("a");
  prevA.className = "page-link";
  prevA.href = "#";
  prevA.textContent = "السابق";
  prevA.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      showPage(currentPage);
    }
  });
  prevLi.appendChild(prevA);
  paginationContainer.appendChild(prevLi);

  // أرقام الصفحات
  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.className = "page-item" + (i === currentPage ? " active" : "");
    const a = document.createElement("a");
    a.className = "page-link";
    a.href = "#";
    a.textContent = i;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      currentPage = i;
      showPage(currentPage);
    });
    li.appendChild(a);
    paginationContainer.appendChild(li);
  }

  // زر التالي
  const nextLi = document.createElement("li");
  nextLi.className =
    "page-item" + (currentPage === totalPages ? " disabled" : "");
  const nextA = document.createElement("a");
  nextA.className = "page-link";
  nextA.href = "#";
  nextA.textContent = "التالي";
  nextA.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPage < totalPages) {
      currentPage++;
      showPage(currentPage);
    }
  });
  nextLi.appendChild(nextA);
  paginationContainer.appendChild(nextLi);
}

// جلب المناسبات من السيرفر
async function loadOccasions() {
  try {
    const res = await fetch("/api/occasions", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    occasions = await res.json();
    currentPage = 1;
    showPage(currentPage);
  } catch (err) {
    console.error("خطأ في جلب المناسبات:", err);
    container.innerHTML = `<p class="text-danger">حدث خطأ أثناء تحميل المناسبات</p>`;
  }
}

window.onload = function () {
  const before = document.getElementById("before");
  const after = document.getElementById("after");

  updateUIBasedOnAuth();

  if (token) {
    if (before) before.style.display = "none";
    if (after) after.style.display = "flex";
    loadOccasions(); // جلب المناسبات من السيرفر
  } else {
    if (before) before.style.display = "flex";
    if (after) after.style.display = "none";
  }
};
