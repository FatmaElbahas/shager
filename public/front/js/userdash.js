const token = localStorage.getItem("authToken");
const user = JSON.parse(localStorage.getItem("user")); // ✅ جلب بيانات المستخدم

// ✅ التحقق من صلاحية الدخول
function checkAuth() {
  if (!token || !user || user.role !== "tree_creator") {
    window.location.href = "login.html";
  }
}

// ==========================================================
// Template 12 Logic - إظهار/إخفاء القوالب حسب template_id
// ==========================================================

// دالة للتحقق من template_id وإظهار القالب المناسب
function handleTemplateDisplay(templateId) {
  console.log("🎨 معرف القالب المستلم:", templateId);

  const familyTreeDiv = document.querySelector(
    ".bg-white.rounded-4.p-4.my-5.text-center"
  );
  const backgroundDiv = document.querySelector(".background");

  if (templateId === 12) {
    console.log("عرض القالب رقم 12 (شجرة الخلفية)");

    // إخفاء div الشجرة العادية
    if (familyTreeDiv) {
      familyTreeDiv.style.display = "none";
      console.log("تم إخفاء div الشجرة العادية");
    } else {
      console.warn("لم يتم العثور على div الشجرة العادية");
    }

    // إظهار div القالب رقم 12
    if (backgroundDiv) {
      backgroundDiv.style.display = "block";
      console.log("تم إظهار div القالب رقم 12");
      
      // التحقق من وجود عناصر الشجرة داخل القالب 12
      const treeElements = backgroundDiv.querySelectorAll(".tree .leaf .name-text");
      console.log("عناصر الشجرة الموجودة في القالب 12:", treeElements.length);

      // تحميل البيانات في القالب رقم 12
      loadFamilyData();
    } else {
      console.error("لم يتم العثور على div القالب رقم 12 (.background)");
    }
  } else {
    console.log("عرض القالب العادي (معرف:", templateId, ")");

    // إظهار div الشجرة العادية
    if (familyTreeDiv) {
      familyTreeDiv.style.display = "block";
      console.log("✨ تم إظهار div الشجرة العادية");
    }

    // إخفاء div القالب رقم 12
    if (backgroundDiv) {
      backgroundDiv.style.display = "none";
      console.log("🚫 تم إخفاء div القالب رقم 12");
    }
  }
}

// متغيرات عامة للقالب 12
let familyData = [];
let isLoading = false;

// دالة جلب البيانات من API للقالب 12
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
      console.log("🎨 معرف القالب:", data.template_id);

      if (data) {
        familyData = extractMembers(data);
        console.log("👥 عدد الأعضاء المستخرجين:", familyData.length);

        if (familyData.length > 0) {
          updateTreeWithData();
          console.log("🌳 تم تحديث القالب رقم 12 بنجاح");
          showSuccessMessage(
            `تم تحميل ${familyData.length} عضو في القالب رقم 12`
          );
        } else {
          console.warn("⚠️ لا توجد أعضاء في البيانات");
          showErrorMessage("لا توجد بيانات أعضاء");
        }
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
  }
}

