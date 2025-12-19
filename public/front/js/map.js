// جلب التوكن والمستخدم
const token = localStorage.getItem("authToken");
const user = JSON.parse(localStorage.getItem("user"));

// متغيرات Google Maps
let map;
let markers = [];
let infoWindow;
let geocoder;
let placesService;

// متغيرات للبحث عن المدن
let searchTimeout;
let selectedCoordinates = null;

// تهيئة خريطة Google Maps
function initMap() {
  // إنشاء الخريطة
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 6,
    center: { lat: 30.0444, lng: 31.2357 }, // مصر
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: [
      {
        featureType: "all",
        elementType: "geometry.fill",
        stylers: [{ weight: "2.00" }]
      },
      {
        featureType: "all",
        elementType: "geometry.stroke",
        stylers: [{ color: "#9c9c9c" }]
      },
      {
        featureType: "all",
        elementType: "labels.text",
        stylers: [{ visibility: "on" }]
      }
    ]
  });

  // إنشاء خدمات Google Maps
  infoWindow = new google.maps.InfoWindow();
  geocoder = new google.maps.Geocoder();
  placesService = new google.maps.places.PlacesService(map);

  // إضافة مستمع للنقر على الخريطة
  map.addListener("click", (event) => {
    const lat = event.latLng.lat().toFixed(6);
    const lng = event.latLng.lng().toFixed(6);

    // تحديث الإحداثيات المحددة
    selectedCoordinates = { lat: parseFloat(lat), lng: parseFloat(lng) };

    // إظهار الإحداثيات في النموذج
    displayCoordinates(lat, lng, "تم تحديد الموقع من الخريطة");

    // تفعيل زر الإضافة
    enableSubmitButton();

    // إظهار رسالة للمستخدم
    showNotification("تم تحديد الإحداثيات من الخريطة", "success");
  });

  // تحميل المناسبات بعد تهيئة الخريطة
  loadMapEvents();

  // الحصول على الموقع الحالي تلقائياً عند فتح الخريطة
  getCurrentLocationOnLoad();

  // تهيئة باقي الوظائف
  initializeMapFeatures();
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
        const marker = addMarkerToMap({
          name: event.name,
          city: event.city || "",
          description: event.description || "",
          latitude: lat,
          longitude: lng,
        });

        // إضافة الموقع إلى الحدود
        bounds.extend(new google.maps.LatLng(lat, lng));
      }
    });

    // ضبط الخريطة لتظهر كل العلامات
    if (events.length > 0) {
      map.fitBounds(bounds);
      // تأكد من أن التكبير ليس مفرطاً
      const listener = google.maps.event.addListener(map, "idle", () => {
        if (map.getZoom() > 15) map.setZoom(15);
        google.maps.event.removeListener(listener);
      });
    }
  } catch (err) {
    console.error("حدث خطأ أثناء تحميل المناسبات:", err);
  }
}

// البحث عن المدن باستخدام Google Places API
function searchCities(query) {
  if (query.length < 2) {
    hideCitySuggestions();
    return;
  }

  showCityLoading();

  const request = {
    query: query,
    fields: ['name', 'geometry', 'formatted_address'],
    locationBias: {
      center: { lat: 24.7136, lng: 46.6753 }, // السعودية
      radius: 2000000 // 2000 كم
    }
  };

  placesService.textSearch(request, (results, status) => {
    hideCityLoading();
    
    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
      displayCitySuggestions(results.slice(0, 5));
    } else {
      hideCitySuggestions();
    }
  });
}

// إظهار اقتراحات المدن
function displayCitySuggestions(results) {
  const suggestionsContainer = document.getElementById("citySearchResults");

  if (results.length === 0) {
    hideCitySuggestions();
    return;
  }

  let suggestionsHTML = "";
  results.forEach((result, index) => {
    const lat = result.geometry.location.lat();
    const lng = result.geometry.location.lng();
    const cityName = result.name;
    const fullAddress = result.formatted_address;
    
    // استخراج البلد من العنوان
    const addressParts = fullAddress.split(",");
    const country = addressParts[addressParts.length - 1].trim();

    suggestionsHTML += `
      <div class="city-suggestion-item" onclick="selectCity(${lat}, ${lng}, '${cityName.replace(/'/g, "\\'")}')">
        <div class="city-suggestion-name">${cityName}</div>
        <div class="city-suggestion-country">${country}</div>
      </div>
    `;
  });

  suggestionsContainer.innerHTML = suggestionsHTML;
  suggestionsContainer.classList.remove("d-none");
}

