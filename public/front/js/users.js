let currentPage = 1;
let totalPages = 1;
let users = [];
const token = localStorage.getItem("authToken");

// Add professional table styling
document.addEventListener('DOMContentLoaded', function () {
    // Add hover effect to table rows
    const tableRows = document.querySelectorAll('tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('mouseenter', function () {
            this.style.backgroundColor = 'rgba(0, 0, 0, 0.02)';
        });

        row.addEventListener('mouseleave', function () {
            this.style.backgroundColor = '';
        });
    });
});

// دالة مساعدة لتصحيح مسارات الصور
function getCorrectImageUrl(imagePath) {
    if (!imagePath) return null;

    // إذا كان المسار يبدأ بـ /storage/ فهو من Laravel
    if (imagePath.startsWith('/storage/')) {
        return `http://127.0.0.1:8001/${imagePath}`;
    }

    // إذا كان مسار كامل، استخدمه كما هو
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // مسار نسبي، أضف Laravel server
    return `/storage/${imagePath}`;
}

// تحقق من التوكن والصلاحية
function checkAuth() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!token || !user || user.role !== "admin") {
        window.location.href = "login.html";
    }
}

// البحث
const searchInput = document.querySelector(".search-input");
searchInput.addEventListener("input", () => {
    currentPage = 1;
    fetchUsers(searchInput.value, currentPage);
});

// جلب المستخدمين من السيرفر
async function fetchUsers(name = "", page = 1) {
    try {
        const response = await fetch(
            `/api/admin/users?name=${encodeURIComponent(
                name
            )}&page=${page}`,
            {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
            }
        );

        if (!response.ok) throw new Error("فشل في جلب البيانات");
        const data = await response.json();

        users = data.data;
        totalPages = data.last_page;
        currentPage = data.current_page;

        updatePaginationInfo(data.from, data.to, data.total);
        renderUsers(users);
    } catch (error) {
        console.error("Error:", error);
        alert("حدث خطأ أثناء تحميل البيانات");
    }
}

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
            document.getElementById("platformLogo").src = getCorrectImageUrl(settings.platform_logo);
        }
    } catch (err) {
        console.error("خطأ في تحميل الإعدادات:", err);
    }
}

// عرض المستخدمين
function renderUsers(users) {
    const tableBody = document.getElementById("users-table-body");
    tableBody.classList.remove("show");

    tableBody.innerHTML = "";

    if (!users || users.length === 0) {
        tableBody.innerHTML =
            "<tr><td colspan='8' class='text-center'>لا يوجد بيانات</td></tr>";
    } else {
        users.forEach((user) => {
            const rowClass =
                user.status === "active"
                    ? "table-success"
                    : user.status === "suspended"
                        ? "table-warning"
                        : "table-danger";

            const statusBadge = `
      <span style="
        background-color: ${user.status === "active"
                    ? "#E8F5E9"
                    : user.status === "suspended"
                        ? "#FFF8E1"
                        : "#FFEBEE"
                };
        color: ${user.status === "active"
                    ? "#2E7D32"
                    : user.status === "suspended"
                        ? "#F9A825"
                        : "#C62828"
                };
        padding: 5px 12px;
        border-radius: 20px;
        font-weight: 600;
      ">
        ${user.status === "active"
                    ? "نشط"
                    : user.status === "suspended"
                        ? "موقوف"
                        : "محظور"
                }
      </span>
    `;

            const row = document.createElement("tr");
            row.className = rowClass;

            row.innerHTML = `
      <td class="text-center">${user.created_at ? new Date(user.created_at).toLocaleDateString('ar-EG') : "-"
                }</td>
      <td>
        <div class="d-flex justify-content-center text-right g-4 user-card" data-user-id="${user.id}" style="cursor: pointer;">
          <div>
            <img src="${user.profile_picture
                    ? `/storage/${user.profile_picture}`
                    : "images/tree 1.png"
                }"
            class="rounded-circle avatar-img" width="40" height="40"
            onerror="this.onerror=null;this.src='images/tree 1.png';" data-user-id="${user.id}">
          </div>
          <div class="user-name" data-user-id="${user.id}">
            <strong>${user.name || "-"}</strong><br>
            <small class="text-muted">${user.email || "-"}</small>
          </div>
        </div>
      </td>
      <td class="text-center">${user.phone || "-"}</td>
      <td class="text-center">${user.job || "-"}</td>
      <td class="text-center">
  ${user.family_trees && user.family_trees.length > 0
                    ? user.family_trees[0].tree_name
                    : "-"
                }
</td>
      <td class="text-center">${statusBadge}</td>
      <td>
        <div class="dropdown text-center">
          <a href="#" class="text-secondary" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="fas fa-ellipsis-v fa-2x"></i>
          </a>
          <ul class="dropdown-menu dropdown-menu-end text-end shadow rounded-3">
            <li><a class="dropdown-item" href="#" onclick="confirmStatusChange(${user.id
                }, 'active')">تفعيل</a></li>
            <li><a class="dropdown-item" href="#" onclick="confirmStatusChange(${user.id
                }, 'suspended')">إيقاف مؤقت</a></li>
            <li><a class="dropdown-item" href="#" onclick="confirmStatusChange(${user.id
                }, 'banned')">حظر</a></li>
            <li><a class="dropdown-item text-danger" href="#" onclick="deleteUser(${user.id
                })">حذف</a></li>
          </ul>
        </div>
      </td>`;
            tableBody.appendChild(row);
        });
    }

    console.log(users);

    tableBody.classList.add("show");

    // Add click event listeners to user cards
    // Use a slight delay to ensure DOM is fully updated
    setTimeout(() => {
        document.querySelectorAll('.user-card, .avatar-img, .user-name').forEach(element => {
            element.addEventListener('click', function (e) {
                e.stopPropagation();
                const userId = this.getAttribute('data-user-id');
                if (userId) {
                    // Show user details section with sliding animation
                    showUserDetails(userId);
                }
            });
        });
    }, 50);
}

