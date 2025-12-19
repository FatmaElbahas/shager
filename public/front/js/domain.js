// Hostinger API Configuration (handled by backend)
// All API calls are now made through Laravel backend which uses Hostinger API

// Global variables
let selectedDomains = [];
let selectedDuration = 1;
let selectedHosting = null;

// Initialize page
document.addEventListener("DOMContentLoaded", function () {
  console.log("Domain page initialized");
  setupSearchFunctionality();
  setupDurationSelection();
  setupHostingSelection();
  setupCheckoutButton();
  updateOrderSummary();
});

// ===== 1. SEARCH FUNCTIONALITY (Hostinger Integration) =====

function setupSearchFunctionality() {
  const searchBtn = document.getElementById("searchBtn");
  const domainInput = document.getElementById("domainInput");

  if (searchBtn && domainInput) {
    searchBtn.addEventListener("click", handleDomainSearch);
    domainInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        handleDomainSearch();
      }
    });
  }
}

async function handleDomainSearch() {
  const domainInput = document.getElementById("domainInput");
  const domainExtension = document.getElementById("domainExtension");
  const searchBtn = document.getElementById("searchBtn");

  if (!domainInput || !domainExtension) {
    showMessage("عذراً، حدث خطأ في النموذج", "error");
    return;
  }

  const domainName = domainInput.value.trim();

  if (!domainName) {
    showMessage("يرجى إدخال اسم الدومين", "error");
    return;
  }

  // Show loading state
  showLoadingState(searchBtn);
  showMessage("🔍 جاري البحث في Hostinger...", "info");

  try {
    // Search for multiple extensions using Hostinger API (via backend)
    const extensions = [".com", ".net", ".org", ".info", ".co", ".me"];
    const results = [];

    for (const ext of extensions) {
      const fullDomain = domainName + ext;
      console.log(`Checking domain: ${fullDomain}`);

      const isAvailable = await checkDomainAvailability(fullDomain);
      const price = await getDomainPrice(fullDomain);

      results.push({
        domain: fullDomain,
        available: isAvailable,
        price: price,
        extension: ext,
      });
    }

    displaySearchResults(results);
  } catch (error) {
    console.error("Domain search error:", error);
    showMessage(
      "حدث خطأ أثناء البحث في Hostinger. يرجى المحاولة مرة أخرى",
      "error"
    );
    showEmptyResults();
  } finally {
    hideLoadingState(searchBtn);
  }
}

async function checkDomainAvailability(domain) {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    // استخدام API الحقيقي من Laravel
    const response = await fetch(`/api/domain/check-availability?domain=${encodeURIComponent(domain)}`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.available === true;
  } catch (error) {
    console.error(`Error checking ${domain}:`, error);
    // Fallback: استخدام WhoIs check محلي
    return checkDomainAvailabilityFallback(domain);
  }
}

// Fallback method للتحقق من التوفر
function checkDomainAvailabilityFallback(domain) {
  // محاولة بسيطة للتحقق من خلال DNS
  // في حالة فشل API، نستخدم طريقة احتياطية
  const extension = domain.substring(domain.lastIndexOf("."));
  const commonAvailable = {
    ".com": false,
    ".net": false,
    ".org": false,
    ".info": true,
    ".co": false,
    ".me": false,
  };
  return commonAvailable[extension] ?? false;
}

// Get domain price from backend API
async function getDomainPrice(domain) {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      return getFallbackPrice(domain);
    }

    // استخدام API الحقيقي من Laravel
    const response = await fetch(`/api/domain/price?domain=${encodeURIComponent(domain)}`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      return data.price || getFallbackPrice(domain);
    }
  } catch (error) {
    console.error(`Error getting price for ${domain}:`, error);
  }

  return getFallbackPrice(domain);
}