// اختيار مدينة من الاقتراحات
function selectCity(lat, lng, cityName) {
  // تحديث حقل المدينة
  document.getElementById("locationCity").value = cityName;

  // تحديث الإحداثيات المحددة
  selectedCoordinates = { lat: parseFloat(lat), lng: parseFloat(lng) };

  // إظهار الإحداثيات
  displayCoordinates(lat, lng, `${cityName}`);

  // إخفاء الاقتراحات
  hideCitySuggestions();

  // تفعيل زر الإضافة
  enableSubmitButton();

  // إظهار رسالة للمستخدم
  showNotification(`تم تحديد موقع ${cityName}`, "success");
}

// إظهار الإحداثيات المحددة
function displayCoordinates(lat, lng, locationName) {
  const coordinatesDisplay = document.getElementById("coordinatesDisplay");
  const coordinatesText = document.getElementById("coordinatesText");

  coordinatesText.innerHTML = `
    <strong>${locationName}</strong><br>
    خط العرض: ${parseFloat(lat).toFixed(4)}<br>
    خط الطول: ${parseFloat(lng).toFixed(4)}
  `;

  coordinatesDisplay.style.display = "block";
}

// إخفاء عرض الإحداثيات
function hideCoordinatesDisplay() {
  document.getElementById("coordinatesDisplay").style.display = "none";
}

// إظهار تحميل البحث
function showCityLoading() {
  document.querySelector(".city-loading").classList.remove("d-none");
}

// إخفاء تحميل البحث
function hideCityLoading() {
  document.querySelector(".city-loading").classList.add("d-none");
}

// إخفاء اقتراحات المدن
function hideCitySuggestions() {
  document.getElementById("citySearchResults").classList.add("d-none");
}

// تفعيل زر الإضافة
function enableSubmitButton() {
  const submitBtn = document.getElementById("submitLocationBtn");
  const name = document.getElementById("locationName").value.trim();
  const city = document.getElementById("locationCity").value.trim();

  if (name && city && selectedCoordinates) {
    submitBtn.disabled = false;
    submitBtn.classList.remove("disabled");
  } else {
    submitBtn.disabled = true;
    submitBtn.classList.add("disabled");
  }
}

// تعطيل زر الإضافة
function disableSubmitButton() {
  const submitBtn = document.getElementById("submitLocationBtn");
  submitBtn.disabled = true;
  submitBtn.classList.add("disabled");
}

// إضافة موقع جديد
async function addNewLocation() {
  const name = document.getElementById("locationName").value.trim();
  const city = document.getElementById("locationCity").value.trim();
  const description = document
    .getElementById("locationDescription")
    .value.trim();

  // التحقق من صحة البيانات
  if (!name || !city || !selectedCoordinates) {
    showNotification("يرجى ملء جميع الحقول المطلوبة وتحديد الموقع", "error");
    return;
  }

  try {
    // إرسال البيانات إلى الخادم
    const response = await fetch(
      "/api/tree_creator/occasions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: name,
          city: city,
          details: description,
          latitude: selectedCoordinates.lat,
          longitude: selectedCoordinates.lng,
          occasion_date: new Date().toISOString().split("T")[0], // تاريخ اليوم
          visibility: "public",
          category: "meeting" // فئة صحيحة
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "فشل في إضافة الموقع");
    }

    const newLocation = await response.json();

    // إضافة العلامة إلى الخريطة
    addMarkerToMap({
      name: name,
      city: city,
      description: description,
      latitude: selectedCoordinates.lat,
      longitude: selectedCoordinates.lng,
    });

    // إغلاق النموذج وإعادة تعيينه
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("addLocationModal")
    );
    modal.hide();
    resetForm();

    showNotification("تم إضافة الموقع بنجاح", "success");

    // إعادة تحميل المناسبات على الخريطة
    loadMapEvents();
  } catch (error) {
    console.error("خطأ في إضافة الموقع:", error);
    showNotification(error.message || "حدث خطأ أثناء إضافة الموقع", "error");
  }
}

