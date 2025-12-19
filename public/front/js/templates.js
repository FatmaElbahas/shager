const token = localStorage.getItem("authToken");
const user = JSON.parse(localStorage.getItem("user"));
let treeId = null; // لتخزين id الشجرة

// التحقق من الصلاحية
function checkAuth() {
  if (!token || !user || user.role !== "tree_creator") {
    window.location.href = "login.html";
  }
}

// جلب بيانات الشجرة مرة واحدة وتحديث الصور والنصوص
function loadTreeData() {
  fetch("/api/tree_creator/family-tree", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("📌 API Response:", data); // مهم للتأكد من البيانات

      if (!data || !data.data || data.data.length === 0) {
        console.warn("لا توجد شجرة لعرضها");
        return;
      }

      const tree = data.data[0];
      treeId = tree.id;

      // تعيين الصور مع قيم افتراضية إذا لم تكن موجودة
      document.getElementById("cover-image").src = tree.cover_image
        ? `/storage/${tree.cover_image}`
        : "/storage/default_images/default_cover.jpg";

      document.getElementById("family-logo").src = tree.logo_image
        ? `/storage/${tree.logo_image}`
        : "/storage/default_images/default_logo.jpg";

      document.getElementById("family-name").textContent =
        tree.tree_name || "اسم العائلة";

      // تحميل أفراد العائلة وعرض الشجرة بتصميم Template 2
      loadFamilyMembersAndBuildTemplate2();
    })
    .catch((err) => {
      console.error("❌ خطأ في جلب بيانات الشجرة:", err);
    });
}

// دالة رفع الصور (غلاف أو شعار)
function uploadImages(files) {
  if (!treeId) {
    alert("خطأ: لم يتم تحميل بيانات الشجرة بعد.");
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
        console.log("Cover image updated to:", newCoverUrl);
      }

      if (files.logo_image && data.data.logo_image) {
        const newLogoUrl = `${baseUrl}${data.data.logo_image}?t=${timestamp}`;
        const familyLogo = document.getElementById("family-logo");
        familyLogo.src = "";
        setTimeout(() => (familyLogo.src = newLogoUrl), 50);
        console.log("Logo image updated to:", newLogoUrl);
      }

      alert("تم تحديث الصور بنجاح");
    })
    .catch((err) => {
      console.error("Upload error:", err);
      alert(`حدث خطأ: ${err.message}`);
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

    // عرض البيانات في الشجرة أيضاً
    if (allMembers.length > 0) {
      buildTemplate2FamilyTree(allMembers);
    } else {
      displayEmptyTreeTemplate2();
    }
  })
  .catch((err) => console.error(err));

// تعديل دالة البحث
searchInput.addEventListener("input", () => {
  const searchValue = searchInput.value.trim().toLowerCase();

  if (searchValue === "") {
    // إذا كان حقل البحث فارغاً، نعيد البيانات الأصلية
    allMembers = [...originalMembers];
    renderTablePage(1); // نعود للصفحة الأولى

    // تحديث الشجرة أيضاً
    if (allMembers.length > 0) {
      buildTemplate2FamilyTree(allMembers);
    } else {
      displayEmptyTreeTemplate2();
    }
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

  // تحديث الشجرة مع النتائج المفلترة
  if (allMembers.length > 0) {
    buildTemplate2FamilyTree(allMembers);
  } else {
    displayEmptyTreeTemplate2();
  }
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

// عدد العناصر في كل صفحة
const ITEMS_PER_PAGE = 6;

let currentPage = 1;
let totalPages = 1;
let allMembers = []; // لتخزين كل الأعضاء

function renderTablePage(page = 1) {
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
          <div><img src="${
            member.profile_picture
              ? `/storage/${member.profile_picture}`
              : "images/tree 1.png"
          }" alt="" class="img-member rounded-pill"></div>
          <div>
            <strong>${member.name ?? "غير معرف"}</strong>
            <p class="text-muted text-end">${
              member.user?.email ?? "غير معرف"
            }</p>
          </div>
        </div>
      </td>
      <td class="text-center">${getRelationInArabic(member.relation)}</td>
      <td>${new Date(member.created_at).toLocaleDateString()}</td>
      <td class="text-center">
        <div class="dropdown">
          <button class="btn" type="button" id="dropdownMenuButton${
            member.id
          }" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="fas fa-ellipsis-v"></i>
          </button>
          <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton${
            member.id
          }">
            <li><a class="dropdown-item edit-profile text-end" href="#" data-id="${
              member.id
            }">تعديل البيانات</a></li>
            <li><a class="dropdown-item delete-member text-end" href="#" data-id="${
              member.id
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
  // عرض البيانات
  if (e.target.classList.contains("view-profile")) {
    e.preventDefault();
    const memberId = e.target.dataset.id;

    fetch(
      `/api/tree_creator/family-members-data/${memberId}`,
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
          alert(data.message);
        } else {
          console.log("بيانات العضو:", data);
          // هنا ممكن تعرضي البيانات في Modal أو Form
        }
      })
      .catch((err) => console.error(err));
  }

  // حذف العضو
  if (e.target.classList.contains("delete-member")) {
    e.preventDefault();
    const memberId = e.target.dataset.id;

    if (confirm("هل أنت متأكد من حذف هذا العضو؟")) {
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
        .then((res) => res.json())
        .then((data) => {
          alert(data.message);
          // إعادة تحميل البيانات في الجدول والشجرة
          reloadTableAndTree();
        })
        .catch((err) => console.error(err));
    }
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

  submitBtn.disabled = true;
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
        alert(data.message || "تم حفظ البيانات بنجاح!");
      } else {
        alert(data.message || "حدث خطأ أثناء حفظ البيانات");
      }
    })
    .catch((err) => {
      alert(err.message);
      console.error(err);
    })
    .finally(() => {
      // إخفاء الـ spinner وإعادة تفعيل الزر
      submitBtn.disabled = false;
      btnText.classList.remove("d-none");
      spinner.classList.add("d-none");
      loadingText.classList.add("d-none");
    });
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
// RENDER TREE WITH TEMPLATE
// ================================

function renderTemplate1(treeData) {
  new Treant({
    chart: {
      container: "#treeContainer",
      rootOrientation: "NORTH",
      nodeAlign: "CENTER",
      levelSeparation: 80,
      siblingSeparation: 60,
      subTeeSeparation: 80,
      connectors: {
        type: "step",
        style: {
          "stroke-width": 2,
          stroke: "#ccc",
        },
      },
    },
    nodeStructure: treeData,
  });
}

function renderTemplate2(treeData) {
  new Treant({
    chart: {
      container: "#treeContainer",
      rootOrientation: "NORTH",
      nodeAlign: "CENTER",
      levelSeparation: 60,
      siblingSeparation: 50,
      subTeeSeparation: 50,
      connectors: {
        type: "curve",
      },
    },
    nodeStructure: treeData,
  });
}

