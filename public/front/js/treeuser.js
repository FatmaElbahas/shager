const token = localStorage.getItem("authToken");
const user = JSON.parse(localStorage.getItem("user"));
let treeId = null; // لتخزين id الشجرة

// ===============================
// دوال الرسائل المحسنة
// ===============================

function showCustomAlert(message, type = "info", title = "", duration = 4000) {
    // إزالة أي رسائل موجودة مسبقاً
    const existingAlerts = document.querySelectorAll(".custom-alert");
    existingAlerts.forEach((alert) => {
        alert.classList.add("hiding");
        setTimeout(() => alert.remove(), 300);
    });

    // تحديد الأيقونة والعنوان حسب النوع
    let icon, defaultTitle;
    switch (type) {
        case "success":
            icon = "✅";
            defaultTitle = "نجح العمل!";
            break;
        case "error":
            icon = "❌";
            defaultTitle = "حدث خطأ!";
            break;
        case "warning":
            icon = "⚠️";
            defaultTitle = "تنبيه!";
            break;
        case "info":
        default:
            icon = "ℹ️";
            defaultTitle = "معلومة";
            break;
    }

    // إنشاء عنصر الرسالة
    const alertElement = document.createElement("div");
    alertElement.className = `custom-alert ${type}`;

    alertElement.innerHTML = `
    <div class="alert-header">
      <span class="alert-icon">${icon}</span>
      <h4 class="alert-title">${title || defaultTitle}</h4>
      <button class="alert-close" onclick="this.closest('.custom-alert').classList.add('hiding'); setTimeout(() => this.closest('.custom-alert').remove(), 300);">×</button>
    </div>
    <p class="alert-message">${message}</p>
    <div class="alert-progress"></div>
  `;

    // إضافة الرسالة للصفحة
    document.body.appendChild(alertElement);

    // إزالة الرسالة تلقائياً بعد المدة المحددة
    setTimeout(() => {
        if (alertElement && alertElement.parentNode) {
            alertElement.classList.add("hiding");
            setTimeout(() => {
                if (alertElement && alertElement.parentNode) {
                    alertElement.remove();
                }
            }, 300);
        }
    }, duration);

    return alertElement;
}

// دوال مخصصة لكل نوع رسالة
function showSuccessMessage(message, title = "تم بنجاح! 🎉", duration = 4000) {
    return showCustomAlert(message, "success", title, duration);
}

function showErrorMessage(message, title = "حدث خطأ! ⚠️", duration = 5000) {
    return showCustomAlert(message, "error", title, duration);
}

function showWarningMessage(message, title = "تنبيه! ⚠️", duration = 4000) {
    return showCustomAlert(message, "warning", title, duration);
}

function showInfoMessage(message, title = "معلومة ℹ️", duration = 4000) {
    return showCustomAlert(message, "info", title, duration);
}

// التحقق من الصلاحية
function checkAuth() {
    if (!token || !user || user.role !== "tree_creator") {
        window.location.href = "login.html";
    } else {
        // عرض رسالة ترحيب
        setTimeout(() => {
            showInfoMessage(
                `مرحباً ${user.name || "بك"}! يمكنك الآن إدارة شجرة عائلتك بسهولة.`,
                "أهلاً وسهلاً! 👋"
            );
        }, 1000);
    }
}

// متغير لمنع تحميل بيانات الشجرة المتكرر
let isLoadingTreeData = false;

// جلب بيانات الشجرة مرة واحدة وتحديث الصور والنصوص
function loadTreeData() {
    // منع التحميل المتكرر
    if (isLoadingTreeData) {
        //console.log("⏳ تحميل بيانات الشجرة قيد التنفيذ بالفعل...");
        return;
    }

    isLoadingTreeData = true;
    //console.log("🔄 تحميل بيانات الشجرة...");

    fetch("/api/tree_creator/family-tree", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    })
        .then(async (res) => {
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `خطأ في الخادم: ${res.status}`);
            }
            return res.json();
        })
        .then((data) => {
            //console.log("📌 API Response:", data); // مهم للتأكد من البيانات

            if (!data || !data.data || data.data.length === 0) {
                console.warn("لا توجد شجرة لعرضها");
                showInfoMessage(
                    "لم يتم العثور على شجرة عائلة. يمكنك إنشاء شجرة جديدة من الإعدادات.",
                    "لا توجد شجرة عائلة 🌳"
                );
                return;
            }

            const tree = data.data[0];
            ////console.log(tree)
            treeId = tree.id;

            // تعيين الصور مع قيم افتراضية إذا لم تكن موجودة
            const coverImg = document.getElementById("cover-image");
            const logoImg = document.getElementById("family-logo");
            const familyNameEl = document.getElementById("family-name");

            if (coverImg) {
                coverImg.src = tree.cover_image
                    ? `/storage/${tree.cover_image}`
                    : "/storage/default_images/default_cover.jpg";
            }

            if (logoImg) {
                logoImg.src = tree.logo_image
                    ? `/storage/${tree.logo_image}`
                    : "/storage/default_images/default_logo.jpg";
            }

            if (familyNameEl) {
                familyNameEl.textContent = tree.tree_name || "اسم العائلة";
            }

            ////console.log("✅ تم تحميل بيانات الشجرة بنجاح");
        })
        .catch((err) => {
            //console.error("❌ خطأ في جلب بيانات الشجرة:", err);
            showErrorMessage(
                `فشل في تحميل بيانات الشجرة: ${err.message}`,
                "خطأ في تحميل الشجرة! 🌳"
            );
        })
        .finally(() => {
            // السماح بالتحميل مرة أخرى بعد ثانيتين
            setTimeout(() => {
                isLoadingTreeData = false;
            }, 2000);
        });
}

// دالة رفع الصور (غلاف أو شعار)
function uploadImages(files) {
    if (!treeId) {
        showErrorMessage(
            "لم يتم تحميل بيانات الشجرة بعد. يرجى إعادة تحميل الصفحة والمحاولة مرة أخرى.",
            "خطأ في التحميل! 🔄"
        );
        return;
    }

    const formData = new FormData();

    if (files.cover_image) {
        formData.append("cover_image", files.cover_image);
    }
    if (files.logo_image) {
        formData.append("logo_image", files.logo_image);
    }

    fetch(`/api/tree_creator/family-tree/${treeId}`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    })
        .then(async (res) => {
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "فشل في رفع الصور");
            }
            return res.json();
        })
        .then((data) => {
            if (!data.data) {
                throw new Error("لا توجد بيانات في الرد");
            }

            const timestamp = new Date().getTime();
            const baseUrl = "/storage/";

            if (files.cover_image && data.data.cover_image) {
                const newCoverUrl = `${baseUrl}${data.data.cover_image}?t=${timestamp}`;
                const coverImage = document.getElementById("cover-image");
                coverImage.src = ""; // إعادة تعيين src
                setTimeout(() => (coverImage.src = newCoverUrl), 50);
                ////console.log("Cover image updated to:", newCoverUrl);
            }

            if (files.logo_image && data.data.logo_image) {
                const newLogoUrl = `${baseUrl}${data.data.logo_image}?t=${timestamp}`;
                const familyLogo = document.getElementById("family-logo");
                familyLogo.src = "";
                setTimeout(() => (familyLogo.src = newLogoUrl), 50);
                ////console.log("Logo image updated to:", newLogoUrl);
            }

            showSuccessMessage(
                "تم تحديث صور العائلة بنجاح! يمكنك الآن رؤية التغييرات.",
                "تحديث الصور 📸"
            );
        })
        .catch((err) => {
            //console.error("Upload error:", err);
            showErrorMessage(
                `فشل في تحديث الصور: ${err.message}. يرجى المحاولة مرة أخرى.`,
                "خطأ في رفع الصور! 📷"
            );
        });
}

