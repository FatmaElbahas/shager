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

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

const treeId = getQueryParam("id");

// ======================= دالة التحكم في إظهار القوالب ======================= //
function handleTemplateDisplay(templateId) {
  console.log("🎨 معرف القالب المستلم:", templateId);

  // البحث عن عناصر القوالب بطرق مختلفة
  const familyTreeContainer = document.querySelector(".family-tree-container") || 
                              document.getElementById("tree_logo") ||
                              document.querySelector(".bg-white.rounded-4.p-4.my-5.text-center");
  const backgroundDiv = document.querySelector(".background");

  console.log("🔍 عنصر الشجرة العادية:", familyTreeContainer ? "✅ موجود" : "❌ غير موجود");
  console.log("🔍 عنصر القالب 12:", backgroundDiv ? "✅ موجود" : "❌ غير موجود");

  if (templateId === 12) {
    console.log("✅ عرض القالب رقم 12 (شجرة الخلفية)");

    // إخفاء div الشجرة العادية
    if (familyTreeContainer) {
      familyTreeContainer.style.display = "none";
      console.log("🚫 تم إخفاء div الشجرة العادية");
    }

    // إظهار div القالب رقم 12
    if (backgroundDiv) {
      backgroundDiv.style.display = "block";
      console.log("✨ تم إظهار div القالب رقم 12");
    } else {
      console.error("❌ لم يتم العثور على div القالب رقم 12");
    }
  } else {
    console.log("✅ عرض القالب العادي (معرف:", templateId, ")");

    // إظهار div الشجرة العادية
    if (familyTreeContainer) {
      familyTreeContainer.style.display = "block";
      console.log("✨ تم إظهار div الشجرة العادية");
    }

    // إخفاء div القالب رقم 12
    if (backgroundDiv) {
      backgroundDiv.style.display = "none";
      console.log("🚫 تم إخفاء div القالب رقم 12");
    }
  }
}

const familyContainer = document.getElementById("familyContainer");