function renderTemplate3(treeData) {
  new Treant({
    chart: {
      container: "#treeContainer",
      rootOrientation: "NORTH",
      nodeAlign: "CENTER",
      levelSeparation: 70,
      siblingSeparation: 60,
      subTeeSeparation: 60,
      connectors: {
        type: "straight",
      },
    },
    nodeStructure: treeData,
  });
}

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

// ================================
// TRANSFORM TREE NODE FOR TREANT
// ================================

function transformTreeNode(node) {
  if (!node) return null;

  let nodeClass = "";
  let relationText = "";

  if (node.relation === "father") {
    nodeClass = "male-node";
    relationText = "أب";
  } else if (node.relation === "mother") {
    nodeClass = "female-node";
    relationText = "أم";
  } else if (node.relation === "son") {
    nodeClass = "male-child-node";
    relationText = "ابن";
  } else if (node.relation === "daughter") {
    nodeClass = "female-child-node";
    relationText = "ابنة";
  } else if (node.relation === "marriage_line") {
    nodeClass = "marriage-line";
    relationText = "";
  } else if (node.relation === "family") {
    nodeClass = "family-root";
    // relationText = "العائلة";
  } else {
    nodeClass = "default-node";
    relationText = node.relation || "";
  }

  // خط الزواج يظهر كخط أفقي
  if (node.relation === "marriage_line") {
    return {
      text: {
        name: "━━━",
      },
      HTMLclass: nodeClass,
      innerHTML: `<div class="tree-node ${nodeClass}">━━━</div>`,
      children: node.children ? node.children.map(transformTreeNode) : [],
    };
  }

  // عقدة العائلة الجذر
  if (node.relation === "family") {
    return {
      text: {
        name: node.text?.name || node.name || "العائلة",
      },
      HTMLclass: nodeClass,
      innerHTML: `
        <div class="tree-node ${nodeClass}">
          <div class="node-name">${
            node.text?.name || node.name || "العائلة"
          }</div>
          <div class="node-relation">${relationText}</div>
        </div>
      `,
      children: node.children ? node.children.map(transformTreeNode) : [],
    };
  }

  // تحديد حالة الشخص
  const statusIcon = node.status === "deceased" ? "" : "";
  const statusText = node.status === "deceased" ? "متوفي" : "على قيد الحياة";

  // الصورة الشخصية حسب الجنس
  let profileImage;
  if (node.profile_picture) {
    profileImage = `/storage/${node.profile_picture}`;
  } else {
    // تحديد الصورة حسب الجنس من صلة القرابة
    if (node.relation === "father" || node.relation === "son") {
      profileImage = "images/hugeicons_male-02.png";
    } else if (node.relation === "mother" || node.relation === "daughter") {
      profileImage = "images/hugeicons_female-02.png";
    } else {
      profileImage = "images/image (25).png";
    }
  }

  return {
    text: {
      name: node.text?.name || node.name || "غير محدد",
    },
    HTMLclass: nodeClass,
    innerHTML: `
      <div class="tree-node ${nodeClass}">
        <div class="node-image">
          <img src="${profileImage}" alt="صورة شخصية" class="profile-img">
        </div>
        <div class="node-info">
          <div class="node-name">${
            node.text?.name || node.name || "غير محدد"
          }</div>
          <div class="node-status">
            <span class="status-icon">${statusIcon}</span>
            <span class="status-text">${statusText}</span>
          </div>
        <div class="node-plus btn px-2 py-2" data-bs-toggle="modal" data-bs-target="#addUserModal">+</div>
        </div>
      </div>
    `,
    children: node.children ? node.children.map(transformTreeNode) : [],
  };
}

// ================================
// LOAD AND RENDER TREE BASED ON TEMPLATE
// ================================

async function loadAndRenderTree() {
  try {
    const res = await fetch(
      "/api/tree_creator/family-tree-design",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    const data = await res.json();
    if (!data.tree) return;

    const treeData = transformTreeNode(data.tree);
    const templateId = data.template?.id || 1;

    if (templateId === 1) renderTemplate1(treeData);
    else if (templateId === 2) renderTemplate2(treeData);
    else if (templateId === 3) renderTemplate3(treeData);
    else renderTemplate1(treeData);
  } catch (err) {
    console.error("❌ خطأ في جلب بيانات الشجرة:", err);
  }
}

// ==================================================================

document.addEventListener("DOMContentLoaded", function () {
  checkAuth();
  loadTreeData();
  renderTablePage();
  loadUserTemplateAndRender();

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
          alert("فشل تسجيل الخروج");
        }
      } catch (error) {
        alert("خطأ في الاتصال بالسيرفر");
      }
    });
});
// دالة تحميل القالب المحدد للمستخدم
function loadUserTemplateAndRender() {
  // جلب معلومات المستخدم لمعرفة القالب المحدد
  fetch("/api/tree_creator/family-tree-design", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      const userTemplate = data.template_id || 1;

      if (userTemplate === 1) {
        loadAndRenderTemplate1();
      } else if (userTemplate === 2) {
        loadFamilyMembersAndBuildTemplate2();
      } else if (userTemplate === 3) {
        loadAndRenderTreeTemplate3();
      }
    })
    .catch((err) => {
      console.error("خطأ في جلب بيانات المستخدم:", err);
      // في حالة الخطأ، استخدم القالب الافتراضي
      loadFamilyMembersAndBuildTemplate2();
    });
}

// Template 1 - Traditional Treant
function loadAndRenderTemplate1() {
  fetch("/api/tree_creator/family-tree-design", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.tree) {
        const treeData = transformTreeNode(data.tree);
        renderTemplate1(treeData);
      }
    })
    .catch((err) => {
      console.error("خطأ في جلب بيانات القالب 1:", err);
    });
}

// Template 2 - Advanced Family Tree
function loadFamilyMembersAndBuildTemplate2() {
  fetch("/api/tree_creator/family-members-data", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("👥 Family Members for Tree:", data);

      if (
        data &&
        data.family_data_members_tree &&
        data.family_data_members_tree.length > 0
      ) {
        buildTemplate2FamilyTree(data.family_data_members_tree);
      } else {
        displayEmptyTreeTemplate2();
      }
    })
    .catch((err) => {
      console.error("❌ خطأ في جلب أفراد العائلة:", err);
      displayEmptyTreeTemplate2();
    });
}

