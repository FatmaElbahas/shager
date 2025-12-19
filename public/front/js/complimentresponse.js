// متغيرات عامة
let users = [];
let complaints = [];
let currentPage = 1;
let totalPages = 1;
let currentFilter = "all";

function checkAuth() {
  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user || user.role !== "tree_creator") {
    alert("يجب تسجيل الدخول بحساب Tree Creator");
    window.location.href = "login.html";
    return false;
  }
  return { token, user };
}

// ملاحظة: messageId مخصص للرسائل وليس للشكاوى - لا يُستخدم في هذه الصفحة
const messageId = localStorage.getItem("selectedMessageId");
const token = localStorage.getItem("authToken");
const user = JSON.parse(localStorage.getItem("user"));
const userId = user.id;

// تحميل الشكاوى من الخادم حسب user_id
async function loadComplaints(page = 1, status = "all") {
  const auth = checkAuth();
  if (!auth) return;

  showLoadingState();

  try {
    const token = localStorage.getItem("authToken");
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user.id;

    console.log("تحميل الشكاوى للمستخدم:", userId);

    const response = await fetch(
      `/api/view-all/${userId}?page=${page}&status=${status}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    // معالجة خاصة لحالة عدم وجود شكاوى (404)
    if (response.status === 404) {
      console.log(`ℹ️ لا توجد شكاوى للمستخدم ${userId} - هذا أمر إيجابي!`);
      complaints = [];
      currentPage = 1;
      totalPages = 1;
      hideLoadingState();
      showEmptyState();
      updatePagination();
      return;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("البيانات المستلمة من API:", data);

    // معالجة البيانات المستلمة
    let rawComplaints = data.data || data.complaints || data || [];

    // إذا كانت البيانات مصفوفة مباشرة (مثل حالتك)
    if (Array.isArray(data) && !data.data && !data.complaints) {
      rawComplaints = data;
    }

    // تنظيف وتحويل البيانات
    complaints = rawComplaints.map((complaint) => ({
      ...complaint,
      // تحويل details إلى description إذا لم تكن موجودة
      description:
        complaint.description || complaint.details || "لا توجد تفاصيل",
      // إصلاح status الفارغة
      status: complaint.status || "pending",
      // التأكد من وجود user_id
      user_id: complaint.user_id || userId,
      // إضافة معلومات إضافية من البيانات
      user_name: complaint.name || "غير محدد",
      user_email: complaint.email || "غير محدد",
      user_phone: complaint.phone || "غير محدد",
      tree_name: complaint.tree_name || "غير محدد",
    }));

    currentPage = data.current_page || page;
    totalPages =
      data.last_page || Math.ceil((data.total || complaints.length) / 10);

    console.log(
      `✅ تم تحميل ${complaints.length} شكوى فعلية من API للمستخدم ${userId}`
    );
    console.log("الشكاوى المعالجة:", complaints);

    if (complaints.length === 0) {
      console.log(`ℹ️ لا توجد شكاوى للمستخدم ${userId} في قاعدة البيانات - هذا أمر إيجابي!`);
      hideLoadingState();
      showEmptyState();
      updatePagination();
      return;
    } else {
      console.log(
        `📋 تفاصيل الشكاوى:`,
        complaints.map((c) => ({
          id: c.id,
          title: c.title,
          type: c.type,
          status: c.status,
          user_name: c.user_name,
        }))
      );
    }

    // تحميل ردود الإدارة لكل شكوى
    await loadRepliesForComplaints();

    displayComplaints();
    updatePagination();
  } catch (error) {
    console.error("❌ خطأ في تحميل الشكاوى:", error);

    // إذا كان الخطأ 404، فهذا يعني عدم وجود شكاوى وليس خطأ حقيقي
    if (error.message.includes('404')) {
      console.log(`ℹ️ لا توجد شكاوى للمستخدم ${userId} - هذا أمر إيجابي!`);
      complaints = [];
      currentPage = 1;
      totalPages = 1;
      hideLoadingState();
      showEmptyState();
      updatePagination();
      return;
    }

    // عرض رسالة خطأ للمستخدم مع زر إعادة المحاولة للأخطاء الحقيقية فقط
    showErrorMessage(`
      فشل في تحميل الشكاوى من الخادم: ${error.message}
      <br><br>
      <button class="btn btn-primary btn-sm mt-2" onclick="loadComplaints()">
        <i class="bi bi-arrow-clockwise me-1"></i>
        إعادة المحاولة
      </button>
    `);

    // عرض حالة فارغة مع رسالة خطأ
    complaints = [];
    currentPage = 1;
    totalPages = 1;
    hideLoadingState();
    showErrorEmptyState();
    updatePagination();
  } finally {
    hideLoadingState();
  }
}

// تحميل ردود الإدارة للشكاوى
async function loadRepliesForComplaints() {
  const auth = checkAuth();
  if (!auth) return;

  for (let complaint of complaints) {
    try {
      const replyResponse = await fetch(
        `/api/show-replay/${complaint.id}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (replyResponse.ok) {
        const replyData = await replyResponse.json();

        // التحقق من وجود الرد في الهيكل الجديد أو القديم
        if (replyData.admin_reply || replyData.reply) {
          // الهيكل الجديد: الرد موجود مباشرة في admin_reply
          if (replyData.admin_reply) {
            complaint.admin_reply = replyData.admin_reply;
            complaint.replied_at = replyData.created_at || replyData.updated_at;
            complaint.status = "replied";
          }
          // الهيكل القديم: الرد موجود داخل reply object
          else if (replyData.reply) {
            complaint.admin_reply =
              replyData.reply.message ||
              replyData.reply.content ||
              replyData.reply.reply;
            complaint.replied_at =
              replyData.reply.created_at || replyData.reply.replied_at;
            complaint.status = "replied";
          }
        }
      } else {
        // فشل في تحميل الرد - لا حاجة لرسالة
      }
    } catch (error) {
      // خطأ في الشبكة - لا حاجة لرسالة
    }
  }

  // ملخص النتائج
  const repliedComplaints = complaints.filter((c) => c.admin_reply).length;
  console.log(
    `✅ تم الانتهاء من تحميل الردود: ${repliedComplaints}/${complaints.length} شكوى لديها ردود`
  );

  // إعادة عرض الشكاوى مع الردود المحدثة
  if (repliedComplaints > 0) {
    console.log(`🔄 إعادة عرض الشكاوى مع ${repliedComplaints} رد جديد...`);
    displayComplaints();
  }
}