async function loadFamilyDetails() {
  if (!treeId) return;

  try {
    const response = await fetch(
      `/api/families/${treeId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error("فشل في جلب بيانات الشجرة");

    const data = await response.json();
    const tree = data.data;

    // تحديث اسم العائلة في العنوان
    const familyTitle = document.querySelector("#family-title");
    if (familyTitle) familyTitle.textContent = tree.tree_name;

    // تحديث البادج
    const familyBadge = document.querySelector("#family-badge");
    if (familyBadge) familyBadge.textContent = tree.tree_name;

    // تحديث breadcrumb
    const breadcrumbActive = document.querySelector(".breadcrumb-item.active");
    if (breadcrumbActive) breadcrumbActive.textContent = tree.tree_name;

    // تحديث اسم العائلة في overlay
    const familyNameOverlay = document.querySelector("#family-name-overlay");
    if (familyNameOverlay) familyNameOverlay.textContent = tree.tree_name;

    // تحديث صورة الغلاف
    const coverImg = document.querySelector("#cover_image");
    if (coverImg && tree.cover_image) {
      coverImg.src = `/storage/${tree.cover_image}`;
    } else if (coverImg) {
      coverImg.src = "images/default_cover.jpg";
    }

    // تحديث شعار القبيلة
    const logoImg = document.getElementById("logo_image");
    if (logoImg && tree.logo_image) {
      logoImg.src = `/storage/${tree.logo_image}`;
    } else if (logoImg) {
      logoImg.src = "images/default_logo.png";
    }

    // تحديث صورة الشجرة
    const treeDiv = document.getElementById("tree_logo");
    const treeImg = treeDiv.querySelector(".tree-image-display");
    if (treeImg) {
      treeImg.src = tree.template?.image_url || "images/tree 1.png";
    }
  } catch (error) {
    console.error("خطأ في تحميل بيانات الشجرة:", error);
  }
}
const container = document.getElementById("occasionsContainerCards");
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

async function loadOccasions() {
  const container = document.getElementById("occasionsContainerCards");
  const loadingElement = document.getElementById("occasions-loading");

  try {
    const res = await fetch(`/api/families/${treeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();
    const occasions = result.occasions || [];

    // Hide loading
    if (loadingElement) loadingElement.style.display = "none";

    if (occasions.length === 0) {
      container.innerHTML = `
        <div class="loading-state">
          <div class="text-center">
            <i class="bi bi-calendar-x" style="font-size: 3rem; color: rgba(211, 171, 85, 0.5); margin-bottom: 1rem;"></i>
            <h5 style="color: rgba(39, 58, 65, 1);">لا توجد مناسبات لعرضها</h5>
            <p class="text-muted">سيتم عرض المناسبات هنا عند إضافتها</p>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = "";
    occasions.forEach((o, index) => {
      const occasionCard = `
        <div class="photo-card" style="animation-delay: ${index * 0.1}s">
          <img src="${
            o.cover_image
              ? "/storage/" + o.cover_image
              : "images/Frame 1410126302.png"
          }" alt="${o.details}" loading="lazy">
          <div class="body">
            <p class="photo-title">${o.details}</p>
            <p class="photo-date">
              <i class="bi bi-calendar-event"></i>
              ${formatDate(o.occasion_date)}
            </p>
          </div>
        </div>
      `;
      container.insertAdjacentHTML("beforeend", occasionCard);
    });

    // Add fade-in animation
    addFadeInAnimation();
  } catch (err) {
    console.error("خطأ في جلب المناسبات:", err);
    if (loadingElement) loadingElement.style.display = "none";
    container.innerHTML = `
      <div class="loading-state">
        <div class="text-center">
          <i class="bi bi-exclamation-triangle" style="font-size: 3rem; color: #dc3545; margin-bottom: 1rem;"></i>
          <h5 style="color: rgba(39, 58, 65, 1);">خطأ في تحميل المناسبات</h5>
          <p class="text-muted">يرجى المحاولة مرة أخرى</p>
        </div>
      </div>
    `;
  }
}

async function fetchNews() {
  const container = document.querySelector("#newsContainer");
  const loadingElement = document.getElementById("news-loading");

  try {
    const response = await fetch(
      `/api/families/${treeId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const result = await response.json();
    const newsList = result.news || [];

    // Hide loading
    if (loadingElement) loadingElement.style.display = "none";

    if (newsList.length === 0) {
      container.innerHTML = `
        <div class="loading-state">
          <div class="text-center">
            <i class="bi bi-newspaper" style="font-size: 3rem; color: rgba(211, 171, 85, 0.5); margin-bottom: 1rem;"></i>
            <h5 style="color: rgba(39, 58, 65, 1);">لا توجد أخبار لعرضها</h5>
            <p class="text-muted">سيتم عرض الأخبار هنا عند إضافتها</p>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = "";
    newsList.slice(0, 4).forEach((news, index) => {
      // Show only first 4 news
      const newsCard = `
        <div class="news-card-modern" style="animation-delay: ${index * 0.1}s">
          <div class="news-image-modern">
            <img src="${
              news.image
                ? "/storage/" + news.image
                : "images/default_images/default.jpg"
            }" alt="${news.title}" loading="lazy">
          </div>
          <div class="news-content-modern">
            <div class="news-meta-modern">
              <i class="bi bi-calendar3"></i>
              <span>${formatDateArabic(news.published_at)}</span>
            </div>
            <h6 class="news-title-modern">${news.title}</h6>
            <p class="news-excerpt-modern">${truncateText(
              news.full_description,
              120
            )}</p>
            <a href="newdetails.html?id=${news.id}" class="btn">
              <i class="bi bi-arrow-left me-1"></i> عرض التفاصيل
            </a>
          </div>
        </div>
      `;
      container.insertAdjacentHTML("beforeend", newsCard);
    });

    // Add fade-in animation
    addFadeInAnimation();
  } catch (error) {
    console.error("فشل في تحميل الأخبار", error);
    if (loadingElement) loadingElement.style.display = "none";
    container.innerHTML = `
      <div class="loading-state">
        <div class="text-center">
          <i class="bi bi-exclamation-triangle" style="font-size: 3rem; color: #dc3545; margin-bottom: 1rem;"></i>
          <h5 style="color: rgba(39, 58, 65, 1);">خطأ في تحميل الأخبار</h5>
          <p class="text-muted">يرجى المحاولة مرة أخرى</p>
        </div>
      </div>
    `;
  }
}

// استدعاء الأخبار عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {});

// Helper Functions
function formatDateArabic(dateString) {
  const date = new Date(dateString);
  const arabicMonths = {
    0: "يناير",
    1: "فبراير",
    2: "مارس",
    3: "أبريل",
    4: "مايو",
    5: "يونيو",
    6: "يوليو",
    7: "أغسطس",
    8: "سبتمبر",
    9: "أكتوبر",
    10: "نوفمبر",
    11: "ديسمبر",
  };

  const day = date.getDate();
  const month = arabicMonths[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

function truncateText(text, maxLength) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

function viewOccasionDetails(occasionId) {
  // Navigate to occasion details page or show modal
  console.log("Viewing occasion details for ID:", occasionId);
  // You can implement this based on your requirements
}

// Enhanced animations
function addFadeInAnimation() {
  const style = document.createElement("style");
  style.textContent = `
    .photo-card, .news-card-modern {
      opacity: 0;
      animation: fadeInUp 0.6s ease-out forwards;
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
}

// =================================================================

// Template 1

// ======================================================================

FamilyTree.templates.sriniz = Object.assign({}, FamilyTree.templates.base);

FamilyTree.templates.sriniz.size = [225, 90];
FamilyTree.templates.sriniz.node =
  '<rect x="0" y="0" height="90" width="225" stroke-width="1" rx="15" ry="15"></rect>';

FamilyTree.templates.sriniz.defs = `
<g transform="matrix(0.05,0,0,0.05,-13 ,-12)" id="heart">
    <path d="M448,256c0-106-86-192-192-192S64,150,64,256s86,192,192,192S448,362,448,256Z" style="fill:#fff;stroke:red;stroke-miterlimit:10;stroke-width:24px" fill="red"></path><path d="M256,360a16,16,0,0,1-9-2.78c-39.3-26.68-56.32-45-65.7-56.41-20-24.37-29.58-49.4-29.3-76.5.31-31.06,25.22-56.33,55.53-56.33,20.4,0,35,10.63,44.1,20.41a6,6,0,0,0,8.72,0c9.11-9.78,23.7-20.41,44.1-20.41,30.31,0,55.22,25.27,55.53,56.33.28,27.1-9.31,52.13-29.3,76.5-9.38,11.44-26.4,29.73-65.7,56.41A16,16,0,0,1,256,360Z" fill="red"></path>
  </g>
  <g id="sriniz_male_up">
    <circle cx="15" cy="15" r="10" fill="#fff" stroke="#fff" stroke-width="1"></circle>
    ${FamilyTree.icon.ft(15, 15, "#039BE5", 7.5, 7.5)}
  </g>

  <g id="sriniz_female_up">
    <circle cx="15" cy="15" r="10" fill="#fff" stroke="#fff" stroke-width="1"></circle>
    ${FamilyTree.icon.ft(15, 15, "#FF46A3", 7.5, 7.5)}
  </g>`;

// Male
FamilyTree.templates.sriniz_male = Object.assign(
  {},
  FamilyTree.templates.sriniz
);
FamilyTree.templates.sriniz_male.node =
  '<rect x="0" y="0" height="{h}" width="{w}" stroke-width="1" fill="#2d98df49" stroke="#3498db" rx="15" ry="15"></rect>';

FamilyTree.templates.sriniz_male.field_0 =
  '<text style="font-size: 20px; font-weight: bold;" fill="#3498db" x="200" y="50">{val}</text>';
FamilyTree.templates.sriniz_male.field_1 =
  '<text style="font-size: 12px; font-weight: bold;" fill="#ffffff" x="100" y="50">{val}</text>';

// Female
FamilyTree.templates.sriniz_female = Object.assign(
  {},
  FamilyTree.templates.sriniz
);
FamilyTree.templates.sriniz_female.node =
  '<rect x="0" y="0" height="{h}" width="{w}" stroke-width="1" fill="#e91e6233" stroke="#e91e63" rx="15" ry="15"></rect>';

FamilyTree.templates.sriniz_female.field_0 =
  '<text style="font-size: 20px; font-weight: bold;" fill="#e91e63" x="200" y="50">{val}</text>';
FamilyTree.templates.sriniz_female.field_1 =
  '<text style="font-size: 12px; font-weight: bold;" fill="#ffffff" x="100" y="50">{val}</text>';

const expandIconMale =
  '<circle cx="97" cy="-16" r="10" fill="#039BE5" stroke="#fff" stroke-width="1"><title>Expand</title></circle>' +
  '<line x1="90" y1="-16" x2="104" y2="-16" stroke-width="1" stroke="#fff"></line>' +
  '<line x1="97" y1="-23" x2="97" y2="-9" stroke-width="1" stroke="#fff"></line>';

const expandIconFemale =
  '<circle cx="97" cy="-16" r="10" fill="#FF46A3" stroke="#fff" stroke-width="1"></circle>' +
  '<line x1="90" y1="-16" x2="104" y2="-16" stroke-width="1" stroke="#fff"></line>' +
  '<line x1="97" y1="-23" x2="97" y2="-9" stroke-width="1" stroke="#fff"></line>';

FamilyTree.templates.sriniz_male.plus = expandIconMale;
FamilyTree.templates.sriniz_female.plus = expandIconFemale;

// Image
const imgTemplate =
  '<clipPath id="ulaImg">' +
  '<rect  height="75" width="75" x="7" y="7" stroke-width="1" fill="#FF46A3" stroke="#aeaeae" rx="15" ry="15"></rect>' +
  "</clipPath>" +
  '<image x="7" y="7" preserveAspectRatio="xMidYMid slice" clip-path="url(#ulaImg)" xlink:href="{val}" width="75" height="75">' +
  "</image>";

FamilyTree.templates.sriniz_male.img_0 = imgTemplate;
FamilyTree.templates.sriniz_female.img_0 = imgTemplate;

FamilyTree.templates.sriniz_male.up =
  '<use x="195" y="0" xlink:href="#sriniz_male_up"></use>';
FamilyTree.templates.sriniz_female.up =
  '<use x="195" y="0" xlink:href="#sriniz_female_up"></use>';

// Pointer
FamilyTree.templates.sriniz.pointer =
  '<g data-pointer="pointer" transform="matrix(0,0,0,0,80,80)">><g transform="matrix(0.3,0,0,0.3,-17,-17)">' +
  '<polygon fill="#039BE5" points="53.004,173.004 53.004,66.996 0,120" />' +
  '<polygon fill="#039BE5" points="186.996,66.996 186.996,173.004 240,120" />' +
  '<polygon fill="#FF46A3" points="66.996,53.004 173.004,53.004 120,0" />' +
  '<polygon fill="#FF46A3" points="120,240 173.004,186.996 66.996,186.996" />' +
  '<circle fill="red" cx="120" cy="120" r="30" />' +
  "</g></g>";

FamilyTree.templates.familyRoot = Object.assign({}, FamilyTree.templates.base);
FamilyTree.templates.familyRoot.size = [250, 80];
FamilyTree.templates.familyRoot.node =
  '<rect x="0" y="0" height="{h}" width="{w}" rx="20" ry="20" fill="#FFD700" stroke="#e0c200" stroke-width="2"></rect>' +
  '<text style="font-size: 20px; font-weight:bold;" fill="#000" x="125" y="50" text-anchor="middle">{val}</text>';

// ======================= Fetch API ======================= //
// ===================== جلب قيمة الـ query parameter من الرابط =====================
function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

if (!treeId) {
  console.error("❌ لا يوجد id للشجرة في الرابط!");
} else {
  fetch(`/api/tree-nodes/${treeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("لا توجد شجرة بهذا المعرف");
      return res.json();
    })
    .then((data) => {
      // التحقق من معرف القالب وإظهار القالب المناسب
      handleTemplateDisplay(data.template_id);

      if (data.template_id === 1) {
        const nodes = data.nodes.map((n) => {
          const defaultImage =
            n.gender === "female"
              ? "images/hugeicons_female-02.svg"
              : "images/hugeicons_male-02.svg";

          return {
            id: n.id,
            name: n.name,
            gender: n.gender,
            pids: n.pids || [],
            fid: n.fid || null,
            mid: n.mid || null,
            photo: n.profile_picture || defaultImage,
          };
        });

        document.getElementById("tree").innerHTML = "";
        const family = new FamilyTree(document.getElementById("tree"), {
          template: "sriniz",
          enableSearch: false,
          mouseScroll: FamilyTree.none,
          nodeMouseClick: FamilyTree.action.none,
          scaleInitial: FamilyTree.match.boundary,
          scaleMax: 1.5,
          nodeBinding: { field_0: "name", img_0: "photo" },
          nodes: nodes,
        });

        // Render heart between partners
        family.on("render-link", function (sender, args) {
          if (args.cnode.ppid != undefined)
            args.html +=
              '<use data-ctrl-ec-id="' +
              args.node.id +
              '" xlink:href="#heart" x="' +
              args.p.xa +
              '" y="' +
              args.p.ya +
              '"/>';
          if (args.cnode.isPartner && args.node.partnerSeparation == 30)
            args.html +=
              '<use data-ctrl-ec-id="' +
              args.node.id +
              '" xlink:href="#heart" x="' +
              args.p.xb +
              '" y="' +
              args.p.yb +
              '"/>';
        });
      }
    })
    .catch((err) => console.error("API Error:", err));
}

// =========================================================================

// Template 2

// ==============================================================================

// ========================= Template 2 =========================
FamilyTree.templates.template2 = Object.assign({}, FamilyTree.templates.base);
FamilyTree.templates.template2.size = [217, 269];
FamilyTree.templates.template2.node =
  '<rect x="0" y="0" height="90" width="225" stroke-width="1" rx="15" ry="15"></rect>';

// تعريف الـ defs (مثل sriniz)
FamilyTree.templates.template2.defs = `
<g transform="matrix(0.05,0,0,0.05,-13,-12)" id="heart">
  <path d="M448,256c0-106-86-192-192-192S64,150,64,256s86,192,192,192S448,362,448,256Z" style="fill:#fff;stroke:red;stroke-miterlimit:10;stroke-width:24px" fill="red"></path>
  <path d="M256,360a16,16,0,0,1-9-2.78c-39.3-26.68-56.32-45-65.7-56.41-20-24.37-29.58-49.4-29.3-76.5.31-31.06,25.22-56.33,55.53-56.33,20.4,0,35,10.63,44.1,20.41a6,6,0,0,0,8.72,0c9.11-9.78,23.7-20.41,44.1-20.41,30.31,0,55.22,25.27,55.53,56.33.28,27.1-9.31,52.13-29.3,76.5-9.38,11.44-26.4,29.73-65.7,56.41A16,16,0,0,1,256,360Z" fill="red"></path>
</g>
`;

// إعدادات الصورة وموضعها
const cardWidth2 = 217;
const cardHeight2 = 269;
const imgSize2 = 120;
const imgX2 = (cardWidth2 - imgSize2) / 2;
const imgY2 = 30;

const imgTemplate2 = `
<clipPath id="template2Img">
  <rect height="${imgSize2}" width="${imgSize2}" x="${imgX2}" y="${imgY2}" rx="15" ry="15"></rect>
</clipPath>
<image x="${imgX2}" y="${imgY2}" preserveAspectRatio="xMidYMid slice" clip-path="url(#template2Img)" xlink:href="{val}" width="${imgSize2}" height="${imgSize2}"></image>
`;

// Male
FamilyTree.templates.template2_male = Object.assign(
  {},
  FamilyTree.templates.template2
);
FamilyTree.templates.template2_male.node =
  '<rect x="0" y="0" height="{h}" width="{w}" stroke-width="5" fill="transparent" stroke="#1E88E5" rx="15" ry="15"></rect>';
FamilyTree.templates.template2_male.field_0 = `<text style="font-size:25px;font-weight:bolder;" fill="#1E88E5" x="${
  cardWidth2 / 2
}" y="${imgY2 + imgSize2 + 50}" text-anchor="middle">{val}</text>`;
FamilyTree.templates.template2_male.field_1 = `<text style="font-size:16px;font-weight:bolder;" fill="#1E88E5" x="${
  cardWidth2 / 2
}" y="${imgY2 + imgSize2 + 75}" text-anchor="middle">{val}</text>`;
FamilyTree.templates.template2_male.img_0 = imgTemplate2;

// Female
FamilyTree.templates.template2_female = Object.assign(
  {},
  FamilyTree.templates.template2
);
FamilyTree.templates.template2_female.node =
  '<rect x="0" y="0" height="{h}" width="{w}" stroke-width="5" fill="transparent" stroke="#E91E63" rx="15" ry="15"></rect>';
FamilyTree.templates.template2_female.field_0 = `<text style="font-size:25px;font-weight:bolder;" fill="#E91E63" x="${
  cardWidth2 / 2
}" y="${imgY2 + imgSize2 + 50}" text-anchor="middle">{val}</text>`;
FamilyTree.templates.template2_female.field_1 = `<text style="font-size:16px;font-weight:bolder;" fill="#E91E63" x="${
  cardWidth2 / 2
}" y="${imgY2 + imgSize2 + 75}" text-anchor="middle">{val}</text>`;
FamilyTree.templates.template2_female.img_0 = imgTemplate2;

// Expand icon
const expandIconMale2 =
  '<circle cx="97" cy="-16" r="10" fill="#1E88E5" stroke="#fff" stroke-width="1"><title>Expand</title></circle><line x1="90" y1="-16" x2="104" y2="-16" stroke-width="1" stroke="#fff"></line><line x1="97" y1="-23" x2="97" y2="-9" stroke-width="1" stroke="#fff"></line>';
const expandIconFemale2 =
  '<circle cx="97" cy="-16" r="10" fill="#E91E63" stroke="#fff" stroke-width="1"></circle><line x1="90" y1="-16" x2="104" y2="-16" stroke-width="1" stroke="#fff"></line><line x1="97" y1="-23" x2="97" y2="-9" stroke-width="1" stroke="#fff"></line>';
FamilyTree.templates.template2_male.plus = expandIconMale2;
FamilyTree.templates.template2_female.plus = expandIconFemale2;

function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

if (!treeId) {
  console.error("❌ لا يوجد id للشجرة في الرابط!");
} else {
  fetch(`/api/tree-nodes/${treeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      // التحقق من معرف القالب وإظهار القالب المناسب
      handleTemplateDisplay(data.template_id);
      
      // فلترة الـ nodes حسب الـ template_id
      const templateId = data.template_id; // القالب المختار من API

      let nodes = data.nodes.map((n) => {
        const defaultImage =
          n.gender === "female"
            ? "images/Frame 1410126454 (1).svg"
            : "images/Frame 1410126454.svg";

        return {
          id: n.id,
          name: n.name,
          birth_date: n.birth_date || "",
          gender: n.gender,
          pids: n.pids || [],
          fid: n.fid,
          mid: n.mid,
          photo: n.photo || defaultImage,
        };
      });

      let selectedTemplate = templateId === 2 ? "template2" : "sriniz";

      let nodeBinding =
        templateId === 2
          ? { field_0: "name", field_1: "birth_date", img_0: "photo" }
          : { field_0: "name", img_0: "photo" };

      var family = new FamilyTree(document.getElementById("tree"), {
        mouseScroll: FamilyTree.none,
        template: selectedTemplate,
        enableSearch: false,
        nodeMouseClick: FamilyTree.action.none,
        scaleInitial: FamilyTree.match.boundary,
        scaleMax: 1.5,
        nodeBinding: nodeBinding,
        nodes: nodes,
      });

      // Render heart بين الشركاء (لو محتاجينه)
      // family.on("render-link", function (sender, args) {
      // يمكن إلغاء الكود لو مش محتاجين القلب
      // });
    })
    .catch((err) => console.error("API Error:", err));
}

// ======================================================================
// Temolate 3
// ======================================================================

// القالب الأساسي
FamilyTree.templates.card = Object.assign({}, FamilyTree.templates.base);
FamilyTree.templates.card.size = [180, 260];

// ===== الشكل الأساسي للذكر =====
FamilyTree.templates.card_male = Object.assign({}, FamilyTree.templates.card);
FamilyTree.templates.card_male.node = `
        <rect x="0" y="0" width="{w}" height="{h}" rx="20" ry="20" fill="#f2f2f2" stroke="#ddd" stroke-width="1"></rect>
    `;

// ===== الشكل الأساسي للأنثى =====
FamilyTree.templates.card_female = Object.assign({}, FamilyTree.templates.card);
FamilyTree.templates.card_female.node = `
        <rect x="0" y="0" width="{w}" height="{h}" rx="20" ry="20" fill="#c3eeb4" stroke="#c3eeb4" stroke-width="1"></rect>
    `;

// الصورة (في النص فوق)
FamilyTree.templates.card_male.img_0 = `
        <clipPath id="maleImg">
            <rect x="40" y="15" width="100" height="100" rx="15" ry="15"></rect>
        </clipPath>
        <image x="40" y="15" width="100" height="100" preserveAspectRatio="xMidYMid slice"
            clip-path="url(#maleImg)" xlink:href="{val}"></image>
    `;
FamilyTree.templates.card_female.img_0 = `
        <clipPath id="femaleImg">
            <rect x="40" y="15" width="100" height="100" rx="15" ry="15"></rect>
        </clipPath>
        <image x="40" y="15" width="100" height="100" preserveAspectRatio="xMidYMid slice"
            clip-path="url(#femaleImg)" xlink:href="{val}"></image>
    `;
// الاسم (تحت الصورة)
FamilyTree.templates.card_male.field_0 = `<text style="font-size: 18px; font-weight: bold;" fill="#000"
            x="90" y="140" text-anchor="middle">{val}</text>`;
FamilyTree.templates.card_female.field_0 = `<text style="font-size: 18px; font-weight: bold;" fill="#000"
            x="90" y="140" text-anchor="middle">{val}</text>`;

// العلاقة
FamilyTree.templates.card_male.field_2 = `<rect x="50" y="150" width="80" height="25" rx="8" ry="8" fill="#000"></rect>
         <text style="font-size: 14px; font-weight: bold;" fill="#fff" x="90" y="167" text-anchor="middle">{val}</text>`;
FamilyTree.templates.card_female.field_2 = `<rect x="50" y="150" width="80" height="25" rx="8" ry="8" fill="#000"></rect>
         <text style="font-size: 14px; font-weight: bold;" fill="#fff" x="90" y="167" text-anchor="middle">{val}</text>`;

// تاريخ الميلاد
FamilyTree.templates.card_male.field_1 = `<text style="font-size: 14px;" fill="#333" x="90" y="200" text-anchor="middle">🎂 {val}</text>`;
FamilyTree.templates.card_female.field_1 = `<text style="font-size: 14px;" fill="#333" x="90" y="200" text-anchor="middle">🎂 {val}</text>`;

// الهاتف
FamilyTree.templates.card_male.field_3 = `<text style="font-size: 14px;" fill="#333" x="90" y="225" text-anchor="middle">📞 {val}</text>`;
FamilyTree.templates.card_female.field_3 = `<text style="font-size: 14px;" fill="#333" x="90" y="225" text-anchor="middle">📞 {val}</text>`;

// ======================= جلب البيانات من الـ API ======================= //
function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

if (!treeId) {
  console.error("❌ لا يوجد id للشجرة في الرابط!");
} else {
  fetch(`/api/tree-nodes/${treeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // التحقق من معرف القالب وإظهار القالب المناسب
      handleTemplateDisplay(data.template_id);
      
      const formattedNodes = data.nodes.map((node) => ({
        id: node.id,
        name: node.name,
        relation: node.relation,
        birth_date: node.birth_date,
        phone_number: node.phone_number,
        gender: node.gender,
        photo: node.profile_picture,
        pids: node.pids || [],
        fid: node.fid || null,
        mid: node.mid || null,
      }));

      if (data.template_id === 3) {
        document.getElementById("tree").innerHTML = "";

        new FamilyTree(document.getElementById("tree"), {
          enableSearch: false,
          template: "card",
          nodeBinding: {
            field_0: "name",
            field_1: "birth_date",
            field_2: "relation",
            field_3: "phone_number",
            img_0: "photo",
          },
          nodes: formattedNodes,
        });
      }
    })
    .catch((error) => console.error("خطأ في جلب البيانات:", error));
}
// ==================================================================================

// Template 4

// ==================================================================================

// ========================= Template 4 ========================= //

// ==================== الأساس ==================== //
FamilyTree.templates.sriniz4 = Object.assign({}, FamilyTree.templates.base);
FamilyTree.templates.sriniz4.size = [250, 100];
FamilyTree.templates.sriniz4.node =
  '<rect x="0" y="0" height="{h}" width="{w}" rx="10" ry="10" stroke="#999" fill="#fff" stroke-width="1"></rect>';

// ==================== ذكر ==================== //
FamilyTree.templates.sriniz4_male = Object.assign(
  {},
  FamilyTree.templates.sriniz4
);
FamilyTree.templates.sriniz4_male.node =
  '<rect x="0" y="0" height="{h}" width="{w}" rx="5" ry="5" fill="#eaf0ff" stroke="#adc4ff" stroke-width="1"></rect>';

FamilyTree.templates.sriniz4_male.img_0 =
  '<clipPath id="maleImg"><rect x="10" y="15" width="70" height="70" rx="15" ry="15"></rect></clipPath>' +
  '<image x="10" y="15" width="80" height="80" preserveAspectRatio="xMidYMid slice" clip-path="url(#maleImg)" xlink:href="{val}"></image>';

FamilyTree.templates.sriniz4_male.field_0 =
  '<text style="font-size: 16px; font-weight: 800;" fill="rgba(65, 65, 65, 1)" x="115" y="40">{val}</text>';
FamilyTree.templates.sriniz4_male.field_1 =
  '<text style="font-size: 12px; font-weight: 400;" fill="rgba(65, 65, 65, 1)" x="170" y="60">{val}🎂</text>';

// ==================== أنثى ==================== //
FamilyTree.templates.sriniz4_female = Object.assign(
  {},
  FamilyTree.templates.sriniz4
);
FamilyTree.templates.sriniz4_female.node =
  '<rect x="0" y="0" height="{h}" width="{w}" rx="5" ry="5" fill="#ffeaf0" stroke="#ffadc4" stroke-width="1"></rect>';

FamilyTree.templates.sriniz4_female.img_0 =
  '<clipPath id="femaleImg"><rect x="10" y="15" width="70" height="70" rx="15" ry="15"></rect></clipPath>' +
  '<image x="10" y="15" width="80" height="80" preserveAspectRatio="xMidYMid slice" clip-path="url(#femaleImg)" xlink:href="{val}"></image>';

FamilyTree.templates.sriniz4_female.field_0 =
  '<text style="font-size: 16px; font-weight: 1000;" fill="rgba(65, 65, 65, 1)" x="115" y="40">{val}</text>';
FamilyTree.templates.sriniz4_female.field_1 =
  '<text style="font-size: 12px; font-weight: 400;" fill="rgba(65, 65, 65, 1)" x="170" y="60">{val}🎂</text>';

// ==================== Fetch API ==================== //
function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

if (!treeId) {
  console.error("❌ لا يوجد id للشجرة في الرابط!");
} else {
  fetch(`/api/tree-nodes/${treeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      // التحقق من معرف القالب وإظهار القالب المناسب
      handleTemplateDisplay(data.template_id);
      
      let nodes = data.nodes.map((n) => {
        return {
          id: n.id,
          name: n.name,
          gender: n.gender,
          birth_date: n.birth_date || "",
          death_date: n.death_date || "",
          photo: n.profile_picture,
          pids: n.pids || [],
          fid: n.fid,
          mid: n.mid,
        };
      });

      if (data.template_id === 4) {
        document.getElementById("tree").innerHTML = "";
        var family = new FamilyTree(document.getElementById("tree"), {
          mouseScroll: FamilyTree.none,
          template: "sriniz4",
          enableSearch: false,
          nodeMouseClick: FamilyTree.action.none,
          scaleInitial: FamilyTree.match.boundary,
          scaleMax: 1.5,
          nodeBinding: {
            field_0: "name",
            img_0: "photo",
            field_1: "birth_date",
            field_2: "death_date",
          },
          nodes: nodes,
        });

        // ==================== شكل الماسة بين الزوجين ==================== //
        family.on("render-link", function (sender, args) {
          if (args.cnode.isPartner) {
            args.html +=
              '<rect x="' +
              (args.p.xa + 10) +
              '" y="' +
              (args.p.ya - 10) +
              '" width="20" height="20" transform="rotate(45 ' +
              (args.p.xa + 20) +
              " " +
              args.p.ya +
              ')" ' +
              'fill="rgba(65, 65, 65, 1)" stroke="rgba(65, 65, 65, 1)" stroke-width="1"></rect>';
          }
        });
      }
    })
    .catch((err) => console.error("API Error:", err));
}

// =================================================================
// Template 5
// ================================================================

// ========================= Template 5 ========================= //

// ==================== الأساس ==================== //
FamilyTree.templates.sriniz5 = Object.assign({}, FamilyTree.templates.base);
FamilyTree.templates.sriniz5.size = [140, 150]; // زودت شوية علشان الباكجراوند

FamilyTree.templates.sriniz5.node =
  '<rect x="0" y="0" height="{h}" width="{w}" fill="transparent" stroke="transparent"></rect>';

// ==================== ذكر ==================== //
FamilyTree.templates.sriniz5_male = Object.assign(
  {},
  FamilyTree.templates.sriniz5
);
FamilyTree.templates.sriniz5_male.img_0 =
  '<clipPath id="maleImg"><circle cx="70" cy="70" r="60"></circle></clipPath>' +
  '<image x="10" y="10" width="120" height="120" preserveAspectRatio="xMidYMid slice" clip-path="url(#maleImg)" xlink:href="{val}"></image>';

FamilyTree.templates.sriniz5_male.field_0 =
  '<rect x="10" y="145" width="120" height="25" rx="15" ry="15" fill="rgba(185,126,0,1)"></rect>' +
  '<text style="font-size: 16px; font-weight: 700; text-anchor: middle;" fill="#fff" x="70" y="163">{val}</text>';

// ==================== أنثى ==================== //
FamilyTree.templates.sriniz5_female = Object.assign(
  {},
  FamilyTree.templates.sriniz5
);
FamilyTree.templates.sriniz5_female.img_0 =
  '<clipPath id="femaleImg"><circle cx="70" cy="70" r="60"></circle></clipPath>' +
  '<image x="10" y="10" width="120" height="120" preserveAspectRatio="xMidYMid slice" clip-path="url(#femaleImg)" xlink:href="{val}"></image>';

FamilyTree.templates.sriniz5_female.field_0 =
  '<rect x="10" y="145" width="120" height="25" rx="15" ry="15" fill="rgba(185,126,0,1)"></rect>' +
  '<text style="font-size: 16px; font-weight: 700; text-anchor: middle;" fill="#fff" x="70" y="163">{val}</text>';

// ==================== Fetch API ==================== //
function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

if (!treeId) {
  console.error("❌ لا يوجد id للشجرة في الرابط!");
} else {
  fetch(`/api/tree-nodes/${treeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      // التحقق من معرف القالب وإظهار القالب المناسب
      handleTemplateDisplay(data.template_id);
      
      let nodes = data.nodes.map((n) => {
        return {
          id: n.id,
          name: n.name,
          gender: n.gender,
          photo: n.profile_picture,
          fid: n.fid,
          mid: n.mid,
          pids: n.pids || [],
        };
      });

      if (data.template_id === 5) {
        document.getElementById("tree").innerHTML = "";
        var family = new FamilyTree(document.getElementById("tree"), {
          mouseScroll: FamilyTree.none,
          template: "sriniz5",
          enableSearch: false,
          nodeMouseClick: FamilyTree.action.none,
          scaleInitial: FamilyTree.match.boundary,
          scaleMax: 1.5,
          nodeBinding: {
            field_0: "name",
            img_0: "photo",
          },
          nodes: nodes,
        });
        // ==================== تلوين الروابط ==================== //
        family.on("render-link", function (sender, args) {
          if (args.html) {
            args.html = args.html.replace(
              /stroke="[^"]*"/g,
              'stroke="rgba(185, 126, 0, 1)"'
            );
            args.html = args.html.replace(
              /stroke-width="[^"]*"/g,
              'stroke-width="2"'
            );
          }
        });
      }
    })
    .catch((err) => console.error("API Error:", err));
}

// ===========================================================

// Template 6

// ===========================================================

// ========================= Template 6 ========================= //

// ==================== الأساس ==================== //
FamilyTree.templates.sriniz6 = Object.assign({}, FamilyTree.templates.base);
FamilyTree.templates.sriniz6.size = [140, 150]; // زودت شوية علشان الباكجراوند

FamilyTree.templates.sriniz6.node =
  '<rect x="0" y="0" height="{h}" width="{w}" fill="transparent" stroke="transparent"></rect>';

// ==================== ذكر ==================== //
FamilyTree.templates.sriniz6_male = Object.assign(
  {},
  FamilyTree.templates.sriniz6
);

FamilyTree.templates.sriniz6_male.field_0 =
  '<rect x="0" y="60" width="140" height="35" rx="15" ry="15" fill="rgba(236, 211, 156, 1)"></rect>' +
  '<text style="font-size: 16px; font-weight: 700; text-anchor: middle;" fill="rgba(0, 0, 0, 0.7)" x="70" y="80">{val}</text>';

// ==================== أنثى ==================== //
FamilyTree.templates.sriniz6_female = Object.assign(
  {},
  FamilyTree.templates.sriniz6
);

FamilyTree.templates.sriniz6_female.field_0 =
  '<rect x="0" y="60" width="140" height="35" rx="15" ry="15" fill="rgba(236, 167, 193, 1)"></rect>' +
  '<text style="font-size: 16px; font-weight: 700; text-anchor: middle;" fill="#fff" x="70" y="80">{val}</text>';

// ==================== Fetch API ==================== //
function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

if (!treeId) {
  console.error("❌ لا يوجد id للشجرة في الرابط!");
} else {
  fetch(`/api/tree-nodes/${treeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      // التحقق من معرف القالب وإظهار القالب المناسب
      handleTemplateDisplay(data.template_id);
      
      let nodes = data.nodes.map((n) => {
        return {
          id: n.id,
          name: n.name,
          gender: n.gender,
          fid: n.fid,
          mid: n.mid,
          pids: n.pids || [],
        };
      });

      if (data.template_id === 6) {
        document.getElementById("tree").innerHTML = "";
        var family = new FamilyTree(document.getElementById("tree"), {
          mouseScroll: FamilyTree.none,
          orientation: FamilyTree.orientation.top,
          template: "sriniz6",
          enableSearch: false,
          nodeMouseClick: FamilyTree.action.none,
          scaleInitial: FamilyTree.match.boundary,
          scaleMax: 1.5,
          nodeBinding: {
            field_0: "name",
          },
          nodes: nodes,
        });

        // ==================== تلوين الروابط ==================== //
        family.on("render-link", function (sender, args) {
          if (args.html) {
            args.html = args.html.replace(
              /stroke="[^"]*"/g,
              'stroke="rgba(181, 181, 181, 1)"'
            );
            args.html = args.html.replace(
              /stroke-width="[^"]*"/g,
              'stroke-width="2"'
            );
          }
        });
      }
    })
    .catch((err) => console.error("API Error:", err));
}

// ==========================================================
// template 7
// ==========================================================

// ========================= Template 7 ========================= //

// ==================== الأساس ==================== //
FamilyTree.templates.sriniz7 = Object.assign({}, FamilyTree.templates.base);
FamilyTree.templates.sriniz7.size = [140, 150]; // زودت شوية علشان الباكجراوند

FamilyTree.templates.sriniz7.node =
  '<rect x="0" y="0" height="{h}" width="{w}" fill="transparent" stroke="transparent"></rect>';

// ==================== ذكر ==================== //
FamilyTree.templates.sriniz7_male = Object.assign(
  {},
  FamilyTree.templates.sriniz7
);

FamilyTree.templates.sriniz7_male.field_0 =
  '<rect x="0" y="60" width="140" height="35" rx="15" ry="15" fill="rgba(236, 211, 156, 1)"></rect>' +
  '<text style="font-size: 16px; font-weight: 700; text-anchor: middle;" fill="rgba(0, 0, 0, 0.7)" x="70" y="80">{val}</text>';

// ==================== أنثى ==================== //
FamilyTree.templates.sriniz7_female = Object.assign(
  {},
  FamilyTree.templates.sriniz7
);

FamilyTree.templates.sriniz7_female.field_0 =
  '<rect x="0" y="60" width="140" height="35" rx="15" ry="15" fill="rgba(236, 167, 193, 1)"></rect>' +
  '<text style="font-size: 16px; font-weight: 700; text-anchor: middle;" fill="#fff" x="70" y="80">{val}</text>';

// ==================== Fetch API ==================== //
function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

if (!treeId) {
  console.error("❌ لا يوجد id للشجرة في الرابط!");
} else {
  fetch(`/api/tree-nodes/${treeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      // التحقق من معرف القالب وإظهار القالب المناسب
      handleTemplateDisplay(data.template_id);
      
      let nodes = data.nodes.map((n) => {
        return {
          id: n.id,
          name: n.name,
          gender: n.gender,
          fid: n.fid,
          mid: n.mid,
          pids: n.pids || [],
        };
      });

      if (data.template_id === 7) {
        document.getElementById("tree").innerHTML = "";
        var family = new FamilyTree(document.getElementById("tree"), {
          mouseScroll: FamilyTree.none,
          orientation: FamilyTree.orientation.left,
          template: "sriniz7",
          enableSearch: false,
          nodeMouseClick: FamilyTree.action.none,
          scaleInitial: FamilyTree.match.boundary,
          scaleMax: 1.5,
          nodeBinding: {
            field_0: "name",
          },
          nodes: nodes,
        });

        // ==================== تلوين الروابط ==================== //
        family.on("render-link", function (sender, args) {
          if (args.html) {
            args.html = args.html.replace(
              /stroke="[^"]*"/g,
              'stroke="rgba(181, 181, 181, 1)"'
            );
            args.html = args.html.replace(
              /stroke-width="[^"]*"/g,
              'stroke-width="2"'
            );
          }
        });
      }
    })
    .catch((err) => console.error("API Error:", err));
}

// ==========================================================
// template 8
// ==========================================================

// ========================= Template 8 ========================= //

// ==================== الأساس ==================== //
FamilyTree.templates.sriniz8 = Object.assign({}, FamilyTree.templates.base);
FamilyTree.templates.sriniz8.size = [250, 110];
FamilyTree.templates.sriniz8.node =
  '<rect x="0" y="0" height="{h}" width="{w}" rx="10" ry="10" stroke="#999" fill="#fff" stroke-width="1"></rect>';

// ==================== ذكر ==================== //
FamilyTree.templates.sriniz8_male = Object.assign(
  {},
  FamilyTree.templates.sriniz8
);
FamilyTree.templates.sriniz8_male.node =
  '<rect x="0" y="0" height="{h}" width="{w}" rx="5" ry="5" fill="rgba(133, 182, 255, 1)" stroke="rgba(133, 182, 255, 1)" stroke-width="1"></rect>';

FamilyTree.templates.sriniz8_male.img_0 =
  '<clipPath id="femaleImg"><circle cx="55" cy="55" r="45"></circle></clipPath>' +
  '<image x="10" y="10" width="90" height="90" preserveAspectRatio="xMidYMid slice" clip-path="url(#femaleImg)" xlink:href="{val}"></image>';

FamilyTree.templates.sriniz8_male.field_0 =
  '<text style="font-size: 22px; font-weight: 1000;" fill="rgba(51, 51, 51, 1)" x="125" y="45" text-anchor="middle">{val}</text>';
FamilyTree.templates.sriniz8_male.field_1 =
  '<text style="font-size: 12px; font-weight: 400;" fill="rgba(51, 51, 51, 1)" x="170" y="65">{val}</text>';

// ==================== أنثى ==================== //
FamilyTree.templates.sriniz8_female = Object.assign(
  {},
  FamilyTree.templates.sriniz8
);
FamilyTree.templates.sriniz8_female.node =
  '<rect x="0" y="0" height="{h}" width="{w}" rx="5" ry="5" fill="rgba(255, 154, 98, 1)" stroke="rgba(255, 154, 98, 1)" stroke-width="1"></rect>';

FamilyTree.templates.sriniz8_female.img_0 =
  '<clipPath id="femaleImg"><circle cx="55" cy="55" r="45"></circle></clipPath>' +
  '<image x="10" y="10" width="90" height="90" preserveAspectRatio="xMidYMid slice" clip-path="url(#femaleImg)" xlink:href="{val}"></image>';

FamilyTree.templates.sriniz8_female.field_0 =
  '<text style="font-size: 22px; font-weight: 1000;" fill="rgba(51, 51, 51, 1)" x="130" y="45" text-anchor="middle">{val}</text>';
FamilyTree.templates.sriniz8_female.field_1 =
  '<text style="font-size: 12px; font-weight: 400;" fill="rgba(51, 51, 51, 1)" x="170" y="65">{val}</text>';

// ==================== Fetch API ==================== //

function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

if (!treeId) {
  console.error("❌ لا يوجد id للشجرة في الرابط!");
} else {
  fetch(`/api/tree-nodes/${treeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      // التحقق من معرف القالب وإظهار القالب المناسب
      handleTemplateDisplay(data.template_id);
      
      let nodes = data.nodes.map((n) => {
        return {
          id: n.id,
          name: n.name,
          gender: n.gender,
          birth_date: n.birth_date || "",
          death_date: n.death_date || "",
          photo: n.profile_picture,
          pids: n.pids || [],
          fid: n.fid,
          mid: n.mid,
        };
      });

      if (data.template_id === 8) {
        document.getElementById("tree").innerHTML = "";
        var family = new FamilyTree(document.getElementById("tree"), {
          mouseScroll: FamilyTree.none,
          template: "sriniz8",
          enableSearch: false,
          nodeMouseClick: FamilyTree.action.none,
          scaleInitial: FamilyTree.match.boundary,
          scaleMax: 1.5,
          nodeBinding: {
            field_0: "name",
            img_0: "photo",
            field_1: "birth_date",
            field_2: "death_date",
          },
          nodes: nodes,
        });
      }

      // ==================== شكل الماسة بين الزوجين ==================== //
      // family.on("render-link", function (sender, args) {
      // if (args.cnode.isPartner) {
      //     args.html +=
      //         '<rect x="' +
      //         (args.p.xa + 10) +
      //         '" y="' +
      //         (args.p.ya - 10) +
      //         '" width="20" height="20" transform="rotate(45 ' +
      //         (args.p.xa + 20) +
      //         " " +
      //         args.p.ya +
      //         ')" ' +
      //         'fill="rgba(65, 65, 65, 1)" stroke="rgba(65, 65, 65, 1)" stroke-width="1"></rect>';
      // }
      // });
    })
    .catch((err) => console.error("API Error:", err));
}

// ==========================================================
//  Template 9
// ==========================================================

// ========================= Template 9 ========================= //

FamilyTree.templates.template9 = Object.assign({}, FamilyTree.templates.base);
FamilyTree.templates.template9.size = [217, 269];
FamilyTree.templates.template9.node =
  '<rect x="0" y="0" height="90" width="225" stroke-width="1" rx="15" ry="15"></rect>';

// تعريف الـ defs (مثل sriniz)
FamilyTree.templates.template9.defs = `
<g transform="matrix(0.05,0,0,0.05,-13,-12)" id="heart">
  <path d="M448,256c0-106-86-192-192-192S64,150,64,256s86,192,192,192S448,362,448,256Z" style="fill:#fff;stroke:red;stroke-miterlimit:10;stroke-width:24px" fill="red"></path>
  <path d="M256,360a16,16,0,0,1-9-2.78c-39.3-26.68-56.32-45-65.7-56.41-20-24.37-29.58-49.4-29.3-76.5.31-31.06,25.22-56.33,55.53-56.33,20.4,0,35,10.63,44.1,20.41a6,6,0,0,0,8.72,0c9.11-9.78,23.7-20.41,44.1-20.41,30.31,0,55.22,25.27,55.53,56.33.28,27.1-9.31,52.13-29.3,76.5-9.38,11.44-26.4,29.73-65.7,56.41A16,16,0,0,1,256,360Z" fill="red"></path>
</g>
`;

// إعدادات الصورة وموضعها
const cardWidth9 = 217;
const cardHeight9 = 260;
const imgSize9 = 120;
const imgX9 = (cardWidth9 - imgSize9) / 2;
const imgY9 = 30;

const imgTemplate9 = `
<clipPath id="template2Img">
  <rect height="${imgSize9}" width="${imgSize9}" x="${imgX9}" y="${imgY9}" rx="15" ry="15"></rect>
</clipPath>
<image x="${imgX9}" y="${imgY9}" preserveAspectRatio="xMidYMid slice" clip-path="url(#template2Img)" xlink:href="{val}" width="${imgSize9}" height="${imgSize2}"></image>
`;

// Male
FamilyTree.templates.template9_male = Object.assign(
  {},
  FamilyTree.templates.template9
);
FamilyTree.templates.template9_male.node =
  '<rect x="0" y="0" height="{h}" width="{w}" stroke-width="1" fill="transparent" stroke="rgba(193, 193, 193, 1)" rx="15" ry="15"></rect>';
FamilyTree.templates.template9_male.field_0 = `<text style="font-size:28px;font-weight:bolder;" fill="dark" x="${
  cardWidth2 / 2
}" y="${imgY2 + imgSize2 + 50}" text-anchor="middle">{val}</text>`;
FamilyTree.templates.template9_male.field_1 = `<text style="font-size:16px;font-weight:bolder;" fill="rgba(102, 102, 102, 1)" x="${
  cardWidth2 / 2
}" y="${imgY2 + imgSize2 + 75}" text-anchor="middle">{val}</text>`;
FamilyTree.templates.template9_male.img_0 = imgTemplate9;

// Female
FamilyTree.templates.template9_female = Object.assign(
  {},
  FamilyTree.templates.template9
);
FamilyTree.templates.template9_female.node =
  '<rect x="0" y="0" height="{h}" width="{w}" stroke-width="1" fill="transparent" stroke="rgba(193, 193, 193, 1)" rx="15" ry="15"></rect>';
FamilyTree.templates.template9_female.field_0 = `<text style="font-size:28px;font-weight:bolder;" fill="dark" x="${
  cardWidth2 / 2
}" y="${imgY9 + imgSize9 + 50}" text-anchor="middle">{val}</text>`;
FamilyTree.templates.template9_female.field_1 = `<text style="font-size:16px;font-weight:bolder;" fill="rgba(102, 102, 102, 1)" x="${
  cardWidth2 / 2
}" y="${imgY9 + imgSize9 + 75}" text-anchor="middle">{val}</text>`;
FamilyTree.templates.template9_female.img_0 = imgTemplate9;

// Expand icon
const expandIconMale9 =
  '<circle cx="97" cy="-16" r="10" fill="#1E88E5" stroke="#fff" stroke-width="1"><title>Expand</title></circle><line x1="90" y1="-16" x2="104" y2="-16" stroke-width="1" stroke="#fff"></line><line x1="97" y1="-23" x2="97" y2="-9" stroke-width="1" stroke="#fff"></line>';
const expandIconFemale9 =
  '<circle cx="97" cy="-16" r="10" fill="#E91E63" stroke="#fff" stroke-width="1"></circle><line x1="90" y1="-16" x2="104" y2="-16" stroke-width="1" stroke="#fff"></line><line x1="97" y1="-23" x2="97" y2="-9" stroke-width="1" stroke="#fff"></line>';
FamilyTree.templates.template9_male.plus = expandIconMale9;
FamilyTree.templates.template9_female.plus = expandIconFemale9;

function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

if (!treeId) {
  console.error("❌ لا يوجد id للشجرة في الرابط!");
} else {
  fetch(`/api/tree-nodes/${treeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      // التحقق من معرف القالب وإظهار القالب المناسب
      handleTemplateDisplay(data.template_id);
      
      let nodes = data.nodes.map((n) => {
        const defaultImage =
          n.gender === "female" ? "images/female 1.svg" : "images/male 1.svg";

        return {
          id: n.id,
          name: n.name,
          birth_date: n.birth_date || "",
          gender: n.gender,
          pids: n.pids || [],
          fid: n.fid,
          mid: n.mid,
          photo: n.photo || defaultImage,
        };
      });

      if (data.template_id === 9) {
        document.getElementById("tree").innerHTML = "";
        var family = new FamilyTree(document.getElementById("tree"), {
          mouseScroll: FamilyTree.none,
          template: "template9",
          enableSearch: false,
          nodeMouseClick: FamilyTree.action.none,
          scaleInitial: FamilyTree.match.boundary,
          scaleMax: 1.5,
          nodeBinding: {
            field_0: "name",
            field_1: "birth_date",
            img_0: "photo",
          },
          nodes: nodes,
        });
      }
    })
    .catch((err) => console.error("API Error:", err));
}

// ===========================================================

// Final Template

// ==========================================================

// القالب الأساسي
FamilyTree.templates.card2 = Object.assign({}, FamilyTree.templates.base);
FamilyTree.templates.card2.size = [180, 260];

// ===== الشكل الأساسي للذكر =====
FamilyTree.templates.card2_male = Object.assign({}, FamilyTree.templates.card2);
FamilyTree.templates.card2_male.node = `
        <rect x="0" y="0" width="{w}" height="{h}" rx="30" ry="30" fill="rgba(233, 229, 213, 1)" stroke="rgba(0, 0, 0, 0.04)" stroke-width="1"></rect>
    `;

// ===== الشكل الأساسي للأنثى =====
FamilyTree.templates.card2_female = Object.assign(
  {},
  FamilyTree.templates.card2
);
FamilyTree.templates.card2_female.node = `
        <rect x="0" y="0" width="{w}" height="{h}" rx="30" ry="30" fill="rgba(236, 167, 193, 1)" stroke="rgba(0, 0, 0, 0.04)" stroke-width="1"></rect>
    `;

// الصورة (في النص فوق)
FamilyTree.templates.card2_male.img_0 = `
        <clipPath id="maleImg">
            <rect x="40" y="15" width="100" height="100" rx="15" ry="15"></rect>
        </clipPath>
        <image x="40" y="15" width="100" height="100" preserveAspectRatio="xMidYMid slice"
            clip-path="url(#maleImg)" xlink:href="{val}"></image>
    `;
FamilyTree.templates.card2_female.img_0 = `
        <clipPath id="femaleImg">
            <rect x="40" y="15" width="100" height="100" rx="15" ry="15"></rect>
        </clipPath>
        <image x="40" y="15" width="100" height="100" preserveAspectRatio="xMidYMid slice"
            clip-path="url(#femaleImg)" xlink:href="{val}"></image>
    `;
// الاسم (تحت الصورة)
FamilyTree.templates.card2_male.field_0 = `<text style="font-size: 18px; font-weight: bold;" fill="#000"
            x="90" y="140" text-anchor="middle">{val}</text>`;
FamilyTree.templates.card2_female.field_0 = `<text style="font-size: 18px; font-weight: bold;" fill="#000"
            x="90" y="140" text-anchor="middle">{val}</text>`;

// العلاقة
FamilyTree.templates.card2_male.field_2 = `<rect x="50" y="150" width="80" height="25" rx="8" ry="8" fill="#000"></rect>
         <text style="font-size: 14px; font-weight: bold;" fill="#fff" x="90" y="167" text-anchor="middle">{val}</text>`;
FamilyTree.templates.card2_female.field_2 = `<rect x="50" y="150" width="80" height="25" rx="8" ry="8" fill="#000"></rect>
         <text style="font-size: 14px; font-weight: bold;" fill="#fff" x="90" y="167" text-anchor="middle">{val}</text>`;

// تاريخ الميلاد
FamilyTree.templates.card2_male.field_1 = `<text style="font-size: 14px;" fill="#333" x="90" y="200" text-anchor="middle">🎂 {val}</text>`;
FamilyTree.templates.card2_female.field_1 = `<text style="font-size: 14px;" fill="#333" x="90" y="200" text-anchor="middle">🎂 {val}</text>`;

// الهاتف
FamilyTree.templates.card2_male.field_3 = `<text style="font-size: 14px;" fill="#333" x="90" y="225" text-anchor="middle">📞 {val}</text>`;
FamilyTree.templates.card2_female.field_3 = `<text style="font-size: 14px;" fill="#333" x="90" y="225" text-anchor="middle">📞 {val}</text>`;

// ======================= جلب البيانات من الـ API ======================= //
function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

if (!treeId) {
  console.error("❌ لا يوجد id للشجرة في الرابط!");
} else {
  fetch(`/api/tree-nodes/${treeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // التحقق من معرف القالب وإظهار القالب المناسب
      handleTemplateDisplay(data.template_id);
      
      const formattedNodes = data.nodes.map((node) => ({
        id: node.id,
        name: node.name,
        relation: node.relation,
        birth_date: node.birth_date,
        phone_number: node.phone_number,
        gender: node.gender,
        photo: node.profile_picture,
        pids: node.pids || [],
        fid: node.fid || null,
        mid: node.mid || null,
      }));

      if (data.template_id === 10) {
        document.getElementById("tree").innerHTML = "";
        new FamilyTree(document.getElementById("tree"), {
          enableSearch: false,
          template: "card2",
          nodeBinding: {
            field_0: "name",
            field_1: "birth_date",
            field_2: "relation",
            field_3: "phone_number",
            img_0: "photo",
          },
          nodes: formattedNodes,
        });
      }
    })
    .catch((error) => console.error("خطأ في جلب البيانات:", error));
}

// ======================= Fetch Trees ======================= //
async function loadTrees() {
  console.log("تحميل الأشجار...");

  // البحث عن جميع عناصر اختيار الشجرة
  const treeSelects = document.querySelectorAll("#tree_id");

  if (treeSelects.length === 0) {
    console.error("لم يتم العثور على أي عنصر tree_id");
    return;
  }

  try {
    console.log("إرسال طلب لجلب الأشجار...");
    const res = await fetch("/api/view-tree", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    console.log("استجابة الخادم:", res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("خطأ من الخادم:", errorText);
      throw new Error(`خطأ في جلب الأشجار: ${res.status}`);
    }

    const trees = await res.json();
    console.log("تم جلب الأشجار بنجاح:", trees);
    console.log("عدد الأشجار:", trees ? trees.length : 0);

    // تحديث جميع عناصر اختيار الشجرة
    treeSelects.forEach((treeSelect, index) => {
      console.log(`تحديث عنصر الشجرة ${index + 1}`);

      // تجنب التحميل المتكرر
      if (treeSelect.dataset.loaded === "true") {
        console.log(`العنصر ${index + 1} محمل مسبقاً`);
        return;
      }

      // مسح الخيارات الموجودة عدا الخيار الافتراضي
      treeSelect.innerHTML =
        '<option value="" disabled selected>اختر الشجرة</option>';

      if (trees && trees.length > 0) {
        trees.forEach((tree) => {
          let option = document.createElement("option");
          option.value = tree.id;
          option.textContent = tree.tree_name;
          treeSelect.appendChild(option);
        });
      } else {
        treeSelect.innerHTML =
          '<option value="" disabled selected>لا توجد أشجار متاحة</option>';
      }

      treeSelect.dataset.loaded = "true";
    });
  } catch (err) {
    console.error("خطأ في تحميل الأشجار:", err);

    // عرض رسالة خطأ في جميع العناصر
    treeSelects.forEach((treeSelect) => {
      treeSelect.innerHTML =
        '<option value="" disabled selected>خطأ في تحميل الأشجار</option>';
    });
  }
}

// معالج إضافي لزر الإرسال لمنع إعادة التحميل
document
  .getElementById("submitJoinRequest")
  .addEventListener("click", async function (e) {
    e.preventDefault();
    e.stopPropagation();

    // تشغيل منطق الإرسال
    await handleJoinRequestSubmit(e);
  });

// دالة منفصلة لمعالجة إرسال طلب الانضمام
async function handleJoinRequestSubmit(e) {
  const submitBtn = document.getElementById("submitJoinRequest");
  const btnText = submitBtn.querySelector(".btn-text");
  const spinner = submitBtn.querySelector(".spinner-border");

  // تفعيل حالة التحميل
  submitBtn.disabled = true;
  btnText.textContent = "جاري الإرسال...";
  spinner.classList.remove("d-none");

  // لو عايز تجيب قيمة الحالة الاجتماعية المختارة
  const socialStatus =
    document.querySelector('input[name="social_status"]:checked')?.value || "";

  const data = {
    user_name: document.getElementById("user_name").value,
    user_email: document.getElementById("user_email").value,
    family_name: document.getElementById("family_name").value,
    job: document.getElementById("job").value,
    birth_date: document.getElementById("birth_date").value,
    social_status: socialStatus,
    tree_id: document.getElementById("tree_id").value,
    user_phone: document.getElementById("user_phone").value,
    user_message: document.getElementById("user_message").value,
  };

  try {
    const response = await fetch("/api/trees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error("Server error:", await response.text());
      showErrorMessage(
        "خطأ في إرسال الطلب",
        "تعذر إرسال طلب الانضمام، يرجى التحقق من البيانات والمحاولة مرة أخرى"
      );
      return;
    }

    const result = await response.json();

    // تغيير حالة الزر في الهيدر إلى "قيد الانتظار"
    updateJoinButtonToPending();

    // حفظ حالة الطلب في localStorage
    localStorage.setItem(`joinRequest_${treeId}`, "pending");

    // إظهار رسالة نجاح جميلة مع عد تنازلي
    showSuccessMessageWithCountdown(
      "تم إرسال طلب الانضمام بنجاح! ✅",
      "سيتم مراجعة طلبك والرد عليك قريباً",
      10
    );

    // إغلاق المودال وإعادة تعيين الفورم بعد تأخير قصير
    setTimeout(() => {
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("joinRequestModal")
      );
      if (modal) {
        modal.hide();
      }
      document.getElementById("joinRequestForm").reset();
    }, 1000); // تأخير ثانية واحدة

    // إعادة تحميل الصفحة بعد 10 ثوان لضمان رؤية رسالة النجاح
    setTimeout(() => {
      // إظهار مؤشر تحميل قبل إعادة التحميل
      showLoadingIndicator("جاري إعادة تحميل الصفحة...");

      // إعادة التحميل بعد ثانية إضافية
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }, 10000);
  } catch (err) {
    console.error(err);
    showErrorMessage(
      "فشل في إرسال طلب الانضمام",
      "حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى"
    );
  } finally {
    // إعادة تعيين حالة الزر
    submitBtn.disabled = false;
    btnText.textContent = "إرسال الطلب";
    spinner.classList.add("d-none");
  }

  return false; // منع إعادة تحميل الصفحة
}

// ======================= فورم مراسلة منشيء الشجرة ======================= //

document
  .getElementById("submitMessage")
  .addEventListener("click", async function (e) {
    e.preventDefault();
    e.stopPropagation();

    const submitBtn = this;
    const btnText = submitBtn.querySelector(".btn-text");
    const spinner = submitBtn.querySelector(".spinner-border");

    // تفعيل حالة التحميل
    submitBtn.disabled = true;
    btnText.textContent = "جاري الإرسال...";
    spinner.classList.remove("d-none");

    // التحقق من وجود التوكن والمستخدم
    if (!token || !user) {
      console.error(
        "مشكلة في المصادقة - Token:",
        token ? "موجود" : "مفقود",
        "User:",
        user ? "موجود" : "مفقود"
      );
      showErrorMessage("خطأ في المصادقة", "يرجى تسجيل الدخول مرة أخرى");
      submitBtn.disabled = false;
      btnText.textContent = "إرسال الرسالة";
      spinner.classList.add("d-none");
      return false;
    }

    // البحث عن العناصر في مودال المراسلة تحديداً
    const messageModal = document.getElementById("messageCreatorModal");
    const treeSelect = messageModal.querySelector("#tree_id");
    const userNameInput = messageModal.querySelector("#user_name");
    const familyNameInput = messageModal.querySelector("#family_name");
    const userPhoneInput = messageModal.querySelector("#user_phone");
    const userMessageInput = messageModal.querySelector("#user_message");

    console.log("عناصر المودال:", {
      treeSelect: treeSelect ? "موجود" : "مفقود",
      userNameInput: userNameInput ? "موجود" : "مفقود",
      familyNameInput: familyNameInput ? "موجود" : "مفقود",
      userPhoneInput: userPhoneInput ? "موجود" : "مفقود",
      userMessageInput: userMessageInput ? "موجود" : "مفقود",
    });

    const data = {
      user_name: userNameInput ? userNameInput.value : "",
      family_name: familyNameInput ? familyNameInput.value : "",
      tree_id: treeSelect ? treeSelect.value : "",
      user_phone: userPhoneInput ? userPhoneInput.value : "",
      user_message: userMessageInput ? userMessageInput.value : "",
    };

    console.log("بيانات الرسالة المرسلة:", data);

    // التحقق من صحة البيانات
    if (
      !data.user_name ||
      !data.family_name ||
      !data.tree_id ||
      !data.user_phone ||
      !data.user_message
    ) {
      console.error("بيانات ناقصة:", data);
      showErrorMessage("بيانات ناقصة", "يرجى ملء جميع الحقول المطلوبة");
      submitBtn.disabled = false;
      btnText.textContent = "إرسال الرسالة";
      spinner.classList.add("d-none");
      return false;
    }

    try {
      console.log("إرسال طلب المراسلة إلى الخادم...");
      const response = await fetch(
        "/api/contact-creator",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      console.log("استجابة الخادم:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("خطأ من الخادم:", errorText);
        throw new Error(
          `خطأ في إرسال الرسالة: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log("نتيجة إرسال الرسالة:", result);

      // إظهار رسالة نجاح جميلة مع عد تنازلي
      showSuccessMessageWithCountdown(
        "تم إرسال رسالتك بنجاح! 📧",
        "سيتم الرد عليك من قبل منشيء الشجرة قريباً",
        10
      );

      // إغلاق المودال وإعادة تعيين الفورم بعد تأخير قصير
      setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("messageCreatorModal")
        );
        if (modal) {
          modal.hide();
        }
        document.getElementById("messageCreatorForm").reset();
      }, 1000); // تأخير ثانية واحدة

      // إعادة تحميل الصفحة بعد 10 ثوان لضمان رؤية رسالة النجاح
      setTimeout(() => {
        // إظهار مؤشر تحميل قبل إعادة التحميل
        showLoadingIndicator("جاري إعادة تحميل الصفحة...");

        // إعادة التحميل بعد ثانية إضافية
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }, 10000);
    } catch (error) {
      console.error("خطأ في إرسال الرسالة:", error);
      showErrorMessage("فشل في إرسال الرسالة", "يرجى المحاولة مرة أخرى");
    } finally {
      // إعادة تعيين حالة الزر
      submitBtn.disabled = false;
      btnText.textContent = "إرسال الرسالة";
      spinner.classList.add("d-none");
    }

    return false; // منع إعادة تحميل الصفحة
  });

// تحميل الأشجار عند فتح مودال المراسلة
document
  .getElementById("messageCreatorModal")
  .addEventListener("shown.bs.modal", function () {
    console.log("فتح مودال المراسلة - تحميل الأشجار");

    // البحث عن عنصر tree_id في مودال المراسلة
    const messageModal = document.getElementById("messageCreatorModal");
    const treeSelect = messageModal.querySelector("#tree_id");

    if (treeSelect && treeSelect.dataset.loaded !== "true") {
      console.log("تحميل الأشجار لمودال المراسلة");
      loadTrees();
    } else {
      console.log("الأشجار محملة مسبقاً في مودال المراسلة");
    }
  });

// ======================= دوال رسائل النجاح والخطأ ======================= //
function showSuccessMessage(title, message) {
  // إنشاء عنصر الرسالة
  const successAlert = document.createElement("div");
  successAlert.className = "success-alert-custom";
  successAlert.innerHTML = `
    <div class="success-content">
      <div class="success-icon">
        <i class="bi bi-check-circle-fill"></i>
      </div>
      <div class="success-text">
        <h5 class="success-title">${title}</h5>
        <p class="success-message">${message}</p>
      </div>
      <button type="button" class="success-close" onclick="this.parentElement.parentElement.remove()">
        <i class="bi bi-x"></i>
      </button>
    </div>
  `;

  // إضافة الأنماط
  if (!document.getElementById("success-alert-styles")) {
    const styles = document.createElement("style");
    styles.id = "success-alert-styles";
    styles.textContent = `
      .success-alert-custom {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 99999;
        min-width: 400px;
        max-width: 500px;
        background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
        border: 1px solid #b8dabd;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        animation: slideInRight 0.5s ease-out;
        backdrop-filter: blur(10px);
      }
      
      .success-content {
        display: flex;
        align-items: flex-start;
        padding: 20px;
        gap: 15px;
      }
      
      .success-icon {
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        background: #28a745;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 20px;
        animation: successPulse 2s infinite;
      }
      
      .success-text {
        flex: 1;
        margin: 0;
      }
      
      .success-title {
        color: #155724;
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 8px 0;
        font-family: 'AdorHairlineExtraBold', sans-serif;
      }
      
      .success-message {
        color: #155724;
        font-size: 14px;
        margin: 0;
        opacity: 0.8;
        line-height: 1.4;
      }
      
      .success-close {
        background: none;
        border: none;
        color: #155724;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.3s ease;
      }
      
      .success-close:hover {
        background: rgba(21, 87, 36, 0.1);
        transform: scale(1.1);
      }
      
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes successPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
      
      @media (max-width: 768px) {
        .success-alert-custom {
          min-width: 300px;
          max-width: 90vw;
          right: 10px;
          top: 10px;
        }
        
        .success-content {
          padding: 15px;
          gap: 10px;
        }
        
        .success-title {
          font-size: 16px;
        }
        
        .success-message {
          font-size: 13px;
        }
      }
    `;
    document.head.appendChild(styles);
  }

  // إضافة الرسالة للصفحة
  document.body.appendChild(successAlert);

  // إزالة الرسالة تلقائياً بعد 7 ثوان (وقت أطول لضمان الرؤية)
  setTimeout(() => {
    if (successAlert.parentElement) {
      successAlert.style.animation = "slideInRight 0.5s ease-out reverse";
      setTimeout(() => successAlert.remove(), 500);
    }
  }, 7000);
}

function showErrorMessage(title, message) {
  // إنشاء عنصر رسالة الخطأ
  const errorAlert = document.createElement("div");
  errorAlert.className = "error-alert-custom";
  errorAlert.innerHTML = `
    <div class="error-content">
      <div class="error-icon">
        <i class="bi bi-exclamation-triangle-fill"></i>
      </div>
      <div class="error-text">
        <h5 class="error-title">${title}</h5>
        <p class="error-message">${message}</p>
      </div>
      <button type="button" class="error-close" onclick="this.parentElement.parentElement.remove()">
        <i class="bi bi-x"></i>
      </button>
    </div>
  `;

  // إضافة الأنماط
  if (!document.getElementById("error-alert-styles")) {
    const styles = document.createElement("style");
    styles.id = "error-alert-styles";
    styles.textContent = `
      .error-alert-custom {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 99999;
        min-width: 400px;
        max-width: 500px;
        background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
        border: 1px solid #f1b0b7;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        animation: slideInRight 0.5s ease-out;
        backdrop-filter: blur(10px);
      }
      
      .error-content {
        display: flex;
        align-items: flex-start;
        padding: 20px;
        gap: 15px;
      }
      
      .error-icon {
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        background: #dc3545;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 20px;
        animation: errorShake 0.5s ease-in-out;
      }
      
      .error-text {
        flex: 1;
        margin: 0;
      }
      
      .error-title {
        color: #721c24;
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 8px 0;
        font-family: 'AdorHairlineExtraBold', sans-serif;
      }
      
      .error-message {
        color: #721c24;
        font-size: 14px;
        margin: 0;
        opacity: 0.8;
        line-height: 1.4;
      }
      
      .error-close {
        background: none;
        border: none;
        color: #721c24;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.3s ease;
      }
      
      .error-close:hover {
        background: rgba(114, 28, 36, 0.1);
        transform: scale(1.1);
      }
      
      @keyframes errorShake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
      
      @media (max-width: 768px) {
        .error-alert-custom {
          min-width: 300px;
          max-width: 90vw;
          right: 10px;
          top: 10px;
        }
        
        .error-content {
          padding: 15px;
          gap: 10px;
        }
        
        .error-title {
          font-size: 16px;
        }
        
        .error-message {
          font-size: 13px;
        }
      }
    `;
    document.head.appendChild(styles);
  }

  // إضافة الرسالة للصفحة
  document.body.appendChild(errorAlert);

  // إزالة الرسالة تلقائياً بعد 7 ثوان (وقت أطول لضمان الرؤية)
  setTimeout(() => {
    if (errorAlert.parentElement) {
      errorAlert.style.animation = "slideInRight 0.5s ease-out reverse";
      setTimeout(() => errorAlert.remove(), 500);
    }
  }, 7000);
}

// ======================= دالة رسالة النجاح مع العد التنازلي ======================= //
function showSuccessMessageWithCountdown(title, message, seconds) {
  // إنشاء ID فريد للعد التنازلي
  const countdownId = `countdown-${Date.now()}`;

  // إنشاء عنصر الرسالة
  const successAlert = document.createElement("div");
  successAlert.className = "success-alert-custom";
  successAlert.innerHTML = `
    <div class="success-content">
      <div class="success-icon">
        <i class="bi bi-check-circle-fill"></i>
      </div>
      <div class="success-text">
        <h5 class="success-title">${title}</h5>
        <p class="success-message">${message}</p>
        <div class="countdown-container">
          <span class="countdown-text">سيتم إعادة تحميل الصفحة خلال: </span>
          <span class="countdown-number" id="${countdownId}">${seconds}</span>
          <span class="countdown-text"> ثانية</span>
        </div>
      </div>
      <button type="button" class="success-close" onclick="this.parentElement.parentElement.remove()">
        <i class="bi bi-x"></i>
      </button>
    </div>
  `;

  // إضافة الأنماط المحدثة
  if (!document.getElementById("success-alert-styles-countdown")) {
    const styles = document.createElement("style");
    styles.id = "success-alert-styles-countdown";
    styles.textContent = `
      .success-alert-custom {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 99999;
        min-width: 450px;
        max-width: 550px;
        background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
        border: 1px solid #b8dabd;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        animation: slideInRight 0.5s ease-out;
        backdrop-filter: blur(10px);
      }
      
      .countdown-container {
        margin-top: 10px;
        padding: 8px 12px;
        background: rgba(40, 167, 69, 0.1);
        border-radius: 8px;
        border: 1px solid rgba(40, 167, 69, 0.3);
        text-align: center;
      }
      
      .countdown-text {
        color: #155724;
        font-size: 13px;
        font-weight: 500;
      }
      
      .countdown-number {
        color: #28a745;
        font-size: 16px;
        font-weight: bold;
        background: rgba(40, 167, 69, 0.2);
        padding: 2px 8px;
        border-radius: 4px;
        margin: 0 4px;
        animation: countdownPulse 1s infinite;
      }
      
      @keyframes countdownPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
      
      @media (max-width: 768px) {
        .success-alert-custom {
          min-width: 320px;
          max-width: 90vw;
          right: 10px;
          top: 10px;
        }
        
        .countdown-text {
          font-size: 12px;
        }
        
        .countdown-number {
          font-size: 14px;
        }
      }
    `;
    document.head.appendChild(styles);
  }

  // إضافة الرسالة للصفحة
  document.body.appendChild(successAlert);

  // العد التنازلي
  const countdownElement = successAlert.querySelector(`#${countdownId}`);
  let remainingSeconds = seconds;

  const countdownInterval = setInterval(() => {
    remainingSeconds--;
    if (countdownElement) {
      countdownElement.textContent = remainingSeconds;
    }

    if (remainingSeconds <= 0) {
      clearInterval(countdownInterval);
    }
  }, 1000);

  // إزالة الرسالة بعد انتهاء العد التنازلي
  setTimeout(() => {
    if (successAlert.parentElement) {
      successAlert.style.animation = "slideInRight 0.5s ease-out reverse";
      setTimeout(() => successAlert.remove(), 500);
    }
  }, (seconds + 1) * 1000);
}

// ======================= دالة مؤشر التحميل ======================= //
function showLoadingIndicator(message) {
  // إنشاء عنصر مؤشر التحميل
  const loadingAlert = document.createElement("div");
  loadingAlert.className = "loading-indicator-custom";
  loadingAlert.innerHTML = `
    <div class="loading-content">
      <div class="loading-spinner">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div class="loading-text">
        <h5 class="loading-title">${message}</h5>
        <p class="loading-message">يرجى الانتظار...</p>
      </div>
    </div>
  `;

  // إضافة الأنماط
  if (!document.getElementById("loading-indicator-styles")) {
    const styles = document.createElement("style");
    styles.id = "loading-indicator-styles";
    styles.textContent = `
      .loading-indicator-custom {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
      }
      
      .loading-content {
        background: white;
        padding: 40px;
        border-radius: 20px;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        min-width: 300px;
        animation: fadeInScale 0.3s ease-out;
      }
      
      .loading-spinner {
        margin-bottom: 20px;
      }
      
      .loading-spinner .spinner-border {
        width: 3rem;
        height: 3rem;
      }
      
      .loading-title {
        color: #333;
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 10px 0;
        font-family: 'AdorHairlineExtraBold', sans-serif;
      }
      
      .loading-message {
        color: #666;
        font-size: 14px;
        margin: 0;
      }
      
      @keyframes fadeInScale {
        from {
          opacity: 0;
          transform: scale(0.8);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
    `;
    document.head.appendChild(styles);
  }

  // إضافة المؤشر للصفحة
  document.body.appendChild(loadingAlert);
}

// ======================= تحميل الأشجار عند فتح المودال ======================= //
document
  .getElementById("joinRequestModal")
  .addEventListener("show.bs.modal", loadTrees);

// تم نقل تحميل الأشجار لمودال المراسلة إلى مستمع shown.bs.modal أعلاه

// ======================= منع إعادة التحميل غير المرغوب فيها ======================= //
function preventPageReload() {
  // منع إعادة تحميل الصفحة عند إرسال الفورم
  const forms = document.querySelectorAll("form");
  forms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      if (
        e.target.id === "joinRequestForm" ||
        e.target.id === "messageCreatorForm"
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    });
  });

  // منع إعادة التحميل عند الضغط على أزرار الإرسال
  const submitButtons = document.querySelectorAll(
    "#submitJoinRequest, #submitMessage"
  );
  submitButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
    });
  });
}

// ======================= منع إعادة التحميل الفوري ======================= //
// تطبيق فوري لمنع إعادة التحميل - يعمل فوراً عند تحميل الصفحة
(function () {
  // منع إعادة التحميل فوراً
  document.addEventListener("DOMContentLoaded", () => {
    // منع إعادة التحميل للفورمين فوراً
    const joinForm = document.getElementById("joinRequestForm");
    const messageForm = document.getElementById("messageCreatorForm");

    if (joinForm) {
      joinForm.addEventListener("submit", function (e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      });
    }

    if (messageForm) {
      messageForm.addEventListener("submit", function (e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      });
    }

    // منع إعادة التحميل للأزرار أيضاً
    const submitBtn = document.getElementById("submitJoinRequest");
    const messageBtn = document.getElementById("submitMessage");

    if (submitBtn) {
      submitBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
      });
    }

    if (messageBtn) {
      messageBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
      });
    }
  });
})();