// دالة بناء الشجرة بتصميم Template 2
function buildTemplate2FamilyTree(members) {
  const treeContainer = document.getElementById("treeContainer");

  // تصنيف الأعضاء حسب الأجيال والعلاقات
  const organizedMembers = organizeMembersForTemplate2(members);

  // بناء HTML للشجرة
  const treeHTML = `
    <div class="family-tree-template2">
      <!-- مستوى الأجداد العظام -->
      ${
        organizedMembers.greatGrandparents.length > 0
          ? buildGreatGrandparentsLevel(organizedMembers.greatGrandparents)
          : ""
      }
      
      <!-- مستوى الأجداد -->
      ${buildGrandparentsLevel(organizedMembers.grandparents)}
      
      <!-- مستوى الآباء والأعمام -->
      ${buildParentsAndSiblingsLevel(
        organizedMembers.parents,
        organizedMembers.siblings
      )}
      
      <!-- مستوى الأطفال -->
      ${buildChildrenLevel(organizedMembers.children)}
      
      <!-- مستوى الأحفاد -->
      ${
        organizedMembers.grandchildren.length > 0
          ? buildGrandchildrenLevel(organizedMembers.grandchildren)
          : ""
      }
    </div>
  `;

  treeContainer.innerHTML = treeHTML;

  // إضافة خطوط الاتصال بعد رندر الشجرة
  setTimeout(() => {
    console.log("🔗 إضافة خطوط الاتصال والأسهم...");
    // استخدام الطريقة البسيطة للخطوط
    addSimpleConnectors();
  }, 500);
}

// دالة تصنيف الأعضاء للتصميم الجديد
function organizeMembersForTemplate2(members) {
  const greatGrandparents = [];
  const grandparents = [];
  const parents = [];
  const siblings = [];
  const children = [];
  const grandchildren = [];

  members.forEach((member) => {
    // تحديد الجيل بناءً على العلاقة
    if (
      member.relation === "great_grandfather" ||
      member.relation === "great_grandmother"
    ) {
      greatGrandparents.push(member);
    } else if (
      member.relation === "grandfather" ||
      member.relation === "grandmother"
    ) {
      grandparents.push(member);
    } else if (member.relation === "father" || member.relation === "mother") {
      parents.push(member);
    } else if (member.relation === "uncle" || member.relation === "aunt") {
      siblings.push(member);
    } else if (member.relation === "brother" || member.relation === "sister") {
      siblings.push(member);
    } else if (member.relation === "son" || member.relation === "daughter") {
      children.push(member);
    } else if (
      member.relation === "grandson" ||
      member.relation === "granddaughter"
    ) {
      grandchildren.push(member);
    } else {
      children.push(member);
    }
  });

  return {
    greatGrandparents,
    grandparents,
    parents,
    siblings,
    children,
    grandchildren,
  };
}

// دالة بناء مستوى الأجداد
function buildGrandparentsLevel(grandparents) {
  if (!grandparents.length) return "";

  const grandparentsHTML = grandparents
    .map((member) => createMemberCard(member))
    .join("");

  return `
    <div class="grandparents-level">
      ${grandparentsHTML}
      ${
        grandparents.length >= 2 ? '<div class="marriage-connector"></div>' : ""
      }
      <div class="parent-children-connections" data-level="grandparents"></div>
    </div>
  `;
}

// دالة بناء مستوى الآباء
function buildParentsLevel(parents) {
  if (!parents.length) return "";

  const parentsHTML = parents
    .map((member) => createMemberCard(member))
    .join("");

  return `
    <div class="parents-level">
      ${parentsHTML}
      ${parents.length === 2 ? '<div class="marriage-connector"></div>' : ""}
      <div class="level-connector"></div>
    </div>
  `;
}

// دالة بناء مستوى الأجداد العظام
function buildGreatGrandparentsLevel(greatGrandparents) {
  if (!greatGrandparents.length) return "";

  const greatGrandparentsHTML = greatGrandparents
    .map((member) => createMemberCard(member))
    .join("");

  return `
    <div class="great-grandparents-level">
      ${greatGrandparentsHTML}
      ${
        greatGrandparents.length >= 2
          ? '<div class="marriage-connector"></div>'
          : ""
      }
      <div class="level-connector"></div>
    </div>
  `;
}

// دالة بناء مستوى الآباء والأعمام
function buildParentsAndSiblingsLevel(parents, siblings) {
  if (!parents.length && !siblings.length) return "";

  // تجميع الآباء والأعمام في مجموعات عائلية
  const familyGroups = [];

  // مجموعة الآباء - التأكد من أن الأب والأم معاً
  if (parents.length > 0) {
    // ترتيب الآباء: الأب أولاً ثم الأم
    const sortedParents = parents.sort((a, b) => {
      if (a.relation === "father") return -1;
      if (b.relation === "father") return 1;
      return 0;
    });

    familyGroups.push({
      type: "parents",
      members: sortedParents,
    });
  }

  // مجموعات الأعمام (كل زوجين في مجموعة)
  const uncleAuntPairs = [];
  const remainingSiblings = [...siblings];

  while (remainingSiblings.length > 0) {
    const current = remainingSiblings.shift();
    const spouse = remainingSiblings.find(
      (s) =>
        (current.relation === "uncle" && s.relation === "aunt") ||
        (current.relation === "aunt" && s.relation === "uncle")
    );

    if (spouse) {
      remainingSiblings.splice(remainingSiblings.indexOf(spouse), 1);
      uncleAuntPairs.push([current, spouse]);
    } else {
      uncleAuntPairs.push([current]);
    }
  }

  uncleAuntPairs.forEach((pair) => {
    familyGroups.push({
      type: "siblings",
      members: pair,
    });
  });

  const groupsHTML = familyGroups
    .map((group) => {
      const membersHTML = group.members
        .map((member) => createMemberCard(member))
        .join("");

      return `
      <div class="family-group">
        ${membersHTML}
      </div>
    `;
    })
    .join("");

  return `
    <div class="parents-siblings-level">
      ${groupsHTML}
      <div class="parent-children-connections" data-level="parents"></div>
    </div>
  `;
}

// دالة بناء مستوى الأطفال
function buildChildrenLevel(children) {
  if (!children.length) return "";

  const childrenHTML = children
    .map((member) => createMemberCard(member))
    .join("");

  return `
    <div class="children-level">
      ${childrenHTML}
    </div>
  `;
}

// دالة بناء مستوى الأحفاد
function buildGrandchildrenLevel(grandchildren) {
  if (!grandchildren.length) return "";

  const grandchildrenHTML = grandchildren
    .map((member) => createMemberCard(member))
    .join("");

  return `
    <div class="grandchildren-level">
      ${grandchildrenHTML}
    </div>
  `;
}

// دالة إنشاء بطاقة العضو
function createMemberCard(member) {
  const genderClass = getGenderFromRelation(member.relation);

  // استخدام الصور الثابتة Frame 1410126454
  const defaultImage =
    genderClass === "female"
      ? "images/Frame 1410126454 (3).png" // للإناث
      : "images/Frame 1410126454.png"; // للذكور

  const relationInArabic = getRelationInArabic(member.relation);
  const birthYear = member.birth_date
    ? new Date(member.birth_date).getFullYear()
    : "";
  const deathYear = member.death_date
    ? new Date(member.death_date).getFullYear()
    : "";
  const dateRange = birthYear ? `${birthYear} - ${deathYear || "الآن"}` : "";

  return `
    <div class="tree-member ${genderClass}" data-member-id="${member.id}">
      <div class="member-avatar-container">
        <img src="${defaultImage}" 
             alt="${member.name || "عضو"}" 
             class="member-avatar ${genderClass}"
             style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover; background: white;">
      </div>
      <div class="member-name">${member.name || "غير محدد"}</div>
      <div class="member-relation">${relationInArabic}</div>
      ${dateRange ? `<div class="member-dates">${dateRange}</div>` : ""}
    </div>
  `;
}

