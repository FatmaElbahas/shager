let currentPage = 1;
const token = localStorage.getItem("authToken");

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

function checkAuth() {
  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user"));
  if (!token || !user || user.role !== "tree_creator") {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

async function fetchNews(page = 1, search = "") {
  showLoading();

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

    // إفراغ العناصر القديمة
    document.querySelector("#newsContainer").innerHTML = "";

    // عرض الكروت
    newsList.forEach(addOccasionCard);

    // عرض أزرار الترقيم
    renderPagination(pagination, search);
  } catch (error) {
    console.error("فشل في تحميل الأخبار", error);
    // في حالة الخطأ، يمكنك عرض رسالة خطأ بدلاً من إخفاء التحميل
    document.querySelector("#newsContainer").innerHTML = `
      <div class="alert alert-danger text-center">
        فشل في تحميل البيانات. يرجى المحاولة مرة أخرى.
      </div>
    `;
  } finally {
    hideLoading(); // إخفاء مؤشر التحميل في كل الأحوال
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

  // السابق
  paginationContainer.innerHTML += createPageItem(
    "السابق",
    current_page - 1,
    current_page === 1
  );

  // الصفحات
  for (let i = 1; i <= last_page; i++) {
    paginationContainer.innerHTML += createPageItem(
      i,
      i,
      false,
      current_page === i
    );
  }

  // التالي
  paginationContainer.innerHTML += createPageItem(
    "التالي",
    current_page + 1,
    current_page === last_page
  );
}

// حدث عند الضغط على زر الترقيم
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

document.querySelector("#searchInput").addEventListener("input", function () {
  const searchTerm = this.value.trim();
  currentPage = 1;
  fetchNews(currentPage, searchTerm);
});

function addOccasionCard(data) {
  const cardHtml = `
        <div class="col-md-6 mb-5">
            <div class="d-flex bg-white rounded-5 shadow overflow-hidden" style="border-radius: 24px;">
                <div class="flex-shrink-0">
                    <img src="/storage/${
                      data.image ? data.image : "default_images/default.jpg"
                    }" class="img-fluid h-100" alt="News Image"  style="width: 150px; object-fit: cover;">
                </div>
                <div class="p-3 flex-grow-1">
                    <div class="d-flex justify-content-between align-items-center my-3">
                        <h5 class="fw-bold text-dark">${data.title}</h5>
                        <small class="text-muted d-block mb-1">${new Date(
                          data.published_at
                        ).toLocaleDateString("ar-EG", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}</small>
                    </div>
                    <p class="text-muted small my-4">${
                      data.short_description || ""
                    }</p>
                  <a href="usernewsdetails.html?news_id=${
                    data.id
                  }&occasion_id=${data.occasion_id}">
                   <button class="btn btn-outline-custom">عرض التفاصيل</button>
                  </a>
                </div>
            </div>
        </div>
    `;
  document
    .querySelector("#newsContainer")
    .insertAdjacentHTML("afterbegin", cardHtml);
}

document.addEventListener("DOMContentLoaded", () => {
  if (!checkAuth()) return;
  fetchNews();

  document
    .querySelector("#occasionForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      // إظهار spinner وتعطيل الزر
      const saveBtn = document.getElementById('saveBtn');
      const saveText = document.getElementById('saveText');
      const saveSpinner = document.getElementById('saveSpinner');
      
      saveText.classList.add('d-none');
      saveSpinner.classList.remove('d-none');
      saveBtn.disabled = true;

      const form = e.target;
      const formData = new FormData(form);

      const token = localStorage.getItem("authToken");

      try {
        const response = await fetch(
          "/api/tree_creator/news",
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const errorBody = await response.json();
          const errorFields = errorBody.errors || {};
          let allErrors = "";
          for (let field in errorFields) {
            allErrors += `${field}: ${errorFields[field].join(", ")}\n`;
          }
          alert("أخطاء في البيانات:\n" + allErrors);
          return;
        }

        const data = await response.json();

        // إضافة المناسبة إلى الصفحة
        addOccasionCard(data);

        // إغلاق المودال
        bootstrap.Modal.getInstance(
          document.getElementById("addOccasionModal")
        ).hide();
        form.reset();
        
        alert("تم إضافة الخبر بنجاح!");
      } catch (error) {
        try {
          const errorBody = await error.json();
          console.error("تفاصيل الخطأ:", errorBody);
          alert("خطأ: " + (errorBody.message || "فشل في الإرسال"));
        } catch (e) {
          console.error("خطأ غير متوقع:", error);
          alert("حدث خطأ أثناء إضافة المناسبة");
        }
      } finally {
        // إخفاء spinner وإعادة تفعيل الزر
        saveText.classList.remove('d-none');
        saveSpinner.classList.add('d-none');
        saveBtn.disabled = false;
      }
    });
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