// دالة استخراج الأعضاء من البيانات
function extractMembers(data) {
  let members = [];
  console.log("🔍 محاولة استخراج الأعضاء من البيانات...");

  if (data.nodes && Array.isArray(data.nodes)) {
    console.log("📋 وجدت data.nodes:", data.nodes.length, "عنصر");
    members = data.nodes;
  } else if (data.members && Array.isArray(data.members)) {
    console.log("📋 وجدت data.members:", data.members.length, "عنصر");
    members = data.members;
  } else if (Array.isArray(data)) {
    console.log("📋 البيانات عبارة عن مصفوفة مباشرة:", data.length, "عنصر");
    members = data;
  }

  return members;
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
  const rootLeaves = document.querySelectorAll(".background .tree > .leaf .name-text");
  console.log("🍃 عدد الأوراق الجذرية:", rootLeaves.length);
  console.log("🔍 البحث في:", ".background .tree > .leaf .name-text");

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
  const parentNames = document.querySelectorAll(".background .parent-name");
  const leafTexts = document.querySelectorAll(".background .branch .leaf .name-text");

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

// دوال مساعدة للرسائل والتحميل
function showLoadingIndicator() {
  console.log("⏳ إظهار مؤشر التحميل");
}

function hideLoadingIndicator() {
  console.log("✅ إخفاء مؤشر التحميل");
}

function showSuccessMessage(message) {
  console.log("✅", message);
}

function showErrorMessage(message) {
  console.error("❌", message);
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
  const treeContainer = document.querySelector(".background .tree");
  if (treeContainer) {
    treeContainer.appendChild(emptyDiv);
  } else {
    console.warn("⚠️ لم يتم العثور على .background .tree");
  }
}

// دالة إخفاء حالة فارغة
function hideEmptyState() {
  const emptyDiv = document.getElementById("empty-state");
  if (emptyDiv) emptyDiv.remove();
}

// تحديث دالة loadFamilyData لتتضمن منطق القالب
async function loadFamilyDataWithTemplate() {
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
      console.log("🎨 معرف القالب:", data.template_id);

      // التحقق من معرف القالب وإظهار القالب المناسب
      handleTemplateDisplay(data.template_id);

      if (data.template_id === 12) {
        // معالجة خاصة للقالب رقم 12
        if (data) {
          familyData = extractMembers(data);
          console.log("👥 عدد الأعضاء المستخرجين:", familyData.length);

          if (familyData.length > 0) {
            updateTreeWithData();
            console.log("🌳 تم تحديث القالب رقم 12 بنجاح");
            showSuccessMessage(
              `تم تحميل ${familyData.length} عضو في القالب رقم 12`
            );
          } else {
            console.warn("⚠️ لا توجد أعضاء في البيانات");
            showErrorMessage("لا توجد بيانات أعضاء");
          }
        }
      } else {
        // معالجة القوالب الأخرى (الكود الموجود مسبقاً)
        console.log("🎨 سيتم عرض القالب رقم:", data.template_id);
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
  }
}

fetch("/api/tree_creator/family_occasions", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  },
})
  .then((res) => res.json())
  .then((data) => {
    const container = document.querySelector(".d-flex.overflow-auto");
    container.innerHTML = "";

    data.forEach((event) => {
      const dateObj = new Date(event.occasion_date);
      const dayName = dateObj.toLocaleDateString("ar-EG", {
        weekday: "long",
      });
      const dayNumber = dateObj.getDate();
      const categoryMap = {
        occasion: "سنوي",
        meeting: "اجتماع",
        familiar: "عائلي",
      };
      const categoryAr = categoryMap[event.category] || event.category;

      container.innerHTML += `
                <div class="custom-card text-center mx-2 p-2 flex-shrink-0" style="min-width: 120px;">
                    <div class="card-title py-4 px-2">
                        <p class="mb-2">${dayName}</p>
                        <p>${dayNumber}</p>
                    </div>
                    <div class="card-footer py-3 px-2">
                    <a href="eventdetails.html?id=${event.id}" class="text-decoration-none text-light">
                        <p class="text-custom">${event.name}</p>
                        <p class="text-muted">“${categoryAr}”</p>
                    </a>
                    </div>
                </div>
            `;
    });
  })
  .catch((err) => console.error(err));

fetch("/api/tree_creator/family_tree", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  },
})
  .then((res) => res.json())
  .then((data) => {
    console.log("📌 API Response:", data);

    if (data.data && data.data.length > 0) {
      const tree = data.data[0];
      const templateImageUrl = tree.template?.image_url;

      if (templateImageUrl) {
        document.querySelector("#template-image").src = templateImageUrl;
      } else {
        document.querySelector("#template-image").src =
          "/storage/default_images/tree 1.jpg";
      }
    }
  })
  .catch((err) => console.error("❌ خطأ في جلب البيانات:", err));

// متغيرات Google Maps
let map;
let markers = [];
let infoWindow;

// تهيئة خريطة Google Maps
function initUserDashMap() {
  // إنشاء الخريطة
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 6,
    center: { lat: 24.7136, lng: 46.6753 }, // السعودية
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    disableDefaultUI: true, // إخفاء عناصر التحكم الافتراضية للحجم الصغير
    zoomControl: true, // إظهار أزرار التكبير فقط
    styles: [
      {
        featureType: "all",
        elementType: "geometry.fill",
        stylers: [{ weight: "2.00" }],
      },
      {
        featureType: "all",
        elementType: "geometry.stroke",
        stylers: [{ color: "#9c9c9c" }],
      },
      {
        featureType: "all",
        elementType: "labels.text",
        stylers: [{ visibility: "on" }],
      },
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }], // إخفاء تسميات الأماكن للوضوح
      },
    ],
  });

  // إنشاء نافذة المعلومات
  infoWindow = new google.maps.InfoWindow();

  // تحميل المناسبات
  loadMapEvents();
}

