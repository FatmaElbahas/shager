const token = localStorage.getItem("authToken");
const user = JSON.parse(localStorage.getItem("user"));
let currentPage = 1;

// ✅ تحديث واجهة المستخدم حسب تسجيل الدخول
function updateUIBasedOnAuth() {
  const before = document.getElementById("before");
  const after = document.getElementById("after");

  if (before && after) {
    before.style.display = token ? "none" : "flex";
    after.style.display = token ? "flex" : "none";
  }
}

// دالة لإنشاء عنصر التحميل
function createLoadingIndicator() {
  const loadingDiv = document.createElement("div");
  loadingDiv.id = "loadingIndicator";
  loadingDiv.className = "text-center my-5";
  loadingDiv.innerHTML = `
    <div class="spinner-border" style="color: #b7924f;" role="status">
      <span class="visually-hidden">جاري التحميل...</span>
    </div>
    <p class="mt-2">جاري تحميل البيانات...</p>
  `;
  return loadingDiv;
}

// دالة لعرض التحميل
function showLoading() {
  const container = document.querySelector("#newsContainer");
  container.innerHTML = "";
  const loadingIndicator = createLoadingIndicator();
  container.appendChild(loadingIndicator);
}

// دالة لإخفاء التحميل
function hideLoading() {
  const loadingIndicator = document.getElementById("loadingIndicator");
  if (loadingIndicator) {
    loadingIndicator.remove();
  }
}

// ✅ تحميل صورة البروفايل في الهيدر
async function updateHeaderProfileImage() {
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

      headerImg.src = userData.profile_picture
        ? `/storage/${userData.profile_picture}`
        : "images/image (25).png";
    } else {
      headerImg.src = "images/image (25).png";
    }
  } catch (error) {
    console.error("خطأ في تحميل صورة الهيدر:", error);
    headerImg.src = "images/image (25).png";
  }
}
updateHeaderProfileImage();

