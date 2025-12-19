const token = localStorage.getItem("authToken");

function updateUIBasedOnAuth() {
    const token = localStorage.getItem("authToken");
    const before = document.getElementById("before");
    const after = document.getElementById("after");

    if (before && after) {
        before.style.display = token ? "none" : "flex";
        after.style.display = token ? "flex" : "none";
    }
}

window.onload = function () {
    const before = document.getElementById("before");
    const after = document.getElementById("after");

    updateUIBasedOnAuth();

    if (token) {
        if (before) before.style.display = "none";
        if (after) after.style.display = "flex";
    } else {
        if (before) before.style.display = "flex";
        if (after) after.style.display = "none";
    }
};

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

        // التحقق من وجود العناصر قبل تعديلها
        const descriptionEl = document.getElementById("description");
        const footerPhoneEl = document.getElementById("footerPhone");
        const footerEmailEl = document.getElementById("footerEmail");
        const footerYoutubeEl = document.getElementById("footerYoutube");
        const footerTwitterEl = document.getElementById("footerTwitter");
        const footerInstagramEl = document.getElementById("footerInstagram");
        const footerFacebookEl = document.getElementById("footerFacebook");

        if (descriptionEl) {
            descriptionEl.textContent =
                settings.platform_description ||
                "منصة رقمية تجمع القبائل والعائلات في مكان واحد، تتيح لك بناء شجرة عائلتك، استكشاف الجذور، متابعة المناسبات، والتواصل مع مجتمعك بكل سهولة.";
        }
        
        if (footerPhoneEl) {
            footerPhoneEl.textContent = settings.support_phone || "+966 59 533 8665";
        }
        
        if (footerEmailEl) {
            footerEmailEl.textContent = settings.support_email || "shaigratech@gmail.com";
        }

        if (footerYoutubeEl) {
            footerYoutubeEl.href = settings.youtube || "#";
        }
        
        if (footerTwitterEl) {
            footerTwitterEl.href = settings.twitter || "#";
        }
        
        if (footerInstagramEl) {
            footerInstagramEl.href = settings.instagram || "#";
        }
        
        if (footerFacebookEl) {
            footerFacebookEl.href = settings.facebook || "#";
        }

        console.log("تم تحديث إعدادات Footer بنجاح");
    } catch (error) {
        console.error("خطأ في تحديث Footer:", error);
    }
}

// نجعل الدالة متاحة في جميع الصفحات
window.updateFooterSettings = updateFooterSettings;

updateFooterSettings();

// دالة محسنة لعرض رسائل التنبيه
function showAlert(type, message) {
    // إنشاء العنصر إذا لم يكن موجوداً
    let alertElement = document.getElementById(
        type === "success" ? "successAlert" : "errorAlert"
    );

    if (!alertElement) {
        // إنشاء عنصر التنبيه إذا لم يكن موجوداً
        alertElement = document.createElement("div");
        alertElement.id = type === "success" ? "successAlert" : "errorAlert";
        alertElement.className = `alert ${type === "success" ? "alert-success" : "alert-danger"
            } mt-3`;
        alertElement.style.display = "none";

        // إضافة العنصر قبل الفورم
        const form = document.getElementById("activityForm");
        if (form) {
            form.parentNode.insertBefore(alertElement, form);
        }
    }

    alertElement.textContent = message;
    alertElement.style.display = "block";

    // التمرير للرسالة
    alertElement.scrollIntoView({ behavior: "smooth", block: "center" });

    // إخفاء الرسالة بعد 5 ثوانٍ
    setTimeout(() => {
        alertElement.style.display = "none";
    }, 5000);
}

function updateUIBasedOnAuth() {
    const token = localStorage.getItem("authToken");
    const before = document.getElementById("before");
    const after = document.getElementById("after");

    if (before && after) {
        before.style.display = token ? "none" : "flex";
        after.style.display = token ? "flex" : "none";
    }
}

window.onload = function () {
    updateUIBasedOnAuth();
    updateHeaderProfileImage();
};

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