// إضافة علامة إلى الخريطة
function addMarkerToMap(location) {
  const marker = new google.maps.Marker({
    position: { lat: location.latitude, lng: location.longitude },
    map: map,
    title: location.name,
    icon: {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="12" fill="#D3AB55" stroke="#fff" stroke-width="3"/>
          <circle cx="16" cy="16" r="6" fill="#fff"/>
        </svg>
      `),
      scaledSize: new google.maps.Size(32, 32),
      anchor: new google.maps.Point(16, 16)
    }
  });

  // إنشاء محتوى النافذة المنبثقة
  const contentString = `
    <div class="custom-popup" style="min-width: 200px; padding: 10px;">
      <h6 style="margin: 0 0 8px 0; color: #D3AB55; font-weight: bold;">${location.name}</h6>
      <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">
        <i class="bi bi-geo-alt"></i> ${location.city}
      </p>
      ${
        location.description
          ? `<p style="margin: 0; color: #333; font-size: 13px; line-height: 1.4;">${location.description}</p>`
          : ""
      }
    </div>
  `;

  // إضافة مستمع للنقر على العلامة
  marker.addListener("click", () => {
    infoWindow.setContent(contentString);
    infoWindow.open(map, marker);
  });

  markers.push(marker);
  return marker;
}

// إعادة تعيين النموذج
function resetForm() {
  document.getElementById("addLocationForm").reset();
  selectedCoordinates = null;
  hideCoordinatesDisplay();
  hideCitySuggestions();
  disableSubmitButton();
}

// إظهار الإشعارات
function showNotification(message, type = "info") {
  // إنشاء عنصر الإشعار
  const notification = document.createElement("div");
  notification.className = `alert alert-${
    type === "error" ? "danger" : type === "success" ? "success" : "info"
  } alert-dismissible fade show position-fixed`;
  notification.style.cssText = `
    top: 20px;
    right: 20px;
    z-index: 9999;
    min-width: 300px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  `;

  notification.innerHTML = `
    <i class="bi bi-${
      type === "error"
        ? "exclamation-triangle"
        : type === "success"
        ? "check-circle"
        : "info-circle"
    } me-2"></i>
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

  document.body.appendChild(notification);

  // إزالة الإشعار تلقائياً بعد 5 ثوانٍ
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);
}

// تهيئة المميزات الإضافية للخريطة
function initializeMapFeatures() {
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

  // إضافة مستمع لإعادة تعيين النموذج عند إغلاق النافذة المنبثقة
  const addLocationModal = document.getElementById("addLocationModal");
  addLocationModal.addEventListener("hidden.bs.modal", function () {
    resetForm();
  });

  // إضافة مستمع للبحث في المدن
  const cityInput = document.getElementById("locationCity");
  cityInput.addEventListener("input", function (e) {
    const query = e.target.value.trim();

    // إلغاء البحث السابق
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // إعادة تعيين الإحداثيات عند تغيير النص
    selectedCoordinates = null;
    hideCoordinatesDisplay();
    disableSubmitButton();

    // بدء بحث جديد بعد تأخير
    searchTimeout = setTimeout(() => {
      searchCities(query);
    }, 500);
  });

  // إضافة مستمع لحقل اسم الموقع
  const nameInput = document.getElementById("locationName");
  nameInput.addEventListener("input", enableSubmitButton);

  // إخفاء الاقتراحات عند النقر خارجها
  document.addEventListener("click", function (e) {
    if (
      !e.target.closest(".city-suggestions") &&
      !e.target.closest("#locationCity")
    ) {
      hideCitySuggestions();
    }
  });

  // منع إرسال النموذج بالضغط على Enter
  document
    .getElementById("addLocationForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
    });

  // إضافة وظائف تسجيل الخروج
  setupLogoutFunctionality();
}

