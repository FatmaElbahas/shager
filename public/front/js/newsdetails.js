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
    const response = await fetch(
      "/api/settings",
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

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

window.onload = function () {
  const before = document.getElementById("before");
  const after = document.getElementById("after");

  updateUIBasedOnAuth();

  if (token) {
    if (before) before.style.display = "none";
    if (after) after.style.display = "flex";
  } else {
    if (before) before.style.display = "flex";
    if (after) after.style.display = "none";
  }
};

function getNewsIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function fetchNewsDetails(newsId) {
  try {
    const response = await fetch(
      `/api/news/${newsId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error("فشل في جلب تفاصيل الخبر");

    const data = await response.json();

    // تحديث عنوان الخبر
    document.querySelector("#newsTitle").textContent = data.title;

    // تحديث صورة الخبر
    const newsImage = document.querySelector("#newsImage");
    if (data.image) {
      newsImage.src = `/storage/${data.image}`;
      newsImage.alt = data.title || "صورة الخبر";
    } else {
      newsImage.src = "images/Frame 38.png";
      newsImage.alt = "صورة افتراضية";
    }

    // تحديث الوصف المختصر
    const shortDesc = document.querySelector("#newsDescriptionShort");
    if (data.short_description) {
      shortDesc.textContent = data.short_description;
      shortDesc.style.display = "block";
    } else {
      shortDesc.style.display = "none";
    }

    // تحديث النص الكامل
    const fullDesc = document.querySelector("#newsDescriptionFull");
    if (data.full_description) {
      fullDesc.textContent = data.full_description;
    } else {
      fullDesc.textContent =
        data.short_description || "لا يوجد محتوى إضافي للخبر.";
    }

    // تنسيق التاريخ
    const date = new Date(data.published_at);

    // أسماء الأشهر بالعربي
    const months = [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ];

    // أسماء الأيام بالعربي
    const days = [
      "الأحد",
      "الاثنين",
      "الثلاثاء",
      "الأربعاء",
      "الخميس",
      "الجمعة",
      "السبت",
    ];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    // النتيجة النهائية
    const formattedDate = `${dayName} ${day} ${month}، ${year}`;

    document.querySelector("#newsPublishedDate").textContent = formattedDate;

    // تحديث عنوان الصفحة
    document.title = `${data.title} - شجرة تك`;

    console.log("تم تحميل تفاصيل الخبر بنجاح:", data);
  } catch (error) {
    console.error("خطأ في تحميل تفاصيل الخبر:", error);

    // عرض رسالة خطأ للمستخدم
    const newsContainer = document.querySelector(".news-article");
    if (newsContainer) {
      newsContainer.innerHTML = `
        <div class="alert alert-danger text-center m-4">
          <i class="fas fa-exclamation-triangle mb-3" style="font-size: 48px;"></i>
          <h4>خطأ في تحميل الخبر</h4>
          <p>عذراً، حدث خطأ أثناء تحميل تفاصيل الخبر. يرجى المحاولة مرة أخرى.</p>
          <a href="new.html" class="btn btn-outline-custom mt-2">
            <i class="fas fa-arrow-right me-2"></i>
            العودة للأخبار
          </a>
        </div>
      `;
    }
  }
}

// بيانات أخبار ثابتة للمستخدمين العاديين
const staticSidebarNews = [
  {
    id: 1,
    title: "احتفال عائلي - قبيلة بني هاشم",
    image: "images/Frame 38.png",
    published_at: "2025-01-15",
    short_description:
      "احتفلت قبيلة بني هاشم بمناسبة عائلية مميزة جمعت أفراد العائلة من مختلف المناطق.",
  },
  {
    id: 2,
    title: "مولود جديد - عائلة الأحمد",
    image: "images/de6269f8495c9e1e3c9d10d517503b73266b35db.jpg",
    published_at: "2025-01-10",
    short_description:
      "تهنئ عائلة الأحمد بقدوم المولود الجديد وتتمنى له الصحة والعافية.",
  },
  {
    id: 3,
    title: "لقاء تراثي - قبيلة العتيبي",
    image: "images/Frame 38.png",
    published_at: "2025-01-05",
    short_description:
      "نظمت قبيلة العتيبي لقاءً تراثياً لتعريف الأجيال الجديدة بتاريخ وتراث القبيلة.",
  },
  {
    id: 4,
    title: "زواج مبارك - عائلة المحمد",
    image: "images/de6269f8495c9e1e3c9d10d517503b73266b35db.jpg",
    published_at: "2025-01-01",
    short_description:
      "تبارك عائلة المحمد زواج ابنهم وتتمنى للعروسين حياة سعيدة مليئة بالخير والبركة.",
  },
];

function displayStaticSidebarNews() {
  const newsContainer = document.getElementById("latestNewsContainer");
  newsContainer.innerHTML = "";

  staticSidebarNews.forEach((newsItem) => {
    const newsCard = document.createElement("div");
    newsCard.className = "photo-card mb-3";

    newsCard.innerHTML = `
      <img src="${
        newsItem.image
      }" alt="صورة الخبر" class="img-fluid" style="height: 200px; object-fit: cover;">
      <div class="body">
        <h5 class="photo-title fw-bold" style="font-size: 16px; line-height: 1.4;">${
          newsItem.title
        }</h5>
        <p class="photo-date mb-2">
          <img src="images/uiw_date (1).png" alt="" style="width: 20px; height: 20px;">
          ${formatDateArabic(newsItem.published_at)}
        </p>
        <p class="text-muted mb-3" style="font-size: 13px; line-height: 1.4;">${
          newsItem.short_description
        }</p>
        <button class="btn btn-outline-custom btn-sm w-100" style="font-size: 13px;" disabled>
          <i class="fas fa-eye me-2"></i>
          محتوى ثابت
        </button>
      </div>
    `;
    newsContainer.appendChild(newsCard);
  });
}

async function fetchLatestNews() {
  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user"));

  // إذا كان المستخدم من نوع 'user' أو غير مسجل دخول، عرض الأخبار الثابتة
  if (!token || !user || user.role === "user") {
    displayStaticSidebarNews();
    return;
  }

  try {
    const response = await fetch(
      "/api/news",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("فشل في جلب الأخبار");
    }

    const data = await response.json();
    const newsList = data.data.slice(0, 4); // ✅ عرض أول 4 أخبار فقط

    const newsContainer = document.getElementById("latestNewsContainer");
    newsContainer.innerHTML = "";

    if (newsList.length === 0) {
      // عرض رسالة في حالة عدم وجود أخبار
      newsContainer.innerHTML = `
        <div class="alert alert-info text-center">
          <i class="fas fa-info-circle mb-2"></i>
          <p class="mb-0">لا توجد أخبار أخرى متاحة حالياً</p>
        </div>
      `;
      return;
    }

    newsList.forEach((newsItem) => {
      const newsCard = document.createElement("div");
      newsCard.className = "photo-card mb-3";

      // تحسين معالجة الوصف
      let description =
        newsItem.short_description ||
        newsItem.full_description ||
        "لا يوجد وصف متاح";
      if (description.length > 120) {
        description = description.substring(0, 120) + "...";
      }

      newsCard.innerHTML = `
        <img src="${
          newsItem.image
            ? `/storage/${newsItem.image}`
            : "images/Frame 38.png"
        }" alt="صورة الخبر" class="img-fluid" style="height: 200px; object-fit: cover;">
        <div class="body">
          <h5 class="photo-title fw-bold" style="font-size: 16px; line-height: 1.4;">${
            newsItem.title
          }</h5>
          <p class="photo-date mb-2">
            <img src="images/uiw_date (1).png" alt="" style="width: 20px; height: 20px;">
            ${formatDateArabic(newsItem.published_at)}
          </p>
          <p class="text-muted mb-3" style="font-size: 13px; line-height: 1.4;">${description}</p>
          <button class="btn btn-outline-custom btn-sm w-100" onclick="goToDetails(${
            newsItem.id
          })" style="font-size: 13px;">
            <i class="fas fa-arrow-left me-2"></i>
            عرض التفاصيل
          </button>
        </div>
      `;
      newsContainer.appendChild(newsCard);
    });
  } catch (error) {
    console.error("حدث خطأ أثناء جلب الأخبار:", error);

    // عرض رسالة خطأ
    const newsContainer = document.getElementById("latestNewsContainer");
    newsContainer.innerHTML = `
      <div class="alert alert-danger text-center">
        <i class="fas fa-exclamation-triangle mb-2"></i>
        <p class="mb-0">حدث خطأ في تحميل الأخبار</p>
        <small>يرجى المحاولة مرة أخرى</small>
      </div>
    `;
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

function formatDateArabic(dateStr) {
  const date = new Date(dateStr);
  const months = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

function goToDetails(id) {
  window.location.href = `newdetails.html?id=${id}`;
}

async function loadHeaderData() {
  try {
    updateUIBasedOnAuth();
    await updateHeaderProfileImage();
  } catch (error) {
    console.error("خطأ في تحميل بيانات الهيدر:", error);
  }
}

async function loadFooterData() {
  const token = localStorage.getItem("authToken");
  if (!token) return; // إذا لم يكن هناك توكن، نتوقف

  try {
    const response = await fetch(
      "/api/settings",
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) throw new Error("فشل تحميل إعدادات Footer");

    const data = await response.json();
    const settings = data.settings || data;

    // تحديث عناصر Footer
    const elements = {
      footerPhone: settings.phone,
      footerEmail: settings.email,
      footerAddress: settings.address,
      footerDescription: settings.description,
    };

    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element && value) {
        element.textContent = value;
      }
    });

    console.log("تم تحميل إعدادات Footer بنجاح");
  } catch (error) {
    console.error("خطأ في تحميل إعدادات Footer:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchLatestNews();
  const params = new URLSearchParams(window.location.search);
  const newsId = params.get("id");

  if (newsId) {
    fetchNewsDetails(newsId);
  } else {
    alert("لم يتم تحديد الخبر.");
  }

  // تحميل بيانات الهيدر
  loadHeaderData();
  
  // تحميل بيانات الفوتر
  loadFooterData();
});