// ✅ تحديث إعدادات الفوتر
async function updateFooterSettings() {
  if (!token) return;

  try {
    const response = await fetch("/api/admin/settings", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("فشل تحميل إعدادات Footer");

    const settings = await response.json();

    document.getElementById("description").textContent =
      settings.platform_description ||
      "منصة رقمية تجمع القبائل والعائلات في مكان واحد...";
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
window.updateFooterSettings = updateFooterSettings;

// ✅ دوال التحميل + الـ Pagination
function createLoadingIndicator() {
  const loadingDiv = document.createElement("div");
  loadingDiv.id = "loadingIndicator";
  loadingDiv.className = "text-center my-5";
  loadingDiv.innerHTML = `
    <div class="spinner-border" style="color: #b7924f;" role="status">
      <span class="visually-hidden">جاري التحميل...</span>
    </div>
    <p class="mt-2">جاري تحميل البيانات...</p>
  `;
  return loadingDiv;
}

async function fetchNews(page = 1, search = "") {
  try {
    const response = await fetch(
      `/api/news?page=${page}&search=${encodeURIComponent(
        search
      )}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();
    console.log("الاستجابة:", result);

    const newsList = result.data;
    const pagination = {
      current_page: result.current_page,
      last_page: result.last_page,
    };

    document.querySelector("#newsContainer").innerHTML = "";

    // التحقق من وجود أخبار
    if (!newsList || newsList.length === 0) {
      document.querySelector("#newsContainer").innerHTML = `
        <div class="col-12">
          <div class="alert alert-info text-center">
            <h5>لا توجد أخبار لعرضها</h5>
            <p>لم يتم إنشاء أي أخبار بعد. يمكنك إضافة أخبار جديدة من لوحة التحكم.</p>
          </div>
        </div>
      `;
      // إخفاء pagination عند عدم وجود بيانات
      const paginationContainer = document.querySelector(".pagination");
      if (paginationContainer) {
        paginationContainer.innerHTML = "";
      }
      return;
    }

    newsList.forEach(addOccasionCard);
    renderPagination(pagination, search);
  } catch (error) {
    console.error("فشل في تحميل الأخبار", error);
    document.querySelector("#newsContainer").innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger text-center">
          <h5>خطأ في تحميل البيانات</h5>
          <p>فشل في تحميل البيانات. يرجى المحاولة مرة أخرى.</p>
        </div>
      </div>
    `;
  } finally {
    hideLoading();
  }
}

function renderPagination({ current_page, last_page }, search = "") {
  const paginationContainer = document.querySelector(".pagination");
  paginationContainer.innerHTML = "";

  const createPageItem = (label, page, disabled = false, active = false) => {
    return `
      <li class="page-item ${disabled ? "disabled" : ""} ${
      active ? "active" : ""
    }">
        <a class="page-link" href="#" data-page="${page}" data-search="${search}">${label}</a>
      </li>`;
  };

  paginationContainer.innerHTML += createPageItem(
    "السابق",
    current_page - 1,
    current_page === 1
  );

  for (let i = 1; i <= last_page; i++) {
    paginationContainer.innerHTML += createPageItem(
      i,
      i,
      false,
      current_page === i
    );
  }

  paginationContainer.innerHTML += createPageItem(
    "التالي",
    current_page + 1,
    current_page === last_page
  );
}

function addOccasionCard(data) {
  const cardHtml = `
 <div class="col-md-6 col-lg-4">
    <div class="card h-100 border-0 shadow-sm">
        <div class="flex-shrink-0">
          <img src="/storage/${
            data.image ? data.image : "default_images/default.jpg"
          }" class="card-img-top" alt="News Image">
        </div>
        <div class="card-body">
      <h5 class="photo-title fw-bold">${data.title}</h5>
        <p class="photo-date mb-1"><span><img src="images/uiw_date (1).png" alt="" style="width: 24px; height: 24px; ">
</span>${new Date(data.published_at).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })}</p>
         <a href="newdetails.html?id=${
           data.id
         }" class="btn btn-link">اقرأ المزيد</a>
        </div>
      </div>
    </div>
  `;
  document
    .querySelector("#newsContainer")
    .insertAdjacentHTML("beforeend", cardHtml);
}

// ✅ Event Listeners
document.addEventListener("click", (e) => {
  if (e.target.matches(".page-link")) {
    e.preventDefault();
    const page = parseInt(e.target.getAttribute("data-page"));
    const search = e.target.getAttribute("data-search") || "";
    if (!isNaN(page)) {
      currentPage = page;
      fetchNews(currentPage, search);
    }
  }
});

// ✅ دالة البحث في الأخبار الثابتة
function searchStaticNews(searchTerm) {
  const filteredNews = staticNewsData.filter(
    (news) =>
      news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      news.short_description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const newsContainer = document.querySelector("#newsContainer");
  newsContainer.innerHTML = "";

  if (filteredNews.length === 0) {
    newsContainer.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info text-center">
          لم يتم العثور على أخبار تطابق البحث "${searchTerm}"
        </div>
      </div>
    `;
  } else {
    filteredNews.forEach((news) => {
      addStaticNewsCard(news);
    });
  }
}

document.querySelector("#searchInput")?.addEventListener("input", function () {
  const searchTerm = this.value.trim();

  // إذا كان المستخدم له role = "user" أو غير مسجل دخول، ابحث في الأخبار الثابتة
  if (!token || !user || user.role === "user") {
    if (searchTerm === "") {
      displayStaticNews();
    } else {
      searchStaticNews(searchTerm);
    }
  } else {
    // باقي المستخدمين يبحثون في السيرفر
    currentPage = 1;
    fetchNews(currentPage, searchTerm);
  }
});

// ✅ بيانات الأخبار الثابتة للمستخدمين العاديين
const staticNewsData = [
  {
    id: "static_1",
    title: "قبيلة بني خالد تحتفل بمرور 100 عام على تأسيس مجلسها",
    short_description:
      "احتفالية كبيرة بمناسبة مرور قرن على تأسيس مجلس قبيلة بني خالد",
    published_at: "2025-05-17",
    image: "images/Frame 36.png",
  },
  {
    id: "static_2",
    title: "ندوة ثقافية لقبيلة شمر حول توثيق الأنساب",
    short_description: "ندوة مهمة حول أهمية توثيق الأنساب والحفاظ على التراث",
    published_at: "2025-05-17",
    image: "images/Frame 36 (1).png",
  },
  {
    id: "static_3",
    title: "قبيلة العتيبي تحتفل بقدوم مولود جديد في أحد فروعها",
    short_description: "فرحة كبيرة بقدوم مولود جديد يحمل اسم العائلة",
    published_at: "2025-05-17",
    image: "images/Frame 36 (2).png",
  },
  {
    id: "static_4",
    title: 'قبيلة بني تميم تهنئ بقدوم المولود "سعود بن ناصر"',
    short_description: "تهنئة قبيلة بني تميم بقدوم المولود الجديد سعود بن ناصر",
    published_at: "2025-05-17",
    image: "images/Frame 36 (3).png",
  },
  {
    id: "static_5",
    title: "رحلة قبيلة الحربي إلى وادي لجب — تواصل وترفيه في أحضان الطبيعة",
    short_description:
      "رحلة ممتعة لأفراد قبيلة الحربي إلى وادي لجب للاستمتاع بالطبيعة",
    published_at: "2025-05-17",
    image: "images/Frame 36 (4).png",
  },
  {
    id: "static_6",
    title: "زواج خالد بن فهد من قبيلة العجمان في حفل بهيج بالرياض",
    short_description: "حفل زفاف مميز لخالد بن فهد من قبيلة العجمان بالرياض",
    published_at: "2025-05-17",
    image: "images/Frame 36 (5).png",
  },
  {
    id: "static_7",
    title: "رحلة ممتعة على ضفاف النهر تجمع أطفال من عدة قبائل",
    short_description: "نشاط ترفيهي جميل يجمع أطفال من قبائل مختلفة",
    published_at: "2025-05-17",
    image: "images/Frame 36 (6).png",
  },
  {
    id: "static_8",
    title: 'أطفال القبائل في نزهة بالدراجات ضمن فعالية "يوم العجلات"',
    short_description: "فعالية رياضية ممتعة للأطفال بالدراجات",
    published_at: "2025-05-17",
    image: "images/Frame 36 (7).png",
  },
  {
    id: "static_9",
    title: "نزهة ترفيهية للأطفال في منتزه القبائل العائلي",
    short_description: "يوم ترفيهي مميز للأطفال في منتزه القبائل",
    published_at: "2025-05-17",
    image: "images/Frame 36 (8).png",
  },
];

// ✅ دالة لعرض الأخبار الثابتة
function displayStaticNews() {
  const newsContainer = document.querySelector("#newsContainer");
  newsContainer.innerHTML = "";

  staticNewsData.forEach((news) => {
    addStaticNewsCard(news);
  });

  // إخفاء pagination للأخبار الثابتة
  const paginationContainer = document.querySelector(".pagination");
  if (paginationContainer) {
    paginationContainer.innerHTML = "";
  }
}

// ✅ دالة لإضافة كارت خبر ثابت
function addStaticNewsCard(data) {
  const cardHtml = `
    <div class="col-md-6 col-lg-4">
      <div class="card h-100 border-0 shadow-sm">
        <img src="${data.image}" class="card-img-top" alt="News Image">
        <div class="card-body">
          <p class="text-muted mb-1">${new Date(
            data.published_at
          ).toLocaleDateString("ar-EG", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}</p>
          <h6 class="card-title fw-bold">${data.title}</h6>
          <a href="newdetails.html?id=${
            data.id
          }" class="btn btn-link">اقرأ المزيد</a>
        </div>
      </div>
    </div>
  `;
  document
    .querySelector("#newsContainer")
    .insertAdjacentHTML("beforeend", cardHtml);
}

// ✅ تشغيل عند تحميل الصفحة
window.onload = function () {
  updateUIBasedOnAuth();
  updateFooterSettings();

  // إعادة قراءة البيانات من localStorage للتأكد من أحدث البيانات
  const currentToken = localStorage.getItem("authToken");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  console.log("Token:", currentToken ? "موجود" : "غير موجود");
  console.log("User:", currentUser);
  console.log("User Role:", currentUser?.role);

  if (currentToken && currentUser) {
    // إذا كان المستخدم مسجل دخول وله role = "user", اعرض الأخبار الثابتة
    if (currentUser.role === "user") {
      console.log("المستخدم له role = user → عرض الأخبار الثابتة");
      displayStaticNews();
    } else {
      // باقي المستخدمين يحصلون على الأخبار من السيرفر
      console.log(
        `المستخدم له role = ${currentUser.role} → عرض الأخبار من السيرفر`
      );
      fetchNews();
    }
  } else {
    // المستخدمين غير المسجلين يرون الأخبار الثابتة أيضاً
    console.log("مفيش توكن أو user → عرض الأخبار الثابتة");
    displayStaticNews();
  }
};