//
// Table
//
const searchInput = document.querySelector(".search-input");
const tableBody = document.getElementById("transactionsTableBody");

// عند جلب البيانات أول مرة
fetch("/api/tree_creator/family-members-data", {
    method: "GET",
    headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
    },
})
    .then((res) => res.json())
    .then((data) => {
        allMembers = data.family_data_members_tree || [];
        originalMembers = [...allMembers]; // حفظ نسخة من البيانات الأصلية
        renderTablePage(currentPage);
    })
    .catch((err) => console.error(err));

// تعديل دالة البحث
searchInput.addEventListener("input", () => {
    const searchValue = searchInput.value.trim().toLowerCase();

    if (searchValue === "") {
        // إذا كان حقل البحث فارغاً، نعيد البيانات الأصلية
        allMembers = [...originalMembers];
        renderTablePage(1); // نعود للصفحة الأولى

        return;
    }

    // تصفية البيانات محلياً بدلاً من طلب جديد من الخادم
    allMembers = originalMembers.filter(
        (member) =>
            (member.name && member.name.toLowerCase().includes(searchValue)) ||
            (member.relation &&
                member.relation.toLowerCase().includes(searchValue)) ||
            (member.phone_number && member.phone_number.includes(searchValue))
    );

    renderTablePage(1); // نعرض النتائج من الصفحة الأولى
});

const profileInput = document.getElementById("profile_picture");
const previewImage = document.getElementById("previewImage");

profileInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();

        reader.addEventListener("load", function () {
            previewImage.src = reader.result;
        });

        reader.readAsDataURL(file);
    } else {
        // إذا تم مسح الملف، نرجع الصورة الافتراضية
        previewImage.src = "images/image (25).png";
    }
});

// عدد العناصر في كل الصفحة
const ITEMS_PER_PAGE = 10;
let currentPage = 1;
let totalPages = 1;
let allMembers = []; // لتخزين كل الأعضاء
let isRenderingTable = false; // لمنع تحديث الجدول المتكرر

function renderTablePage(page = 1) {
    // منع التحديث المتكرر
    if (isRenderingTable) {
        ////console.log("⏳ تحديث الجدول قيد التنفيذ بالفعل...");
        return;
    }

    isRenderingTable = true;
    tableBody.innerHTML = "";

    totalPages = Math.ceil(allMembers.length / ITEMS_PER_PAGE);
    document.getElementById("total-pages").textContent = totalPages || 1;
    document.getElementById("current-page").textContent = page;

    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const membersPage = allMembers.slice(start, end);

    membersPage.forEach((member, index) => {
        const tr = document.createElement("tr");
        tr.classList.add("text-center");

        tr.innerHTML = `
      <td>${start + index + 1}</td>
      <td>
        <div class="d-flex align-items-center justify-content-center text-end gap-3">
          <div><img src="${member.profile_picture
                ? `/storage/${member.profile_picture}`
                : "images/tree 1.png"
            }" alt="" class="img-member rounded-pill"></div>
          <div>
            <strong>${member.name ?? "غير معرف"}</strong>
            <p class="text-muted text-end">${member.user?.email ?? "غير معرف"
            }</p>
          </div>
        </div>
      </td>
      <td class="text-center">${getRelationInArabic(member.relation)}</td>
      <td>${new Date(member.created_at).toLocaleDateString()}</td>
      <td class="text-center">
        <div class="dropdown">
          <button class="btn" type="button" id="dropdownMenuButton${member.id
            }" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="fas fa-ellipsis-v"></i>
          </button>
          <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton${member.id
            }">
            <li><a class="dropdown-item edit-profile text-end" href="#" data-id="${member.id
            }">تعديل البيانات</a></li>
            <li><a class="dropdown-item delete-member text-end" href="" data-id="${member.id
            }">حذف العضو</a></li>
          </ul>
        </div>
      </td>
    `;

        tableBody.appendChild(tr);
    });

    // تحديث info
    const itemsInfo = document.getElementById("items-info");
    const totalItems = allMembers.length;
    const fromItem = membersPage.length ? start + 1 : 0;
    const toItem = start + membersPage.length;
    itemsInfo.textContent = `عرض ${fromItem}-${toItem} من ${totalItems} فرد`;

    // السماح بالتحديث مرة أخرى
    setTimeout(() => {
        isRenderingTable = false;
    }, 100);
}

// جلب البيانات وتخزينها
fetch("/api/tree_creator/family-members-data", {
    method: "GET",
    headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
    },
})
    .then((res) => res.json())
    .then((data) => {
        allMembers = data.family_data_members_tree || [];
        renderTablePage(currentPage);
    })
    .catch((err) => console.error(err));

// أزرار الانتقال
document.getElementById("prev-page").addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        renderTablePage(currentPage);
    }
});

document.getElementById("next-page").addEventListener("click", () => {
    if (currentPage < totalPages) {
        currentPage++;
        renderTablePage(currentPage);
    }
});