// تحميل البيانات التجريبية كبديل (معطلة - يتم استخدام البيانات الفعلية من API فقط)
function loadMockComplaints(status = "all") {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user ? user.id : 1;

  console.log("تحميل البيانات التجريبية للمستخدم:", userId);

  const mockComplaints = [
    {
      id: 1,
      user_id: userId,
      title: "مشكلة في تحميل شجرة العائلة",
      type: "technical",
      description:
        "لا أستطيع تحميل شجرة العائلة الخاصة بي، تظهر رسالة خطأ عند محاولة الوصول إليها",
      status: "replied",
      priority: "high",
      created_at: "2024-10-20T10:30:00Z",
      admin_reply:
        "تم حل المشكلة، كانت هناك مشكلة في الخادم. يرجى المحاولة مرة أخرى الآن.",
      replied_at: "2024-10-20T14:15:00Z",
    },
    {
      id: 2,
      user_id: userId,
      title: "استفسار حول الاشتراك المميز",
      type: "financial",
      description:
        "أريد معرفة المزيد عن مميزات الاشتراك المميز وكيفية الترقية إليه",
      status: "pending",
      priority: "medium",
      created_at: "2024-10-21T09:15:00Z",
    },
    {
      id: 3,
      user_id: userId,
      title: "طلب حذف بيانات شخصية",
      type: "other",
      description: "أريد حذف بعض البيانات الشخصية من حسابي لأسباب خاصة",
      status: "resolved",
      priority: "low",
      created_at: "2024-10-19T16:45:00Z",
      admin_reply:
        "تم حذف البيانات المطلوبة كما طلبت. إذا كنت تحتاج لأي مساعدة إضافية، لا تتردد في التواصل معنا.",
      replied_at: "2024-10-19T18:30:00Z",
    },
  ];

  // فلترة حسب الحالة
  let filteredComplaints = mockComplaints;
  if (status !== "all") {
    filteredComplaints = mockComplaints.filter((c) => c.status === status);
  }

  complaints = filteredComplaints;
  currentPage = 1;
  totalPages = Math.ceil(filteredComplaints.length / 10);

  console.log(
    `تم تحميل ${filteredComplaints.length} شكوى تجريبية للمستخدم ${userId}`
  );

  displayComplaints();
  updatePagination();
}

// عرض معلومات المستخدم الحالي
function displayCurrentUserInfo() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  let userInfoContainer = document.getElementById("currentUserInfo");
  if (!userInfoContainer) {
    userInfoContainer = document.createElement("div");
    userInfoContainer.id = "currentUserInfo";
    userInfoContainer.className = "alert alert-info mb-3";

    const complaintsContainer = document.getElementById("complaintsContainer");
    if (complaintsContainer && complaintsContainer.parentNode) {
      complaintsContainer.parentNode.insertBefore(
        userInfoContainer,
        complaintsContainer
      );
    }
  }

  userInfoContainer.innerHTML = `
    <div class="d-flex align-items-center">
      <i class="bi bi-person-badge me-2 fs-5"></i>
      <div>
        <strong>عرض شكاوى المستخدم:</strong> ${user.name || "غير محدد"} 
        <small class="text-muted">(ID: ${user.id})</small>
        <br>
        <small class="text-muted">الدور: ${user.role || "غير محدد"} | البريد: ${
    user.email || "غير محدد"
  }</small>
      </div>
    </div>
  `;
}