// دالة تحديد الجنس من العلاقة
function getGenderFromRelation(relation) {
  const maleRelations = [
    "father",
    "son",
    "grandfather",
    "great_grandfather",
    "uncle",
    "brother",
    "grandson",
    "nephew",
    "cousin",
  ];
  const femaleRelations = [
    "mother",
    "daughter",
    "grandmother",
    "great_grandmother",
    "aunt",
    "sister",
    "granddaughter",
    "niece",
  ];

  if (maleRelations.includes(relation)) return "male";
  if (femaleRelations.includes(relation)) return "female";
  return "male"; // افتراضي
}

// دالة الحصول على الصورة الافتراضية
function getDefaultAvatar(gender) {
  return gender === "female"
    ? "images/Frame 1410126454 (3).png" // للإناث
    : "images/Frame 1410126454.png"; // للذكور
}

// دالة ترجمة العلاقات للعربية
function getRelationInArabic(relation) {
  const relations = {
    great_grandfather: "الجد الأكبر",
    great_grandmother: "الجدة الكبرى",
    father: "الأب",
    mother: "الأم",
    son: "الابن",
    daughter: "الابنة",
    grandfather: "الجد",
    grandmother: "الجدة",
    uncle: "العم",
    aunt: "العمة",
    brother: "الأخ",
    sister: "الأخت",
    grandson: "الحفيد",
    granddaughter: "الحفيدة",
    nephew: "ابن الأخ",
    niece: "ابنة الأخ",
    cousin: "ابن العم",
  };

  return relations[relation] || relation;
}