// إعداد وظيفة تسجيل الخروج
function setupLogoutFunctionality() {
  const logoutLink = document.querySelector(".nav-link.text-danger");
  if (logoutLink) {
    logoutLink.addEventListener("click", async function (e) {
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
  }
}

// تهيئة الصفحة عند تحميل DOM
document.addEventListener("DOMContentLoaded", function () {
  // إذا لم يتم تحميل Google Maps بعد، انتظر
  if (typeof google === 'undefined') {
    console.log('انتظار تحميل Google Maps...');
    return;
  }
  
  // إذا لم يتم استدعاء initMap بعد، استدعها
  if (!map) {
    initMap();
  }
});

// إعداد الفئة النشطة للشريط الجانبي
document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll(".sidebar li").forEach((li) => {
    li.addEventListener("click", () => {
      document
        .querySelectorAll(".sidebar li")
        .forEach((item) => item.classList.remove("active"));
      li.classList.add("active");
    });
  });
});

// دالة مساعدة لإزالة جميع العلامات
function clearAllMarkers() {
  markers.forEach(marker => {
    marker.setMap(null);
  });
  markers = [];
}

// دالة لإعادة تحميل العلامات
function reloadMarkers() {
  clearAllMarkers();
  loadMapEvents();
}

// دالة للحصول على الموقع الحالي تلقائياً عند تحميل الصفحة
function getCurrentLocationOnLoad() {
  if (navigator.geolocation) {
    // إظهار رسالة تحميل
    showNotification("جاري تحديد موقعك الحالي...", "info");
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // تحديث مركز الخريطة للموقع الحالي
        map.setCenter(pos);
        map.setZoom(12);

        // إضافة علامة للموقع الحالي
        new google.maps.Marker({
          position: pos,
          map: map,
          title: "موقعك الحالي",
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
                <circle cx="14" cy="14" r="10" fill="#4285F4" stroke="#fff" stroke-width="3"/>
                <circle cx="14" cy="14" r="4" fill="#fff"/>
                <circle cx="14" cy="14" r="12" fill="none" stroke="#4285F4" stroke-width="1" opacity="0.3"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(28, 28),
            anchor: new google.maps.Point(14, 14)
          }
        });

        showNotification("تم تحديد موقعك الحالي بنجاح! 📍", "success");
      },
      (error) => {
        let errorMessage = "فشل في تحديد الموقع الحالي";
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "تم رفض الإذن للوصول للموقع. يرجى السماح بالوصول للموقع في إعدادات المتصفح";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "معلومات الموقع غير متاحة حالياً";
            break;
          case error.TIMEOUT:
            errorMessage = "انتهت مهلة تحديد الموقع. يرجى المحاولة مرة أخرى";
            break;
        }
        
        console.log("خطأ في تحديد الموقع:", error);
        showNotification(errorMessage, "error");
        
        // في حالة الفشل، اعرض الخريطة على الموقع الافتراضي (مصر)
        map.setCenter({ lat: 30.0444, lng: 31.2357 });
        map.setZoom(6);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 دقائق
      }
    );
  } else {
    showNotification("المتصفح لا يدعم تحديد الموقع الجغرافي", "error");
    // اعرض الخريطة على الموقع الافتراضي
    map.setCenter({ lat: 30.0444, lng: 31.2357 });
    map.setZoom(6);
  }
}



// دالة للحصول على الموقع الحالي (للاستخدام اليدوي)
function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        map.setCenter(pos);
        map.setZoom(15);

        // إضافة علامة للموقع الحالي
        new google.maps.Marker({
          position: pos,
          map: map,
          title: "موقعك الحالي",
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="#fff" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" fill="#fff"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(24, 24),
            anchor: new google.maps.Point(12, 12)
          }
        });

        showNotification("تم تحديد موقعك الحالي", "success");
      },
      () => {
        showNotification("فشل في تحديد الموقع الحالي", "error");
      }
    );
  } else {
    showNotification("المتصفح لا يدعم تحديد الموقع", "error");
  }
}