// جلب المناسبات مع الإحداثيات
async function loadMapEvents() {
  try {
    const response = await fetch("/api/family-map", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error("فشل في تحميل المناسبات:", await response.text());
      return;
    }

    const events = await response.json();
    const bounds = new google.maps.LatLngBounds();

    events.forEach((event) => {
      if (event.latitude && event.longitude) {
        const lat = parseFloat(event.latitude);
        const lng = parseFloat(event.longitude);

        // إضافة Marker
        const marker = new google.maps.Marker({
          position: { lat: lat, lng: lng },
          map: map,
          title: event.name,
          icon: {
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" fill="#D3AB55" stroke="#fff" stroke-width="2"/>
                <circle cx="12" cy="12" r="4" fill="#fff"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(24, 24),
            anchor: new google.maps.Point(12, 12),
          },
        });

        // إنشاء محتوى النافذة المنبثقة
        const contentString = `
          <div style="min-width: 120px; padding: 6px; text-align: center;">
            <h6 style="margin: 0 0 3px 0; color: #D3AB55; font-weight: bold; font-size: 14px;">${
              event.name
            }</h6>
            <p style="margin: 0; color: #666; font-size: 11px;">
              📍 ${event.city || "موقع"}
            </p>
          </div>
        `;

        // إضافة مستمع للنقر على العلامة
        marker.addListener("click", () => {
          infoWindow.setContent(contentString);
          infoWindow.open(map, marker);
        });

        markers.push(marker);
        bounds.extend(new google.maps.LatLng(lat, lng));
      }
    });

    // ضبط الخريطة لتظهر كل العلامات
    if (events.length > 0) {
      map.fitBounds(bounds);
      // تأكد من أن التكبير مناسب للخريطة الصغيرة
      const listener = google.maps.event.addListener(map, "idle", () => {
        if (map.getZoom() > 12) map.setZoom(12); // تكبير أقل للخريطة الصغيرة
        google.maps.event.removeListener(listener);
      });
    } else {
      // إذا لم توجد مناسبات، اعرض منطقة واسعة
      map.setZoom(5);
    }
  } catch (err) {
    console.error("حدث خطأ أثناء تحميل المناسبات:", err);
    // في حالة الخطأ، اعرض الخريطة على الموقع الافتراضي
    if (map) {
      map.setCenter({ lat: 24.7136, lng: 46.6753 });
      map.setZoom(6);
    }
  }
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
fetch("/api/test-tree", {
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  },
})
  .then((res) => res.json())
  .then((data) => {
    // التحقق من معرف القالب وإظهار القالب المناسب
    handleTemplateDisplay(data.template_id);

    // فقط إذا كان القالب رقم 1
    if (data.template_id === 1) {
      // فلترة الـ nodes اللي template_id = 1
      let nodes = data.nodes
        .filter((n) => n.template_id === 1)
        .map((n) => {
          const defaultImage =
            n.gender === "female"
              ? "images/hugeicons_female-02.svg"
              : "images/hugeicons_male-02.svg";

          return {
            id: n.id,
            name: n.name,
            gender: n.gender,
            pids: n.pids || [],
            fid: n.fid,
            mid: n.mid,
            photo: n.photo || defaultImage,
          };
        });

      var family = new FamilyTree(document.getElementById("tree"), {
        mouseScroll: FamilyTree.none,
        template: "sriniz",
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

fetch("/api/test-tree", {
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
fetch("/api/test-tree", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  },
})
  .then((response) => response.json())
  .then((data) => {
    // التحقق من معرف القالب وإظهار القالب المناسب
    handleTemplateDisplay(data.template_id);

    if (data.template_id === 3) {
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
fetch("/api/test-tree", {
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  },
})
  .then((res) => res.json())
  .then((data) => {
    // التحقق من معرف القالب وإظهار القالب المناسب
    handleTemplateDisplay(data.template_id);

    if (data.template_id === 4) {
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
fetch("/api/test-tree", {
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  },
})
  .then((res) => res.json())
  .then((data) => {
    // التحقق من معرف القالب وإظهار القالب المناسب
    handleTemplateDisplay(data.template_id);

    if (data.template_id === 5) {
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
fetch("/api/test-tree", {
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  },
})
  .then((res) => res.json())
  .then((data) => {
    // التحقق من معرف القالب وإظهار القالب المناسب
    handleTemplateDisplay(data.template_id);

    if (data.template_id === 6) {
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
fetch("/api/test-tree", {
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  },
})
  .then((res) => res.json())
  .then((data) => {
    // التحقق من معرف القالب وإظهار القالب المناسب
    handleTemplateDisplay(data.template_id);

    if (data.template_id === 7) {
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
fetch("/api/test-tree", {
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  },
})
  .then((res) => res.json())
  .then((data) => {
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

fetch("/api/test-tree", {
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  },
})
  .then((res) => res.json())
  .then((data) => {
    // التحقق من معرف القالب وإظهار القالب المناسب
    handleTemplateDisplay(data.template_id);

    if (data.template_id === 9) {
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
fetch("/api/test-tree", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  },
})
  .then((response) => response.json())
  .then((data) => {
    // التحقق من معرف القالب وإظهار القالب المناسب
    handleTemplateDisplay(data.template_id);

    if (data.template_id === 10) {
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

// ======================= الصفحة الرئيسية ======================= //

document.addEventListener("DOMContentLoaded", () => {
  checkAuth();

  // تحميل البيانات مع القالب المناسب
  loadFamilyDataWithTemplate();

  // fallback في حالة عدم تحميل Google Maps
  setTimeout(() => {
    if (typeof google === "undefined" || !map) {
      console.log("Google Maps لم يتم تحميله، محاولة تهيئة الخريطة...");
      if (typeof google !== "undefined") {
        initUserDashMap();
      }
    }
  }, 3000);

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