// دالة بناء خطوط الاتصال بين الآباء والأبناء مع الأسهم
function buildParentChildConnections(organizedMembers, allMembers) {
  // إنشاء حاوية للخطوط والأسهم
  const treeContainer = document.querySelector(".family-tree-template2");
  if (!treeContainer) return;

  // إزالة الخطوط القديمة إن وجدت
  const oldConnections = treeContainer.querySelector(
    ".tree-connections-overlay"
  );
  if (oldConnections) oldConnections.remove();

  // إنشاء حاوية جديدة للخطوط
  const connectionsOverlay = document.createElement("div");
  connectionsOverlay.className = "tree-connections-overlay";
  connectionsOverlay.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 5;
  `;

  // خطوط من الأجداد للآباء
  if (
    organizedMembers.grandparents.length > 0 &&
    (organizedMembers.parents.length > 0 ||
      organizedMembers.siblings.length > 0)
  ) {
    createAdvancedConnectionLines(
      connectionsOverlay,
      "grandparents",
      organizedMembers.grandparents,
      [...organizedMembers.parents, ...organizedMembers.siblings],
      allMembers
    );
  }

  // خطوط من الآباء للأطفال
  if (
    organizedMembers.parents.length > 0 &&
    organizedMembers.children.length > 0
  ) {
    createAdvancedConnectionLines(
      connectionsOverlay,
      "parents",
      organizedMembers.parents,
      organizedMembers.children,
      allMembers
    );
  }

  // خطوط من الأطفال للأحفاد
  if (
    organizedMembers.children.length > 0 &&
    organizedMembers.grandchildren.length > 0
  ) {
    createAdvancedConnectionLines(
      connectionsOverlay,
      "children",
      organizedMembers.children,
      organizedMembers.grandchildren,
      allMembers
    );
  }

  treeContainer.appendChild(connectionsOverlay);
}

// دالة إنشاء خطوط الاتصال المتقدمة مع الأسهم
function createAdvancedConnectionLines(
  overlay,
  fromLevel,
  parents,
  children,
  allMembers
) {
  console.log(`📐 رسم خطوط من ${fromLevel} إلى الأطفال...`);
  console.log("الآباء:", parents);
  console.log("الأطفال:", children);

  // الحصول على عناصر DOM للآباء والأطفال
  const parentElements = [];
  const childElements = [];

  // جمع عناصر الآباء
  parents.forEach((parent) => {
    const elem = document.querySelector(`[data-member-id="${parent.id}"]`);
    if (elem) {
      parentElements.push({ element: elem, member: parent });
      console.log(`✅ تم العثور على عنصر الوالد: ${parent.name}`);
    } else {
      console.warn(
        `⚠️ لم يتم العثور على عنصر للوالد: ${parent.name} (ID: ${parent.id})`
      );
    }
  });

  // جمع عناصر الأطفال
  children.forEach((child) => {
    const elem = document.querySelector(`[data-member-id="${child.id}"]`);
    if (elem) {
      childElements.push({ element: elem, member: child });
      console.log(`✅ تم العثور على عنصر الطفل: ${child.name}`);
    } else {
      console.warn(
        `⚠️ لم يتم العثور على عنصر للطفل: ${child.name} (ID: ${child.id})`
      );
    }
  });

  if (parentElements.length === 0 || childElements.length === 0) {
    console.warn("⚠️ لا توجد عناصر كافية لرسم الخطوط");
    return;
  }

  // تجميع الأطفال حسب الوالدين
  const childrenByParents = new Map();

  children.forEach((child) => {
    const parentKey = `${child.father_id || "none"}_${
      child.mother_id || "none"
    }`;
    if (!childrenByParents.has(parentKey)) {
      childrenByParents.set(parentKey, []);
    }
    childrenByParents.get(parentKey).push(child);
  });

  // رسم الخطوط لكل مجموعة والدين
  childrenByParents.forEach((childGroup, parentKey) => {
    const [fatherId, motherId] = parentKey.split("_");

    // العثور على عناصر الوالدين
    let parentCenterX = 0;
    let parentBottomY = 0;
    let parentCount = 0;

    if (fatherId !== "none") {
      const fatherElem = document.querySelector(
        `[data-member-id="${fatherId}"]`
      );
      if (fatherElem) {
        const rect = fatherElem.getBoundingClientRect();
        const containerRect = overlay.parentElement.getBoundingClientRect();
        parentCenterX += rect.left + rect.width / 2 - containerRect.left;
        parentBottomY = Math.max(
          parentBottomY,
          rect.bottom - containerRect.top
        );
        parentCount++;
      }
    }

    if (motherId !== "none") {
      const motherElem = document.querySelector(
        `[data-member-id="${motherId}"]`
      );
      if (motherElem) {
        const rect = motherElem.getBoundingClientRect();
        const containerRect = overlay.parentElement.getBoundingClientRect();
        parentCenterX += rect.left + rect.width / 2 - containerRect.left;
        parentBottomY = Math.max(
          parentBottomY,
          rect.bottom - containerRect.top
        );
        parentCount++;
      }
    }

    if (parentCount > 0) {
      parentCenterX /= parentCount;

      // رسم خط عمودي من الوالدين
      const verticalLine = document.createElement("div");
      verticalLine.style.cssText = `
        position: absolute;
        left: ${parentCenterX}px;
        top: ${parentBottomY}px;
        width: 3px;
        height: 40px;
        background: linear-gradient(to bottom, #4a90e2, #2196f3);
        transform: translateX(-50%);
        z-index: 5;
      `;
      overlay.appendChild(verticalLine);

      // إذا كان هناك أكثر من طفل، ارسم خط أفقي
      if (childGroup.length > 1) {
        // حساب مواضع الأطفال
        const childPositions = [];
        childGroup.forEach((child) => {
          const childElem = document.querySelector(
            `[data-member-id="${child.id}"]`
          );
          if (childElem) {
            const rect = childElem.getBoundingClientRect();
            const containerRect = overlay.parentElement.getBoundingClientRect();
            childPositions.push(
              rect.left + rect.width / 2 - containerRect.left
            );
          }
        });

        if (childPositions.length > 0) {
          const minX = Math.min(...childPositions);
          const maxX = Math.max(...childPositions);

          // خط أفقي يربط الأطفال
          const horizontalLine = document.createElement("div");
          horizontalLine.style.cssText = `
            position: absolute;
            left: ${minX}px;
            top: ${parentBottomY + 40}px;
            width: ${maxX - minX}px;
            height: 3px;
            background: linear-gradient(to right, #4a90e2, #2196f3, #4a90e2);
            z-index: 5;
          `;
          overlay.appendChild(horizontalLine);

          // خطوط عمودية وأسهم لكل طفل
          childGroup.forEach((child) => {
            const childElem = document.querySelector(
              `[data-member-id="${child.id}"]`
            );
            if (childElem) {
              const rect = childElem.getBoundingClientRect();
              const containerRect =
                overlay.parentElement.getBoundingClientRect();
              const childX = rect.left + rect.width / 2 - containerRect.left;
              const childTopY = rect.top - containerRect.top;

              // خط عمودي للطفل
              const childLine = document.createElement("div");
              childLine.style.cssText = `
                position: absolute;
                left: ${childX}px;
                top: ${parentBottomY + 43}px;
                width: 3px;
                height: ${childTopY - (parentBottomY + 43) - 5}px;
                background: linear-gradient(to bottom, #2196f3, #4caf50);
                transform: translateX(-50%);
                z-index: 5;
              `;
              overlay.appendChild(childLine);

              // سهم للطفل
              const arrow = document.createElement("div");
              arrow.style.cssText = `
                position: absolute;
                left: ${childX}px;
                top: ${childTopY - 8}px;
                transform: translateX(-50%);
                color: #4caf50;
                font-size: 16px;
                font-weight: bold;
                z-index: 6;
              `;
              arrow.innerHTML = "▼";
              overlay.appendChild(arrow);
            }
          });
        }
      } else if (childGroup.length === 1) {
        // طفل واحد - خط مباشر
        const child = childGroup[0];
        const childElem = document.querySelector(
          `[data-member-id="${child.id}"]`
        );
        if (childElem) {
          const rect = childElem.getBoundingClientRect();
          const containerRect = overlay.parentElement.getBoundingClientRect();
          const childX = rect.left + rect.width / 2 - containerRect.left;
          const childTopY = rect.top - containerRect.top;

          // خط مباشر للطفل الوحيد
          const directLine = document.createElement("div");
          directLine.style.cssText = `
            position: absolute;
            left: ${parentCenterX}px;
            top: ${parentBottomY + 40}px;
            width: 3px;
            height: ${childTopY - (parentBottomY + 40) - 5}px;
            background: linear-gradient(to bottom, #4a90e2, #4caf50);
            transform: translateX(-50%);
            z-index: 5;
          `;
          overlay.appendChild(directLine);

          // سهم للطفل الوحيد
          const arrow = document.createElement("div");
          arrow.style.cssText = `
            position: absolute;
            left: ${parentCenterX}px;
            top: ${childTopY - 8}px;
            transform: translateX(-50%);
            color: #4caf50;
            font-size: 18px;
            font-weight: bold;
            z-index: 6;
          `;
          arrow.innerHTML = "▼";
          overlay.appendChild(arrow);
        }
      }
    }
  });
}

// دالة إنشاء خطوط الاتصال القديمة (للتوافق)
function createConnectionLines(fromLevel, parents, children, allMembers) {
  const connectionsContainer = document.querySelector(
    `[data-level="${fromLevel}"]`
  );
  if (!connectionsContainer) return;

  let connectionsHTML = "";

  parents.forEach((parent, parentIndex) => {
    // البحث عن الأطفال المباشرين لهذا الوالد
    const directChildren = children.filter(
      (child) => child.father_id === parent.id || child.mother_id === parent.id
    );

    if (directChildren.length > 0) {
      // خط عمودي من الوالد
      connectionsHTML += `
        <div class="parent-line" style="
          position: absolute;
          left: ${(parentIndex + 1) * (100 / (parents.length + 1))}%;
          top: 100%;
          width: 2px;
          height: 40px;
          background: #4a90e2;
          transform: translateX(-50%);
          z-index: 5;
        "></div>
      `;

      // خط أفقي يربط الأطفال
      if (directChildren.length > 1) {
        const childPositions = directChildren.map((child) => {
          const childIndex = children.findIndex((c) => c.id === child.id);
          return (childIndex + 1) * (100 / (children.length + 1));
        });

        const minPos = Math.min(...childPositions);
        const maxPos = Math.max(...childPositions);

        connectionsHTML += `
          <div class="children-horizontal-line" style="
            position: absolute;
            left: ${minPos}%;
            top: calc(100% + 40px);
            width: ${maxPos - minPos}%;
            height: 2px;
            background: #4a90e2;
            z-index: 5;
          "></div>
        `;
      }

      // خطوط عمودية للأطفال
      directChildren.forEach((child) => {
        const childIndex = children.findIndex((c) => c.id === child.id);
        connectionsHTML += `
          <div class="child-line" style="
            position: absolute;
            left: ${(childIndex + 1) * (100 / (children.length + 1))}%;
            top: calc(100% + ${directChildren.length > 1 ? "42px" : "40px"});
            width: 2px;
            height: 20px;
            background: #4a90e2;
            transform: translateX(-50%);
            z-index: 5;
          "></div>
          <div class="child-arrow" style="
            position: absolute;
            left: ${(childIndex + 1) * (100 / (children.length + 1))}%;
            top: calc(100% + ${directChildren.length > 1 ? "60px" : "58px"});
            transform: translateX(-50%);
            color: #4a90e2;
            font-size: 14px;
            font-weight: bold;
            background: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #4a90e2;
            z-index: 6;
          ">↓</div>
        `;
      });
    }
  });

  connectionsContainer.innerHTML = connectionsHTML;
}

// دالة إعادة تحميل الجدول والشجرة
function reloadTableAndTree() {
  console.log("🔄 إعادة تحميل البيانات...");

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
        throw new Error(`خطأ في الخادم: ${res.status}`);
      }
      return await res.json();
    })
    .then((data) => {
      console.log("✅ تم تحميل البيانات بنجاح");

      // تحديث البيانات العامة
      allMembers = data.family_data_members_tree || [];
      originalMembers = [...allMembers];

      // إعادة رسم الجدول
      renderTablePage(currentPage);

      // إعادة تحميل الشجرة حسب قالب المستخدم
      loadUserTemplateAndRender();

      console.log("✅ تم تحديث الجدول والشجرة");
    })
    .catch((err) => {
      console.error("❌ خطأ في إعادة تحميل البيانات:", err);
      showMessage(`حدث خطأ في تحديث البيانات: ${err.message}`, "error");
    });
}

// دالة التحقق من العلاقات المرتبطة بالعضو
function checkMemberRelations(memberId) {
  if (!allMembers || allMembers.length === 0) {
    return { hasRelations: false, relations: [] };
  }

  const relations = [];
  const memberIdStr = memberId.toString();

  // البحث عن الأطفال
  const children = allMembers.filter(
    (member) =>
      member.father_id?.toString() === memberIdStr ||
      member.mother_id?.toString() === memberIdStr
  );

  if (children.length > 0) {
    relations.push(`${children.length} طفل/أطفال`);
  }

  // البحث عن الزوج/الزوجة
  const member = allMembers.find((m) => m.id?.toString() === memberIdStr);
  if (member) {
    let spouse = null;
    if (member.father_id && member.mother_id) {
      // البحث عن الأشقاء الذين لديهم نفس الأب والأم
      const siblings = allMembers.filter(
        (m) =>
          m.id?.toString() !== memberIdStr &&
          m.father_id?.toString() === member.father_id?.toString() &&
          m.mother_id?.toString() === member.mother_id?.toString()
      );

      if (siblings.length > 0) {
        relations.push(`${siblings.length} أخ/أخت`);
      }
    }
  }

  return {
    hasRelations: relations.length > 0,
    relations: relations,
  };
}

// دالة إظهار رسائل محسنة
function showMessage(message, type = "info") {
  // يمكن استبدالها بـ toast notification أو modal أفضل
  const prefix = {
    success: "✅ ",
    error: "❌ ",
    warning: "⚠️ ",
    info: "ℹ️ ",
  };

  alert((prefix[type] || "") + message);
}

// دالة عرض تفاصيل العضو
function showMemberDetails(memberId) {
  console.log("عرض تفاصيل العضو:", memberId);
  // يمكن إضافة modal أو صفحة تفاصيل هنا
  // مؤقتاً سنعرض رسالة
  showMessage(`سيتم عرض تفاصيل العضو رقم: ${memberId}`, "info");
}

// دالة عرض شجرة فارغة
function displayEmptyTreeTemplate2() {
  const treeContainer = document.getElementById("treeContainer");

  treeContainer.innerHTML = `
    <div class="family-tree-template2">
      <div class="text-center py-5">
        <i class="bi bi-people" style="font-size: 4rem; color: #ccc;"></i>
        <h4 class="mt-3 text-muted">لا توجد أفراد في العائلة بعد</h4>
        <p class="text-muted">ابدأ بإضافة أفراد العائلة لبناء شجرتك</p>
        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addUserModal">
          إضافة فرد جديد
        </button>
      </div>
    </div>
  `;
}

// دالة بسيطة لإضافة الخطوط والأسهم مباشرة
function addSimpleConnectors() {
  console.log("🎯 إضافة الخطوط والأسهم البسيطة...");

  const treeContainer = document.querySelector(".family-tree-template2");
  if (!treeContainer) {
    console.warn("⚠️ لم يتم العثور على حاوية الشجرة");
    return;
  }

  // إزالة الخطوط القديمة
  const oldSvg = treeContainer.querySelector(".simple-connectors-svg");
  if (oldSvg) oldSvg.remove();

  // إنشاء SVG للخطوط
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "simple-connectors-svg");
  svg.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 5;
  `;

  // الحصول على جميع المستويات
  const levels = {
    grandparents: document.querySelector(".grandparents-level"),
    parentsSiblings: document.querySelector(".parents-siblings-level"),
    children: document.querySelector(".children-level"),
  };

  // رسم خطوط من الأجداد للآباء
  if (levels.grandparents && levels.parentsSiblings) {
    drawLevelConnections(
      svg,
      levels.grandparents,
      levels.parentsSiblings,
      treeContainer
    );
  }

  // رسم خطوط من الآباء للأطفال
  if (levels.parentsSiblings && levels.children) {
    drawLevelConnections(
      svg,
      levels.parentsSiblings,
      levels.children,
      treeContainer
    );
  }

  treeContainer.appendChild(svg);
  console.log("✅ تم إضافة الخطوط والأسهم");
}

// دالة رسم الخطوط بين المستويات
function drawLevelConnections(svg, parentLevel, childLevel, container) {
  const containerRect = container.getBoundingClientRect();

  // الحصول على المجموعات العائلية في المستوى الأعلى
  const familyGroups = parentLevel.querySelectorAll(".family-group");
  const childCards = childLevel.querySelectorAll(".tree-member");

  if (familyGroups.length === 0 || childCards.length === 0) return;

  // لكل مجموعة عائلية، ارسم خط من مركزها
  familyGroups.forEach((group) => {
    const groupCards = group.querySelectorAll(".tree-member");
    if (groupCards.length === 0) return;

    // حساب مركز المجموعة العائلية
    let groupCenterX = 0;
    let groupBottomY = 0;

    groupCards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      groupCenterX += rect.left + rect.width / 2;
      groupBottomY = Math.max(groupBottomY, rect.bottom);
    });
    groupCenterX = groupCenterX / groupCards.length - containerRect.left;
    groupBottomY = groupBottomY - containerRect.top;

    // رسم خط عمودي من مركز المجموعة
    const verticalLine = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    verticalLine.setAttribute("x1", groupCenterX);
    verticalLine.setAttribute("y1", groupBottomY + 5);
    verticalLine.setAttribute("x2", groupCenterX);
    verticalLine.setAttribute("y2", groupBottomY + 35);
    verticalLine.setAttribute("stroke", "#B8C5D6");
    verticalLine.setAttribute("stroke-width", "2");
    svg.appendChild(verticalLine);
  });

  // حساب مواضع الأطفال
  const childPositions = [];
  childCards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    childPositions.push({
      x: rect.left + rect.width / 2 - containerRect.left,
      y: rect.top - containerRect.top,
    });
  });

  if (childPositions.length === 0) return;

  // حساب أسفل كل المجموعات
  let overallBottomY = 0;
  familyGroups.forEach((group) => {
    const groupCards = group.querySelectorAll(".tree-member");
    groupCards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      overallBottomY = Math.max(
        overallBottomY,
        rect.bottom - containerRect.top
      );
    });
  });

  // إذا كان هناك أكثر من طفل، ارسم خط أفقي
  if (childPositions.length > 1) {
    const minX = Math.min(...childPositions.map((p) => p.x));
    const maxX = Math.max(...childPositions.map((p) => p.x));

    const horizontalLine = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    horizontalLine.setAttribute("x1", minX);
    horizontalLine.setAttribute("y1", overallBottomY + 35);
    horizontalLine.setAttribute("x2", maxX);
    horizontalLine.setAttribute("y2", overallBottomY + 35);
    horizontalLine.setAttribute("stroke", "#B8C5D6");
    horizontalLine.setAttribute("stroke-width", "2");
    svg.appendChild(horizontalLine);
  }

  // رسم خطوط عمودية للأطفال مع أيقونة +
  childPositions.forEach((pos) => {
    // خط عمودي للطفل
    const childLine = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    childLine.setAttribute("x1", pos.x);
    childLine.setAttribute("y1", overallBottomY + 35);
    childLine.setAttribute("x2", pos.x);
    childLine.setAttribute("y2", pos.y - 15);
    childLine.setAttribute("stroke", "#B8C5D6");
    childLine.setAttribute("stroke-width", "2");
    svg.appendChild(childLine);

    // رسم دائرة مع علامة +
    const circleGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );

    // الدائرة الخلفية
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("cx", pos.x);
    circle.setAttribute("cy", pos.y - 15);
    circle.setAttribute("r", "10");
    circle.setAttribute("fill", "white");
    circle.setAttribute("stroke", "#B8C5D6");
    circle.setAttribute("stroke-width", "2");
    circleGroup.appendChild(circle);

    // علامة + محسنة
    const plusDiv = document.createElement("div");
    plusDiv.className = "node-plus2 btn px-2 py-2";
    plusDiv.setAttribute("data-bs-toggle", "modal");
    plusDiv.setAttribute("data-bs-target", "#addUserModal");
    plusDiv.textContent = "+";
    plusDiv.style.position = "absolute";
    plusDiv.style.left = pos.x - 15 + "px";
    plusDiv.style.top = pos.y - 25 + "px";
    plusDiv.style.zIndex = "10";

    // إضافة العنصر للحاوية بدلاً من SVG
    const treeContainer = document.querySelector(".family-tree-template2");
    if (treeContainer) {
      treeContainer.appendChild(plusDiv);
    }

    svg.appendChild(circleGroup);
  });
}

