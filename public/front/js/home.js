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

function checkUserStatus() {
  const hasTreeData = localStorage.getItem("hasTreeData") === "true";
  const userRole = localStorage.getItem("userRole");

  const familyTreeSection = document.getElementById("family-tree-section");
  const treeCreatorWelcome = document.getElementById("treeCreatorWelcome");
  const userWelcome = document.getElementById("userWelcome");

  // إخفاء جميع الأقسام أولاً
  familyTreeSection.style.display = "none";
  treeCreatorWelcome.style.display = "none";
  userWelcome.style.display = "none";

  // تحديد القسم الظاهر
  if (hasTreeData) {
    familyTreeSection.style.display = "block";
  } else if (userRole === "tree_creator") {
    treeCreatorWelcome.style.display = "block";
  } else {
    userWelcome.style.display = "block";
  }
}

window.onload = function () {
  const before = document.getElementById("before");
  const after = document.getElementById("after");

  updateUIBasedOnAuth();
  checkUserStatus();

  // إعادة قراءة البيانات من localStorage للتأكد من أحدث البيانات
  const currentToken = localStorage.getItem("authToken");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  if (currentToken) {
    if (before) before.style.display = "none";
    if (after) after.style.display = "flex";

    // إذا كان المستخدم له role = "user", اعرض المناسبات الثابتة
    if (currentUser && currentUser.role === "user") {
      console.log("تحميل المناسبات الثابتة للمستخدم العادي");
      loadStaticOccasions();
    } else {
      console.log("تحميل المناسبات الديناميكية للمستخدم المتقدم");
      loadOccasions();
    }
  } else {
    if (before) before.style.display = "flex";
    if (after) after.style.display = "none";
    console.log("تحميل المناسبات الثابتة للمستخدم غير المسجل");
    loadStaticOccasions(); // تحميل المناسبات الثابتة
  }
};

const container = document.getElementById("occasionsContainer");

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
  try {
    const res = await fetch("/api/occasions", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const occasions = await res.json();
    container.innerHTML = ""; // تفريغ القديم

    if (occasions.length === 0) {
      container.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info text-center">
            <h5>لا توجد مناسبات لعرضها</h5>
            <p>لم يتم إنشاء أي مناسبات بعد. يمكنك إضافة مناسبات جديدة من لوحة التحكم.</p>
          </div>
        </div>
      `;
      return;
    }

    occasions.forEach((o) => {
      container.innerHTML += `
        <div class="col-md-4 col-lg-4">
          <div class="photo-card my-3">
            <img src="${
              o.cover_image
                ? "/storage/" + o.cover_image
                : "images/Frame 1410126302.png"
            }" class="img-fluid">
            <div class="body">
              <p class="photo-title">${o.details}</p>
              <p class="photo-date"><span>    <img src="images/uiw_date (1).png" alt="" style="width: 24px; height: 24px; ">
</span>${formatDate(o.occasion_date)}</p>
            </div>
          </div>
        </div>
      `;
    });
  } catch (err) {
    console.error("خطأ في جلب المناسبات:", err);
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger text-center">
          <h5>خطأ في تحميل المناسبات</h5>
          <p>حدث خطأ أثناء تحميل المناسبات. يرجى المحاولة مرة أخرى.</p>
        </div>
      </div>
    `;
  }
}

// المناسبات الثابتة
function loadStaticOccasions() {
  container.innerHTML = `
    <div class="col-md-4 col-lg-4">
      <div class="photo-card my-3">
        <img src="images/de6269f8495c9e1e3c9d10d517503b73266b35db.jpg" alt="" class="img-fluid">
        <div class="body">
          <p class="photo-title">اجتماع عائلي - قبيلة بني تميم</p>
          <p class="photo-date text-muted">2025, 30 يونيو - 12:20 ص</p>
        </div>
      </div>
    </div>
    <div class="col-md-4 col-lg-4">
      <div class="photo-card my-3">
        <img src="images/da84cac83443fa1e5a0ec89f2c6716b444d2173f.jpg" alt="" class="img-fluid">
        <div class="body">
          <p class="photo-title">نزهة عائلية - قبيلة شمر</p>
          <p class="photo-date text-muted">2025, 30 يونيو - 12:20 ص</p>
        </div>
      </div>
    </div>
    <div class="col-md-4 col-lg-4">
      <div class="photo-card my-3">
        <img src="images/1e457e8dda5958b753ae72e997605762fe02d0a1.jpg" alt="" class="img-fluid">
        <div class="body">
          <p class="photo-title">مصيف عائلي - قبيلة مطير</p>
          <p class="photo-date text-muted">2025, 30 يونيو - 12:20 ص</p>
        </div>
      </div>
    </div>
  `;
}

