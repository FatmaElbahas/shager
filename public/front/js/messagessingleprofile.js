// Message Single Profile JavaScript
// تم تحديث هذا الملف ليستقبل message_id بدلاً من user_id
// النظام يجلب بيانات الرسالة من API: /api/admin/view/{messageId}
// تم إضافة دالة translateTypeToArabic() لترجمة أنواع الرسائل للعربية

const token = localStorage.getItem("authToken");

// فحص صلاحية المستخدم
function checkAuth() {
  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token || !user || user.role !== "admin") {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

document.addEventListener("DOMContentLoaded", function () {
  if (checkAuth()) {
    initializeMessageProfile();
    setupEventListeners();
  }
});

function getCorrectImageUrl(imagePath) {
  if (!imagePath) return null;

  // إذا كان المسار يبدأ بـ /storage/ فهو من Laravel
  if (imagePath.startsWith("/storage/")) {
    return `http://127.0.0.1:8001/${imagePath}`;
  }

  // إذا كان مسار كامل، استخدمه كما هو
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // مسار نسبي، أضف Laravel server
  return `/storage/${imagePath}`;
}

function initializeMessageProfile() {
  // Load user profile and message data from API
  loadUserProfile();

  // Setup form validation
  setupFormValidation();
}

function setupEventListeners() {
  // Reply form submission
  const replyForm = document.querySelector(".reply-form");
  if (replyForm) {
    replyForm.addEventListener("submit", handleReplySubmission);
  }

  // Action button click
  const actionBtn = document.querySelector(".action-btn");
  if (actionBtn) {
    actionBtn.addEventListener("click", handleActionMenu);
  }

  // Sidebar toggle for mobile
  const sidebarToggle = document.querySelector(".navbar-toggler");
  const sidebar = document.getElementById("sidebar");
  const closeBtn = document.getElementById("close");

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("show");
    });
  }

  if (closeBtn && sidebar) {
    closeBtn.addEventListener("click", () => {
      sidebar.classList.remove("show");
    });
  }
}

// عرض حالة التحميل
function showLoadingState() {
  const nameElement = document.querySelector(".profile-name");
  const emailElement = document.querySelector(".profile-email");
  const messageElement = document.querySelector(".message-preview");

  if (nameElement) nameElement.textContent = "جاري التحميل...";
  if (emailElement) emailElement.textContent = "جاري التحميل...";
  if (messageElement) messageElement.textContent = "جاري تحميل الرسائل...";
}

// التحقق من صحة البيانات المستلمة
function validateResponseData(data) {
  if (!data) return false;

  // إذا كانت مصفوفة فارغة
  if (Array.isArray(data) && data.length === 0) return false;

  // إذا كان كائن فارغ
  if (typeof data === "object" && Object.keys(data).length === 0) return false;

  // التحقق من وجود بيانات أساسية للرسالة أو المستخدم
  const hasValidData =
    data.id || // معرف الرسالة
    data.title || // عنوان الرسالة
    data.type || // نوع الرسالة
    data.details || // تفاصيل الرسالة
    data.message || // محتوى الرسالة
    data.user || // بيانات المستخدم
    data.name || // اسم المستخدم
    data.email || // إيميل المستخدم
    (Array.isArray(data) &&
      data[0] &&
      (data[0].name || data[0].email || data[0].id));

  return !!hasValidData;
}

// عرض حالة الخطأ
function showErrorState(message) {
  const nameElement = document.querySelector(".profile-name");
  const emailElement = document.querySelector(".profile-email");
  const messageElement = document.querySelector(".message-preview");

  if (nameElement) nameElement.textContent = "خطأ في التحميل";
  if (emailElement) emailElement.textContent = message;
  if (messageElement) messageElement.textContent = "لم يتم تحميل الرسائل";
}