// تحديث دالة buildTemplate2FamilyTree لاستدعاء الخطوط البسيطة
function updateBuildTemplate2FamilyTree() {
  const originalFunc = buildTemplate2FamilyTree;
  window.buildTemplate2FamilyTree = function (members) {
    originalFunc.call(this, members);
    // إضافة الخطوط البسيطة بعد بناء الشجرة
    setTimeout(() => {
      addSimpleConnectors();
    }, 500);
  };
}

// تفعيل التحديث عند تحميل الصفحة
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", updateBuildTemplate2FamilyTree);
} else {
  updateBuildTemplate2FamilyTree();
}

// ================================
// RENDER TEMPLATE 3
// ================================

function renderTemplate3(treeData) {
  new Treant({
    chart: {
      container: "#treeContainer",
      rootOrientation: "NORTH", // الجذر فوق
      nodeAlign: "CENTER", // محاذاة في النص
      levelSeparation: 80, // مسافة بين المستويات
      siblingSeparation: 60, // مسافة بين الأخوة
      subTeeSeparation: 70, // مسافة بين الفروع
      connectors: {
        type: "straight", // خط مستقيم بين الأفراد
        style: {
          "stroke-width": 2,
          stroke: "#999",
        },
      },
    },
    nodeStructure: treeData,
  });
}

