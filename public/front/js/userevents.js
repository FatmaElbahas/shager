// ✅ تعريف التوكن والمستخدم
const token = localStorage.getItem("authToken");
const user = JSON.parse(localStorage.getItem("user"));
let eventLatitude = null;
let eventLongitude = null;

// لو عايزة تحولي اسم المدينة لإحداثيات ممكن تستخدمي Geocoding API
async function geocodeCity(cityName) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      cityName
    )}`
  );
  const data = await response.json();
  if (data.length > 0) {
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      display_name: data[0].display_name,
    };
  }
  return null;
}

// ✅ التحقق من صلاحية الدخول
function checkAuth() {
  if (!token || !user || user.role !== "tree_creator") {
    window.location.href = "login.html";
  }
}

// ✅ تحميل المناسبات عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  loadOccasions();
});

function showLoading() {
  document.getElementById("loadingIndicator").classList.remove("d-none");
}

function hideLoading() {
  document.getElementById("loadingIndicator").classList.add("d-none");
}

// ✅ تحميل المناسبات من الـ API
let allOccasions = []; // متغير عام لتخزين المناسبات

// تعديل loadOccasions لتخزين المناسبات
async function loadOccasions() {
  const container = document.getElementById("occasionCardsContainer");
  showLoading();

  try {
    const response = await fetch("/api/occasions", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error("فشل في تحميل المناسبات:", await response.text());
      hideLoading();
      return;
    }

    let occasions = await response.json();

    // ✅ ترتيب المناسبات حسب وقت الإضافة (الأحدث أولاً)
    occasions.sort(
      (a, b) => new Date(b.occasion_date) - new Date(a.occasion_date)
    );

    allOccasions = occasions;

    container.innerHTML = "";
    occasions.forEach((occasion) => {
      addOccasionCard(occasion);
    });

    renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
  } catch (err) {
    console.error("فشل في تحميل المناسبات:", err);
  } finally {
    hideLoading();
  }
}

// عرض الكروت مع الترجمة للعربي
function addOccasionCard(occasion) {
  const categoryMap = {
    occasion: "سنوي",
    meeting: "اجتماع",
    familiar: "عائلي",
  };
  const categoryAr = categoryMap[occasion.category] || occasion.category;

  const date = new Date(occasion.occasion_date);
  const weekday = date.toLocaleDateString("ar-EG", { weekday: "long" });
  const day = date.getDate();

  const container = document.getElementById("occasionCardsContainer");

  const card = document.createElement("div");
  card.className = "col-6 col-sm-4 col-md-3 mb-3";
  card.innerHTML = `
    <div class="custom-card text-center mx-2 p-2 flex-shrink-0" style="min-width: 120px;">
      <div class="card-title py-4 px-2">
        <p class="mb-2" style="font-size: 20px;">${weekday}</p>
        <p class="fw-bold" style="font-size: 48px;">${day}</p>
      </div>
      <div class="card-footer py-3 px-2">
         <a href="eventdetails.html?id=${occasion.id}" class="text-decoration-none text-light">
      <p class="text-custom">${occasion.name}</p>
      <p class="text-muted">${categoryAr}</p>
    </a>
      </div>
    </div>
  `;

  container.appendChild(card);
}

// ✅ عرض معاينة صورة الغلاف
document
  .getElementById("occasionForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const cityName = document.querySelector('input[name="city"]').value.trim();
    if (!cityName) return alert("من فضلك اختر مدينة");

    document.getElementById("loadingSpinner").classList.remove("d-none");

    // 🔹 جلب الإحداثيات من Geocoding API
    const geoData = await geocodeCity(cityName);
    if (!geoData) return alert("اختر مدينة صحيحة أولاً");

    eventLatitude = geoData.lat;
    eventLongitude = geoData.lon;

    // 🔹 تجهيز FormData للإرسال
    const formData = new FormData();
    const name = document.querySelector(
      'input[placeholder="اسم المناسبة"]'
    ).value;
    const date = document.querySelector('input[type="date"]').value;
    const visibility = document.querySelector(
      'select[name="visibility"]'
    ).value;
    const category = document.querySelector('select[name="category"]').value;
    const details = document.querySelector("textarea").value;
    const coverImage = document.getElementById("coverImageInput").files[0];

    formData.append("name", name);
    formData.append("occasion_date", date);
    formData.append("latitude", eventLatitude);
    formData.append("longitude", eventLongitude);
    formData.append("city", geoData.display_name);
    formData.append("visibility", visibility);
    formData.append("category", category);
    formData.append("details", details);
    if (coverImage) formData.append("cover_image", coverImage);

    try {
      const response = await fetch(
        "/api/tree_creator/occasions",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();
      if (response.ok) {
        await loadOccasions();
        document.getElementById("occasionForm").reset();
        document.getElementById("coverImagePreview").classList.add("d-none");
        document
          .getElementById("addEventModal")
          .querySelector(".btn-close")
          .click();
      } else {
        alert("فشل في الإضافة: " + (result.message || "خطأ غير معروف"));
      }
    } catch (err) {
      console.error("حدث خطأ أثناء الإضافة:", err);
    }
  });

async function loadPastEvents() {
  const token = localStorage.getItem("authToken");
  const container = document.querySelector(".past-events-box");

  try {
    const response = await fetch(
      "/api/tree_creator/tree-creator-events/past",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const events = await response.json();

    // تفريغ المناسبات القديمة
    container.innerHTML = `
      <h5 class="py-3 px-2" style="color: rgba(39, 58, 65, 1); font-size: 24px;">
        مناسبات فائتة
      </h5>
    `;

    if (events.length === 0) {
      container.innerHTML += `<div class="text-center text-muted">لا توجد مناسبات فائتة</div>`;
      return;
    }

    // عرض المناسبات
    events.forEach((event) => {
      let iconClass = "fa-solid fa-star"; // أيقونة افتراضية

      if (event.name.includes("عيد ميلاد")) {
        iconClass = "fa-solid fa-cake-candles";
      } else if (event.name.includes("زفاف") || event.name.includes("فرح")) {
        iconClass = "fa-solid fa-ring";
      }
      container.innerHTML += `
  <div class="past-event-item">
    <div class="text">
      <div>${event.name}</div>
      <small class="text-muted">
        ${new Date(event.occasion_date).toLocaleDateString("ar-EG", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </small>
    </div>
    <span class="icon"><i class="${iconClass}"></i></span>
  </div>
`;
    });
  } catch (err) {
    console.error("فشل تحميل المناسبات الفائتة", err);
  }
}

// Sidebar toggle and active class

document.addEventListener("DOMContentLoaded", function () {
  checkAuth();
  loadOccasions();
  loadPastEvents();

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
});

// active class
document.querySelectorAll(".sidebar li").forEach((li) => {
  li.addEventListener("click", () => {
    document
      .querySelectorAll(".sidebar li")
      .forEach((item) => item.classList.remove("active"));
    li.classList.add("active");
  });
});

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

let currentDate = new Date();

function renderCalendar(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const totalDays = lastDay.getDate();
  const startDay = firstDay.getDay() || 7;
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const calendarDates = document.getElementById("calendarDates");
  calendarDates.innerHTML = "";

  // ✅ فلترة المناسبات الخاصة بالشهر المعروض
  const filteredOccasions = allOccasions.filter((occasion) => {
    const eventDate = new Date(occasion.occasion_date);
    return eventDate.getMonth() === month && eventDate.getFullYear() === year;
  });

  // أيام من الشهر السابق
  for (let i = startDay - 1; i > 0; i--) {
    const div = document.createElement("div");
    div.textContent = prevMonthLastDay - i + 1;
    div.classList.add("other-month");
    calendarDates.appendChild(div);
  }

  // أيام الشهر الحالي
  for (let day = 1; day <= totalDays; day++) {
    const div = document.createElement("div");
    div.textContent = day;

    // ✅ تحديد الأيام اللي فيها مناسبة من الشهر الحالي فقط
    const hasEvent = filteredOccasions.some((occasion) => {
      const eventDate = new Date(occasion.occasion_date);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === month &&
        eventDate.getFullYear() === year
      );
    });

    if (hasEvent) {
      div.classList.add("event-day"); // تقدر هنا تحط نفس ستايل current-day لو عايزه نفس الشكل
      div.title = "لديك مناسبة هذا اليوم 🎉";
    }

    calendarDates.appendChild(div);
  }

  // أيام من الشهر القادم
  const nextDays = 42 - (startDay - 1 + totalDays);
  for (let i = 1; i <= nextDays; i++) {
    const div = document.createElement("div");
    div.textContent = i;
    div.classList.add("other-month");
    calendarDates.appendChild(div);
  }
}

// Populate year and month dropdowns
const yearSelect = document.getElementById("yearSelect");
const monthSelect = document.getElementById("monthSelect");
for (let i = 2020; i <= 2030; i++) {
  const option = document.createElement("option");
  option.value = i;
  option.textContent = i;
  yearSelect.appendChild(option);
}
months.forEach((month, index) => {
  const option = document.createElement("option");
  option.value = index;
  option.textContent = month;
  monthSelect.appendChild(option);
});

yearSelect.value = currentDate.getFullYear();
monthSelect.value = currentDate.getMonth();

// Render initial calendar
renderCalendar(currentDate.getFullYear(), currentDate.getMonth());

// Update calendar on change
yearSelect.addEventListener("change", () => {
  renderCalendar(yearSelect.value, monthSelect.value);
});
monthSelect.addEventListener("change", () => {
  renderCalendar(yearSelect.value, monthSelect.value);
});

const coverInput = document.getElementById("coverImageInput");
const coverPreview = document.getElementById("coverImagePreview");

coverInput.addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      coverPreview.src = e.target.result;
      coverPreview.classList.remove("d-none");
    };

    reader.readAsDataURL(file);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  checkAuth();

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