// عرض الشكاوى
function displayComplaints() {
  const container = document.getElementById("complaintsContainer");

  // عرض معلومات المستخدم الحالي
  displayCurrentUserInfo();

  // عرض إحصائيات شكاوى المستخدم
  displayUserComplaintsStats();

  if (!complaints || complaints.length === 0) {
    showEmptyState();
    return;
  }

  hideEmptyState();
  container.innerHTML = complaints
    .map((complaint) => createComplaintCard(complaint))
    .join("");

  console.log(`تم عرض ${complaints.length} شكوى`);
}

// إنشاء بطاقة الشكوى
function createComplaintCard(complaint) {
  const statusClass = getStatusClass(complaint.status);
  const statusText = getStatusText(complaint.status);
  const formattedDate = formatDate(complaint.created_at);

  // تشخيص مبسط
  if (complaint.admin_reply) {
    console.log(`💬 رد متوفر للشكوى #${complaint.id}`);
  }

  const adminReply = complaint.admin_reply
    ? createAdminReply(complaint.admin_reply, complaint.replied_at)
    : "";

  return `
    <div class="complaint-card ${
      complaint.priority ? "priority-" + complaint.priority : ""
    }">
      <div class="complaint-header">
        <h5 class="complaint-title">${complaint.title || "شكوى بدون عنوان"}</h5>
        <span class="complaint-status ${statusClass}">
          <i class="bi ${getStatusIcon(complaint.status)}"></i>
          ${statusText}
        </span>
      </div>
      
      <div class="complaint-meta">
        <div class="meta-item">
          <i class="bi bi-calendar3"></i>
          <span>${formattedDate}</span>
        </div>
        <div class="meta-item">
          <i class="bi bi-tag"></i>
          <span>${getTypeText(complaint.type)}</span>
        </div>
        <div class="meta-item">
          <i class="bi bi-person"></i>
          <span>${complaint.user_name || complaint.name || "مستخدم"}</span>
        </div>
      </div>
      
      <div class="complaint-content">
        <p class="complaint-description">${
          complaint.description || complaint.details || "لا توجد تفاصيل"
        }</p>
      </div>
      
      ${adminReply}
      
      ${
        complaint.status !== "replied"
          ? `
      <div class="complaint-actions">
        <button class="action-btn btn-simple" onclick="viewComplaintDetails(${complaint.id})">
          <i class="bi bi-eye"></i>
          التفاصيل
        </button>
      </div>
      `
          : ""
      }
    </div>
  `;
}

// إنشاء رد الإدارة
function createAdminReply(reply, repliedAt) {
  const replyDate = repliedAt ? formatDate(repliedAt) : "غير محدد";

  return `
    <div class="admin-reply">
      <div class="reply-header">
        <i class="bi bi-shield-check"></i>
        <span>رد الإدارة</span>
      </div>
      <div class="reply-content">${reply}</div>
      <div class="reply-date">${replyDate}</div>
    </div>
  `;
}

// الدوال المساعدة
function getStatusClass(status) {
  const statusMap = {
    pending: "status-pending",
    replied: "status-replied",
    resolved: "status-resolved",
    closed: "status-resolved",
  };
  return statusMap[status] || "status-pending";
}

function getStatusText(status) {
  const statusMap = {
    pending: "قيد الانتظار",
    replied: "تم الرد",
    resolved: "تم الحل",
    closed: "مغلقة",
  };
  return statusMap[status] || "غير محدد";
}

function getStatusIcon(status) {
  const iconMap = {
    pending: "bi-clock-history",
    replied: "bi-reply",
    resolved: "bi-check-circle-fill",
    closed: "bi-x-circle-fill",
  };
  return iconMap[status] || "bi-question-circle";
}

function getTypeText(type) {
  const typeMap = {
    technical: "فنية",
    financial: "مالية",
    behavioral: "سلوكية",
    other: "أخرى",
  };
  return typeMap[type] || "غير محدد";
}