// دالة لطباعة هيكل البيانات بشكل منظم
function debugDataStructure(data) {
  console.log("=== تشخيص هيكل البيانات ===");
  console.log("نوع البيانات:", typeof data);
  console.log("هل هي مصفوفة:", Array.isArray(data));

  if (data && typeof data === "object") {
    console.log("جميع المفاتيح المتاحة:", Object.keys(data));

    // فحص الحقول المهمة
    const importantFields = [
      "title",
      "type",
      "details",
      "message",
      "content",
      "description",
      "user",
      "messages",
      "complaints",
      "subject",
      "body",
      "text",
    ];
    console.log("فحص الحقول المهمة:");
    importantFields.forEach((field) => {
      if (data.hasOwnProperty(field)) {
        console.log(`حقل ${field}:`, data[field]);
      } else {
        console.log(`حقل ${field}: غير موجود`);
      }
    });

    // فحص بيانات المستخدم
    if (data.user) {
      console.log("بيانات المستخدم:", data.user);
      console.log("مفاتيح المستخدم:", Object.keys(data.user));
    }

    // فحص الرسائل
    const messageArrays = ["messages", "complaints", "user_messages"];
    messageArrays.forEach((arrayName) => {
      if (data[arrayName] && Array.isArray(data[arrayName])) {
        console.log(`عدد ${arrayName}:`, data[arrayName].length);
        if (data[arrayName].length > 0) {
          console.log(`أول ${arrayName}:`, data[arrayName][0]);
          console.log(
            `مفاتيح أول ${arrayName}:`,
            Object.keys(data[arrayName][0])
          );

          // فحص الحقول المهمة في الرسالة
          const messageFields = [
            "title",
            "type",
            "details",
            "message",
            "content",
          ];
          messageFields.forEach((field) => {
            if (data[arrayName][0].hasOwnProperty(field)) {
              console.log(
                `${arrayName}[0].${field}:`,
                data[arrayName][0][field]
              );
            }
          });
        }
      }
    });
  }
  console.log("=== نهاية التشخيص ===");
}