// ======================= دالة اختبار فورم المراسلة ======================= //
function testMessageForm() {
  console.log("=== اختبار فورم المراسلة ===");

  // التحقق من العناصر الأساسية
  const elements = {
    modal: document.getElementById("messageCreatorModal"),
    form: document.getElementById("messageCreatorForm"),
    submitBtn: document.getElementById("submitMessage"),
    token: token,
    user: user,
  };

  console.log("فحص العناصر الأساسية:");
  Object.keys(elements).forEach((key) => {
    const element = elements[key];
    const status = element ? "✅ موجود" : "❌ مفقود";
    console.log(`${key}: ${status}`);
  });

  // فتح المودال
  if (elements.modal) {
    console.log("فتح مودال المراسلة...");
    const modal = new bootstrap.Modal(elements.modal);
    modal.show();

    // انتظار قليل ثم فحص العناصر داخل المودال
    setTimeout(() => {
      const messageModal = document.getElementById("messageCreatorModal");
      const modalElements = {
        treeSelect: messageModal.querySelector("#tree_id"),
        userNameInput: messageModal.querySelector("#user_name"),
        familyNameInput: messageModal.querySelector("#family_name"),
        userPhoneInput: messageModal.querySelector("#user_phone"),
        userMessageInput: messageModal.querySelector("#user_message"),
      };

      console.log("فحص عناصر المودال:");
      Object.keys(modalElements).forEach((key) => {
        const element = modalElements[key];
        const status = element ? "✅ موجود" : "❌ مفقود";
        const value = element ? element.value : "N/A";
        console.log(`${key}: ${status} - القيمة: "${value}"`);
      });
    }, 1000);
  }
}