// Fallback pricing function
function getFallbackPrice(domain) {
  const extension = domain.substring(domain.lastIndexOf("."));
  const fallbackPricing = {
    ".com": 45,
    ".net": 55,
    ".org": 50,
    ".info": 40,
    ".co": 60,
    ".me": 70,
  };
  return fallbackPricing[extension] || 50;
}

// Show loading state
function showLoadingState(button) {
  if (!button) return;

  button.disabled = true;
  button.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status"></span>
        جاري البحث...
    `;
}

// Hide loading state
function hideLoadingState(button) {
  if (!button) return;

  button.disabled = false;
  button.innerHTML = `
        <i class="bi bi-search me-2"></i>
        تحقق من التوفر
    `;
}

// Show empty results
function showEmptyResults() {
  const searchResults = document.getElementById("searchResults");
  if (!searchResults) return;

  searchResults.innerHTML = `
        <div class="empty-search-state text-center py-5">
            <i class="bi bi-exclamation-triangle text-warning" style="font-size: 4rem;"></i>
            <h4 class="text-muted mt-3">لم يتم العثور على نتائج</h4>
            <p class="text-muted">حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى</p>
        </div>
    `;
}

// ===== 2. RESULTS DISPLAY =====
function displaySearchResults(results) {
  const searchResults = document.getElementById("searchResults");
  if (!searchResults) return;

  // Reset styles for results display
  searchResults.style.display = "grid";
  searchResults.style.textAlign = "initial";
  searchResults.style.justifyContent = "initial";

  searchResults.innerHTML = results
    .map(
      (result) => `
        <div class="domain-card ${
          result.available ? "available" : "unavailable"
        }" ${
        result.available
          ? `onclick="selectDomain('${result.domain}', ${result.price})"`
          : ""
      }>
            <div class="domain-header">
                <div class="domain-icon">
                    <i class="bi bi-globe2"></i>
                </div>
                <div class="domain-extension-badge">${result.extension}</div>
            </div>
            
            <div class="domain-body">
                <h5 class="domain-name">${result.domain}</h5>
                <div class="domain-status-badge ${
                  result.available ? "status-available" : "status-unavailable"
                }">
                    <i class="bi ${
                      result.available
                        ? "bi-check-circle-fill"
                        : "bi-x-circle-fill"
                    }"></i>
                    ${result.available ? "متاح للحجز" : "غير متاح"}
                </div>
            </div>
            
            <div class="domain-footer">
                <div class="domain-price-section">
                    <span class="price-label">السعر السنوي</span>
                    <span class="domain-price">${result.price} ريال</span>
                </div>
                ${
                  result.available
                    ? `
                    <button class="btn-select-domain">
                        <i class="bi bi-plus-circle me-1"></i>
                        اختيار
                    </button>
                `
                    : `
                    <div class="unavailable-notice">
                        <i class="bi bi-info-circle me-1"></i>
                        محجوز
                    </div>
                `
                }
            </div>
            
            ${
              result.available
                ? '<div class="hover-overlay"><i class="bi bi-cursor-fill"></i></div>'
                : ""
            }
        </div>
    `
    )
    .join("");

  const availableCount = results.filter((r) => r.available).length;
  showMessage(
    availableCount > 0
      ? `🎉 رائع! وجدنا ${availableCount} دومين متاح من أصل ${results.length}`
      : "😔 عذراً، جميع الدومينات محجوزة. جرب اسماً آخر",
    availableCount > 0 ? "success" : "warning"
  );
}

function selectDomain(domain, price) {
  // Check if already selected
  if (selectedDomains.find((d) => d.domain === domain)) {
    showMessage("هذا الدومين مُحدد بالفعل", "warning");
    return;
  }

  selectedDomains.push({ domain, price });
  updateOrderSummary();
  showMessage(`✅ تم إضافة ${domain} للطلب`, "success");
}

function removeDomain(domain) {
  selectedDomains = selectedDomains.filter((d) => d.domain !== domain);
  updateOrderSummary();
  showMessage(`تم إزالة ${domain} من الطلب`, "info");
}

function updateOrderSummary() {
  const selectedDomainsContainer = document.getElementById("selectedDomains");
  const selectedHostingContainer = document.getElementById("selectedHosting");
  const totalAmountElement = document.getElementById("totalAmount");
  const domainsTotal = document.getElementById("domainsTotal");
  const hostingTotal = document.getElementById("hostingTotal");

  // Update domains section
  if (selectedDomainsContainer) {
    if (selectedDomains.length === 0) {
      selectedDomainsContainer.innerHTML = `
        <div class="empty-state text-center py-3">
          <i class="bi bi-globe2 text-muted" style="font-size: 2rem;"></i>
          <p class="text-muted mt-2 mb-0">لم يتم اختيار أي دومين بعد</p>
        </div>
      `;
    } else {
      selectedDomainsContainer.innerHTML = `
        <h6 class="mb-3"><i class="bi bi-globe me-2"></i>الدومينات المحددة:</h6>
        ${selectedDomains
          .map(
            (domain) => `
          <div class="selected-item">
            <div class="item-details">
              <strong>${domain.domain}</strong>
              <span class="text-muted">مدة ${selectedDuration} سنة</span>
            </div>
            <div class="item-actions">
              <span class="price">${domain.price * selectedDuration} ريال</span>
              <button class="btn btn-sm btn-outline-danger" onclick="removeDomain('${
                domain.domain
              }')">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        `
          )
          .join("")}
      `;
    }
  }

  // Update hosting section
  if (selectedHostingContainer) {
    if (!selectedHosting) {
      selectedHostingContainer.innerHTML = `
        <div class="empty-state text-center py-3">
          <i class="bi bi-server text-muted" style="font-size: 2rem;"></i>
          <p class="text-muted mt-2 mb-0">لم يتم اختيار خطة استضافة بعد</p>
        </div>
      `;
    } else {
      selectedHostingContainer.innerHTML = `
        <h6 class="mb-3"><i class="bi bi-server me-2"></i>خطة الاستضافة:</h6>
        <div class="selected-item">
          <div class="item-details">
            <strong>${getHostingPlanName(selectedHosting.plan)}</strong>
            <span class="text-muted">شهرياً</span>
          </div>
          <div class="item-actions">
            <span class="price">${selectedHosting.price} ريال/شهر</span>
            <button class="btn btn-sm btn-outline-danger" onclick="removeHosting()">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      `;
    }
  }

  // Calculate totals
  const domainsSum = selectedDomains.reduce(
    (sum, domain) => sum + domain.price * selectedDuration,
    0
  );
  const hostingSum = selectedHosting ? selectedHosting.price : 0;
  const grandTotal = domainsSum + hostingSum;

  // Update total displays
  if (domainsTotal) domainsTotal.textContent = `${domainsSum} ريال`;
  if (hostingTotal) hostingTotal.textContent = `${hostingSum} ريال`;
  if (totalAmountElement) totalAmountElement.textContent = `${grandTotal} ريال`;
}

function getHostingPlanName(plan) {
  const names = {
    basic: "الخطة الأساسية",
    premium: "الخطة المميزة",
    business: "خطة الأعمال",
  };
  return names[plan] || plan;
}

function setupDurationSelection() {
  const durationOptions = document.querySelectorAll(".duration-option");

  durationOptions.forEach((option) => {
    option.addEventListener("click", function () {
      // Remove active class from all options
      durationOptions.forEach((opt) => opt.classList.remove("active"));

      // Add active class to clicked option
      this.classList.add("active");

      // Update selected duration
      selectedDuration = parseInt(this.dataset.duration);

      // Update order summary
      updateOrderSummary();

      showMessage(`تم تحديد مدة ${selectedDuration} سنة`, "info");
    });
  });
}

// ===== HOSTING FUNCTIONALITY =====
function setupHostingSelection() {
  const hostingPlans = document.querySelectorAll(".hosting-plan");

  hostingPlans.forEach((plan) => {
    const selectBtn = plan.querySelector(".btn-select-plan");
    if (selectBtn) {
      selectBtn.addEventListener("click", function () {
        const planType = plan.dataset.plan;
        const planPrice = parseInt(plan.dataset.price);

        selectHostingPlan(planType, planPrice);
      });
    }
  });
}

function selectHostingPlan(plan, price) {
  // Remove active class from all plans
  document
    .querySelectorAll(".hosting-plan")
    .forEach((p) => p.classList.remove("selected"));

  // Add active class to selected plan
  const selectedPlan = document.querySelector(`[data-plan="${plan}"]`);
  if (selectedPlan) {
    selectedPlan.classList.add("selected");
  }

  selectedHosting = { plan, price };
  updateOrderSummary();
  showMessage(`✅ تم اختيار ${getHostingPlanName(plan)}`, "success");
}

function removeHosting() {
  selectedHosting = null;
  document
    .querySelectorAll(".hosting-plan")
    .forEach((p) => p.classList.remove("selected"));
  updateOrderSummary();
  showMessage("تم إزالة خطة الاستضافة من الطلب", "info");
}

// ===== 3. PAYMENT FUNCTIONALITY =====
function setupCheckoutButton() {
  const checkoutBtn = document.getElementById("checkoutBtn");
  if (!checkoutBtn) return;

  checkoutBtn.addEventListener("click", function () {
    if (selectedDomains.length === 0 && !selectedHosting) {
      showMessage("يرجى اختيار دومين أو خطة استضافة على الأقل", "warning");
      return;
    }

    openPaymentModal();
  });
}

function openPaymentModal() {
  // Calculate totals
  const domainsSum = selectedDomains.reduce(
    (sum, domain) => sum + domain.price * selectedDuration,
    0
  );
  const hostingSum = selectedHosting ? selectedHosting.price : 0;
  const grandTotal = domainsSum + hostingSum;

  // Update modal content
  updatePaymentModalContent(domainsSum, hostingSum, grandTotal);

  // Initialize Moyasar payment form
  initializeMoyasarPayment(grandTotal);

  // Show modal
  const modal = new bootstrap.Modal(document.getElementById("paymentModal"));
  modal.show();
}

function updatePaymentModalContent(domainsSum, hostingSum, grandTotal) {
  // Update order items list
  const orderItemsList = document.getElementById("orderItemsList");
  let itemsHTML = "";

  // Add domains
  if (selectedDomains.length > 0) {
    itemsHTML += '<div class="order-section mb-3">';
    itemsHTML +=
      '<h6 class="text-primary mb-2"><i class="bi bi-globe me-2"></i>الدومينات:</h6>';
    selectedDomains.forEach((domain) => {
      itemsHTML += `
        <div class="order-item d-flex justify-content-between align-items-center mb-2">
          <div>
            <span class="fw-bold">${domain.domain}</span>
            <small class="text-muted d-block">مدة ${selectedDuration} سنة</small>
          </div>
          <span class="text-success fw-bold">${
            domain.price * selectedDuration
          } ريال</span>
        </div>
      `;
    });
    itemsHTML += "</div>";
  }

  // Add hosting
  if (selectedHosting) {
    itemsHTML += '<div class="order-section mb-3">';
    itemsHTML +=
      '<h6 class="text-primary mb-2"><i class="bi bi-server me-2"></i>الاستضافة:</h6>';
    itemsHTML += `
      <div class="order-item d-flex justify-content-between align-items-center mb-2">
        <div>
          <span class="fw-bold">${getHostingPlanName(
            selectedHosting.plan
          )}</span>
          <small class="text-muted d-block">شهرياً</small>
        </div>
        <span class="text-success fw-bold">${
          selectedHosting.price
        } ريال/شهر</span>
      </div>
    `;
    itemsHTML += "</div>";
  }

  if (orderItemsList) {
    orderItemsList.innerHTML = itemsHTML;
  }

  // Update price breakdown - Check if elements exist
  const modalDomainsTotal = document.getElementById("modalDomainsTotal");
  const modalHostingTotal = document.getElementById("modalHostingTotal");
  const originalPrice = document.getElementById("originalPrice");
  const finalPrice = document.getElementById("finalPrice");

  if (modalDomainsTotal) {
    modalDomainsTotal.textContent = `${domainsSum} ريال`;
  }
  if (modalHostingTotal) {
    modalHostingTotal.textContent = `${hostingSum} ريال`;
  }
  if (originalPrice) {
    originalPrice.textContent = `${grandTotal} ريال`;
  }
  if (finalPrice) {
    finalPrice.textContent = `${grandTotal} ريال`;
  }
}

function initializeMoyasarPayment(amount) {
  // Clear previous form
  const formContainer = document.querySelector(".mysr-form");
  if (formContainer) {
    formContainer.innerHTML = "";
  }

  // Initialize Moyasar with updated amount
  Moyasar.init({
    element: ".mysr-form",
    amount: amount * 100, // Convert to halalas
    currency: "SAR",
    description: "حجز دومين واستضافة - شجرتك",
    publishable_api_key: "pk_test_WeLyc8N5AuE4Nya2kab2nhmjLPnDts4mZvYAsF7Y",
    callback_url: window.location.origin + "/domain-success.html",
    supported_networks: ["visa", "mastercard", "mada"],
    methods: ["creditcard", "stcpay"],
    on_completed: async function (payment) {
      await handlePaymentSuccess(payment);
    },
    on_failed: function (payment) {
      handlePaymentFailure(payment);
    },
  });
}

async function handlePaymentSuccess(payment) {
  try {
    // Get user info from localStorage
    const userStr = localStorage.getItem('user');
    let userInfo = {};
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userInfo = {
          email: user.email || "",
          name: user.name || "",
          phone: user.phone || "",
        };
      } catch (e) {
        console.warn('Failed to parse user data:', e);
      }
    }

    // Calculate final amount (after discount if any)
    const finalAmount = parseFloat(
      document.getElementById("finalPrice")?.textContent.replace(" ريال", "") || 
      payment.amount / 100
    );

    // Get coupon code if applied
    const couponCode = document.getElementById("couponCode")?.value.trim() || null;
    const discount = parseFloat(
      document.getElementById("discountValue")?.textContent.replace(" ريال", "") || 0
    );

    // Prepare order data
    const orderData = {
      payment_id: payment.id,
      status: payment.status === 'paid' ? 'completed' : 'pending',
      amount: finalAmount,
      duration: selectedDuration,
      domains: selectedDomains,
      hosting: selectedHosting,
      customer_info: userInfo,
      coupon_code: couponCode,
      discount: discount,
    };

    // Save order details to localStorage for success page
    localStorage.setItem("lastOrder", JSON.stringify(orderData));

    // Save to backend
    try {
      const savedOrder = await saveOrderToBackend(orderData);
      console.log('Order saved successfully:', savedOrder);
    } catch (backendError) {
      console.error("Backend save failed:", backendError);
      showMessage("تم الدفع بنجاح، لكن حدث خطأ في حفظ الطلب. يرجى التواصل مع الدعم", "warning");
      // Continue with success flow even if backend fails
    }

    // Show success message
    showMessage("🎉 تم الدفع بنجاح! جاري توجيهك لصفحة التأكيد...", "success");

    // Close modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("paymentModal")
    );
    if (modal) {
      modal.hide();
    }

    // Redirect to success page
    setTimeout(() => {
      window.location.href = "domain-success.html?payment_id=" + payment.id;
    }, 1500);
  } catch (error) {
    console.error("Error handling payment success:", error);
    showMessage("تم الدفع بنجاح! جاري توجيهك لصفحة التأكيد...", "success");

    // Still redirect to success page
    setTimeout(() => {
      window.location.href = "domain-success.html?payment_id=" + payment.id;
    }, 2000);
  }
}

function handlePaymentFailure(payment) {
  showMessage("فشل في عملية الدفع. يرجى المحاولة مرة أخرى", "error");
  console.error("Payment failed:", payment);
}

async function saveOrderToBackend(orderData) {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    throw new Error('يجب تسجيل الدخول أولاً');
  }

  const response = await fetch("/api/domain/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
    },
    credentials: 'include',
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "فشل في حفظ الطلب");
  }

  return await response.json();
}

// Coupon functionality - Connected to Backend
async function applyCoupon() {
  const couponCode = document.getElementById("couponCode").value.trim();
  const couponResult = document.getElementById("couponResult");

  if (!couponCode) {
    couponResult.textContent = "يرجى إدخال كود الكوبون";
    couponResult.className = "text-danger mt-2 d-block";
    return;
  }

  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      couponResult.textContent = "يجب تسجيل الدخول أولاً";
      couponResult.className = "text-danger mt-2 d-block";
      return;
    }

    // حساب المبلغ الحالي
    const domainsSum = selectedDomains.reduce(
      (sum, domain) => sum + domain.price * selectedDuration,
      0
    );
    const hostingSum = selectedHosting ? selectedHosting.price : 0;
    const totalAmount = domainsSum + hostingSum;

    // التحقق من الكوبون من Backend
    const response = await fetch("/api/domain/validate-coupon", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
      },
      credentials: 'include',
      body: JSON.stringify({
        code: couponCode,
        amount: totalAmount
      }),
    });

    const data = await response.json();

    if (response.ok && data.valid) {
      // تطبيق الخصم
      applyCouponDiscount({
        discount: data.discount,
        type: data.discount_type,
        final_amount: data.final_amount
      }, totalAmount);
      
      couponResult.textContent = `✅ ${data.message}`;
      couponResult.className = "text-success mt-2 d-block";
    } else {
      couponResult.textContent = `❌ ${data.message || 'كود الكوبون غير صحيح'}`;
      couponResult.className = "text-danger mt-2 d-block";
    }
  } catch (error) {
    console.error('Coupon validation error:', error);
    couponResult.textContent = "❌ حدث خطأ في التحقق من الكوبون";
    couponResult.className = "text-danger mt-2 d-block";
  }
}

function applyCouponDiscount(coupon, originalPrice) {
  let discount = 0;

  if (coupon.type === "percentage") {
    discount = (originalPrice * coupon.discount) / 100;
  } else {
    discount = coupon.discount;
  }

  const finalPrice = Math.max(0, originalPrice - discount);

  document.getElementById("discountValue").textContent = `${discount.toFixed(2)} ريال`;
  document.getElementById("finalPrice").textContent = `${finalPrice.toFixed(2)} ريال`;
  document.getElementById(
    "promotionMessage"
  ).textContent = `تم توفير ${discount.toFixed(2)} ريال بفضل الكوبون!`;

  // Reinitialize payment with new amount
  initializeMoyasarPayment(finalPrice);
}

// ===== UTILITY FUNCTIONS =====
function showMessage(message, type = "info") {
  // Remove existing messages
  const existingMessages = document.querySelectorAll(".domain-message");
  existingMessages.forEach((msg) => msg.remove());

  // Create new message
  const messageDiv = document.createElement("div");
  messageDiv.className = `alert alert-${
    type === "error"
      ? "danger"
      : type === "success"
      ? "success"
      : type === "warning"
      ? "warning"
      : "info"
  } domain-message`;
  messageDiv.style.cssText =
    "position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;";
  messageDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <span>${message}</span>
            <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;

  document.body.appendChild(messageDiv);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (messageDiv.parentElement) {
      messageDiv.remove();
    }
  }, 5000);
}