async function loadUserProfile() {
  const messageId = localStorage.getItem("selectedMessageId");

  if (!messageId) {
    showNotification("لم يتم العثور على معرف الرسالة", "error");
    setTimeout(() => {
      window.location.href = "messages.html";
    }, 2000);
    return;
  }

  // عرض حالة التحميل
  showLoadingState();

  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch(
      `/api/view/${messageId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("خطأ في الاستجابة:", errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("البيانات المستلمة من API:", data);

    document.querySelector(".message-title").textContent =
      data.title || "بدون عنوان";
    document.querySelector(".message-type").textContent =
      translateTypeToArabic(data.type) || "غير محدد";
    document.getElementById("message-details").textContent =
      data.details || "لا توجد تفاصيل";

    // التحقق من وجود بيانات
    if (!validateResponseData(data)) {
      throw new Error("لا توجد بيانات صحيحة لهذا المستخدم");
    }

    // طباعة تفصيلية للبيانات للتشخيص
    debugDataStructure(data);

    // Update profile information
    updateProfileDisplay(data);

    // Update message content
    updateMessageDisplay(data);
  } catch (error) {
    console.error("خطأ في جلب بيانات الرسالة:", error);

    // عرض رسالة خطأ مفصلة
    let errorMessage = "حدث خطأ في تحميل بيانات الرسالة";

    if (error.message.includes("404")) {
      errorMessage = "لم يتم العثور على هذه الرسالة";
    } else if (error.message.includes("401") || error.message.includes("403")) {
      errorMessage = "لا تملك صلاحية لعرض هذه الرسالة";
    } else if (error.message.includes("500")) {
      errorMessage = "خطأ في الخادم - يرجى المحاولة لاحقاً";
    }

    showNotification(errorMessage, "error");

    // عرض رسالة خطأ في الواجهة
    showErrorState(errorMessage);

    setTimeout(() => {
      window.location.href = "messages.html";
    }, 5000);
  }
}

function updateProfileDisplay(data) {
  // التحقق من هيكل البيانات المستلمة
  console.log("البيانات المستلمة:", data);

  // معالجة هياكل البيانات المختلفة
  let user = {};
  let familyTree = {};

  console.log("هيكل البيانات:", {
    hasUser: !!data.user,
    hasName: !!data.name,
    hasEmail: !!data.email,
    isArray: Array.isArray(data),
    keys: Object.keys(data),
  });

  // إذا كانت البيانات تحتوي على user مباشرة
  if (data.user) {
    user = data.user;
    familyTree = data.family_tree || data.familyTree || {};
  }
  // إذا كانت البيانات هي المستخدم نفسه
  else if (data.name || data.email) {
    user = data;
    familyTree = data.family_tree || data.familyTree || {};
  }
  // إذا كانت البيانات في مصفوفة
  else if (Array.isArray(data) && data.length > 0) {
    user = data[0];
    familyTree = data[0].family_tree || data[0].familyTree || {};
  }
  // إذا كانت البيانات تحتوي على معلومات الرسالة فقط
  else if (
    data.id &&
    (data.title || data.type || data.details || data.message)
  ) {
    // استخدام بيانات افتراضية للمستخدم أو البحث عن بيانات المستخدم في الرسالة
    user = {
      name: data.sender_name || data.user_name || "مرسل الرسالة",
      email: data.sender_email || data.user_email || "غير محدد",
      phone: data.sender_phone || data.user_phone || "غير محدد",
    };
    familyTree = {};
  }

  console.log("بيانات المستخدم المعالجة:", user);
  console.log("بيانات الشجرة:", familyTree);

  const nameElement = document.querySelector(".profile-name");
  const emailElement = document.querySelector(".profile-email");
  const phoneElement = document.querySelector(".contact-item .contact-value");
  const businessElement = document.querySelectorAll(
    ".contact-item .contact-value"
  )[1];
  const avatarElement = document.querySelector(".avatar-img");

  if (nameElement)
    nameElement.textContent = user.name || user.full_name || "غير محدد";
  if (emailElement) emailElement.textContent = user.email || "غير محدد";
  if (phoneElement)
    phoneElement.textContent =
      user.phone || user.mobile || user.phone_number || "غير محدد";
  if (businessElement) {
    // البحث عن اسم الشجرة في مختلف الهياكل المحتملة
    const treeName =
      familyTree.tree_name ||
      familyTree.name ||
      user.tree_name ||
      (data.trees && data.trees[0] && data.trees[0].tree_name) ||
      (data.family_trees &&
        data.family_trees[0] &&
        data.family_trees[0].tree_name) ||
      "غير محدد";
    businessElement.textContent = treeName;
  }

  // تحديث صورة المستخدم
  if (avatarElement) {
    if (user.profile_picture) {
      avatarElement.innerHTML = `<img src="/storage/${user.profile_picture}" alt="صورة المستخدم" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=/"bi bi-person-circle/" style=/"font-size: 80px; color: #d0d0d0;"></i>`;
    } else {
      avatarElement.innerHTML =
        '<i class="bi bi-person-circle" style="font-size: 80px; color: #d0d0d0;"></i>';
    }
  }
}

// تم دمج هذه الدالة في loadUserProfile

function updateMessageDisplay(data) {
  const user = data.user || data || {};

  // البحث عن الرسائل في البيانات
  const messages = data.messages || data.complaints || data.user_messages || [];

  // إذا وجدت رسائل، استخدم أحدثها، وإلا استخدم البيانات الرئيسية
  let latestMessage;
  if (messages.length > 0) {
    // استخدام أحدث رسالة
    latestMessage = messages[messages.length - 1] || messages[0];
  } else {
    // استخدام البيانات الرئيسية إذا لم توجد رسائل منفصلة
    latestMessage = data;
  }

  console.log("=== تحليل الرسائل ===");
  console.log("الرسائل الموجودة:", messages);
  console.log("عدد الرسائل:", messages.length);
  console.log("الرسالة المختارة:", latestMessage);
  console.log("البيانات الكاملة:", data);
  console.log("=== نهاية تحليل الرسائل ===");

  // طباعة جميع الحقول المتاحة للتشخيص
  console.log("=== مفاتيح البيانات ===");
  console.log("جميع مفاتيح البيانات:", Object.keys(data));
  if (latestMessage && typeof latestMessage === "object") {
    console.log("جميع مفاتيح الرسالة:", Object.keys(latestMessage));

    // فحص محتوى الرسالة بالتفصيل
    const messageKeys = Object.keys(latestMessage);
    messageKeys.forEach((key) => {
      console.log(`latestMessage.${key}:`, latestMessage[key]);
    });
  }
  console.log("=== نهاية مفاتيح البيانات ===");

  const senderElement = document.querySelector(".message-sender");
  const subjectElement = document.querySelector(".message-subject");
  const previewElement = document.querySelector(".message-preview");

  // عرض اسم المرسل
  if (senderElement) {
    const senderName =
      user.name || user.full_name || latestMessage.sender_name || "غير محدد";
    senderElement.textContent = senderName;
    console.log("تم عرض اسم المرسل:", senderName);
  }

  // عرض العنوان/النوع من title أو type
  if (subjectElement) {
    // البحث عن العنوان في حقول مختلفة
    const messageTitle =
      latestMessage.title ||
      data.title ||
      latestMessage.subject ||
      data.subject ||
      latestMessage.complaint_title ||
      data.complaint_title ||
      latestMessage.message_title ||
      data.message_title;

    console.log("البحث عن العنوان في:", {
      "latestMessage.title": latestMessage.title,
      "data.title": data.title,
      "latestMessage.subject": latestMessage.subject,
      "data.subject": data.subject,
    });

    if (messageTitle && messageTitle.trim() !== "") {
      subjectElement.textContent = messageTitle;
      console.log("تم عرض العنوان:", messageTitle);
    } else {
      // إذا لم يوجد عنوان، اعرض النوع
      const messageType =
        latestMessage.type ||
        latestMessage.complaint_type ||
        latestMessage.message_type ||
        data.type ||
        data.complaint_type ||
        data.message_type ||
        "inquiry";

      console.log("البحث عن النوع في:", {
        "latestMessage.type": latestMessage.type,
        "data.type": data.type,
        messageType: messageType,
      });

      subjectElement.textContent = translateTypeToArabic(messageType);
      console.log(
        "تم عرض نوع الرسالة:",
        messageType,
        "→",
        translateTypeToArabic(messageType)
      );
    }
  }

  // عرض المحتوى من details أو message
  if (previewElement) {
    console.log("البحث عن المحتوى في:", {
      "latestMessage.details": latestMessage.details,
      "data.details": data.details,
      "latestMessage.message": latestMessage.message,
      "data.message": data.message,
    });

    const messageContent =
      latestMessage.details ||
      data.details ||
      latestMessage.message ||
      latestMessage.content ||
      latestMessage.description ||
      latestMessage.body ||
      latestMessage.text ||
      data.message ||
      data.content ||
      data.description ||
      data.body ||
      data.text ||
      "لا يوجد محتوى";

    previewElement.textContent = messageContent;
    console.log("تم عرض محتوى الرسالة:", messageContent);
  }
}

// دالة ترجمة النوع للعربية
function translateTypeToArabic(type) {
  console.log("ترجمة نوع الرسالة:", type);

  const typeTranslations = {
    // أنواع الشكاوى
    behavioral: "شكوى سلوكية",
    technical: "مشكلة تقنية",
    financial: "استفسار مالي",
    administrative: "مشكلة إدارية",
    service: "شكوى خدمة",

    // أنواع الرسائل العامة
    inquiry: "استفسار عام",
    complaint: "شكوى",
    suggestion: "اقتراح",
    feedback: "ملاحظات",
    support: "طلب دعم",

    // أنواع التقارير
    bug_report: "بلاغ خطأ",
    feature_request: "طلب ميزة جديدة",
    improvement: "اقتراح تحسين",

    // أنواع أخرى
    general: "عام",
    urgent: "عاجل",
    other: "أخرى",

    // حالات خاصة
    null: "غير محدد",
    undefined: "غير محدد",
    "": "غير محدد",
  };

  // تحويل النوع للأحرف الصغيرة للمقارنة
  const normalizedType = type ? type.toString().toLowerCase() : "";

  const result =
    typeTranslations[normalizedType] ||
    typeTranslations[type] ||
    type ||
    "غير محدد";
  console.log("نتيجة الترجمة:", result);
  return result;
}

// تحويل نوع الشكوى لنص مقروء (للتوافق مع الكود القديم)
function getTypeText(type) {
  return translateTypeToArabic(type);
}

function setupFormValidation() {
  const textarea = document.querySelector(".reply-textarea");
  const submitBtn = document.querySelector(".btn-send");
  const replyForm = document.querySelector(".reply-form");

  if (textarea && submitBtn) {
    textarea.addEventListener("input", function () {
      const isValid = this.value.trim().length > 0;
      submitBtn.disabled = !isValid;

      if (isValid) {
        submitBtn.style.opacity = "1";
        submitBtn.style.cursor = "pointer";
      } else {
        submitBtn.style.opacity = "0.6";
        submitBtn.style.cursor = "not-allowed";
      }
    });

    // Initial state
    submitBtn.disabled = true;
    submitBtn.style.opacity = "0.6";
    submitBtn.style.cursor = "not-allowed";
  }

  // ربط الفورم بدالة المعالجة
  if (replyForm) {
    replyForm.addEventListener("submit", handleReplySubmission);
  }
}

async function handleReplySubmission(event) {
  event.preventDefault();

  const textarea = document.querySelector(".reply-textarea");
  const replyContent = textarea.value.trim();
  const messageId = localStorage.getItem("selectedMessageId");

  if (!replyContent) {
    showNotification("يرجى كتابة رسالة الرد", "error");
    return;
  }

  if (!messageId) {
    showNotification("لم يتم العثور على معرف الرسالة للرحد", "error");
    return;
  }

  // Show loading state
  const submitBtn = document.querySelector(".btn-send");
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> جاري الإرسال...';
  submitBtn.disabled = true;

  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch(
      `/api/admin/replay/${messageId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          admin_reply: replyContent,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // Reset form
    textarea.value = "";
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = true;
    submitBtn.style.opacity = "0.6";

    // Show success message
    showNotification("تم إرسال الرد بنجاح", "success");

    // Optionally redirect back to messages list after 2 seconds
    setTimeout(() => {
      window.location.href = "messages.html";
    }, 2000);
  } catch (error) {
    console.error("خطأ في إرسال الرد:", error);

    // Reset button state
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
    submitBtn.style.opacity = "1";

    showNotification("حدث خطأ في إرسال الرد", "error");
  }
}

function handleActionMenu(event) {
  event.preventDefault();

  // Create dropdown menu
  const existingMenu = document.querySelector(".action-menu");
  if (existingMenu) {
    existingMenu.remove();
    return;
  }

  const menu = document.createElement("div");
  menu.className = "action-menu";
  menu.innerHTML = `
        <div class="action-menu-item" onclick="markAsRead()">
            <i class="bi bi-check-circle"></i>
            تحديد كمقروء
        </div>
        <div class="action-menu-item" onclick="deleteMessage()">
            <i class="bi bi-trash"></i>
            حذف الرسالة
        </div>
        <div class="action-menu-item" onclick="forwardMessage()">
            <i class="bi bi-forward"></i>
            إعادة توجيه
        </div>
    `;

  // Position menu
  const rect = event.target.getBoundingClientRect();
  menu.style.position = "absolute";
  menu.style.top = rect.bottom + 5 + "px";
  menu.style.left = rect.left - 150 + "px";
  menu.style.zIndex = "1000";

  document.body.appendChild(menu);

  // Close menu when clicking outside
  setTimeout(() => {
    document.addEventListener("click", function closeMenu(e) {
      if (!menu.contains(e.target)) {
        menu.remove();
        document.removeEventListener("click", closeMenu);
      }
    });
  }, 100);
}

function markAsRead() {
  showNotification("تم تحديد الرسالة كمقروءة", "success");
  document.querySelector(".action-menu")?.remove();
}

function deleteMessage() {
  if (confirm("هل أنت متأكد من حذف هذه الرسالة؟")) {
    showNotification("تم حذف الرسالة", "success");
    setTimeout(() => {
      window.location.href = "messages.html";
    }, 1500);
  }
  document.querySelector(".action-menu")?.remove();
}

function forwardMessage() {
  showNotification("سيتم إضافة هذه الميزة قريباً", "info");
  document.querySelector(".action-menu")?.remove();
}

function showNotification(message, type = "info") {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll(".notification");
  existingNotifications.forEach((n) => n.remove());

  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
        <div class="notification-content">
            <i class="bi bi-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;

  document.body.appendChild(notification);

  // Show notification
  setTimeout(() => {
    notification.classList.add("show");
  }, 100);

  // Hide notification after 3 seconds
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

function getNotificationIcon(type) {
  switch (type) {
    case "success":
      return "check-circle";
    case "error":
      return "exclamation-circle";
    case "warning":
      return "exclamation-triangle";
    default:
      return "info-circle";
  }
}

// Add notification styles
const notificationStyles = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 16px 20px;
    z-index: 9999;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    min-width: 300px;
}

.notification.show {
    transform: translateX(0);
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 12px;
}

.notification-success {
    border-left: 4px solid #4CAF50;
}

.notification-error {
    border-left: 4px solid #f44336;
}

.notification-warning {
    border-left: 4px solid #ff9800;
}

.notification-info {
    border-left: 4px solid #2196f3;
}

.notification-success i {
    color: #4CAF50;
}

.notification-error i {
    color: #f44336;
}

.notification-warning i {
    color: #ff9800;
}

.notification-info i {
    color: #2196f3;
}

.action-menu {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 8px 0;
    min-width: 180px;
}

.action-menu-item {
    padding: 12px 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #2c3e50;
    transition: background-color 0.2s ease;
}

.action-menu-item:hover {
    background-color: #f8f9fa;
}

.action-menu-item i {
    font-size: 16px;
}
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

async function loadSettings() {
  try {
    const response = await fetch("/api/admin/settings", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("فشل تحميل الإعدادات");

    const settings = await response.json();

    // تحديث صورة اللوجو في الصفحة
    if (settings.platform_logo) {
      document.getElementById("platformLogo").src = getCorrectImageUrl(
        settings.platform_logo
      );
    }
  } catch (err) {
    console.error("خطأ في تحميل الإعدادات:", err);
  }
}

// تنفيذ الدالة عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  loadSettings();

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

// تم دمج معالجة الفورم في setupFormValidation() لتجنب التكرار