document.addEventListener("click", function (e) {
    ////console.log("🖱️ تم النقر على:", e.target);
    ////console.log("🏷️ الكلاسات:", e.target.classList);
    ////console.log("📊 البيانات:", e.target.dataset);

    // تعديل العضو - التحقق من النقر على الزر أو الأيقونة
    let editButton = null;
    let editMemberId = null;

    if (e.target.classList.contains("edit-profile")) {
        editButton = e.target;
        editMemberId = e.target.dataset.id;
    } else if (e.target.closest && e.target.closest(".edit-profile")) {
        editButton = e.target.closest(".edit-profile");
        editMemberId = editButton.dataset.id;
    }

    if (editButton && editMemberId) {
        e.preventDefault();

        fetch(
            `/api/tree_creator/family-members-data/${editMemberId}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            }
        )
            .then((res) => res.json())
            .then((data) => {
                if (data.message) {
                    showInfoMessage(data.message, "معلومات العضو 👤");
                } else {
                    ////console.log("بيانات العضو:", data);
                    // هنا ممكن تعرضي البيانات في Modal أو Form
                }
            })
            .catch((err) => console.error(err));
    }

    // حذف العضو - التحقق من النقر على الزر أو الأيقونة
    let deleteButton = null;
    let memberId = null;

    if (e.target.classList.contains("delete-member")) {
        deleteButton = e.target;
        memberId = e.target.dataset.id;
    } else if (e.target.closest && e.target.closest(".delete-member")) {
        deleteButton = e.target.closest(".delete-member");
        memberId = deleteButton.dataset.id;
    }

    if (deleteButton && memberId) {
        e.preventDefault();

        ////console.log("🗑️ محاولة حذف العضو:", memberId);

        // منع النقر المتكرر
        if (deleteButton.disabled) {
            //console.log("⏳ الزر معطل بالفعل");
            return;
        }

        // العثور على اسم العضو للتأكيد
        const memberRow = deleteButton.closest("tr");
        let memberName = "العضو";

        if (memberRow) {
            // محاولة استخراج الاسم من عدة أماكن محتملة
            const strongElement = memberRow.querySelector("td:nth-child(2) strong");
            const divElement = memberRow.querySelector(
                "td:nth-child(2) div div strong"
            );

            if (strongElement) {
                memberName = strongElement.textContent?.trim() || "العضو";
            } else if (divElement) {
                memberName = divElement.textContent?.trim() || "العضو";
            }
        }

        //console.log("👤 اسم العضو المراد حذفه:", memberName);

        // استخدام نظام التنبيهات الجديد بدلاً من confirm
        const confirmAlert = showCustomAlert(
            `هل أنت متأكد من حذف "${memberName}" من شجرة العائلة؟ هذا الإجراء لا يمكن التراجع عنه.`,
            "warning",
            "تأكيد الحذف ⚠️"
        );

        // التحقق من وجود نافذة التأكيد
        if (!confirmAlert) {
            console.error("❌ فشل في إنشاء نافذة التأكيد");
            showErrorMessage("فشل في عرض نافذة التأكيد", "خطأ في النظام! ⚠️");
            return;
        }

        // إضافة أزرار التأكيد والإلغاء مع IDs فريدة
        const uniqueId = Date.now() + Math.random();
        const confirmBtnId = `confirmDelete_${uniqueId}`;
        const cancelBtnId = `cancelDelete_${uniqueId}`;

        const alertMessage = confirmAlert.querySelector(".alert-message");
        if (!alertMessage) {
            console.error("❌ لم يتم العثور على عنصر الرسالة");
            return;
        }

        alertMessage.innerHTML += `
      <div class="alert-buttons mt-3">
        <button class="btn btn-danger btn-sm me-2" id="${confirmBtnId}">
          <i class="fas fa-trash"></i> نعم، احذف
        </button>
        <button class="btn btn-secondary btn-sm" id="${cancelBtnId}">
          <i class="fas fa-times"></i> إلغاء
        </button>
      </div>
    `;

        // معالجة النقر على الأزرار
        const confirmBtn = document.getElementById(confirmBtnId);
        const cancelBtn = document.getElementById(cancelBtnId);

        if (!confirmBtn || !cancelBtn) {
            console.error("❌ فشل في العثور على أزرار التأكيد");
            return;
        }

        confirmBtn.onclick = function () {
            //console.log("✅ تأكيد الحذف - بدء العملية");

            // إزالة نافذة التأكيد
            confirmAlert.remove();

            // تعطيل الزر ومنع النقر المتكرر
            deleteButton.disabled = true;
            deleteButton.innerHTML =
                '<i class="fas fa-spinner fa-spin"></i> جاري الحذف...';
            deleteButton.classList.add("disabled");

            //console.log("🔄 إرسال طلب الحذف للخادم...");

            // إرسال طلب الحذف
            fetch(
                `/api/tree_creator/family-members-data/${memberId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            )
                .then(async (res) => {
                    //console.log("📡 استجابة الخادم:", res.status);

                    if (!res.ok) {
                        const errorData = await res.json().catch(() => ({}));
                        console.error("❌ خطأ من الخادم:", errorData);
                        throw new Error(
                            errorData.message || `خطأ في الخادم: ${res.status}`
                        );
                    }
                    return res.json();
                })
                .then((data) => {
                    //console.log("✅ تم حذف العضو بنجاح:", data);

                    showSuccessMessage(
                        `تم حذف "${memberName}" من شجرة العائلة بنجاح.`,
                        "تم الحذف بنجاح! 🗑️"
                    );

                    // إزالة الصف من الجدول فوراً لتحسين تجربة المستخدم
                    const memberRow = deleteButton.closest("tr");
                    if (memberRow) {
                        // إضافة تأثير بصري للحذف
                        memberRow.style.transition = "all 0.5s ease";
                        memberRow.style.opacity = "0";
                        memberRow.style.transform = "translateX(-100%)";
                        memberRow.style.backgroundColor = "#ffebee";

                        setTimeout(() => {
                            memberRow.remove();
                            // تحديث عداد الصفوف
                            updatePaginationInfo();

                            // إعادة ترقيم الصفوف المتبقية
                            const remainingRows = document.querySelectorAll(
                                "#membersTable tbody tr"
                            );
                            remainingRows.forEach((row, index) => {
                                const firstCell = row.querySelector("td:first-child");
                                if (firstCell) {
                                    const start = (currentPage - 1) * ITEMS_PER_PAGE;
                                    firstCell.textContent = start + index + 1;
                                }
                            });
                        }, 500);
                    }

                    // إعادة تحميل البيانات في الخلفية (بدون إعادة رسم فوري)
                    setTimeout(() => {
                        reloadTableAndTree();
                    }, 500);
                })
                .catch((err) => {
                    console.error("❌ خطأ في حذف العضو:", err);
                    console.error("❌ تفاصيل الخطأ:", err.message);

                    showErrorMessage(
                        `فشل في حذف العضو: ${err.message}`,
                        "خطأ في الحذف! ❌"
                    );

                    // إعادة تفعيل الزر في حالة الخطأ
                    //console.log("🔄 إعادة تفعيل الزر...");
                    deleteButton.disabled = false;
                    deleteButton.innerHTML = "حذف العضو";
                    deleteButton.classList.remove("disabled");
                });
        };

        cancelBtn.onclick = function () {
            //console.log("❌ تم إلغاء عملية الحذف");
            confirmAlert.remove();
        };
    }
});

// //////////
// Form
// /////////////

let originalData = {}; // لتخزين البيانات الأصلية عند فتح المودال