function formatCustomDate(dateString) {
  const date = new Date(dateString);
  const optionsDate = { year: "numeric", month: "long", day: "numeric" };
  const optionsTime = { hour: "2-digit", minute: "2-digit", hour12: true };

  const formattedDate = date.toLocaleDateString("ar-EG", optionsDate);
  const formattedTime = date.toLocaleTimeString("ar-EG", optionsTime);

  return `${formattedDate} - ${formattedTime}`;
}

// ✅ بيانات الأخبار الثابتة للصفحة الرئيسية
const staticHomeNewsData = [
  {
    id: "home_static_1",
    title: "اجتماع عائلي - قبيلة بني تميم",
    published_at: "2025-06-30T00:20:00",
    image: "images/Frame 38.png",
  },
  {
    id: "home_static_2",
    title: "ندوة ثقافية لقبيلة شمر حول توثيق الأنساب",
    published_at: "2025-05-17T00:00:00",
    image: "images/Frame 39.png",
  },
  {
    id: "home_static_3",
    title: "قبيلة العتيبي تحتفل بقدوم مولود جديد في أحد فروعها",
    published_at: "2025-06-30T00:20:00",
    image: "images/Frame 39 (1).png",
  },
];

// ✅ دالة لعرض الأخبار الثابتة في الصفحة الرئيسية
function displayStaticHomeNews() {
  const container = document.querySelector(
    ".blogs .container .row.align-items-center"
  );
  if (!container) return;

  // إنشاء HTML للأخبار الثابتة كـ كاردات متساوية
  let html = "";
  
  staticHomeNewsData.forEach((newsItem) => {
    html += `
      <div class="col-md-4 col-lg-4">
        <div class="photo-card my-3">
          <img src="${newsItem.image}" alt="" class="img-fluid">
          <div class="body">
            <h5 class="photo-title">${newsItem.title}</h5>
            <p class="photo-date">
              <img src="images/uiw_date (1).png" alt="" style="width: 24px; height: 24px;">
              ${formatCustomDate(newsItem.published_at)}
            </p>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

async function loadNews() {
  try {
    // إعادة قراءة البيانات من localStorage للتأكد من أحدث البيانات
    const currentToken = localStorage.getItem("authToken");
    const currentUser = JSON.parse(localStorage.getItem("user"));

    console.log("Home - Token:", currentToken ? "موجود" : "غير موجود");
    console.log("Home - User:", currentUser);
    console.log("Home - User Role:", currentUser?.role);

    // إذا لم يكن هناك token أو user، أو إذا كان المستخدم له role = "user"
    if (!currentToken || !currentUser || currentUser.role === "user") {
      console.log(
        "المستخدم له role = user أو غير مسجل دخول → عرض الأخبار الثابتة"
      );
      displayStaticHomeNews();
      return;
    }

    const res = await fetch("/api/news_show", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      console.log("فشل في جلب الأخبار → عرض الأخبار الثابتة");
      displayStaticHomeNews();
      return;
    }

    const responseData = await res.json();
    const news = responseData.data || [];

    if (!news || news.length === 0) {
      console.log("مفيش أخبار في الداتا → عرض رسالة لا توجد بيانات");
      displayNoNewsMessage();
      return;
    }

    // عرض الأخبار الديناميكية للمستخدمين الآخرين
    displayDynamicHomeNews(news);
  } catch (error) {
    console.log("Error:", error);
    displayStaticHomeNews();
  }
}

// ✅ دالة لعرض رسالة عدم وجود أخبار في الصفحة الرئيسية
function displayNoNewsMessage() {
  const container = document.querySelector(
    ".blogs .container .row.align-items-center"
  );
  if (!container) return;

  let html = `
    <div class="col-12">
      <div class="alert alert-info">
        <h5>لا توجد أخبار لعرضها</h5>
        <p>لم يتم إنشاء أي أخبار بعد. يمكنك إضافة أخبار جديدة من لوحة التحكم.</p>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// ✅ دالة لعرض الأخبار الديناميكية في الصفحة الرئيسية
function displayDynamicHomeNews(news) {
  const container = document.querySelector(
    ".blogs .container .row.align-items-center"
  );
  if (!container) return;

  let html = "";

  if (news.length > 0) {
    // عرض جميع الأخبار كـ كاردات متساوية
    for (let i = 0; i < Math.min(news.length, 3); i++) {
      html += `
        <div class="col-md-4 col-lg-4">
          <div class="photo-card my-3">
            <img src="${
              news[i].image
                ? "/storage/" + news[i].image
                : "images/Frame 38.png"
            }" alt="" class="img-fluid">
            <div class="body">
              <h5 class="photo-title">${
                news[i].title || news[i].full_description
              }</h5>
              <p class="photo-date">
                <img src="images/uiw_date (1).png" alt="" style="width: 24px; height: 24px;">
                ${formatDate(news[i].published_at)}
              </p>
            </div>
          </div>
        </div>
      `;
    }
  } else {
    // في حالة عدم وجود أخبار، اعرض رسالة عدم وجود بيانات
    displayNoNewsMessage();
    return;
  }

  container.innerHTML = html;
}

// استدعاء
loadNews();

// متغيرات Google Maps
let map;
let markers = [];
let infoWindow;
let currentLocationMarker = null;

// دالة تهيئة Google Maps
function initMap() {
  console.log("بدء تهيئة خريطة جوجل...");
  
  // إنشاء الخريطة مع التركيز على المملكة العربية السعودية
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 6,
    center: { lat: 24.774265, lng: 46.738586 }, // الرياض
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    // تحسين إعدادات الخريطة
    gestureHandling: 'cooperative',
    zoomControl: true,
    mapTypeControl: true,
    scaleControl: true,
    streetViewControl: true,
    rotateControl: true,
    fullscreenControl: true,
    styles: [
      {
        featureType: "all",
        elementType: "labels.text.fill",
        stylers: [{ color: "#444444" }]
      },
      {
        featureType: "landscape",
        elementType: "all",
        stylers: [{ color: "#f2f2f2" }]
      },
      {
        featureType: "poi",
        elementType: "all",
        stylers: [{ visibility: "off" }]
      },
      {
        featureType: "road",
        elementType: "all",
        stylers: [{ saturation: -100 }, { lightness: 45 }]
      },
      {
        featureType: "road.highway",
        elementType: "all",
        stylers: [{ visibility: "simplified" }]
      },
      {
        featureType: "road.arterial",
        elementType: "labels.icon",
        stylers: [{ visibility: "off" }]
      },
      {
        featureType: "transit",
        elementType: "all",
        stylers: [{ visibility: "off" }]
      },
      {
        featureType: "water",
        elementType: "all",
        stylers: [{ color: "#b4d4e1" }, { visibility: "on" }]
      }
    ]
  });

  // إنشاء نافذة المعلومات
  infoWindow = new google.maps.InfoWindow();

  console.log("تم تحميل خريطة جوجل بنجاح");

  // إعداد زر الموقع الحالي
  setupCurrentLocationButton();

  // الحصول على الموقع الحالي تلقائياً عند تحميل الصفحة
  getCurrentLocationOnLoad();

  // تحديد نوع البيانات حسب المستخدم
  const mapToken = localStorage.getItem("authToken");
  const mapUser = JSON.parse(localStorage.getItem("user"));

  if (!mapUser || mapUser.role === "user") {
    // المستخدم العادي أو غير مسجل دخول → ماركرز ثابتة
    console.log("عرض الخريطة الثابتة للمستخدم العادي");
    loadStaticMarkers();
  } else {
    // المستخدمون الآخرون → بيانات ديناميكية من الباك إند
    console.log("عرض الخريطة الديناميكية للمستخدم المتقدم");
    loadMapEvents();
  }
}

// إعداد زر الموقع الحالي
function setupCurrentLocationButton() {
  const locationBtn = document.getElementById('currentLocationBtn');
  if (locationBtn) {
    locationBtn.addEventListener('click', getCurrentLocation);
  }
}

// الحصول على الموقع الحالي (عند النقر على الزر)
function getCurrentLocation() {
  const locationBtn = document.getElementById('currentLocationBtn');
  
  if (!navigator.geolocation) {
    showLocationMessage('المتصفح لا يدعم خدمة تحديد الموقع', 'error');
    return;
  }

  // إظهار حالة التحميل على الزر
  locationBtn.classList.add('loading');
  showLocationMessage('🔄 جاري تحديث موقعك...', 'info');

  const options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 30000 // استخدام موقع أحدث للزر
  };

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      
      console.log(`تم تحديث الموقع عبر الزر: ${lat}, ${lng}`);
      
      // إزالة الماركر السابق للموقع الحالي
      if (currentLocationMarker) {
        currentLocationMarker.setMap(null);
      }
      
      // إنشاء ماركر محدث للموقع الحالي
      currentLocationMarker = new google.maps.Marker({
        position: { lat: lat, lng: lng },
        map: map,
        title: 'موقعك الحالي (محدث)',
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/blue-pushpin.png',
          scaledSize: new google.maps.Size(45, 45),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(22, 45)
        },
        animation: google.maps.Animation.BOUNCE,
        zIndex: 1000
      });

      // إضافة نافذة معلومات محدثة للموقع الحالي
      const infoContent = `
        <div class="custom-info-window">
          <h4 style="color: #4285f4;">🔄 موقعك المحدث</h4>
          <p><span class="info-label">خط العرض:</span> ${lat.toFixed(6)}</p>
          <p><span class="info-label">خط الطول:</span> ${lng.toFixed(6)}</p>
          <p><span class="info-label">الدقة:</span> ${Math.round(position.coords.accuracy)} متر</p>
          <p><span class="info-label">آخر تحديث:</span> ${new Date().toLocaleTimeString('ar-EG')}</p>
          <p><span class="info-label">المصدر:</span> تحديث يدوي</p>
        </div>
      `;

      currentLocationMarker.addListener('click', () => {
        infoWindow.setContent(infoContent);
        infoWindow.open(map, currentLocationMarker);
      });

      // التحرك إلى الموقع المحدث
      map.setCenter({ lat: lat, lng: lng });
      map.setZoom(16); // تكبير أكثر للتحديث اليدوي

      // إيقاف الأنيميشن بعد 3 ثوان
      setTimeout(() => {
        if (currentLocationMarker) {
          currentLocationMarker.setAnimation(null);
        }
      }, 3000);

      // إزالة حالة التحميل وإظهار رسالة النجاح
      locationBtn.classList.remove('loading');
      showLocationMessage('✅ تم تحديث موقعك بنجاح!', 'success');
      
      // إخفاء الرسالة بعد 3 ثوان
      setTimeout(() => {
        hideLocationMessage();
      }, 3000);
    },
    (error) => {
      locationBtn.classList.remove('loading');
      
      let errorMessage = 'فشل في تحديث الموقع';
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'تم رفض الإذن لتحديد الموقع - يرجى السماح بالوصول للموقع';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'معلومات الموقع غير متاحة حالياً';
          break;
        case error.TIMEOUT:
          errorMessage = 'انتهت مهلة البحث - يرجى المحاولة مرة أخرى';
          break;
      }
      
      console.error('خطأ في تحديث الموقع:', error);
      showLocationMessage(errorMessage, 'error');
      
      // إخفاء رسالة الخطأ بعد 5 ثوان
      setTimeout(() => {
        hideLocationMessage();
      }, 5000);
    },
    options
  );
}