// ==================================================
// Template 12
// ===================================================

// متغيرات عامة
let familyData = [];
let isLoading = false;

// دالة جلب البيانات من API
async function loadFamilyData() {
  if (isLoading) return;

  try {
    isLoading = true;
    console.log("🔄 بدء تحميل البيانات من API...");
    showLoadingIndicator();

    const response = await fetch("/api/test-tree", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    console.log("📡 استجابة الخادم:", response.status, response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ تم تحميل البيانات بنجاح:", data);
      console.log("📊 نوع البيانات:", typeof data);
      console.log("🔍 محتويات البيانات:", Object.keys(data));
      console.log("🎨 معرف القالب:", data.template_id);

      // التحقق من معرف القالب وإظهار القالب المناسب
      handleTemplateDisplay(data.template_id);

      if (data && data.template_id === 12) {
        familyData = extractMembers(data);
        console.log("👥 عدد الأعضاء المستخرجين:", familyData.length);
        console.log("📝 الأعضاء:", familyData);

        if (familyData.length > 0) {
          updateTreeWithData();
          console.log("🌳 تم تحديث الشجرة بنجاح");
          showSuccessMessage(`تم تحميل ${familyData.length} عضو`);
        } else {
          console.warn("⚠️ لا توجد أعضاء في البيانات");
          showErrorMessage("لا توجد بيانات أعضاء");
        }
      } else if (data && data.template_id !== 12) {
        console.log("ℹ️ القالب رقم", data.template_id, "لا يحتاج لتحميل في هذه الدالة");
      } else {
        console.error("❌ البيانات فارغة");
        showErrorMessage("البيانات المستلمة فارغة");
      }
    } else {
      console.error(
        "❌ فشل في تحميل البيانات:",
        response.status,
        response.statusText
      );
      showErrorMessage(`خطأ ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error("💥 خطأ في الاتصال:", error);
    showErrorMessage(`خطأ في الاتصال: ${error.message}`);
  } finally {
    isLoading = false;
    hideLoadingIndicator();
    initializeAnimation();
  }
}

// دالة استخراج الأعضاء من البيانات
function extractMembers(data) {
  let members = [];

  console.log("🔍 محاولة استخراج الأعضاء من البيانات...");

  // محاولة استخراج من تنسيقات مختلفة
  if (data.nodes && Array.isArray(data.nodes)) {
    console.log("📋 وجدت data.nodes:", data.nodes.length, "عنصر");
    members = data.nodes;
  } else if (data.members && Array.isArray(data.members)) {
    console.log("📋 وجدت data.members:", data.members.length, "عنصر");
    members = data.members;
  } else if (data.tree && Array.isArray(data.tree)) {
    console.log("📋 وجدت data.tree:", data.tree.length, "عنصر");
    members = data.tree;
  } else if (
    data.family_data_members_tree &&
    Array.isArray(data.family_data_members_tree)
  ) {
    console.log(
      "📋 وجدت data.family_data_members_tree:",
      data.family_data_members_tree.length,
      "عنصر"
    );
    members = data.family_data_members_tree;
  } else if (Array.isArray(data)) {
    console.log("📋 البيانات عبارة عن مصفوفة مباشرة:", data.length, "عنصر");
    members = data;
  } else {
    console.log("🔍 محاولة البحث في جميع خصائص البيانات...");
    // البحث في جميع الخصائص
    for (let key in data) {
      if (Array.isArray(data[key]) && data[key].length > 0) {
        console.log(`📋 وجدت مصفوفة في ${key}:`, data[key].length, "عنصر");
        members = data[key];
        break;
      }
    }
  }

  console.log("📊 عدد الأعضاء الخام:", members.length);

  if (members.length === 0) {
    console.warn("⚠️ لم يتم العثور على أي أعضاء في البيانات");
    return [];
  }

  // تنظيف وتوحيد البيانات
  const processedMembers = members.map((member, index) => {
    const processed = {
      id: member.id || index + 1,
      name:
        member.name || member.text?.name || member.title || `عضو ${index + 1}`,
      relation:
        member.relation || member.text?.relation || member.type || "member",
      status: member.status || member.text?.status || "alive",
      job: member.job || member.text?.job || "",
      birth_date: member.birth_date || member.text?.birth_date || "",
      father_id: member.father_id || member.parent_id || null,
      mother_id: member.mother_id || null,
    };

    console.log(
      `👤 عضو ${index + 1}:`,
      processed.name,
      `(${processed.relation})`
    );
    return processed;
  });

  console.log("✅ تم معالجة", processedMembers.length, "عضو بنجاح");
  return processedMembers;
}

// دوال المساعدة للواجهة
function showLoadingIndicator() {
  const indicator = document.createElement("div");
  indicator.id = "loading-indicator";
  indicator.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255, 255, 255, 0.95);
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                z-index: 1000;
                text-align: center;
                border: 2px solid #D3AB55;
            `;
  indicator.innerHTML = `
                <div style="color: #D3AB55; font-size: 18px; margin-bottom: 10px;">🌳 جاري تحميل شجرة العائلة...</div>
                <div style="width: 30px; height: 30px; border: 3px solid #f3f3f3; border-top: 3px solid #D3AB55; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                <style>
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                </style>
            `;
  document.body.appendChild(indicator);
}

function hideLoadingIndicator() {
  const indicator = document.getElementById("loading-indicator");
  if (indicator) indicator.remove();
}

function showSuccessMessage(message) {
  showMessage(message, "#4CAF50", "✅");
}

function showErrorMessage(message) {
  showMessage(message, "#f44336", "❌");
}

function showMessage(message, color, icon) {
  const msg = document.createElement("div");
  msg.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${color};
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                z-index: 1001;
                font-family: Arial, sans-serif;
                max-width: 300px;
                animation: slideIn 0.3s ease-out;
            `;
  msg.innerHTML = `
                <div style="font-weight: bold;">${icon} ${message}</div>
                <style>
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                </style>
            `;
  document.body.appendChild(msg);

  setTimeout(() => {
    if (msg.parentNode) msg.remove();
  }, 4000);
}

// دالة تحديث الشجرة بالبيانات
function updateTreeWithData() {
  if (!familyData || familyData.length === 0) {
    console.warn("⚠️ لا توجد بيانات لتحديث الشجرة");
    showEmptyState();
    return;
  }

  console.log("🌳 بدء تحديث الشجرة بـ", familyData.length, "عضو");

  // إخفاء رسالة الحالة الفارغة
  hideEmptyState();

  // تحديث الأوراق الرئيسية (الجذر)
  const rootLeaves = document.querySelectorAll(".tree > .leaf .name-text");
  console.log("🍃 عدد الأوراق الجذرية:", rootLeaves.length);

  if (rootLeaves[0] && familyData[0]) {
    rootLeaves[0].textContent = familyData[0].name;
    rootLeaves[0].parentElement.style.display = "block";
    console.log("👑 تم تحديث الجذر الأول:", familyData[0].name);
  }
  if (rootLeaves[1] && familyData[1]) {
    rootLeaves[1].textContent = familyData[1].name;
    rootLeaves[1].parentElement.style.display = "block";
    console.log("👑 تم تحديث الجذر الثاني:", familyData[1].name);
  }

  // تحديث أسماء الآباء والأطفال
  const parentNames = document.querySelectorAll(".parent-name");
  const leafTexts = document.querySelectorAll(".branch .leaf .name-text");

  console.log("👨‍👩‍👧‍👦 عدد أسماء الآباء:", parentNames.length);
  console.log("🍃 عدد أوراق الأطفال:", leafTexts.length);

  let memberIndex = 2; // بدء من العضو الثالث بعد الجذرين

  // تحديث أسماء الآباء
  parentNames.forEach((parent, index) => {
    if (familyData[memberIndex]) {
      const oldName = parent.textContent;
      parent.textContent = familyData[memberIndex].name;
      parent.style.display = "block";
      console.log(
        `👨 آب ${index + 1}: ${oldName} → ${familyData[memberIndex].name}`
      );
      memberIndex++;
    } else {
      // إخفاء العناصر الفارغة
      parent.style.display = "none";
    }
  });

  // تحديث أسماء الأطفال
  leafTexts.forEach((leaf, index) => {
    if (familyData[memberIndex]) {
      const oldName = leaf.textContent;
      leaf.textContent = familyData[memberIndex].name;
      leaf.parentElement.style.display = "block";
      console.log(
        `👶 طفل ${index + 1}: ${oldName} → ${familyData[memberIndex].name}`
      );
      memberIndex++;
    } else {
      // إخفاء العناصر الفارغة
      leaf.parentElement.style.display = "none";
    }
  });

  console.log(
    "✅ تم تحديث الشجرة بنجاح! استُخدم",
    memberIndex,
    "من",
    familyData.length,
    "عضو"
  );
}

// دالة عرض حالة فارغة
function showEmptyState() {
  const existingEmpty = document.getElementById("empty-state");
  if (existingEmpty) return;

  const emptyDiv = document.createElement("div");
  emptyDiv.id = "empty-state";
  emptyDiv.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                color: #666;
                font-family: Arial, sans-serif;
                z-index: 500;
            `;
  emptyDiv.innerHTML = `
                <div style="font-size: 48px; margin-bottom: 20px;">🌳</div>
                <div style="font-size: 24px; margin-bottom: 10px; color: #D3AB55;">في انتظار البيانات</div>
                <div style="font-size: 16px; color: #999;">سيتم عرض شجرة العائلة عند تحميل البيانات من API</div>
            `;
  document.querySelector(".tree").appendChild(emptyDiv);
}

// دالة إخفاء حالة فارغة
function hideEmptyState() {
  const emptyDiv = document.getElementById("empty-state");
  if (emptyDiv) emptyDiv.remove();
}

// دالة تهيئة الأنيميشن
function initializeAnimation() {
  var sceneTree = new Scene(
    {
      ".tree": {
        0: { transform: "scale(0)" },
        1.5: { transform: "scale(1)" },
      },
    },
    {
      selector: true,
    }
  );

  var branchs = document.querySelectorAll(
    ".tree .branch, .tree .leaf, .tree .parent-name"
  );
  var depths = [0, 0, 0];

  for (var i = 0; i < branchs.length; ++i) {
    var sceneItem = sceneTree.newItem("item" + i);
    var className = branchs[i].className;

    if (~className.indexOf("branch-inner")) {
      ++depths[1];
      depths[2] = 0;
    } else if (~className.indexOf("branch")) {
      ++depths[0];
      depths[1] = 0;
      depths[2] = 0;
    } else if (
      ~className.indexOf("leaf") ||
      ~className.indexOf("parent-name")
    ) {
      ++depths[2];
    }

    sceneItem.setElement(branchs[i]);
    sceneItem.setCSS(0, ["transform"]);
    var time = 1 + depths[0] * 0.5 + depths[1] * 0.5 + depths[2] * 0.5;
    sceneItem.set(time, "transform", "scale", 0);
    sceneItem.set(time + 1, "transform", "scale", 1);
  }

  sceneTree.playCSS();
}

// تشغيل التطبيق عند تحميل الصفحة (للقالب 12 فقط)
document.addEventListener("DOMContentLoaded", function () {
  // هذا الكود خاص بالقالب 12 فقط
  // عرض حالة الانتظار أولاً
  showEmptyState();
  // ثم تحميل البيانات
  loadFamilyData();
});

// ======================= الصفحة الرئيسية ======================= //
document.addEventListener("DOMContentLoaded", async () => {
  await updateFooterSettings();
  await loadFamilyDetails();
  await loadOccasions();
  await fetchNews();

  // تطبيق منع إعادة التحميل
  preventPageReload();
});

// ======================= تحديث حالة زر الانضمام ======================= //
function updateJoinButtonToPending() {
  // البحث عن زر طلب الانضمام في الهيدر
  const joinButton = document.querySelector(
    '[data-bs-target="#joinRequestModal"]'
  );

  if (joinButton) {
    // تغيير النص والأيقونة
    const buttonContent = joinButton.querySelector("span");
    if (buttonContent) {
      buttonContent.innerHTML = `
        <i class="bi bi-clock-history me-2"></i>
        طلب الانضمام قيد الانتظار
      `;
    }

    // تعطيل الزر وتغيير التصميم
    joinButton.disabled = true;
    joinButton.classList.add("btn-pending");
    joinButton.classList.remove("btn-custom");

    // إزالة وظيفة فتح المودال
    joinButton.removeAttribute("data-bs-toggle");
    joinButton.removeAttribute("data-bs-target");

    // إضافة tooltip توضيحي
    joinButton.setAttribute("title", "تم إرسال طلب الانضمام وهو قيد المراجعة");
    joinButton.setAttribute("data-bs-toggle", "tooltip");

    // تفعيل tooltip
    if (typeof bootstrap !== "undefined" && bootstrap.Tooltip) {
      new bootstrap.Tooltip(joinButton);
    }
  }
}

// ======================= إعادة تعيين زر الانضمام للحالة الأصلية ======================= //
function resetJoinButtonToOriginal() {
  const joinButton =
    document.querySelector(".btn-pending") ||
    document.querySelector('[data-bs-target="#joinRequestModal"]');

  if (joinButton) {
    // استعادة النص والأيقونة الأصلية
    const buttonContent = joinButton.querySelector("span");
    if (buttonContent) {
      buttonContent.innerHTML = `
        طلب انضمام<img src="images/octicon_arrow-up-24.svg" alt="" class="me-3">
      `;
    }

    // استعادة التصميم الأصلي
    joinButton.disabled = false;
    joinButton.classList.remove("btn-pending");
    joinButton.classList.add("btn-custom");

    // استعادة وظيفة فتح المودال
    joinButton.setAttribute("data-bs-toggle", "modal");
    joinButton.setAttribute("data-bs-target", "#joinRequestModal");

    // إزالة tooltip
    joinButton.removeAttribute("title");
    joinButton.removeAttribute("data-bs-toggle");

    // إزالة حالة الطلب من localStorage
    if (treeId) {
      localStorage.removeItem(`joinRequest_${treeId}`);
    }
  }
}