document.addEventListener("click", function (e) {
    if (e.target.classList.contains("edit-profile")) {
        e.preventDefault();
        const memberId = e.target.dataset.id;

        fetch(
            `/api/tree_creator/family-members-data/${memberId}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            }
        )
            .then((res) => res.json())
            .then((member) => {
                originalData = { ...member }; // حفظ النسخة الأصلية

                const form = document.getElementById("userForm");
                form.dataset.editMode = "true";
                form.dataset.memberId = memberId;

                // تعبئة الحقول
                document.getElementById("name").value = member.name || "";
                document.getElementById("relation").value = member.relation || "";
                document.getElementById("job").value = member.job || "";
                document.getElementById("status").value = member.status || "alive";
                document.getElementById("birth_date").value = member.birth_date || "";
                document.getElementById("phone_number").value =
                    member.phone_number || "";

                if (member.marital_status) {
                    const maritalRadio = document.querySelector(
                        `input[name="marital_status"][value="${member.marital_status}"]`
                    );
                    if (maritalRadio) maritalRadio.checked = true;
                }

                if (member.profile_picture) {
                    document.getElementById(
                        "previewImage"
                    ).src = `/storage/${member.profile_picture}`;
                }

                const modal = new bootstrap.Modal(
                    document.getElementById("addUserModal")
                );
                modal.show();
            })
            .catch((err) => console.error(err));
    }
});

document.getElementById("userForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const form = this;
    const isEditMode = form.dataset.editMode === "true";
    const memberId = form.dataset.memberId;

    const formData = new FormData();

    const fields = [
        "name",
        "relation",
        "job",
        "status",
        "birth_date",
        "phone_number",
        "email",
        "password",
        "marital_status",
    ];

    fields.forEach((f) => {
        const el = document.getElementById(f);
        if (el) formData.append(f, el.value || "");
    });

    const fatherId = document.getElementById("father_id")?.value;
    if (fatherId && fatherId !== "") formData.append("father_id", fatherId);

    const motherId = document.getElementById("mother_id")?.value;
    if (motherId && motherId !== "") formData.append("mother_id", motherId);

    // الحالة الاجتماعية
    const marital =
        document.querySelector('input[name="marital_status"]:checked')?.value || "";
    formData.append("marital_status", marital);

    // الصورة
    const profileFile = document.getElementById("profile_picture").files[0];
    if (profileFile) formData.append("profile_picture", profileFile);

    let url = "/api/tree_creator/family-members-data";
    let method = "POST";

    if (isEditMode) {
        url += `/${memberId}`;
        formData.append("_method", "PUT");
    }

    // إظهار الـ spinner وتعطيل الزر
    const submitBtn = document.getElementById("submitBtn");
    const btnText = submitBtn.querySelector(".btn-text");
    const spinner = submitBtn.querySelector(".spinner-border");
    const loadingText = submitBtn.querySelector(".loading-text");

    // منع الإرسال المتكرر
    if (submitBtn.disabled) {
        return;
    }

    submitBtn.disabled = true;
    submitBtn.style.pointerEvents = "none";
    btnText.classList.add("d-none");
    spinner.classList.remove("d-none");
    loadingText.classList.remove("d-none");

    fetch(url, {
        method: method,
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
        body: formData,
    })
        .then(async (res) => {
            const data = await res.json();
            if (res.ok) {
                // إغلاق المودال فوراً
                const modal = bootstrap.Modal.getInstance(
                    document.getElementById("addUserModal")
                );
                modal.hide();

                // إعادة تعيين الفورم
                form.reset();
                form.removeAttribute("data-edit-mode");
                form.removeAttribute("data-member-id");
                document.getElementById("previewImage").src = "images/image (25).png";

                // إعادة تحميل البيانات في الجدول والشجرة
                reloadTableAndTree();

                // عرض رسالة النجاح
                const isEdit = form.dataset.editMode === "true";
                const successTitle = isEdit
                    ? "تم التعديل بنجاح! ✏️"
                    : "تم إضافة العضو بنجاح! 👥";
                const successMessage = isEdit
                    ? "تم تحديث بيانات العضو وإعادة تحميل شجرة العائلة."
                    : "تم إضافة العضو الجديد إلى شجرة العائلة بنجاح!";

                showSuccessMessage(successMessage, successTitle);
            } else {
                showErrorMessage(
                    data.message || "فشل في حفظ البيانات. يرجى المحاولة مرة أخرى.",
                    "خطأ في الحفظ! 💾"
                );

                // إعادة تفعيل الزر في حالة الخطأ
                resetSubmitButton();
            }
        })
        .catch((err) => {
            showErrorMessage(
                `حدث خطأ في الاتصال: ${err.message}`,
                "خطأ في الشبكة! 🌐"
            );
            console.error(err);

            // إعادة تفعيل الزر في حالة الخطأ
            resetSubmitButton();
        });

    // دالة إعادة تفعيل زر الإرسال
    function resetSubmitButton() {
        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.style.pointerEvents = "auto";
            btnText.classList.remove("d-none");
            spinner.classList.add("d-none");
            loadingText.classList.add("d-none");
        }, 1000); // تأخير قصير لمنع النقر السريع المتكرر
    }
});

// عند فتح المودال للتعديل، نغير العنوان ونضيف زر الإلغاء
document
    .getElementById("addUserModal")
    .addEventListener("show.bs.modal", function (e) {
        const modalTitle = this.querySelector(".modal-title");
        const isEditMode =
            document.getElementById("userForm").dataset.editMode === "true";

        if (isEditMode) {
            modalTitle.textContent = "تعديل بيانات الفرد";
        } else {
            modalTitle.textContent = "إضافة فرد جديد";
            const cancelBtn = this.querySelector(".btn-cancel");
            if (cancelBtn) cancelBtn.remove();
        }
    });

document
    .getElementById("relation")
    .addEventListener("change", async function () {
        let relation = this.value;
        let fatherBox = document.getElementById("fatherBox");
        let motherBox = document.getElementById("motherBox");
        let fatherSelect = document.getElementById("father_id");
        let motherSelect = document.getElementById("mother_id");

        if (relation === "son" || relation === "daughter") {
            fatherBox.style.display = "block";
            motherBox.style.display = "block";

            try {
                const res = await fetch(
                    "/api/tree_creator/family-parents",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }
                );
                const data = await res.json();

                // إعادة تعيين القوائم
                fatherSelect.innerHTML = "<option selected disabled>اختر الأب</option>";
                motherSelect.innerHTML = "<option selected disabled>اختر الأم</option>";

                data.parents.forEach((parent) => {
                    if (parent.relation === "father") {
                        const option = document.createElement("option");
                        option.value = parent.id;
                        option.textContent = parent.name;
                        fatherSelect.appendChild(option);
                    } else if (parent.relation === "mother") {
                        const option = document.createElement("option");
                        option.value = parent.id;
                        option.textContent = parent.name;
                        motherSelect.appendChild(option);
                    }
                });
            } catch (err) {
                console.error("❌ خطأ في جلب قائمة الآباء/الأمهات:", err);
            }
        } else {
            fatherBox.style.display = "none";
            motherBox.style.display = "none";
            fatherSelect.innerHTML = "";
            motherSelect.innerHTML = "";
        }
    });

// عند إغلاق المودال، نعيد تعيين الفورم
document
    .getElementById("addUserModal")
    .addEventListener("hidden.bs.modal", function () {
        const form = document.getElementById("userForm");
        form.reset();
        form.removeAttribute("data-edit-mode");
        form.removeAttribute("data-member-id");
        document.getElementById("previewImage").src = "images/image (25).png";
        const submitBtn = form.querySelector("button[type='submit']");
        submitBtn.textContent = "حفظ بيانات الفرد";
    });

// ================================
// HELPER FUNCTIONS
// ================================

function getRelationInArabic(relation) {
    const relationMap = {
        father: "أب",
        mother: "أم",
        son: "ابن",
        daughter: "ابنة",
    };
    return relationMap[relation] || relation;
}

// متغير لمنع التحميل المتكرر
let isReloading = false;

// دالة تحديث معلومات الصفحات
function updatePaginationInfo() {
    // تحديث عدد العناصر المعروضة
    const tableBody = document.querySelector("#membersTable tbody");
    const visibleRows = tableBody ? tableBody.querySelectorAll("tr").length : 0;

    // تحديث النص إذا كان موجود
    const paginationInfo = document.querySelector(".pagination-info");
    if (paginationInfo && typeof allMembers !== "undefined") {
        const totalMembers = allMembers.length;
        paginationInfo.textContent = `عرض ${visibleRows} من ${totalMembers} عضو`;
    }
}

// دالة إعادة تحميل الجدول والشجرة المحسنة
function reloadTableAndTree() {
    // منع التحميل المتكرر
    if (isReloading) {
        //console.log("⏳ التحميل قيد التنفيذ بالفعل...");
        return;
    }

    isReloading = true;
    //console.log("🔄 إعادة تحميل البيانات...");

    // إظهار مؤشر التحميل إذا كان موجود
    const loadingIndicator = document.querySelector(".loading-indicator");
    if (loadingIndicator) {
        loadingIndicator.style.display = "block";
    }

    // إعادة تحميل بيانات الجدول
    fetch("/api/tree_creator/family-members-data", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    })
        .then(async (res) => {
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `خطأ في الخادم: ${res.status}`);
            }
            return await res.json();
        })
        .then((data) => {
            //console.log("✅ تم تحميل البيانات بنجاح");

            // تحديث البيانات العامة
            if (typeof allMembers !== "undefined") {
                allMembers = data.family_data_members_tree || [];
                originalMembers = [...allMembers];
            }

            // إعادة رسم الجدول إذا كانت الدالة موجودة
            if (typeof renderTablePage === "function") {
                const currentPageNum =
                    typeof currentPage !== "undefined" ? currentPage : 1;
                renderTablePage(currentPageNum);
            }

            // تحديث الشجرة إذا كانت الدالة موجودة
            if (typeof loadTreeData === "function") {
                loadTreeData();
            }

            // تحديث معلومات الصفحات
            updatePaginationInfo();

            //console.log("✅ تم تحديث الجدول والشجرة");
        })
        .catch((err) => {
            console.error("❌ خطأ في إعادة تحميل البيانات:", err);
            showErrorMessage(
                `حدث خطأ في تحديث البيانات: ${err.message}`,
                "خطأ في إعادة التحميل! 🔄"
            );
        })
        .finally(() => {
            // إخفاء مؤشر التحميل
            if (loadingIndicator) {
                loadingIndicator.style.display = "none";
            }

            // السماح بالتحميل مرة أخرى بعد ثانية واحدة
            setTimeout(() => {
                isReloading = false;
            }, 1000);
        });
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
// Removed redundant API calls to prevent conflicts
// All template rendering now uses data from loadFamilyDataWithTemplate()

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
FamilyTree.templates.template2_male.field_0 = `<text style="font-size:25px;font-weight:bolder;" fill="#1E88E5" x="${cardWidth2 / 2
    }" y="${imgY2 + imgSize2 + 50}" text-anchor="middle">{val}</text>`;
FamilyTree.templates.template2_male.field_1 = `<text style="font-size:16px;font-weight:bolder;" fill="#1E88E5" x="${cardWidth2 / 2
    }" y="${imgY2 + imgSize2 + 75}" text-anchor="middle">{val}</text>`;
FamilyTree.templates.template2_male.img_0 = imgTemplate2;

// Female
FamilyTree.templates.template2_female = Object.assign(
    {},
    FamilyTree.templates.template2
);
FamilyTree.templates.template2_female.node =
    '<rect x="0" y="0" height="{h}" width="{w}" stroke-width="5" fill="transparent" stroke="#E91E63" rx="15" ry="15"></rect>';
FamilyTree.templates.template2_female.field_0 = `<text style="font-size:25px;font-weight:bolder;" fill="#E91E63" x="${cardWidth2 / 2
    }" y="${imgY2 + imgSize2 + 50}" text-anchor="middle">{val}</text>`;
FamilyTree.templates.template2_female.field_1 = `<text style="font-size:16px;font-weight:bolder;" fill="#E91E63" x="${cardWidth2 / 2
    }" y="${imgY2 + imgSize2 + 75}" text-anchor="middle">{val}</text>`;
FamilyTree.templates.template2_female.img_0 = imgTemplate2;

// Expand icon
const expandIconMale2 =
    '<circle cx="97" cy="-16" r="10" fill="#1E88E5" stroke="#fff" stroke-width="1"><title>Expand</title></circle><line x1="90" y1="-16" x2="104" y2="-16" stroke-width="1" stroke="#fff"></line><line x1="97" y1="-23" x2="97" y2="-9" stroke-width="1" stroke="#fff"></line>';
const expandIconFemale2 =
    '<circle cx="97" cy="-16" r="10" fill="#E91E63" stroke="#fff" stroke-width="1"></circle><line x1="90" y1="-16" x2="104" y2="-16" stroke-width="1" stroke="#fff"></line><line x1="97" y1="-23" x2="97" y2="-9" stroke-width="1" stroke="#fff"></line>';
FamilyTree.templates.template2_male.plus = expandIconMale2;
FamilyTree.templates.template2_female.plus = expandIconFemale2;

// Removed redundant API calls to prevent conflicts
// All template rendering now uses data from loadFamilyDataWithTemplate()

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
// Removed redundant API calls to prevent conflicts
// All template rendering now uses data from loadFamilyDataWithTemplate()

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
// Removed redundant API calls to prevent conflicts
// All template rendering now uses data from loadFamilyDataWithTemplate()

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
// Removed redundant API calls to prevent conflicts
// All template rendering now uses data from loadFamilyDataWithTemplate()

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
// Removed redundant API calls to prevent conflicts
// All template rendering now uses data from loadFamilyDataWithTemplate()

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
// Removed redundant API calls to prevent conflicts
// All template rendering now uses data from loadFamilyDataWithTemplate()

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
// Removed redundant API calls to prevent conflicts
// All template rendering now uses data from loadFamilyDataWithTemplate()

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
FamilyTree.templates.template9_male.field_0 = `<text style="font-size:28px;font-weight:bolder;" fill="dark" x="${cardWidth2 / 2
    }" y="${imgY2 + imgSize2 + 50}" text-anchor="middle">{val}</text>`;
FamilyTree.templates.template9_male.field_1 = `<text style="font-size:16px;font-weight:bolder;" fill="rgba(102, 102, 102, 1)" x="${cardWidth2 / 2
    }" y="${imgY2 + imgSize2 + 75}" text-anchor="middle">{val}</text>`;
FamilyTree.templates.template9_male.img_0 = imgTemplate9;

// Female
FamilyTree.templates.template9_female = Object.assign(
    {},
    FamilyTree.templates.template9
);
FamilyTree.templates.template9_female.node =
    '<rect x="0" y="0" height="{h}" width="{w}" stroke-width="1" fill="transparent" stroke="rgba(193, 193, 193, 1)" rx="15" ry="15"></rect>';
FamilyTree.templates.template9_female.field_0 = `<text style="font-size:28px;font-weight:bolder;" fill="dark" x="${cardWidth2 / 2
    }" y="${imgY9 + imgSize9 + 50}" text-anchor="middle">{val}</text>`;
FamilyTree.templates.template9_female.field_1 = `<text style="font-size:16px;font-weight:bolder;" fill="rgba(102, 102, 102, 1)" x="${cardWidth2 / 2
    }" y="${imgY9 + imgSize9 + 75}" text-anchor="middle">{val}</text>`;
FamilyTree.templates.template9_female.img_0 = imgTemplate9;

// Expand icon
const expandIconMale9 =
    '<circle cx="97" cy="-16" r="10" fill="#1E88E5" stroke="#fff" stroke-width="1"><title>Expand</title></circle><line x1="90" y1="-16" x2="104" y2="-16" stroke-width="1" stroke="#fff"></line><line x1="97" y1="-23" x2="97" y2="-9" stroke-width="1" stroke="#fff"></line>';
const expandIconFemale9 =
    '<circle cx="97" cy="-16" r="10" fill="#E91E63" stroke="#fff" stroke-width="1"></circle><line x1="90" y1="-16" x2="104" y2="-16" stroke-width="1" stroke="#fff"></line><line x1="97" y1="-23" x2="97" y2="-9" stroke-width="1" stroke="#fff"></line>';
FamilyTree.templates.template9_male.plus = expandIconMale9;
FamilyTree.templates.template9_female.plus = expandIconFemale9;

// Removed redundant API calls to prevent conflicts
// All template rendering now uses data from loadFamilyDataWithTemplate()

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
// Removed redundant API calls to prevent conflicts
// All template rendering now uses data from loadFamilyDataWithTemplate()

// ==========================================================
// Template 12
// ==========================================================

// ========================= Template 12 ========================= //
// ========================== المتغيرات العامة ==========================
// متغيرات عامة
// متغيرات عامة
let familyData = [];
let isLoading = false;

// دالة جلب البيانات من API
async function loadFamilyData() {
    if (isLoading) return;

    try {
        isLoading = true;
        //console.log("🔄 بدء تحميل البيانات من API...");
        showLoadingIndicator();

        const response = await fetch("/api/test-tree", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });

        //console.log("📡 استجابة الخادم:", response.status, response.statusText);

        if (response.ok) {
            const data = await response.json();
            //console.log("✅ تم تحميل البيانات بنجاح:", data);
            //console.log("📊 نوع البيانات:", typeof data);
            //console.log("🔍 محتويات البيانات:", Object.keys(data));

            if (data) {
                familyData = extractMembers(data);
                //console.log("👥 عدد الأعضاء المستخرجين:", familyData.length);
                //console.log("📝 الأعضاء:", familyData);

                if (familyData.length > 0) {
                    updateTreeWithData();
                    //console.log("🌳 تم تحديث الشجرة بنجاح");
                    showSuccessMessage(`تم تحميل ${familyData.length} عضو`);
                } else {
                    console.warn("⚠️ لا توجد أعضاء في البيانات");
                    showErrorMessage("لا توجد بيانات أعضاء");
                }
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

    //console.log("🔍 محاولة استخراج الأعضاء من البيانات...");

    // محاولة استخراج من تنسيقات مختلفة
    if (data.nodes && Array.isArray(data.nodes)) {
        //console.log("📋 وجدت data.nodes:", data.nodes.length, "عنصر");
        members = data.nodes;
    } else if (data.members && Array.isArray(data.members)) {
        //console.log("📋 وجدت data.members:", data.members.length, "عنصر");
        members = data.members;
    } else if (data.tree && Array.isArray(data.tree)) {
        //console.log("📋 وجدت data.tree:", data.tree.length, "عنصر");
        members = data.tree;
    } else if (
        data.family_data_members_tree &&
        Array.isArray(data.family_data_members_tree)
    ) {
        //console.log(
        //   "📋 وجدت data.family_data_members_tree:",
        //   data.family_data_members_tree.length,
        //   "عنصر"
        // );
        members = data.family_data_members_tree;
    } else if (Array.isArray(data)) {
        //console.log("📋 البيانات عبارة عن مصفوفة مباشرة:", data.length, "عنصر");
        members = data;
    } else {
        //console.log("🔍 محاولة البحث في جميع خصائص البيانات...");
        // البحث في جميع الخصائص
        for (let key in data) {
            if (Array.isArray(data[key]) && data[key].length > 0) {
                //console.log(`📋 وجدت مصفوفة في ${key}:`, data[key].length, "عنصر");
                members = data[key];
                break;
            }
        }
    }

    //console.log("📊 عدد الأعضاء الخام:", members.length);

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

        //console.log(
        //   `👤 عضو ${index + 1}:`,
        //   processed.name,
        //   `(${processed.relation})`
        // );
        return processed;
    });

    //console.log("✅ تم معالجة", processedMembers.length, "عضو بنجاح");
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

    //console.log("🌳 بدء تحديث الشجرة بـ", familyData.length, "عضو");

    // إخفاء رسالة الحالة الفارغة
    hideEmptyState();

    // تحديث الأوراق الرئيسية (الجذر)
    const rootLeaves = document.querySelectorAll(".tree > .leaf .name-text");
    //console.log("🍃 عدد الأوراق الجذرية:", rootLeaves.length);

    if (rootLeaves[0] && familyData[0]) {
        rootLeaves[0].textContent = familyData[0].name;
        rootLeaves[0].parentElement.style.display = "block";
        //console.log("👑 تم تحديث الجذر الأول:", familyData[0].name);
    }
    if (rootLeaves[1] && familyData[1]) {
        rootLeaves[1].textContent = familyData[1].name;
        rootLeaves[1].parentElement.style.display = "block";
        //console.log("👑 تم تحديث الجذر الثاني:", familyData[1].name);
    }

    // تحديث أسماء الآباء والأطفال
    const parentNames = document.querySelectorAll(".parent-name");
    const leafTexts = document.querySelectorAll(".branch .leaf .name-text");

    //console.log("👨‍👩‍👧‍👦 عدد أسماء الآباء:", parentNames.length);
    //console.log("🍃 عدد أوراق الأطفال:", leafTexts.length);

    let memberIndex = 2; // بدء من العضو الثالث بعد الجذرين

    // تحديث أسماء الآباء
    parentNames.forEach((parent, index) => {
        if (familyData[memberIndex]) {
            const oldName = parent.textContent;
            parent.textContent = familyData[memberIndex].name;
            parent.style.display = "block";
            //console.log(
            //   `👨 آب ${index + 1}: ${oldName} → ${familyData[memberIndex].name}`
            // );
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
            //console.log(
            //   `👶 طفل ${index + 1}: ${oldName} → ${familyData[memberIndex].name}`
            // );
            memberIndex++;
        } else {
            // إخفاء العناصر الفارغة
            leaf.parentElement.style.display = "none";
        }
    });

    //console.log(
    //   "✅ تم تحديث الشجرة بنجاح! استُخدم",
    //   memberIndex,
    //   "من",
    //   familyData.length,
    //   "عضو"
    // );
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

// تشغيل التطبيق عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", function () {
    // عرض حالة الانتظار أولاً
    showEmptyState();
    // تحميل البيانات مع منطق القالب يتم في الدالة الرئيسية
});

// ==========================================================
// Template 12 Logic - إظهار/إخفاء القوالب حسب template_id
// ==========================================================

// دالة للتحقق من template_id وإظهار القالب المناسب
function handleTemplateDisplay(templateId) {
    //console.log("🎨 معرف القالب المستلم:", templateId);

    // تحديث معرف القالب في عنصر body
    const body = document.querySelector('body');
    if (body) {
        body.setAttribute('data-template-id', templateId);
        // إضافة تصحيح بصري مؤقت لعرض معرف القالب النشط
        console.log('🎯 تطبيق قالب:', templateId);

        // التحقق من أن السمة قد تم تطبيقها بشكل صحيح
        console.log('🔍 قيمة سمة القالب:', body.getAttribute('data-template-id'));

        // إضافة مؤشر بصري مؤقت في الزاوية العلوية اليمنى
        let indicator = document.getElementById('template-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'template-indicator';
            indicator.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 10px 15px;
                border-radius: 5px;
                z-index: 9999;
                font-family: Arial, sans-serif;
                font-weight: bold;
                font-size: 14px;
                transition: all 0.3s ease;
            `;
            document.body.appendChild(indicator);
        }
        indicator.textContent = `القالب النشط: ${templateId}`;

        // إضافة تأثير بصري مؤقت عند تغيير القالب
        indicator.style.transform = 'scale(1.1)';
        indicator.style.boxShadow = '0 0 15px rgba(255,255,255,0.5)';
        setTimeout(() => {
            indicator.style.transform = 'scale(1)';
            indicator.style.boxShadow = 'none';
        }, 300);

        // التحقق من أن CSS variables تم تطبيقها
        setTimeout(() => {
            const treeElement = document.querySelector('.tree');
            const leafElements = document.querySelectorAll('.leaf');
            if (treeElement) {
                const computedStyle = getComputedStyle(treeElement);
                console.log('🎨 لون الفرع المحسوب:', computedStyle.borderBottomColor);
                console.log('🎨 قيمة المتغير --branch-color:', getComputedStyle(document.documentElement).getPropertyValue('--branch-color'));

                // تسجيل لون أول ورقة للتأكيد
                if (leafElements.length > 0) {
                    const leafStyle = getComputedStyle(leafElements[0]);
                    console.log('🍃 لون الورقة المحسوب:', leafStyle.backgroundColor);
                }
            } else {
                console.log('❌ لم يتم العثور على عنصر الشجرة');
            }
        }, 100);
    }

    const familyTreeDiv = document.getElementById('tree');
    const backgroundDiv = document.querySelector('.background');

    // إظهار div الشجرة العادية بشكل افتراضي
    if (familyTreeDiv) {
        familyTreeDiv.style.display = 'block';
        familyTreeDiv.style.visibility = 'visible';
        //console.log("✨ تم إظهار div الشجرة العادية");
    }

    if (templateId >= 12 && templateId <= 15) {
        //console.log("✅ عرض القالب رقم", templateId, "(شجرة الخلفية)");

        // إخفاء div الشجرة العادية
        if (familyTreeDiv) {
            familyTreeDiv.style.display = 'none';
            //console.log("🚫 تم إخفاء div الشجرة العادية");
        }

        // إظهار div القالب (12-15)
        if (backgroundDiv) {
            backgroundDiv.style.display = 'block';
            //console.log("✨ تم إظهار div القالب رقم", templateId);

            // تحميل البيانات في القالب
            loadFamilyData();
        } else {
            console.error("❌ لم يتم العثور على div القالب رقم", templateId);
        }

    } else {
        //console.log("✅ عرض القالب العادي (معرف:", templateId, ")");

        // إظهار div الشجرة العادية
        if (familyTreeDiv) {
            familyTreeDiv.style.display = 'block';
            familyTreeDiv.style.visibility = 'visible';
            //console.log("✨ تم إظهار div الشجرة العادية");
        }

        // إخفاء div القالب رقم 12
        if (backgroundDiv) {
            backgroundDiv.style.display = 'none';
            //console.log("🚫 تم إخفاء div القالب رقم 12");
        }
    }
}

// تحديث دالة loadFamilyData لتتضمن منطق القالب
async function loadFamilyDataWithTemplate() {
    if (isLoading) return;

    try {
        isLoading = true;
        //console.log("🔄 بدء تحميل البيانات من API...");
        showLoadingIndicator();

        const response = await fetch("/api/tree_creator/family-members-data", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });

        //console.log("📡 استجابة الخادم:", response.status, response.statusText);

        if (response.ok) {
            const data = await response.json();
            //console.log("✅ تم تحميل البيانات بنجاح:", data);
            //console.log("🎨 معرف القالب:", data.template_id);

            // التحقق من معرف القالب وإظهار القالب المناسب
            handleTemplateDisplay(data.template_id);

            if (data.template_id >= 12 && data.template_id <= 15) {
                // معالجة خاصة للقوالب 12-15 (شجرة الخلفية)
                if (data) {
                    familyData = extractMembers(data);
                    //console.log("👥 عدد الأعضاء المستخرجين:", familyData.length);

                    if (familyData.length > 0) {
                        updateTreeWithData();
                        //console.log("🌳 تم تحديث القالب رقم", data.template_id, "بنجاح");
                        showSuccessMessage(`تم تحميل ${familyData.length} عضو في القالب رقم ${data.template_id}`);
                    } else {
                        console.warn("⚠️ لا توجد أعضاء في البيانات");
                        showErrorMessage("لا توجد بيانات أعضاء");
                    }
                }
            } else if (data.template_id >= 1 && data.template_id <= 10) {
                // معالجة القوالب من 1 إلى 10
                renderFamilyTree(data);
            } else {
                //console.log("🎨 سيتم عرض القالب الافتراضي");
            }

        } else {
            console.error("❌ فشل في تحميل البيانات:", response.status, response.statusText);
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

// دالة لعرض شجرة العائلة باستخدام مكتبة FamilyTree
function renderFamilyTree(data) {
    //console.log("🎨 عرض شجرة العائلة باستخدام القالب:", data.template_id);

    // تحديد القالب المناسب
    let templateName = "sriniz"; // الافتراضي
    let nodeBinding = { field_0: "name", img_0: "photo" };

    switch (data.template_id) {
        case 1:
            templateName = "sriniz";
            nodeBinding = { field_0: "name", img_0: "photo" };
            break;
        case 2:
            templateName = "template2";
            nodeBinding = { field_0: "name", field_1: "birth_date", img_0: "photo" };
            break;
        case 3:
            templateName = "card";
            nodeBinding = {
                field_0: "name",
                field_1: "birth_date",
                field_2: "relation",
                field_3: "phone_number",
                img_0: "photo"
            };
            break;
        case 4:
            templateName = "sriniz4";
            nodeBinding = { field_0: "name", img_0: "photo", field_1: "birth_date" };
            break;
        case 5:
            templateName = "sriniz5";
            nodeBinding = { field_0: "name", img_0: "photo" };
            break;
        case 6:
            templateName = "sriniz6";
            nodeBinding = { field_0: "name" };
            break;
        case 7:
            templateName = "sriniz7";
            nodeBinding = { field_0: "name" };
            break;
        case 8:
            templateName = "sriniz8";
            nodeBinding = { field_0: "name", img_0: "photo", field_1: "birth_date" };
            break;
        case 9:
            templateName = "template9";
            nodeBinding = { field_0: "name", field_1: "birth_date", img_0: "photo" };
            break;
        case 10:
            templateName = "card2";
            nodeBinding = {
                field_0: "name",
                field_1: "birth_date",
                field_2: "relation",
                field_3: "phone_number",
                img_0: "photo"
            };
            break;
        default:
            templateName = "sriniz";
            nodeBinding = { field_0: "name", img_0: "photo" };
    }

    // تحويل البيانات إلى التنسيق المطلوب
    let nodes = [];

    if (data.nodes && Array.isArray(data.nodes)) {
        nodes = data.nodes.map(node => {
            // تحديد الصورة الافتراضية حسب الجنس
            let defaultPhoto = "images/hugeicons_male-02.svg";
            if (node.gender === "female") {
                defaultPhoto = "images/hugeicons_female-02.svg";
            }

            // تحديد الصورة حسب القالب
            if (data.template_id === 3 || data.template_id === 10) {
                defaultPhoto = node.profile_picture || defaultPhoto;
            } else if (data.template_id === 9) {
                defaultPhoto = node.photo ||
                    (node.gender === "female" ? "images/female 1.svg" : "images/male 1.svg");
            } else {
                defaultPhoto = node.photo || defaultPhoto;
            }

            return {
                id: node.id,
                name: node.name,
                gender: node.gender,
                birth_date: node.birth_date || "",
                death_date: node.death_date || "",
                relation: node.relation || "",
                phone_number: node.phone_number || "",
                photo: defaultPhoto,
                profile_picture: node.profile_picture || "",
                pids: node.pids || [],
                fid: node.fid || null,
                mid: node.mid || null,
            };
        });
    }

    //console.log("🌳 بيانات الشجرة:", nodes);

    // مسح محتوى عنصر الشجرة
    const treeElement = document.getElementById("tree");
    if (treeElement) {
        treeElement.innerHTML = "";
        treeElement.style.display = "block";
        treeElement.style.visibility = "visible";
    }

    // إنشاء الشجرة
    if (nodes.length > 0) {
        try {
            //console.log("🔧 إنشاء الشجرة باستخدام القالب:", templateName);

            var family = new FamilyTree(treeElement, {
                mouseScroll: FamilyTree.none,
                template: templateName,
                enableSearch: false,
                nodeMouseClick: FamilyTree.action.none,
                scaleInitial: FamilyTree.match.boundary,
                scaleMax: 1.5,
                nodeBinding: nodeBinding,
                nodes: nodes,
            });

            //console.log("✅ تم إنشاء الشجرة بنجاح");

            // إضافة مستمعات الأحداث الخاصة بالقالب
            if (data.template_id === 1) {
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
            } else if (data.template_id === 4) {
                // شكل الماسة بين الزوجين
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
            } else if (data.template_id === 5 || data.template_id === 6 || data.template_id === 7) {
                // تلوين الروابط
                family.on("render-link", function (sender, args) {
                    if (args.html) {
                        let strokeColor = "rgba(181, 181, 181, 1)";
                        if (data.template_id === 5) {
                            strokeColor = "rgba(185, 126, 0, 1)";
                        }
                        args.html = args.html.replace(
                            /stroke="[^"]*"/g,
                            `stroke="${strokeColor}"`
                        );
                        args.html = args.html.replace(
                            /stroke-width="[^"]*"/g,
                            'stroke-width="2"'
                        );
                    }
                });
            }

            showSuccessMessage(`تم تحميل ${nodes.length} عضو في شجرة العائلة`);
        } catch (error) {
            console.error("❌ خطأ في إنشاء الشجرة:", error);
            showErrorMessage("حدث خطأ في عرض شجرة العائلة");
        }
    } else {
        console.warn("⚠️ لا توجد بيانات لعرضها في الشجرة");
        showInfoMessage("لا توجد أعضاء في شجرة العائلة");

        // عرض رسالة في عنصر الشجرة
        if (treeElement) {
            treeElement.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #666;">
          <div style="font-size: 48px; margin-bottom: 20px;">🌳</div>
          <div style="font-size: 24px; margin-bottom: 10px; color: #D3AB55;">لا توجد بيانات شجرة العائلة</div>
          <div style="font-size: 16px; color: #999;">سيتم عرض شجرة العائلة عند إضافة أعضاء</div>
        </div>
      `;
        }
    }
}

// عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", function () {
    checkAuth();
    loadTreeData();
    renderTablePage();

    // تحميل البيانات مع منطق القالب
    loadFamilyDataWithTemplate();

    // عناصر التحكم
    const coverInput = document.getElementById("cover-input");
    const logoInput = document.getElementById("logo-input");
    const editCoverBtn = document.getElementById("edit-cover-btn");
    const editLogoBtn = document.getElementById("edit-logo-btn");

    // افتح نافذة اختيار صورة الغلاف عند الضغط على الزر
    editCoverBtn.addEventListener("click", () => {
        coverInput.click();
    });

    // افتح نافذة اختيار صورة الشعار عند الضغط على زر التعديل
    editLogoBtn.addEventListener("click", () => {
        logoInput.click();
    });

    // بعد اختيار صورة الغلاف، ارسلها للباك اند
    coverInput.addEventListener("change", () => {
        if (coverInput.files.length > 0) {
            uploadImages({ cover_image: coverInput.files[0] });
        }
    });

    // بعد اختيار صورة الشعار، ارسلها للباك اند
    logoInput.addEventListener("change", () => {
        if (logoInput.files.length > 0) {
            uploadImages({ logo_image: logoInput.files[0] });
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

    // active class
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
                    showErrorMessage(
                        "فشل في تسجيل الخروج. يرجى المحاولة مرة أخرى.",
                        "خطأ في تسجيل الخروج! 🚪"
                    );
                }
            } catch (error) {
                showErrorMessage(
                    "تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.",
                    "خطأ في الشبكة! 🌐"
                );
            }
        });
});