// إظهار رسالة الموقع
function showLocationMessage(message, type) {
  const messageDiv = document.getElementById('locationMessage');
  if (messageDiv) {
    messageDiv.textContent = message;
    messageDiv.className = `location-message ${type}`;
    messageDiv.style.display = 'block';
  }
}

// إخفاء رسالة الموقع
function hideLocationMessage() {
  const messageDiv = document.getElementById('locationMessage');
  if (messageDiv) {
    messageDiv.style.display = 'none';
  }
}

// الحصول على الموقع الحالي تلقائياً عند تحميل الصفحة
function getCurrentLocationOnLoad() {
  if (!navigator.geolocation) {
    console.log('المتصفح لا يدعم خدمة تحديد الموقع');
    showLocationMessage('المتصفح لا يدعم خدمة تحديد الموقع', 'error');
    setTimeout(() => hideLocationMessage(), 4000);
    return;
  }

  console.log('محاولة الحصول على الموقع الحالي تلقائياً...');
  showLocationMessage('🔍 جاري البحث عن موقعك الحالي...', 'info');

  const options = {
    enableHighAccuracy: true,
    timeout: 8000, // مهلة أقصر للتحميل التلقائي
    maximumAge: 300000 // 5 دقائق
  };

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      
      console.log(`تم العثور على الموقع تلقائياً: ${lat}, ${lng}`);
      
      // إزالة الماركر السابق للموقع الحالي إذا وجد
      if (currentLocationMarker) {
        currentLocationMarker.setMap(null);
      }
      
      // إنشاء ماركر للموقع الحالي
      currentLocationMarker = new google.maps.Marker({
        position: { lat: lat, lng: lng },
        map: map,
        title: 'موقعك الحالي',
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/blue-pushpin.png',
          scaledSize: new google.maps.Size(45, 45),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(22, 45)
        },
        animation: google.maps.Animation.BOUNCE,
        zIndex: 1000 // أعطي أولوية عالية لماركر الموقع الحالي
      });

      // إضافة نافذة معلومات للموقع الحالي
      const infoContent = `
        <div class="custom-info-window">
          <h4 style="color: #4285f4;">📍 موقعك الحالي</h4>
          <p><span class="info-label">خط العرض:</span> ${lat.toFixed(6)}</p>
          <p><span class="info-label">خط الطول:</span> ${lng.toFixed(6)}</p>
          <p><span class="info-label">الدقة:</span> ${Math.round(position.coords.accuracy)} متر</p>
          <p><span class="info-label">الوقت:</span> ${new Date().toLocaleTimeString('ar-EG')}</p>
        </div>
      `;

      currentLocationMarker.addListener('click', () => {
        infoWindow.setContent(infoContent);
        infoWindow.open(map, currentLocationMarker);
      });

      // التحرك إلى الموقع الحالي مع تكبير مناسب
      map.setCenter({ lat: lat, lng: lng });
      map.setZoom(14); // تكبير أكثر للموقع الحالي

      // إيقاف الأنيميشن بعد 4 ثوان
      setTimeout(() => {
        if (currentLocationMarker) {
          currentLocationMarker.setAnimation(null);
        }
      }, 4000);

      // إظهار رسالة النجاح
      showLocationMessage('✅ تم العثور على موقعك بنجاح!', 'success');
      
      // إخفاء الرسالة بعد 3 ثوان
      setTimeout(() => {
        hideLocationMessage();
      }, 3000);
    },
    (error) => {
      let errorMessage = 'لم يتم العثور على الموقع';
      let showButton = false;
      
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'تم رفض الإذن لتحديد الموقع';
          showButton = true;
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'معلومات الموقع غير متاحة';
          break;
        case error.TIMEOUT:
          errorMessage = 'انتهت مهلة البحث عن الموقع';
          showButton = true;
          break;
      }
      
      console.log('فشل في الحصول على الموقع تلقائياً:', error);
      
      if (showButton) {
        showLocationMessage(`${errorMessage} - اضغط على زر الموقع للمحاولة مرة أخرى`, 'error');
      } else {
        showLocationMessage(errorMessage, 'error');
      }
      
      // إخفاء رسالة الخطأ بعد 5 ثوان
      setTimeout(() => {
        hideLocationMessage();
      }, 5000);
    },
    options
  );
}