// ================================
// TRANSFORM TREE NODE (TEMPLATE 3)
// ================================

function transformTreeNode(node) {
  if (!node) return null;

  // تحديد الكلاس والألوان حسب نوع القرابة
  let nodeClass = "";
  let relationText = "";

  if (node.relation === "father") {
    nodeClass = "male-node";
    relationText = "أب";
  } else if (node.relation === "mother") {
    nodeClass = "female-node";
    relationText = "أم";
  } else if (node.relation === "son") {
    nodeClass = "male-child-node";
    relationText = "ابن";
  } else if (node.relation === "daughter") {
    nodeClass = "female-child-node";
    relationText = "ابنة";
  } else if (node.relation === "family") {
    nodeClass = "family-root";
    relationText = "العائلة";
  } else {
    nodeClass = "default-node";
    relationText = node.relation || "";
  }

  // تحديد الحالة
  const statusText = node.status === "deceased" ? "متوفي" : "على قيد الحياة";

  // صورة العضو
  let profileImage;
  if (node.profile_picture) {
    profileImage = `/storage/${node.profile_picture}`;
  } else {
    if (node.relation === "father" || node.relation === "son") {
      profileImage = "images/hugeicons_male-02.png";
    } else if (node.relation === "mother" || node.relation === "daughter") {
      profileImage = "images/hugeicons_female-02.png";
    } else {
      profileImage = "images/image (25).png"; // صورة افتراضية
    }
  }

  return {
    text: {
      name: node.text?.name || node.name || "غير محدد",
    },
    HTMLclass: nodeClass,
    innerHTML: `
      <div class="tree-node ${nodeClass}">
        <div class="node-image">
          <img src="${profileImage}" alt="">
        </div>
        <div class="node-info">
          <div class="node-name">${
            node.text?.name || node.name || "غير محدد"
          }</div>
          <div class="node-relation">${relationText}</div>
          <div class="node-status">${statusText}</div>
        </div>
      </div>
    `,
    children: node.children ? node.children.map(transformTreeNode) : [],
  };
}

// ================================
// LOAD TREE (FOR TEMPLATE 3)
// ================================