// Function to show user details with sliding animation
async function showUserDetails(userId) {
    const userDetailsSection = document.getElementById('user-details-section');
    const closeButton = document.getElementById('close-details');

    // Show the section
    userDetailsSection.style.display = 'block';

    // Add sliding animation class
    setTimeout(() => {
        userDetailsSection.classList.add('slide-down');
    }, 10);

    // Fetch user details
    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
        });

        if (!response.ok) throw new Error("فشل في جلب بيانات المستخدم");

        const userData = await response.json();
        displayUserDetails(userData);
    } catch (error) {
        console.error("Error:", error);
        alert("حدث خطأ أثناء تحميل بيانات المستخدم");
    }

    // Add close button event listener
    closeButton.onclick = function () {
        userDetailsSection.classList.remove('slide-down');
        setTimeout(() => {
            userDetailsSection.style.display = 'none';
        }, 300); // Match the animation duration
    };
}

// Display user details (reusing logic from user-details.js)
function displayUserDetails(user) {
    // Set user avatar
    const avatarUrl = user.profile_picture
        ? `/storage/${user.profile_picture}`
        : "images/tree 1.png";
    document.getElementById("user-avatar").src = avatarUrl;

    // Set summary cards (KPIs)
    document.getElementById("subscription-status").textContent = getStatusText(user.status);
    document.getElementById("user-role").textContent = user.role === 'admin' ? 'مدير' : user.role === 'tree_creator' ? 'منشئ الشجرة' : 'عضو';

    // Set family members count
    let familyMembersCount = '-';
    if (user.family_trees && user.family_trees.length > 0) {
        // Get actual family members count from the first family tree
        familyMembersCount = user.family_trees[0].family_data_members ?
            user.family_trees[0].family_data_members.length : '-';
    }
    document.getElementById("family-members-count").textContent = familyMembersCount;

    const joinDate = user.created_at
        ? new Date(user.created_at).toLocaleDateString('ar-EG')
        : "-";
    document.getElementById("join-date").textContent = joinDate;

    // Set user profile summary
    document.getElementById("user-full-name").textContent = user.name || "-";
    document.getElementById("user-email-display").textContent = user.email || "-";
    document.getElementById("user-phone-display").textContent = user.phone || "-";
    document.getElementById("user-tree-name").textContent = user.family_trees && user.family_trees.length > 0
        ? user.family_trees[0].tree_name || "-"
        : "-";

    // Display subscriptions
    displaySubscriptions(user.subscriptions || []);
}

// Get status text in Arabic (reusing logic from user-details.js)
function getStatusText(status) {
    switch (status) {
        case 'active': return 'نشط';
        case 'suspended': return 'موقوف';
        case 'banned': return 'محظور';
        default: return 'غير معروف';
    }
}

