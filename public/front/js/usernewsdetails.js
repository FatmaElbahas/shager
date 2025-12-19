const token = localStorage.getItem("authToken");

function checkAuth() {
  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user"));
  if (!token || !user || user.role !== "tree_creator") {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

function getNewsIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("news_id") || params.get("id");
}

async function fetchNewsDetails(newsId) {
  try {
    const response = await fetch(`/api/news/${newsId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("فشل في جلب تفاصيل الخبر");

    const data = await response.json();

    document.querySelector("#newsTitle").textContent = data.title;

    if (data.image) {
      document.querySelector(
        "#newsImage"
      ).src = `/storage/${data.image}`;
    } else {
      document.querySelector("#newsImage").src =
        "/storage/default_images/default.jpg";
    }

    document.querySelector("#newsDescription").textContent =
      data.full_description;

    const date = new Date(data.published_at);
    document.querySelector("#newsPublishedDate").textContent =
      date.toLocaleDateString("ar-EG");
    
    // يمكن إضافة renderComments لاحقاً إذا كان هناك قسم للتعليقات
    // renderComments(data.comments || []);
  } catch (error) {
    console.error(error.message);
    // عرض رسالة خطأ للمستخدم
    document.querySelector("#newsTitle").textContent = "خطأ في تحميل الخبر";
    document.querySelector("#newsDescription").textContent = "حدث خطأ أثناء تحميل تفاصيل الخبر. يرجى المحاولة مرة أخرى.";
  }
}

async function fetchLatestNews() {
  const token = localStorage.getItem("authToken");

  try {
    const response = await fetch("/api/news", {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("فشل في جلب الأخبار");
    }

    const data = await response.json();
    const newsList = data.data.slice(0, 3); // ✅ عرض أول 3 أخبار فقط

    const newsContainer = document.getElementById("latestNewsContainer");
    newsContainer.innerHTML = "";

    // فلترة الأخبار لإزالة الخبر الحالي
    const currentNewsId = getNewsIdFromURL();
    const filteredNews = newsList.filter(newsItem => newsItem.id != currentNewsId);

    if (filteredNews.length === 0) {
      newsContainer.innerHTML = `
        <div class="alert alert-info text-center">
          <i class="fas fa-info-circle mb-2"></i>
          <p class="mb-0">لا توجد أخبار أخرى متاحة حالياً</p>
        </div>
      `;
      return;
    }

    filteredNews.forEach((newsItem) => {
      const newsCard = document.createElement("div");
      newsCard.className = "p-3 bg-white rounded shadow-sm mb-3";
      newsCard.style.cursor = "pointer";
      newsCard.innerHTML = `
        <small class="text-muted d-block">${formatDate(
          newsItem.published_at
        )}</small>
        <h6 class="mt-2 mb-1">${newsItem.title}</h6>
        <p class="small text-muted mb-2">${newsItem.short_description || ''}</p>
        <button class="btn btn-outline-custom btn-sm">عرض التفاصيل</button>
      `;
      
      // إضافة حدث النقر للبطاقة كاملة
      newsCard.addEventListener('click', () => {
        goToDetails(newsItem.id);
      });
      
      newsContainer.appendChild(newsCard);
    });
  } catch (error) {
    console.error("حدث خطأ أثناء جلب الأخبار:", error);
    const newsContainer = document.getElementById("latestNewsContainer");
    newsContainer.innerHTML = `
      <div class="alert alert-warning text-center">
        <i class="fas fa-exclamation-triangle mb-2"></i>
        <p class="mb-0">لا يمكن تحميل الأخبار الجانبية حالياً</p>
      </div>
    `;
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

function goToDetails(newsId) {
  // إعادة تحميل الصفحة مع معرف الخبر الجديد
  window.location.href = `usernewsdetails.html?news_id=${newsId}`;
}

document.addEventListener("DOMContentLoaded", () => {
  if (!checkAuth()) return;

  const newsId = getNewsIdFromURL();

  if (newsId) {
    fetchNewsDetails(newsId);
    fetchLatestNews(); // تحميل الأخبار الجانبية
  } else {
    alert("لم يتم تحديد الخبر.");
  }

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

  // ** كود تسجيل الخروج **
  document
    .querySelector(".nav-link.text-danger")
    ?.addEventListener("click", async function (e) {
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