async function loadAndRenderTreeTemplate3() {
  try {
    const res = await fetch(
      "/api/tree_creator/family-tree-design",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    const data = await res.json();
    if (!data.tree) return;

    const treeData = transformTreeNode(data.tree);

    // عرض باستخدام Template 3 فقط
    renderTemplate3(treeData);
  } catch (err) {
    console.error("❌ خطأ في جلب بيانات الشجرة:", err);
  }
}

function buildTemplate3FamilyTree(members) {
  const treeContainer = document.getElementById("treeContainer");

  // تصنيف الأعضاء حسب الأجيال والعلاقات
  const organizedMembers = organizeMembersForTemplate2(members);

  // بناء HTML للشجرة الهرمية
  const treeHTML = `
    <div class="template3-family-tree">
      <div class="template3-level-title">شجرة العائلة الهرمية</div>
      
      <!-- مستوى الأجداد العظام -->
      ${
        organizedMembers.greatGrandparents.length > 0
          ? buildTemplate3Level(
              "الأجداد العظام",
              organizedMembers.greatGrandparents,
              "great-grandparents"
            )
          : ""
      }
      
      <!-- مستوى الأجداد -->
      ${buildTemplate3Level(
        "الأجداد",
        organizedMembers.grandparents,
        "grandparents"
      )}
      
      <!-- مستوى الآباء والأعمام -->
      ${buildTemplate3Level(
        "الآباء والأعمام",
        [...organizedMembers.parents, ...organizedMembers.siblings],
        "parents-siblings"
      )}
      
      <!-- مستوى الأطفال -->
      ${buildTemplate3Level("الأطفال", organizedMembers.children, "children")}
      
      <!-- مستوى الأحفاد -->
      ${
        organizedMembers.grandchildren.length > 0
          ? buildTemplate3Level(
              "الأحفاد",
              organizedMembers.grandchildren,
              "grandchildren"
            )
          : ""
      }
    </div>
  `;

  treeContainer.innerHTML = treeHTML;

  // إضافة خطوط الاتصال بعد رندر الشجرة
  setTimeout(() => {
    addTemplate3Connections();
  }, 500);
}

function buildTemplate3Level(title, members, levelClass) {
  if (!members.length) return "";

  const couplesAndSingles = groupTemplate3IntoCouples(members);

  const membersHTML = couplesAndSingles
    .map((group) => {
      if (group.length === 2) {
        return `
        <div class="template3-couple-container">
          ${group.map((member) => createTemplate3MemberCard(member)).join("")}
          <div class="template3-marriage-line">
            <div class="template3-marriage-heart">💖</div>
          </div>
        </div>
      `;
      } else {
        return `
        <div class="template3-single-container">
          ${createTemplate3MemberCard(group[0])}
        </div>
      `;
      }
    })
    .join("");

  return `
    <div class="template3-level ${levelClass}">
      <div class="template3-level-header">${title}</div>
      <div class="template3-members-container">
        ${membersHTML}
      </div>
    </div>
  `;
}

function createTemplate3MemberCard(member) {
  const genderClass = getGenderFromRelation(member.relation);

  const defaultImage =
    genderClass === "female"
      ? "images/Frame 1410126454 (3).png"
      : "images/Frame 1410126454.png";

  const relationInArabic = getRelationInArabic(member.relation);
  const birthYear = member.birth_date
    ? new Date(member.birth_date).getFullYear()
    : "";
  const deathYear = member.death_date
    ? new Date(member.death_date).getFullYear()
    : "";
  const dateRange = birthYear ? `${birthYear} - ${deathYear || "الآن"}` : "";

  return `
    <div class="template3-member-card ${genderClass}" data-member-id="${
    member.id
  }">
      <div class="template3-member-avatar-container">
        <img src="${defaultImage}" 
             alt="${member.name || "عضو"}" 
             class="template3-member-avatar ${genderClass}">
      </div>
      <div class="template3-member-name">${member.name || "غير محدد"}</div>
      <div class="template3-member-relation">${relationInArabic}</div>
      ${
        dateRange
          ? `<div class="template3-member-dates">${dateRange}</div>`
          : ""
      }
      <div class="template3-edit-btn" data-bs-toggle="modal" data-bs-target="#addUserModal">✏️</div>
    </div>
  `;
}

function groupTemplate3IntoCouples(members) {
  const couples = [];
  const processed = new Set();

  members.forEach((member) => {
    if (processed.has(member.id)) return;

    const spouse = members.find(
      (m) =>
        !processed.has(m.id) &&
        m.id !== member.id &&
        ((member.relation === "father" && m.relation === "mother") ||
          (member.relation === "mother" && m.relation === "father") ||
          (member.relation === "grandfather" && m.relation === "grandmother") ||
          (member.relation === "grandmother" && m.relation === "grandfather") ||
          (member.relation === "uncle" && m.relation === "aunt") ||
          (member.relation === "aunt" && m.relation === "uncle"))
    );

    if (spouse) {
      couples.push([member, spouse]);
      processed.add(member.id);
      processed.add(spouse.id);
    } else {
      couples.push([member]);
      processed.add(member.id);
    }
  });

  return couples;
}

function addTemplate3Connections() {
  const treeContainer = document.querySelector(".template3-family-tree");
  if (!treeContainer) return;

  const oldConnections = treeContainer.querySelector(
    ".template3-connections-overlay"
  );
  if (oldConnections) oldConnections.remove();

  const connectionsOverlay = document.createElement("div");
  connectionsOverlay.className = "template3-connections-overlay";
  connectionsOverlay.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 5;
  `;

  const levels = treeContainer.querySelectorAll(".template3-level");
  for (let i = 0; i < levels.length - 1; i++) {
    drawTemplate3LevelConnections(connectionsOverlay, levels[i], levels[i + 1]);
  }

  treeContainer.appendChild(connectionsOverlay);
}

function drawTemplate3LevelConnections(overlay, fromLevel, toLevel) {
  const fromRect = fromLevel.getBoundingClientRect();
  const toRect = toLevel.getBoundingClientRect();
  const containerRect = overlay.parentElement.getBoundingClientRect();

  const fromY = fromRect.bottom - containerRect.top;
  const toY = toRect.top - containerRect.top;
  const centerX = fromRect.left + fromRect.width / 2 - containerRect.left;

  const line = document.createElement("div");
  line.style.cssText = `
    position: absolute;
    left: ${centerX}px;
    top: ${fromY}px;
    width: 3px;
    height: ${toY - fromY}px;
    background: linear-gradient(to bottom, #9b59b6, #3498db);
    transform: translateX(-50%);
  `;

  const arrow = document.createElement("div");
  arrow.style.cssText = `
    position: absolute;
    left: ${centerX}px;
    top: ${toY - 10}px;
    transform: translateX(-50%);
    color: #3498db;
    font-size: 18px;
    font-weight: bold;
  `;
  arrow.innerHTML = "▼";

  overlay.appendChild(line);
  overlay.appendChild(arrow);
}

function displayEmptyTreeTemplate3() {
  const treeContainer = document.getElementById("treeContainer");

  treeContainer.innerHTML = `
    <div class="template3-family-tree">
      <div class="text-center py-5">
        <i class="bi bi-diagram-3-fill" style="font-size: 4rem; color: #9b59b6;"></i>
        <h4 class="mt-3 text-muted">القالب الهرمي</h4>
        <p class="text-muted">لا توجد أفراد في العائلة بعد</p>
        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addUserModal">
          إضافة فرد جديد
        </button>
      </div>
    </div>
  `;
}
