const token = localStorage.getItem("authToken");
const user = JSON.parse(localStorage.getItem("user"));
window.USER_ID = user.id;

document.addEventListener("DOMContentLoaded", function () {
  if (!token || !user || user.role !== "tree_creator") {
    alert("❌ لا يمكنك الوصول إلى هذه الصفحة");
    window.location.href = "login.html";
  }

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

document.querySelectorAll(".subscribe-btn button").forEach((button) => {
  button.addEventListener("click", async function () {
    const plan = this.getAttribute("data-plan");
    const token = localStorage.getItem("authToken");
    const user = JSON.parse(localStorage.getItem("user"));

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(startDate.getMonth() + 1);

    const body = {
      user_id: user.id,
      plan: plan,
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
      auto_renew: false,
      status: "active",
    };

    try {
      const response = await fetch(
        "/api/tree_creator/subscriptions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        console.error("فشل:", data);
      } else {
        alert("تم الاشتراك بالخطة بنجاح");
        console.log(data);
      }
    } catch (error) {
      console.error("خطأ:", error);
    }
  });
});

let discount = 0;
let selectedPlan = null;

async function applyCoupon() {
  let code = document.getElementById("couponCode").value;
  try {
    const res = await fetch("/api/check-coupon", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ code }),
    });

    const data = await res.json();

    if (data.valid) {
      let plan = plans[selectedPlan];

      // لو خصم نسبة
      if (data.discount_percent) {
        discount = (plan.amount * data.discount_percent) / 100;
      }
      // لو خصم مبلغ ثابت
      else if (data.discount_amount) {
        discount = data.discount_amount;
      } else {
        discount = 0;
      }

      // تحديث عرض الخصم
      document.getElementById(
        "couponResult"
      ).innerText = `✅ تم تطبيق الخصم: ${discount} ريال`;

      // تحديث UI الملخص
      updateSummary(plan.amount);
    } else {
      document.getElementById("couponResult").innerText = data.message;
      discount = 0;
      updateSummary(plans[selectedPlan].amount);
    }
  } catch (err) {
    console.error("خطأ في التحقق من الكوبون", err);
  }
}

function updateSummary(originalAmount) {
  // السعر الأصلي
  document.getElementById("originalPrice").innerText = originalAmount + " ريال";

  // قيمة الخصم
  document.getElementById("discountValue").innerText =
    discount > 0 ? discount + " ريال" : "0 ريال";

  // المبلغ النهائي
  let finalAmount = originalAmount - discount;
  if (finalAmount < 0) finalAmount = 0;
  document.getElementById("finalPrice").innerText = finalAmount + " ريال";

  // إعادة تهيئة بوابة الدفع
  document.querySelector(".mysr-form").innerHTML =
    "<div id='moyasar-form'></div>";

  Moyasar.init({
    element: "#moyasar-form",
    amount: finalAmount,
    currency: "SAR",
    description: plans[selectedPlan].description,
    publishable_api_key: "pk_test_WeLyc8N5AuE4Nya2kab2nhmjLPnDts4mZvYAsF7Y",
    callback_url: "/api/payment/callback",
    supported_networks: ["visa", "mastercard", "mada"],
    methods: ["creditcard"],
    on_completed: async function (payment) {
      await savePaymentOnBackend(payment, selectedPlan);
    },
  });
}

const plans = {
  primary: { amount: 2000, description: "الاشتراك الأساسي" },
  advanced: { amount: 3000, description: "الاشتراك المتقدم" },
  custom: { amount: 5000, description: "الاشتراك المخصص" },
};

document.querySelectorAll(".btn-custom").forEach((btn) => {
  btn.addEventListener("click", function () {
    selectedPlan = this.dataset.plan;
    let plan = plans[selectedPlan];

    // افتح المودال
    let paymentModal = new bootstrap.Modal(
      document.getElementById("paymentModal")
    );
    paymentModal.show();

    // تحديث الملخص لأول مرة بدون خصم
    discount = 0;
    updateSummary(plan.amount);
  });
});

async function savePaymentOnBackend(payment, plan) {
  try {
    const response = await fetch("/api/save-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        payment_id: payment.id,
        status: payment.status,
        amount: payment.amount,
        plan: plan,
        discount: discount, // 🟢 إرسال الخصم كمان للباك إند
      }),
    });
    const data = await response.json();
    console.log("تم حفظ الدفع:", data);
  } catch (err) {
    console.error("خطأ في حفظ الدفع:", err);
  }
}

async function loadActivePromotions() {
  try {
    let res = await fetch("/api/promotions");
    let promotions = await res.json();

    let today = new Date();
    let activePromotions = promotions.filter((p) => {
      let start = new Date(p.start_date);
      let end = new Date(p.end_date);
      return p.is_active && today >= start && today <= end;
    });

    const container = document.getElementById("activePromotionsContainer");
    container.innerHTML = "";

    if (activePromotions.length === 0) return;

    activePromotions.forEach((promo) => {
      let discountText =
        promo.discount_type === "percentage"
          ? `خصم ${promo.discount_value}%`
          : `خصم ${promo.discount_value} ريال`;

      let card = `
        <div class="alert alert-warning shadow-sm p-4 rounded-4 d-flex align-items-center justify-content-between">
          <div>
            <h5 class="fw-bold mb-1">🎉 ${promo.title}</h5>
            <p class="mb-1">${promo.message}</p>
            <small class="text-muted">العرض ساري حتى ${promo.end_date}</small>
          </div>
          <div>
            <span class="badge bg-danger p-2 fs-6">${discountText}</span>
          </div>
        </div>
      `;
      container.innerHTML += card;
    });
  } catch (err) {
    console.error("❌ خطأ في تحميل العروض:", err);
  }
}

// 🟢 تحميل العروض أول ما الصفحة تفتح
document.addEventListener("DOMContentLoaded", loadActivePromotions);
