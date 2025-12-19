// Get user ID from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('id');

// Add professional styling
document.addEventListener('DOMContentLoaded', function () {
    // Add professional card styling
    const cards = document.querySelectorAll('.professional-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.boxShadow = '0 0.5rem 1rem rgba(0, 0, 0, 0.15)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.boxShadow = '';
        });
    });
});

// Token for authentication
const token = localStorage.getItem("authToken");

// Check authentication
function checkAuth() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!token || !user || user.role !== "admin") {
        window.location.href = "login.html";
    }
}

// Load user details
async function loadUserDetails() {
    if (!userId) {
        alert("لم يتم تحديد مستخدم");
        window.location.href = "users.html";
        return;
    }

    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) throw new Error("فشل في جلب بيانات المستخدم");

        const userData = await response.json();
        displayUserDetails(userData);
    } catch (error) {
        console.error("Error:", error);
        alert("حدث خطأ أثناء تحميل بيانات المستخدم");
    }
}

// Display user details
function displayUserDetails(user) {
    // Set user avatar
    const avatarUrl = user.profile_picture
        ? `/storage/${user.profile_picture}`
        : "images/tree 1.png";
    document.getElementById("user-avatar").src = avatarUrl;

    // Set summary cards (KPIs)
    document.getElementById("subscription-status").textContent = getStatusText(user.status);
    document.getElementById("user-role").textContent = user.role === 'admin' ? 'مدير' : user.role === 'tree_creator' ? 'منشئ الشجرة' : 'عضو';
    const joinDate = user.created_at
        ? new Date(user.created_at).toLocaleDateString('ar-EG')
        : "-";
    document.getElementById("join-date").textContent = joinDate;
    document.getElementById("family-members-count").textContent = user.family_trees && user.family_trees.length > 0
        ? user.family_trees[0].members_count || 0
        : 0;

    // Set user profile summary
    document.getElementById("user-full-name").textContent = user.name || "-";
    document.getElementById("user-email-display").textContent = user.email || "-";
    document.getElementById("user-phone-display").textContent = user.phone || "-";
    document.getElementById("user-tree-name").textContent = user.family_trees && user.family_trees.length > 0
        ? user.family_trees[0].tree_name || "-"
        : "-";
    document.getElementById("user-job-display").textContent = user.job || "-";

    // Display subscriptions
    displaySubscriptions(user.subscriptions || []);
}

// Get status text in Arabic
function getStatusText(status) {
    switch (status) {
        case 'active': return 'نشط';
        case 'suspended': return 'موقوف';
        case 'banned': return 'محظور';
        default: return 'غير معروف';
    }
}

// Get status badge class
function getStatusClass(status) {
    switch (status) {
        case 'active': return 'bg-success';
        case 'suspended': return 'bg-warning text-dark';
        case 'banned': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

// Display subscriptions
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

// Delete user
async function deleteUser() {
    if (!confirm("هل أنت متأكد أنك تريد حذف هذا المستخدم؟")) return;

    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: "DELETE",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) throw new Error("فشل في حذف المستخدم");

        const data = await response.json();
        alert(data.message || "تم حذف المستخدم بنجاح");

        // Redirect to users list
        window.location.href = "users.html";
    } catch (error) {
        console.error("Error:", error);
        alert("حدث خطأ أثناء حذف المستخدم");
    }
}

// Update user status
async function updateUserStatus(status) {
    const statusText = getStatusText(status);
    if (!confirm(`هل أنت متأكد من تغيير حالة المستخدم إلى "${statusText}"؟`)) return;

    try {
        const response = await fetch(`/api/admin/users/${userId}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status }),
        });

        if (!response.ok) throw new Error("فشل في تحديث الحالة");

        alert("تم تحديث الحالة بنجاح");

        // Reload user details to show updated status
        loadUserDetails();
    } catch (error) {
        console.error(error);
        alert("حدث خطأ أثناء تحديث الحالة");
    }
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
    loadUserDetails();

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

    // Action buttons
    document.getElementById("activate-user")?.addEventListener("click", () => {
        updateUserStatus("active");
    });

    document.getElementById("suspend-user")?.addEventListener("click", () => {
        updateUserStatus("suspended");
    });

    document.getElementById("ban-user")?.addEventListener("click", () => {
        updateUserStatus("banned");
    });

    document.getElementById("delete-user")?.addEventListener("click", deleteUser);

    // Logout
    document.querySelector(".nav-link.text-danger")?.addEventListener("click", async function (e) {
        e.preventDefault();

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