document
    .getElementById("activityForm")
    .addEventListener("submit", async function (e) {
        e.preventDefault();

        // إخفاء أي رسائل تنبيه سابقة
        const existingAlerts = document.querySelectorAll(".alert");
        existingAlerts.forEach((alert) => (alert.style.display = "none"));

        // التحقق من وجود جميع الحقول المطلوبة
        const requiredFields = [
            "user_name",
            "user_email",
            "user_phone",
            "family_name",
            "user_message",
        ];
        for (let field of requiredFields) {
            const element = document.getElementById(field);
            if (!element || !element.value.trim()) {
                showAlert(
                    "error",
                    `الرجاء ملء حقل ${field === "user_name"
                        ? "الاسم"
                        : field === "user_email"
                            ? "البريد الإلكتروني"
                            : field === "user_phone"
                                ? "رقم الجوال"
                                : field === "family_name"
                                    ? "اسم العائلة"
                                    : "الرسالة"
                    }`
                );
                return;
            }
        }

        const data = {
            user_name: document.getElementById("user_name").value.trim(),
            user_email: document.getElementById("user_email").value.trim(),
            user_phone: document.getElementById("user_phone").value.trim(),
            family_name: document.getElementById("family_name").value.trim(),
            user_message: document.getElementById("user_message").value.trim(),
            plan: document.getElementById("plan").value,
        };

        // التحقق من صحة البريد الإلكتروني
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.user_email)) {
            showAlert("error", "الرجاء إدخال بريد إلكتروني صحيح");
            return;
        }

        // التحقق من رقم الجوال
        const phoneRegex = /^[0-9+\-\s()]{10,}$/;
        if (!phoneRegex.test(data.user_phone)) {
            showAlert("error", "الرجاء إدخال رقم جوال صحيح");
            return;
        }

        console.log("Data to send:", data);

        try {
            // الحصول على التوكن من localStorage
            const token = localStorage.getItem("authToken");

            const headers = {
                "Content-Type": "application/json",
                Accept: "application/json",
            };

            // إضافة التوكن إذا كان متوفراً
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            const response = await fetch("/api/activities", {
                method: "POST",
                headers: headers,
                body: JSON.stringify(data),
            });

            // معالجة الاستجابة
            if (!response.ok) {
                let errorMessage = "خطأ في إرسال البيانات";
                console.log("Data to send:", data);

                if (response.status === 401) {
                    errorMessage = "يجب تسجيل الدخول أولاً لإرسال طلب الانضمام";
                } else if (response.status === 422) {
                    try {
                        const errorData = await response.json();
                        if (errorData.errors) {
                            const errors = Object.values(errorData.errors).flat();
                            errorMessage = errors.join(", ");
                        } else {
                            errorMessage = errorData.message || errorMessage;
                        }
                    } catch (e) {
                        errorMessage = "خطأ في التحقق من البيانات";
                    }
                } else {
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorMessage;
                    } catch (e) {
                        errorMessage = `خطأ في الخادم (${response.status})`;
                    }
                }

                console.error("Server error:", errorMessage);
                showAlert("error", errorMessage);
                return;
            }

            const result = await response.json();
            showAlert(
                "success",
                result.message || "تم إرسال طلبك بنجاح! سنتواصل معك قريباً."
            );
            document.getElementById("activityForm").reset();
        } catch (err) {
            console.error("Network error:", err);
            let errorMessage = "حدث خطأ في الاتصال بالخادم";

            if (err.name === "TypeError" && err.message.includes("fetch")) {
                errorMessage = "تعذر الاتصال بالخادم. تأكد من اتصالك بالإنترنت";
            }

            showAlert("error", errorMessage);
        }
    });