function formatDate(dateString) {
  if (!dateString) return "غير محدد";

  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "أمس";
  if (diffDays < 7) return `منذ ${diffDays} أيام`;

  return date.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// وظائف العرض والإخفاء
function showLoadingState() {
  document.getElementById("loadingState").style.display = "block";
  document.getElementById("complaintsContainer").style.display = "none";
  document.getElementById("emptyState").style.display = "none";
}

function hideLoadingState() {
  document.getElementById("loadingState").style.display = "none";
  document.getElementById("complaintsContainer").style.display = "block";
}

function showEmptyState() {
  const user = JSON.parse(localStorage.getItem("user"));
  const userName = user ? user.name : "المستخدم";
  const userId = user ? user.id : "غير محدد";

  // تحديث محتوى حالة الفراغ برسالة لطيفة وجميلة
  const emptyStateElement = document.getElementById("emptyState");
  if (emptyStateElement) {
    emptyStateElement.innerHTML = `
      <div class="text-center py-5">
        <div class="mb-4">
          <div class="d-inline-block p-4 rounded-circle" style="background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%); border: 3px solid #2196f3;">
            <i class="bi bi-emoji-smile display-1 text-primary"></i>
          </div>
        </div>
        
        <h3 class="text-primary mb-3">
          <i class="bi bi-check-circle-fill me-2"></i>
          رائع! لا توجد شكاوى حالياً
        </h3>
        
        <div class="alert alert-success d-inline-block mb-4" style="border-radius: 20px; border: none; background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);">
          <div class="d-flex align-items-center justify-content-center">
            <i class="bi bi-heart-fill text-success me-2 fs-5"></i>
            <span class="fw-bold">مرحباً ${userName}! كل شيء يبدو رائعاً</span>
          </div>
        </div>
        
        <p class="text-muted mb-4 fs-5">
          لا توجد شكاوى مسجلة في حسابك حالياً، وهذا أمر إيجابي!
          <br>
          <span class="text-success fw-bold">✨ تجربتك معنا تسير بسلاسة ✨</span>
        </p>
        
        <div class="row justify-content-center mb-4">
          <div class="col-md-8">
            <div class="card border-0 shadow-sm" style="background: linear-gradient(135deg, #fff8e1 0%, #f3e5f5 100%); border-radius: 20px;">
              <div class="card-body p-4">
                <h5 class="card-title text-primary mb-3">
                  <i class="bi bi-lightbulb-fill me-2"></i>
                  نصائح مفيدة
                </h5>
                <div class="row text-start">
                  <div class="col-md-6 mb-3">
                    <div class="d-flex align-items-start">
                      <i class="bi bi-chat-dots-fill text-info me-2 mt-1"></i>
                      <small class="text-muted">إذا واجهت أي مشكلة، لا تتردد في إرسال شكوى</small>
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <div class="d-flex align-items-start">
                      <i class="bi bi-headset text-warning me-2 mt-1"></i>
                      <small class="text-muted">فريق الدعم متاح 24/7 لمساعدتك</small>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="d-flex align-items-start">
                      <i class="bi bi-shield-check text-success me-2 mt-1"></i>
                      <small class="text-muted">نحن نهتم بتجربتك ونسعى لتحسينها</small>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="d-flex align-items-start">
                      <i class="bi bi-star-fill text-warning me-2 mt-1"></i>
                      <small class="text-muted">شاركنا رأيك لتطوير خدماتنا</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="d-flex justify-content-center gap-3 flex-wrap">
          <button class="btn btn-primary btn-lg px-4 py-2" onclick="switchToSendTab()" style="border-radius: 25px; background: linear-gradient(135deg, #2196f3 0%, #21cbf3 100%); border: none;">
            <i class="bi bi-plus-circle-fill me-2"></i>
            إرسال شكوى جديدة
          </button>
          <button class="btn btn-outline-success btn-lg px-4 py-2" onclick="refreshComplaints()" style="border-radius: 25px;">
            <i class="bi bi-arrow-clockwise me-2"></i>
            تحديث الصفحة
          </button>
        </div>
        
        <div class="mt-4">
          <small class="text-muted d-block">
            <i class="bi bi-info-circle me-1"></i>
            يتم فحص الشكاوى تلقائياً من قاعدة البيانات
          </small>
        </div>
      </div>
    `;
  }

  document.getElementById("emptyState").style.display = "block";
  document.getElementById("complaintsContainer").style.display = "none";
}

function hideEmptyState() {
  document.getElementById("emptyState").style.display = "none";
}

function showErrorEmptyState(errorMessage, userId) {
  const emptyStateElement = document.getElementById("emptyState");
  if (emptyStateElement) {
    emptyStateElement.innerHTML = `
      <div class="text-center py-5">
        <i class="bi bi-exclamation-triangle display-1 text-danger mb-3"></i>
        <h4 class="text-danger">خطأ في تحميل الشكاوى</h4>
        <p class="text-muted mb-4">
          فشل في تحميل شكاوى المستخدم (ID: ${userId}) من الخادم.
          <br>
          <strong>سبب الخطأ:</strong> ${errorMessage}
        </p>
        <div class="alert alert-warning d-inline-block mb-3">
          <i class="bi bi-info-circle me-2"></i>
          API المستخدم: <code>/api/view-all/${userId}</code>
        </div>
        <br>
        <button class="btn btn-primary" onclick="loadComplaints()">
          <i class="bi bi-arrow-clockwise me-2"></i>
          إعادة المحاولة
        </button>
      </div>
    `;
  }

  document.getElementById("emptyState").style.display = "block";
  document.getElementById("complaintsContainer").style.display = "none";
}

function showError(message) {
  Swal.fire({
    icon: "error",
    title: "خطأ",
    text: message,
    confirmButtonText: "حسناً",
  });
}

// وظائف التفاعل
function refreshComplaints() {
  loadComplaints(currentPage, currentFilter);
}

function switchToSendTab() {
  const sendTab = document.getElementById("send-tab");
  const sendTabPane = document.getElementById("send-complaint");

  // تفعيل التبويب
  document
    .querySelectorAll("#complaintTabs .nav-link")
    .forEach((tab) => tab.classList.remove("active"));
  sendTab.classList.add("active");

  // إظهار المحتوى
  document.querySelectorAll(".tab-pane").forEach((pane) => {
    pane.classList.remove("show", "active");
  });
  sendTabPane.classList.add("show", "active");
}

async function viewComplaintDetails(complaintId) {
  const auth = checkAuth();
  if (!auth) return;

  // إظهار مؤشر التحميل
  Swal.fire({
    title: "جاري التحميل...",
    html: "يتم تحميل تفاصيل الشكوى",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    // جلب تفاصيل الشكوى من الخادم
    const response = await fetch(
      `/api/show-replay/${complaintId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("تفاصيل الشكوى المستلمة:", data);
    const complaint = data.complaint || data;

    // جلب رد الإدارة إن وجد
    let adminReply = null;
    try {
      const replyResponse = await fetch(
        `/api/show-replay/${complaintId}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (replyResponse.ok) {
        const replyData = await replyResponse.json();
        adminReply = replyData.reply;
      }
    } catch (replyError) {
      console.log("لا يوجد رد من الإدارة أو خطأ في جلب الرد");
    }

    // عرض تفاصيل الشكوى
    Swal.fire({
      title: complaint.title || complaint.subject || "تفاصيل الشكوى",
      html: `
        <div class="text-start" style="max-height: 400px; overflow-y: auto;">
          <div class="row mb-3">
            <div class="col-6">
              <p><strong>النوع:</strong> ${getTypeText(complaint.type)}</p>
            </div>
            <div class="col-6">
              <p><strong>الحالة:</strong> ${getStatusText(complaint.status)}</p>
            </div>
          </div>
          <div class="row mb-3">
            <div class="col-6">
              <p><strong>التاريخ:</strong> ${formatDate(
                complaint.created_at
              )}</p>
            </div>
            <div class="col-6">
              <p><strong>رقم الشكوى:</strong> #${complaint.id}</p>
            </div>
          </div>
          <hr>
          <div class="mb-3">
            <p><strong>تفاصيل الشكوى:</strong></p>
            <div class="p-3 bg-light rounded">
              ${
                complaint.description ||
                complaint.details ||
                complaint.message ||
                "لا توجد تفاصيل"
              }
            </div>
          </div>
          ${
            adminReply
              ? `
            <hr>
            <div class="mb-3">
              <p><strong>رد الإدارة:</strong></p>
              <div class="p-3 rounded" style="background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%); border-right: 4px solid #2196f3;">
                ${adminReply.message || adminReply.content || adminReply.reply}
              </div>
              <small class="text-muted mt-2 d-block">تم الرد في: ${formatDate(
                adminReply.created_at || adminReply.replied_at
              )}</small>
            </div>
          `
              : `
            <div class="text-center text-muted py-3">
              <i class="bi bi-clock-history fs-1 mb-2"></i>
              <p>لم يتم الرد على هذه الشكوى بعد</p>
            </div>
          `
          }
        </div>
      `,
      width: "700px",
      confirmButtonText: "إغلاق",
      customClass: {
        htmlContainer: "text-start",
      },
    });
  } catch (error) {
    console.error("خطأ في جلب تفاصيل الشكوى:", error);

    // في حالة الفشل، استخدم البيانات المحلية
    const complaint = complaints.find((c) => c.id == complaintId);
    if (complaint) {
      Swal.fire({
        title: complaint.title,
        html: `
          <div class="text-start">
            <p><strong>النوع:</strong> ${getTypeText(complaint.type)}</p>
            <p><strong>التاريخ:</strong> ${formatDate(complaint.created_at)}</p>
            <p><strong>الحالة:</strong> ${getStatusText(complaint.status)}</p>
            <hr>
            <p><strong>التفاصيل:</strong></p>
            <p>${complaint.description || complaint.details}</p>
            ${
              complaint.admin_reply
                ? `
              <hr>
              <p><strong>رد الإدارة:</strong></p>
              <p>${complaint.admin_reply}</p>
              <small class="text-muted">تم الرد في: ${formatDate(
                complaint.replied_at
              )}</small>
            `
                : ""
            }
            <div class="alert alert-warning mt-3">
              <small>تم عرض البيانات المحفوظة محلياً بسبب مشكلة في الاتصال</small>
            </div>
          </div>
        `,
        width: "600px",
        confirmButtonText: "إغلاق",
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في تحميل تفاصيل الشكوى",
        confirmButtonText: "حسناً",
      });
    }
  }
}

async function markAsResolved(complaintId) {
  const result = await Swal.fire({
    title: "تأكيد الحل",
    text: "هل تريد تأكيد أن هذه الشكوى تم حلها؟",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "نعم، تم الحل",
    cancelButtonText: "إلغاء",
  });

  if (!result.isConfirmed) return;

  // تحديث الحالة محلياً (في التطبيق الحقيقي سيتم إرسال طلب للخادم)
  const complaintIndex = complaints.findIndex((c) => c.id === complaintId);
  if (complaintIndex !== -1) {
    complaints[complaintIndex].status = "resolved";
    displayComplaints();
    Swal.fire("تم!", 'تم تحديث حالة الشكوى إلى "تم الحل"', "success");
  }
}

// تحديث الصفحات
function updatePagination() {
  const container = document.getElementById("paginationContainer");
  if (!container) return;

  const pagination = container.querySelector(".pagination");
  if (!pagination) return;

  if (totalPages <= 1) {
    container.style.display = "none";
    return;
  }

  container.style.display = "block";

  let paginationHTML = "";

  // زر السابق
  if (currentPage > 1) {
    paginationHTML += `
      <li class="page-item">
        <a class="page-link" href="#" onclick="loadComplaints(${
          currentPage - 1
        }, '${currentFilter}')">السابق</a>
      </li>
    `;
  }

  // أرقام الصفحات
  for (let i = 1; i <= totalPages; i++) {
    if (i === currentPage) {
      paginationHTML += `<li class="page-item active"><span class="page-link">${i}</span></li>`;
    } else {
      paginationHTML += `
        <li class="page-item">
          <a class="page-link" href="#" onclick="loadComplaints(${i}, '${currentFilter}')">${i}</a>
        </li>
      `;
    }
  }

  // زر التالي
  if (currentPage < totalPages) {
    paginationHTML += `
      <li class="page-item">
        <a class="page-link" href="#" onclick="loadComplaints(${
          currentPage + 1
        }, '${currentFilter}')">التالي</a>
      </li>
    `;
  }

  pagination.innerHTML = paginationHTML;
}

// دالة اختبار API الردود فقط
async function testRepliesAPI() {
  const auth = checkAuth();
  if (!auth) return;

  console.group("🧪 اختبار API الردود");

  if (complaints.length === 0) {
    console.log("⚠️ لا توجد شكاوى محملة للاختبار");
    console.groupEnd();
    return;
  }

  for (let complaint of complaints) {
    console.log(`\n🔍 اختبار رد الشكوى #${complaint.id}...`);

    try {
      const response = await fetch(
        `/api/show-replay/${complaint.id}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      console.log(
        `📊 حالة الاستجابة: ${response.status} ${response.statusText}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`📥 البيانات المستلمة:`, data);

        if (data.reply) {
          console.log(`✅ يوجد رد للشكوى #${complaint.id}`);
          console.log(
            `💬 محتوى الرد:`,
            data.reply.message || data.reply.content || data.reply.reply
          );
        } else {
          console.log(`ℹ️ لا يوجد رد للشكوى #${complaint.id}`);
        }
      } else {
        const errorData = await response.text();
        console.log(`❌ خطأ في API:`, errorData);
      }
    } catch (error) {
      console.error(`❌ خطأ في الشبكة:`, error);
    }
  }

  console.groupEnd();
}

// دالة اختبار الاتصال بالـ APIs
async function testComplaintsAPIs() {
  const auth = checkAuth();
  if (!auth) return;

  console.log("🧪 اختبار APIs الشكاوى...");

  try {
    // اختبار جلب الشكاوى
    console.log("📋 اختبار جلب الشكاوى...");
    const complaintsResponse = await fetch(
      `/api/view/${messageId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      }
    );
    console.log("✅ حالة جلب الشكاوى:", complaintsResponse.status);

    if (complaintsResponse.ok) {
      const complaintsData = await complaintsResponse.json();
      console.log("📊 بيانات الشكاوى:", complaintsData);

      // اختبار عرض تفاصيل أول شكوى إن وجدت
      const complaints = complaintsData.data || complaintsData.complaints || [];
      if (complaints.length > 0) {
        const firstComplaintId = complaints[0].id;

        console.log(`📄 اختبار عرض تفاصيل الشكوى ${firstComplaintId}...`);
        const viewResponse = await fetch(
          `/api/view/${firstComplaintId}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );
        console.log("✅ حالة عرض التفاصيل:", viewResponse.status);

        if (viewResponse.ok) {
          const viewData = await viewResponse.json();
          console.log("📋 تفاصيل الشكوى:", viewData);
        }

        // اختبار جلب رد الإدارة
        console.log(`💬 اختبار جلب رد الإدارة للشكوى ${firstComplaintId}...`);
        const replyResponse = await fetch(
          `/api/show-replay/${firstComplaintId}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );
        console.log("✅ حالة جلب الرد:", replyResponse.status);

        if (replyResponse.ok) {
          const replyData = await replyResponse.json();
          console.log("💭 رد الإدارة:", replyData);
        }
      }
    }

    console.log("🎉 انتهى اختبار APIs الشكاوى");
  } catch (error) {
    console.error("❌ خطأ في اختبار APIs:", error);
  }
}

// إضافة زر اختبار في بيئة التطوير
if (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) {
}

checkAuth(); // تأكد من الصلاحية عند تحميل الصفحة

// تحميل الشكاوى عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  loadComplaints();
});

// أزرار التطوير (مخفية في الإنتاج)
if (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) {
  // أزرار التطوير متاحة فقط في البيئة المحلية
}

document
  .getElementById("complaintForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const token = localStorage.getItem("authToken");
    const formData = new FormData(this);

    try {
      const response = await fetch(
        "/api/tree_creator/complaints",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        // هنا يتم عرض رسالة النجاح بشكل أكثر وضوحاً
        Swal.fire({
          icon: "success",
          title: "شكراً لك",
          html: '<div style="font-size:18px">تم استلام شكواك بنجاح وسنتواصل معك قريباً</div>',
          confirmButtonText: "متابعة الشكاوى",
          showCancelButton: true,
          cancelButtonText: "إرسال أخرى",
          timer: 5000,
        }).then((result) => {
          if (result.isConfirmed) {
            // التوجه لتبويب متابعة الشكاوى
            const viewTab = document.getElementById("view-tab");
            const viewTabPane = document.getElementById("view-complaints");

            // تفعيل التبويب
            document
              .querySelectorAll("#complaintTabs .nav-link")
              .forEach((tab) => tab.classList.remove("active"));
            viewTab.classList.add("active");

            // إظهار المحتوى
            document.querySelectorAll(".tab-pane").forEach((pane) => {
              pane.classList.remove("show", "active");
            });
            viewTabPane.classList.add("show", "active");

            // تحميل الشكاوى
            loadComplaints();
          }
        });
        this.reset();
      } else {
        const errorMessage = data.errors
          ? Object.values(data.errors).flat().join("\n")
          : data.message || "تحقق من البيانات";

        Swal.fire({
          icon: "error",
          title: "فشل في الإرسال",
          text: errorMessage,
          confirmButtonText: "حسناً",
        });
      }
    } catch (error) {
      console.error("خطأ في الطلب:", error);
      Swal.fire({
        icon: "error",
        title: "حدث خطأ",
        text: "حدث خطأ أثناء إرسال الشكوى. حاول مرة أخرى.",
        confirmButtonText: "حسناً",
      });
    }
  });
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();

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

  // مستمع أحداث فلتر الحالة
  const statusFilter = document.getElementById("statusFilter");
  if (statusFilter) {
    statusFilter.addEventListener("change", (e) => {
      currentFilter = e.target.value;
      currentPage = 1;
      loadComplaints(currentPage, currentFilter);
    });
  }

  // مستمع أحداث التبويبات
  const viewTab = document.getElementById("view-tab");
  if (viewTab) {
    viewTab.addEventListener("click", () => {
      // تحميل الشكاوى عند فتح تبويب المتابعة
      setTimeout(() => {
        loadComplaints();
      }, 100);
    });
  }

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

document
  .getElementById("confirmDeleteBtn")
  .addEventListener("click", async () => {
    if (!users || !users.id) {
      alert("المستخدم غير موجود.");
      return;
    }

    try {
      const response = await fetch(
        `/api/tree_creator/delete-account/${user.id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("خطأ في حذف الحساب:", result.message || result);
        alert("حدث خطأ أثناء حذف الحساب.");
        return;
      }

      // تنظيف التخزين المحلي وتوجيه المستخدم
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      alert("تم حذف الحساب بنجاح.");
      window.location.href = "login.html";
    } catch (error) {
      console.error("خطأ غير متوقع أثناء الحذف:", error);
      alert("فشل حذف الحساب. حاول مرة أخرى.");
    }
  });

const deleteBtn = document.getElementById("confirmDeleteBtn");

deleteBtn.addEventListener("click", async function () {
  const userId = JSON.parse(localStorage.getItem("user")).id;
  const token = localStorage.getItem("authToken");

  try {
    const res = await axios.delete(
      `/api/user-profiles/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
    // مسح بيانات المستخدم والتوكن
    alert(res.data.message);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    window.location.href = "/Home.html";
  } catch (error) {
    alert(error.response?.data?.message || "حدث خطأ أثناء الحذف");
  }
});

// وظيفة حذف الحساب المحسنة
document.addEventListener("DOMContentLoaded", function () {
  const deleteBtn = document.getElementById("confirmDeleteBtn");

  if (deleteBtn) {
    deleteBtn.addEventListener("click", async function () {
      // تأكيد إضافي قبل الحذف
      const finalConfirm = confirm(
        "هذا هو التأكيد الأخير!\n\nهل أنت متأكد 100% من رغبتك في حذف حسابك نهائياً؟\n\nلن تتمكن من استرداد أي من بياناتك بعد هذه الخطوة."
      );

      if (!finalConfirm) {
        return; // إلغاء العملية إذا لم يؤكد المستخدم
      }

      // إظهار مؤشر التحميل
      const originalText = deleteBtn.innerHTML;
      deleteBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        جاري الحذف...
      `;
      deleteBtn.disabled = true;

      try {
        const userId = user?.id;

        if (!userId || !token) {
          throw new Error("بيانات المستخدم غير صحيحة");
        }

        const response = await fetch(
          `/api/user-profiles/${userId}`,
          {
            method: "DELETE",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "فشل في حذف الحساب");
        }

        // إظهار رسالة نجاح
        showSuccessMessage(
          "تم حذف الحساب بنجاح. سيتم توجيهك إلى الصفحة الرئيسية..."
        );

        // تنظيف البيانات المحفوظة
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        localStorage.removeItem("mapPreferences");

        // إغلاق المودال
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("deleteModal")
        );
        if (modal) {
          modal.hide();
        }

        // التوجيه بعد 2 ثانية
        setTimeout(() => {
          window.location.href = "Home.html";
        }, 2000);
      } catch (error) {
        console.error("خطأ في حذف الحساب:", error);
        showErrorMessage(
          error.message || "حدث خطأ أثناء حذف الحساب. حاول مرة أخرى."
        );

        // استعادة النص الأصلي للزر
        deleteBtn.innerHTML = originalText;
        deleteBtn.disabled = false;
      }
    });
  }
});