// Display subscriptions (reusing logic from user-details.js)
function displaySubscriptions(subscriptions) {
    const tableBody = document.getElementById("subscriptions-table");

    if (!subscriptions || subscriptions.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted py-4">
                    لا توجد اشتراكات لهذا المستخدم
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = '';

    subscriptions.forEach(sub => {
        const statusText = sub.status === 'active' ? 'فعال' : sub.status === 'suspended' ? 'متوقف' : 'منتهي';
        const statusClass = sub.status === 'active' ? 'bg-success' : sub.status === 'suspended' ? 'bg-warning' : 'bg-danger';
        const planText = sub.plan_type === 'basic' ? 'أساسية' : sub.plan_type === 'advanced' ? 'متقدمة' : 'مخصصة';
        const paymentMethod = sub.payment_method === 'cash' ? 'كاش' : 'محفظة';

        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="text-center">
                <div><strong>${sub.user_name || "-"}</strong></div>
                <div class="text-muted small">${sub.user_email || "-"}</div>
            </td>
            <td class="text-center">${sub.tree_name || "-"}</td>
            <td class="text-center">${sub.start_date ? new Date(sub.start_date).toLocaleDateString('ar-EG') : "-"}</td>
            <td class="text-center">${sub.end_date ? new Date(sub.end_date).toLocaleDateString('ar-EG') : "-"}</td>
            <td class="text-center">${planText}</td>
            <td class="text-center"><span class="badge ${statusClass}">${statusText}</span></td>
            <td class="text-center">${paymentMethod}</td>
            <td class="text-center">
                <div class="dropdown">
                    <button class="btn btn-sm btn-outline-secondary rounded-pill dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        إجراءات
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#"><i class="bi bi-eye me-1"></i> عرض</a></li>
                        <li><a class="dropdown-item" href="#"><i class="bi bi-pencil me-1"></i> تعديل</a></li>
                        <li><a class="dropdown-item" href="#"><i class="bi bi-pause me-1"></i> إيقاف</a></li>
                        <li><a class="dropdown-item text-danger" href="#"><i class="bi bi-trash me-1"></i> حذف</a></li>
                    </ul>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// حذف المستخدم
async function deleteUser(userId) {
    if (!confirm("هل أنت متأكد أنك تريد حذف هذا المستخدم؟")) return;

    try {
        const response = await fetch(
            `/api/admin/users/${userId}`,
            {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
            }
        );

        if (!response.ok) throw new Error("فشل في حذف المستخدم");

        const data = await response.json();
        alert(data.message || "تم حذف المستخدم بنجاح");

        fetchUsers(searchInput.value, currentPage);
    } catch (error) {
        console.error("Error:", error);
        alert("حدث خطأ أثناء حذف المستخدم");
    }
}

// تأكيد تغيير الحالة
function confirmStatusChange(userId, status) {
    const confirmChange = confirm(
        `هل أنت متأكد من تغيير حالة المستخدم إلى "${status}"؟`
    );
    if (confirmChange) {
        updateStatus(userId, status);
    }
}

// تحديث الحالة
async function updateStatus(userId, status) {
    try {
        const response = await fetch(
            `/api/admin/users/${userId}/status`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
                body: JSON.stringify({ status }),
            }
        );

        if (!response.ok) throw new Error("فشل في تحديث الحالة");
        alert("تم تحديث الحالة بنجاح");
        fetchUsers(searchInput.value, currentPage);
    } catch (error) {
        console.error(error);
        alert("حدث خطأ أثناء تحديث الحالة");
    }
}

// تحديث معلومات الصفحات
function updatePaginationInfo(from, to, total) {
    document.getElementById("current-page").textContent = currentPage;
    document.getElementById("total-pages").textContent = totalPages;
    document.getElementById(
        "items-info"
    ).textContent = `عرض ${from}-${to} من ${total} مستخدم`;
}

// التنقل بين الصفحات
function nextPage() {
    if (currentPage < totalPages) {
        fetchUsers(searchInput.value, currentPage + 1);
    }
}

function prevPage() {
    if (currentPage > 1) {
        fetchUsers(searchInput.value, currentPage - 1);
    }
}

// ربط الأزرار
document.getElementById("next-page").addEventListener("click", nextPage);
document.getElementById("prev-page").addEventListener("click", prevPage);

// تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
    fetchUsers();
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