// دالة تحميل الماركرز الثابتة
function loadStaticMarkers() {
  const staticLocations = [
    { 
      name: "الرياض - مقر قبيلة بني تميم", 
      position: { lat: 24.774265, lng: 46.738586 },
      description: "المقر الرئيسي لقبيلة بني تميم في العاصمة الرياض"
    },
    { 
      name: "المدينة المنورة - قبيلة الأنصار", 
      position: { lat: 24.524654, lng: 39.569184 },
      description: "مقر قبيلة الأنصار في المدينة المنورة"
    },
    { 
      name: "جدة - قبيلة قريش", 
      position: { lat: 21.485811, lng: 39.192505 },
      description: "فرع قبيلة قريش في محافظة جدة"
    },
    { 
      name: "القصيم - قبيلة عنزة", 
      position: { lat: 26.326, lng: 43.975 },
      description: "مقر قبيلة عنزة في منطقة القصيم"
    },
    { 
      name: "حائل - قبيلة شمر", 
      position: { lat: 27.5114, lng: 41.7208 },
      description: "المقر الرئيسي لقبيلة شمر في حائل"
    }
  ];

  // إضافة الماركرز للخريطة
  staticLocations.forEach((location, index) => {
    const marker = new google.maps.Marker({
      position: location.position,
      map: map,
      title: location.name,
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/red-pushpin.png',
        scaledSize: new google.maps.Size(40, 40),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(20, 40)
      },
      animation: google.maps.Animation.DROP,
      optimized: false
    });

    // إضافة نافذة معلومات للماركر
    marker.addListener('click', () => {
      infoWindow.setContent(`
        <div class="custom-info-window">
          <h4>🏛️ ${location.name}</h4>
          <p><span class="info-label">الوصف:</span> ${location.description}</p>
          <p><span class="info-label">النوع:</span> موقع ثابت</p>
          <p><span class="info-label">الحالة:</span> نشط</p>
        </div>
      `);
      infoWindow.open(map, marker);
    });

    markers.push(marker);

    // تأخير في الأنيميشن لكل ماركر
    setTimeout(() => {
      marker.setAnimation(null);
    }, (index + 1) * 200);
  });

  // ضبط حدود الخريطة لتشمل جميع الماركرز
  const bounds = new google.maps.LatLngBounds();
  staticLocations.forEach(location => {
    bounds.extend(location.position);
  });
  map.fitBounds(bounds);
}