// وظائف مساعدة لإظهار الرسائل
function showSuccessMessage(message) {
  const alertDiv = document.createElement("div");
  alertDiv.className =
    "alert alert-success alert-dismissible fade show position-fixed";
  alertDiv.style.cssText = `
    top: 20px;
    right: 20px;
    z-index: 9999;
    min-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  alertDiv.innerHTML = `
    <i class="bi bi-check-circle-fill me-2"></i>
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(alertDiv);

  // إزالة تلقائية بعد 5 ثوان
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.remove();
    }
  }, 5000);
}

function showErrorMessage(message) {
  const alertDiv = document.createElement("div");
  alertDiv.className =
    "alert alert-danger alert-dismissible fade show position-fixed";
  alertDiv.style.cssText = `
    top: 20px;
    right: 20px;
    z-index: 9999;
    min-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  alertDiv.innerHTML = `
    <i class="bi bi-exclamation-triangle-fill me-2"></i>
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(alertDiv);

  // إزالة تلقائية بعد 5 ثوان
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.remove();
    }
  }, 5000);
}

// دالة عرض إحصائيات شكاوى المستخدم
function displayUserComplaintsStats() {
  if (!complaints || complaints.length === 0) return;

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user ? user.id : null;

  // فلترة الشكاوى الخاصة بالمستخدم الحالي (جميع الشكاوى المحملة هي للمستخدم الحالي)
  const userComplaints = complaints;

  const pending = userComplaints.filter((c) => c.status === "pending").length;
  const replied = userComplaints.filter((c) => c.status === "replied").length;
  const resolved = userComplaints.filter((c) => c.status === "resolved").length;

  const technical = userComplaints.filter((c) => c.type === "technical").length;
  const financial = userComplaints.filter((c) => c.type === "financial").length;
  const behavioral = userComplaints.filter(
    (c) => c.type === "behavioral"
  ).length;
  const other = userComplaints.filter((c) => c.type === "other").length;

  console.group(`📊 إحصائيات شكاوى المستخدم ${userId}`);
  console.log(`إجمالي الشكاوى: ${userComplaints.length}`);
  console.log(`قيد الانتظار: ${pending}`);
  console.log(`تم الرد عليها: ${replied}`);
  console.log(`تم حلها: ${resolved}`);
  console.log(
    `فنية: ${technical}, مالية: ${financial}, سلوكية: ${behavioral}, أخرى: ${other}`
  );
  console.groupEnd();

  // عرض في واجهة المستخدم أيضاً
  let statsContainer = document.getElementById("userComplaintsStats");
  if (!statsContainer) {
    statsContainer = document.createElement("div");
    statsContainer.id = "userComplaintsStats";
    statsContainer.className = "alert alert-secondary mb-3";

    const userInfoContainer = document.getElementById("currentUserInfo");
    if (userInfoContainer && userInfoContainer.parentNode) {
      userInfoContainer.parentNode.insertBefore(
        statsContainer,
        userInfoContainer.nextSibling
      );
    }
  }

  statsContainer.innerHTML = `
    <div class="row text-center">
      <div class="col-md-3">
        <div class="d-flex flex-column">
          <span class="fs-4 fw-bold text-primary">${userComplaints.length}</span>
          <small class="text-muted">إجمالي الشكاوى</small>
        </div>
      </div>
      <div class="col-md-3">
        <div class="d-flex flex-column">
          <span class="fs-4 fw-bold text-warning">${pending}</span>
          <small class="text-muted">قيد الانتظار</small>
        </div>
      </div>
      <div class="col-md-3">
        <div class="d-flex flex-column">
          <span class="fs-4 fw-bold text-info">${replied}</span>
          <small class="text-muted">تم الرد</small>
        </div>
      </div>
      <div class="col-md-3">
        <div class="d-flex flex-column">
          <span class="fs-4 fw-bold text-success">${resolved}</span>
          <small class="text-muted">تم الحل</small>
        </div>
      </div>
    </div>
    <hr class="my-2">
    <div class="row text-center">
      <div class="col-3">
        <small class="text-muted">فنية: <strong>${technical}</strong></small>
      </div>
      <div class="col-3">
        <small class="text-muted">مالية: <strong>${financial}</strong></small>
      </div>
      <div class="col-3">
        <small class="text-muted">سلوكية: <strong>${behavioral}</strong></small>
      </div>
      <div class="col-3">
        <small class="text-muted">أخرى: <strong>${other}</strong></small>
      </div>
    </div>
  `;
}
