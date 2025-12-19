const params = new URLSearchParams(window.location.search);
const occasionId = params.get("id");
const token = localStorage.getItem("authToken");
const user = JSON.parse(localStorage.getItem("user") || "{}");

// متغيرات Google Maps
let map;
let marker;
let infoWindow;

if (!occasionId) {
  alert("حدث خطأ: لم يتم اختيار مناسبة");
  window.location.href = "userevents.html";
}

// ✅ التحقق من صلاحية الدخول
function checkAuth() {
  if (!token || !user || user.role !== "tree_creator") {
    window.location.href = "login.html";
  }
}

// تهيئة خريطة Google Maps
function initEventMap() {
  try {
    console.log('بدء تهيئة خريطة Google Maps...');
    
    const mapContainer = document.getElementById("map");
    if (!mapContainer) {
      console.error('عنصر الخريطة غير موجود');
      return;
    }

    // إنشاء الخريطة بموقع افتراضي
    map = new google.maps.Map(mapContainer, {
      zoom: 13,
      center: { lat: 24.7136, lng: 46.6753 }, // السعودية
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
        },
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    });

    // إنشاء نافذة المعلومات
    infoWindow = new google.maps.InfoWindow();

    console.log('تم تهيئة الخريطة بنجاح');
    
    // تحميل تفاصيل المناسبة
    loadOccasionDetails();
  } catch (error) {
    console.error('خطأ في تهيئة الخريطة:', error);
    // في حالة الخطأ، اعرض رسالة وحمّل البيانات بدون خريطة
    const mapContainer = document.getElementById("map");
    if (mapContainer) {
      mapContainer.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; 
                    background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); 
                    border-radius: 12px; color: #d32f2f; text-align: center;">
          <div>
            <i class="bi bi-exclamation-triangle" style="font-size: 48px; margin-bottom: 10px;"></i>
            <p style="margin: 0; font-size: 14px;">خطأ في تحميل الخريطة</p>
          </div>
        </div>
      `;
    }
    loadOccasionDetails();
  }
}

// دالة إضافة علامة على الخريطة
function addEventMarker(lat, lng, title, details) {
  try {
    // التحقق من صحة الإحداثيات
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      console.error('إحداثيات غير صحيحة:', { lat, lng });
      return;
    }

    // التحقق من وجود الخريطة
    if (!map) {
      console.error('الخريطة غير مهيأة');
      return;
    }

    // إزالة العلامة السابقة إن وجدت
    if (marker) {
      marker.setMap(null);
    }

    // إضافة علامة جديدة
    marker = new google.maps.Marker({
      position: { lat: lat, lng: lng },
      map: map,
      title: title,
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

    // إنشاء محتوى نافذة المعلومات
    const contentString = `
      <div style="min-width: 200px; padding: 10px; text-align: center; direction: rtl;">
        <h6 style="margin: 0 0 8px 0; color: #D3AB55; font-weight: bold; font-size: 16px;">${title}</h6>
        <p style="margin: 0; color: #666; font-size: 12px; line-height: 1.4;">
          📍 موقع المناسبة
        </p>
        <small style="color: #999; font-size: 10px;">انقر على الخريطة للتفاعل</small>
      </div>
    `;

    // إضافة مستمع للنقر على العلامة
    marker.addListener("click", () => {
      infoWindow.setContent(contentString);
      infoWindow.open(map, marker);
    });

    // تحديث مركز الخريطة مع تكبير مناسب
    map.setCenter({ lat: lat, lng: lng });
    map.setZoom(15);

    console.log('تم إضافة العلامة بنجاح:', { lat, lng, title });
  } catch (error) {
    console.error('خطأ في إضافة العلامة:', error);
  }
}

async function loadOccasionDetails() {
  try {
    const response = await fetch(
      `/api/tree_creator/occasion-details/${occasionId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error("فشل تحميل بيانات المناسبة");

    const occasion = await response.json();

    // تحديث الصفحة بالبيانات
    const coverImage = document.getElementById("cover_image");
    if (occasion.cover_image) {
      coverImage.src = occasion.cover_image;
    } else {
      coverImage.src = "images/tree 1.png";
    }
    document.querySelector(".content h3").textContent = occasion.name;
    document.querySelector(".content p.text-muted").textContent = new Date(
      occasion.occasion_date
    ).toLocaleDateString("ar-EG", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    document.getElementById("occasionDetails").textContent = occasion.details;

    // categories
    const categoriesContainer = document.getElementById("categoriesContainer");
    categoriesContainer.innerHTML = "";
    const categoryMap = {
      occasion: "سنوي",
      meeting: "اجتماع",
      familiar: "عائلي",
    };
    if (occasion.category) {
      const span = document.createElement("span");
      span.className = "tag btn";
      span.style =
        "color: rgba(39, 58, 65, 1); font-size: 20px; background-color: rgba(39, 58, 65, 0.05); padding: .5rem; border-radius: 4px;";
      span.textContent = categoryMap[occasion.category] || occasion.category;
      categoriesContainer.appendChild(span);
    }

    document.querySelectorAll(".share-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const platform = btn.dataset.platform;
        const url = encodeURIComponent(window.location.href); // رابط المناسبة الحالية
        const text = encodeURIComponent(
          document.querySelector(".content h3").textContent
        ); // عنوان المناسبة

        let shareUrl = "";

        switch (platform) {
          case "facebook":
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
          case "twitter":
            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
            break;
          case "whatsapp":
            shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
            break;
          case "linkedin":
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
            break;
        }

        window.open(shareUrl, "_blank", "width=600,height=400");
      });
    });

    // إضافة العلامة على الخريطة إذا توفرت الإحداثيات
    if (occasion.latitude && occasion.longitude && map) {
      const lat = parseFloat(occasion.latitude);
      const lng = parseFloat(occasion.longitude);
      addEventMarker(lat, lng, occasion.name, occasion.details);
    } else if (!occasion.latitude || !occasion.longitude) {
      // إذا لم تتوفر إحداثيات، اعرض رسالة في الخريطة
      const mapContainer = document.getElementById("map");
      mapContainer.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; 
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); 
                    border-radius: 12px; color: #666; text-align: center;">
          <div>
            <i class="bi bi-geo-alt" style="font-size: 48px; color: #D3AB55; margin-bottom: 10px;"></i>
            <p style="margin: 0; font-size: 14px;">لم يتم تحديد موقع لهذه المناسبة</p>
          </div>
        </div>
      `;
    }
  } catch (err) {
    console.error(err);
    alert("فشل في تحميل بيانات المناسبة");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // loadOccasionDetails سيتم استدعاؤها من initEventMap عند تحميل Google Maps
  
  // fallback في حالة عدم تحميل Google Maps
  setTimeout(() => {
    if (typeof google === 'undefined' || !map) {
      console.log('Google Maps لم يتم تحميله، محاولة تهيئة الخريطة...');
      if (typeof google !== 'undefined') {
        initEventMap();
      } else {
        // إذا فشل تحميل Google Maps، اعرض رسالة خطأ
        const mapContainer = document.getElementById("map");
        mapContainer.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; 
                      background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); 
                      border-radius: 12px; color: #d32f2f; text-align: center;">
            <div>
              <i class="bi bi-exclamation-triangle" style="font-size: 48px; margin-bottom: 10px;"></i>
              <p style="margin: 0; font-size: 14px;">فشل في تحميل الخريطة</p>
            </div>
          </div>
        `;
        // تحميل البيانات بدون خريطة
        loadOccasionDetails();
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
});

// active class
document.querySelectorAll(".sidebar li").forEach((li) => {
  li.addEventListener("click", () => {
    document
      .querySelectorAll(".sidebar li")
      .forEach((item) => item.classList.remove("active"));
    li.classList.add("active");
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