// دالة تحميل البيانات الديناميكية من الباك إند
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
      // في حالة الفشل، عرض الماركرز الثابتة
      loadStaticMarkers();
      return;
    }

    const events = await response.json();

    if (!events || events.length === 0) {
      console.log("لا توجد بيانات، عرض الماركرز الثابتة");
      loadStaticMarkers();
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    let validEvents = 0;

    events.forEach((event, index) => {
      if (event.latitude && event.longitude) {
        const lat = parseFloat(event.latitude);
        const lng = parseFloat(event.longitude);

        // التحقق من صحة الإحداثيات
        if (isNaN(lat) || isNaN(lng)) {
          console.warn(`إحداثيات غير صحيحة للحدث: ${event.name}`);
          return;
        }

        const position = { lat: lat, lng: lng };

        const marker = new google.maps.Marker({
          position: position,
          map: map,
          title: event.name,
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/green-pushpin.png',
            scaledSize: new google.maps.Size(40, 40),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(20, 40)
          },
          animation: google.maps.Animation.DROP,
          optimized: false
        });

        // إضافة نافذة معلومات للماركر
        marker.addListener('click', () => {
          infoWindow.setContent(`
            <div class="custom-info-window">
              <h4>🌟 ${event.name}</h4>
              ${event.city ? `<p><span class="info-label">المدينة:</span> ${event.city}</p>` : ''}
              ${event.description ? `<p><span class="info-label">الوصف:</span> ${event.description}</p>` : ''}
              <p><span class="info-label">النوع:</span> حدث ديناميكي</p>
              <p><span class="info-label">المصدر:</span> قاعدة البيانات</p>
            </div>
          `);
          infoWindow.open(map, marker);
        });

        markers.push(marker);
        bounds.extend(position);
        validEvents++;

        // تأخير في الأنيميشن لكل ماركر
        setTimeout(() => {
          marker.setAnimation(null);
        }, (index + 1) * 200);
      }
    });

    // ضبط حدود الخريطة إذا كان هناك أحداث صالحة
    if (validEvents > 0) {
      map.fitBounds(bounds);
      
      // التأكد من أن مستوى التكبير ليس عالياً جداً
      google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
        if (map.getZoom() > 15) {
          map.setZoom(15);
        }
      });
    } else {
      // إذا لم تكن هناك أحداث صالحة، عرض الماركرز الثابتة
      loadStaticMarkers();
    }

  } catch (err) {
    console.error("حدث خطأ أثناء تحميل المناسبات:", err);
    // في حالة الخطأ، عرض الماركرز الثابتة
    loadStaticMarkers();
  }
}