document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll(".btn[data-plan]");

    buttons.forEach((button) => {
        button.addEventListener("click", function () {
            const plan = this.getAttribute("data-plan");
            const user = JSON.parse(localStorage.getItem("user"));
            const token = localStorage.getItem("authToken");

            if (!user || !token) {
                alert("يرجى تسجيل الدخول أولاً");
                window.location.href = "login.html";
                return;
            }

            // تحديد السعر والوصف
            let amount = 0;
            let description = "";

            if (plan === "advanced") {
                amount = 50 * 100;
                description = "Advanced Plan Subscription";
            } else if (plan === "custom") {
                amount = 100 * 100;
                description = "Custom Plan Subscription";
            } else if (plan === "featured") {
                amount = 200 * 100;
                description = "Featured Plan Subscription";
            }

            // تخزين الخطة المختارة محليًا
            localStorage.setItem("selectedPlan", plan);

            // تحديث الأسعار في المودال قبل فتحه
            const baseAmount = (amount && !isNaN(amount)) ? (amount / 100) : 0;
            if (typeof updatePaymentPrices === 'function') {
                updatePaymentPrices(baseAmount);
            }

            // عرض نموذج الدفع
            Moyasar.init({
                element: ".mysr-form",
                amount: amount,
                currency: "SAR",
                description: description,
                publishable_api_key: "pk_test_WeLyc8N5AuE4Nya2kab2nhmjLPnDts4mZvYAsF7Y",
                callback_url: "http://127.0.0.1:8001//start.html",
                supported_networks: ["visa", "mastercard", "mada"],
                methods: ["creditcard"],
                on_completed: async function (payment) {
                    // يتم تنفيذ هذا الجزء عند نجاح الدفع ✅
                    console.log("✅ Payment success:", payment);

                    // تحديد التواريخ
                    const startDate = new Date().toISOString().split("T")[0];
                    let endDate = new Date();
                    if (plan === "advanced") {
                        endDate.setMonth(endDate.getMonth() + 3);
                    } else {
                        endDate.setFullYear(endDate.getFullYear() + 1);
                    }

                    const subscriptionData = {
                        plan: plan,
                        start_date: startDate,
                        end_date: endDate.toISOString().split("T")[0],
                        auto_renew: false,
                        status: "active",
                    };

                    try {
                        // إرسال الاشتراك فقط بعد نجاح الدفع
                        const response = await fetch(
                            "/api/subscriptions",
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(subscriptionData),
                            }
                        );

                        const data = await response.json();

                        if (response.ok) {
                            alert(`تم الدفع والاشتراك في خطة ${plan} بنجاح ✅`);

                            // تحديث الدور لو الخطة متقدمة
                            if (["advanced", "custom", "featured"].includes(plan)) {
                                const updatedUser = { ...user, role: "tree_creator" };
                                localStorage.setItem("user", JSON.stringify(updatedUser));
                            }

                            // إخفاء نموذج الدفع
                            document.getElementById("paymentContainer").style.display =
                                "none";
                        } else {
                            alert(
                                `تم الدفع ولكن حدث خطأ في إنشاء الاشتراك: ${data.message || "خطأ غير معروف"
                                }`
                            );
                        }
                    } catch (error) {
                        console.error(error);
                        alert("تم الدفع ولكن حدث خطأ في الاتصال بالسيرفر.");
                    }
                },
            });

            // إعادة تهيئة حالة مودال الدفع (إخفاء رسائل الكوبون، إعادة تمكين الحقول، إعادة الضبط)
            try {
                const couponInput = document.getElementById('couponInput');
                const applyBtn = document.getElementById('applyCouponBtn');
                const couponError = document.getElementById('couponError');
                const couponSuccess = document.getElementById('couponSuccess');
                const discountValue = document.getElementById('discountValue');
                const totalValue = document.getElementById('totalValue');
                const originalPrice = document.getElementById('originalPrice');
                const moyasarForm = document.getElementById('moyasarForm');
                const freeBox = document.getElementById('freeSubscriptionBox');
                
                // إعادة التعيين الآمن
                if (couponError) couponError.style.display = 'none';
                if (couponSuccess) couponSuccess.style.display = 'none';
                if (couponInput) { couponInput.disabled = false; couponInput.value = ''; }
                if (applyBtn) { applyBtn.disabled = false; applyBtn.textContent = 'تطبيق'; applyBtn.style.backgroundColor = ''; }
                if (discountValue) discountValue.textContent = '0 ريال';
                
                // ضبط المبلغ المعروض إلى السعر الأساسي للحزمة
                const baseAmount = (amount && !isNaN(amount)) ? (amount / 100) : 0;
                
                // تحديث السعر الأصلي والمبلغ المطلوب
                if (originalPrice) originalPrice.textContent = baseAmount + ' ريال';
                if (totalValue) totalValue.textContent = baseAmount + ' ريال';
                
                if (moyasarForm) moyasarForm.style.display = 'block';
                if (freeBox) freeBox.style.display = 'none';
                
                // تحديث المتغيرات العامة إذا كانت موجودة
                if (typeof updatePaymentPrices === 'function') {
                    updatePaymentPrices(baseAmount);
                }
            } catch (e) { console.warn('Reset payment modal failed', e); }

            // عرض الصندوق
            document.getElementById("paymentContainer").style.display = "flex";
        });
    });

    // زر الإغلاق
    document.getElementById("closePayment").addEventListener("click", () => {
        document.getElementById("paymentContainer").style.display = "none";
    });
});