// جعل الدالة متاحة عالمياً للاستدعاء من Google Maps API
window.initMap = initMap;

document
  .getElementById("contactForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault(); // يمنع الفورم من إعادة التحميل

    const token = localStorage.getItem("authToken"); // لو مستخدم Sanctum

    const formData = {
      name: this.name.value,
      email: this.email.value,
      subject: this.subject.value,
      message: this.message.value,
    };

    try {
      // عرض رسالة تحميل (يمكن إضافتها لتحسين التجربة)
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "جاري الإرسال...";
      submitBtn.disabled = true;

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        // إخفاء الفورم وعرض رسالة النجاح
        this.style.display = "none";
        document.getElementById("successMessage").style.display = "block";
      } else {
        alert(data.message || "حدث خطأ");
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ في الاتصال بالسيرفر");
      const submitBtn = this.querySelector('button[type="submit"]');
      submitBtn.textContent = "إرسال الرسالة";
      submitBtn.disabled = false;
    }
  });

// إضافة وظيفة الزر للعودة إلى النموذج
document.getElementById("backButton").addEventListener("click", function (e) {
  e.preventDefault();
  document.getElementById("contactForm").style.display = "block";
  document.getElementById("successMessage").style.display = "none";
  document.getElementById("contactForm").reset();
});

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

updateFooterSettings();

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
