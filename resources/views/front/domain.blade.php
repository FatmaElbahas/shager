<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>حجز دومين لعائلتك</title>

    <!-- Css -->
    <link rel="stylesheet" href="{{ asset('front/css/all.min.css') }}">
    <link rel="stylesheet" href="{{ asset('front/css/bootstrap.min.css') }}">
    <link rel="stylesheet" href="{{ asset('front/css/domain.css') }}">

    <!-- tab image -->
    <link rel="icon" type="image/png" href="{{ asset('front/images/Asset 141.png') }}">

    <!-- Bootstrap Icons -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet">

    <!-- googlefont-->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display&display=swap" rel="stylesheet">

</head>

<body style="height: 100vh;">
    <div class="sidebar d-lg-flex flex-column" id="sidebar">
        <div class="logo p-3">
            <img src="{{ asset('front/images/Asset 80.svg') }}" alt="Logo" class="img-fluid">
        </div>
        <!-- Close Button -->
        <button id="close" class="btn btn-link sidebar-close">
            <i class="fas fa-times fa-lg"></i>
        </button>
        <ul class="nav flex-column px-3">
            <li class=" nav-item d-flex align-items-center gap-2 mt-3 ">
                <img src="{{ asset('front/images/Dashboard.png') }}" alt="" class="icon">
                <a href="{{ url('front/UserDashboard.html') }}" class="nav-link">الرئيسية</a>
            </li>
            <li class="nav-item d-flex align-items-center gap-2">
                <img src="{{ asset('front/images/hugeicons_tree-06.png') }}" alt="" class="icon">
                <a href="{{ url('front/shagertk.html') }}" class="nav-link">شجرتك</a>
            </li>
            <li class=" nav-item d-flex align-items-center gap-2 ">
                <img src="{{ asset('front/images/famicons_map-outline.png') }}" alt="" class="icon">
                <a href="{{ url('front/map.html') }}" class="nav-link">خريطة العائلة</a>
            </li>
            <li class="nav-item d-flex align-items-center gap-2">
                <img src="{{ asset('front/images/tabler_link-plus.png') }}" alt="" class="icon">
                <a href="{{ url('front/userevents.html') }}" class="nav-link">المناسبات </a>
            </li>
            <li class="nav-item d-flex align-items-center gap-2">
                <img src="{{ asset('front/images/iconamoon_news-light.png') }}" alt="" class="icon">
                <a href="{{ url('front/usernews.html') }}" class="nav-link">الاخبار</a>
            </li>
            <li class="nav-item d-flex align-items-center gap-2">
                <i class="fa-solid fa-user-plus icon" style="color: rgba(39, 58, 65, 1);"></i>
                <a href="{{ url('front/requests.html') }}" class="nav-link">طلبات الانضمام</a>
            </li>
            <li class="active nav-item d-flex align-items-center gap-2">
                <img src="{{ asset('front/images/icon-wrapper (1).png') }}" alt="" class="icon">
                <a href="{{ url('front/usersettings.html') }}" class="nav-link">الإعدادات</a>
            </li>
        </ul>
        <ul class="nav flex-column px-3">
            <li class="nav-item d-flex align-items-center gap-2 my-3">
                <img src="{{ asset('front/images/Frame (3).png') }}" alt="" class="icon">
                <a href="" class="nav-link text-danger">تسجيل الخروج</a>
            </li>
        </ul>
    </div>

    <!-- Content -->
    <div class="content">
        <!-- Navbar for mobile -->
        <nav class="navbar my-3 d-lg-none">
            <div class="container-fluid">
                <span class="navbar-brand fw-bold">حجز دومين لعائلتك</span>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#sidebar"
                    aria-controls="sidebar" aria-expanded="false" aria-label="Toggle navigation">
                    <i class="fas fa-bars text-dark"></i>
                </button>
            </div>
        </nav>

        <!-- header -->
        <h5 class="text-end fw-bold my-4" style="color: rgba(39, 58, 65, 1); font-size: 24px;">
            حجز دومين لعائلتك
        </h5>

        <div class="container my-5">
            <div class="row g-4">
                <!-- Sidebar -->
                <div class="col-lg-3">
                    <div class="profile-sidebar text-end">
                        <ul class="nav flex-column py-4">
                            <li class="nav-item">
                                <a class="nav-link" href="{{ url('front/usersettings.html') }}"
                                    style="color: rgba(123, 123, 123, 1);">البيانات
                                    الشخصية</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="{{ url('front/editPayments.html') }}" style="color: rgba(123, 123, 123, 1);">
                                    المدفوعات</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="{{ url('front/applyingcomplimant.html') }}"
                                    style="color: rgba(123, 123, 123, 1);">
                                    تقديم شكوي</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="{{ url('front/complimentresponse.html') }}"
                                    style="color: rgba(123, 123, 123, 1);">
                                    متابعة الشكاوى</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="{{ url('front/Help.html') }}" style="color: rgba(123, 123, 123, 1);">
                                    المساعدة</a>
                            </li>
                            <li class="nav-item">
                                <a class="active nav-link" href="{{ url('front/domain.html') }}" style="color: rgba(123, 123, 123, 1);">
                                    حجز دومين</a>
                            </li>
                            <li class="nav-item">
                                <button class="nav-link text-danger bg-transparent border-0" data-bs-toggle="modal"
                                    data-bs-target="#deleteModal" style="cursor:pointer;">
                                    <i class="bi bi-trash3 me-2"></i>
                                    حذف الحساب
                                </button>
                            </li>
                            <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel"
                                aria-hidden="true">
                                <div class="modal-dialog modal-dialog-centered">
                                    <div class="modal-content border-0 shadow-lg" style="border-radius: 20px;">
                                        <div class="modal-header border-0 pb-0">
                                            <div class="w-100 text-center">
                                                <div class="delete-icon mb-3">
                                                    <i class="bi bi-exclamation-triangle-fill text-danger"
                                                        style="font-size: 3rem;"></i>
                                                </div>
                                                <h4 class="modal-title fw-bold text-danger" id="deleteModalLabel">
                                                    تحذير: حذف الحساب
                                                </h4>
                                            </div>
                                            <button type="button" class="btn-close position-absolute top-0 end-0 m-3"
                                                data-bs-dismiss="modal" aria-label="إغلاق"></button>
                                        </div>
                                        <div class="modal-body text-center px-4 py-3">
                                            <div class="alert alert-warning border-0 mb-3"
                                                style="background: rgba(255, 193, 7, 0.1);">
                                                <p class="mb-2 fw-bold">⚠️ تنبيه مهم</p>
                                                <p class="mb-0 small">هذا الإجراء لا يمكن التراجع عنه</p>
                                            </div>
                                            <p class="text-muted mb-3">
                                                هل أنت متأكد تماماً من رغبتك في حذف حسابك؟
                                            </p>
                                            <div class="consequences-list text-start">
                                                <p class="small text-danger mb-2">سيتم حذف:</p>
                                                <ul class="small text-muted">
                                                    <li>جميع بياناتك الشخصية</li>
                                                    <li>شجرة العائلة الخاصة بك</li>
                                                    <li>جميع المناسبات والأخبار</li>
                                                    <li>الصور والملفات المرفوعة</li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div class="modal-footer border-0 justify-content-center pb-4">
                                            <button type="button"
                                                class="btn btn-outline-secondary rounded-pill px-4 me-2"
                                                data-bs-dismiss="modal">
                                                <i class="bi bi-x-circle me-1"></i>
                                                إلغاء
                                            </button>
                                            <button type="button" id="confirmDeleteBtn"
                                                class="btn btn-danger rounded-pill px-4">
                                                <i class="bi bi-trash3-fill me-1"></i>
                                                نعم، احذف الحساب نهائياً
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ul>
                    </div>
                </div>


                <!-- Main content -->
                <div class="col-lg-9">
                    <!-- Domain Search Section - Full Width -->
                    <div class="domain-search-card mb-4">
                        <div class="text-center mb-4">
                            <h2 class="domain-title">حجز دومين لعائلتك</h2>
                            <p class="domain-subtitle">ابحث عن الدومين المثالي لعائلتك</p>
                        </div>

                        <div class="domain-search-form">
                            <div class="input-group">
                                <input type="text" class="form-control domain-input"
                                    placeholder="ادخل اسم الدومين المطلوب" id="domainInput">
                                <select class="form-select domain-extension" id="domainExtension">
                                    <option value=".com">.com</option>
                                    <option value=".net">.net</option>
                                    <option value=".org">.org</option>
                                    <option value=".info">.info</option>
                                </select>
                            </div>
                            <button class="btn btn-search" id="searchBtn">
                                <i class="bi bi-search me-2"></i>
                                تحقق من التوفر
                            </button>
                        </div>
                    </div>

                    <!-- Search Results Section - Full Width -->
                    <div class="search-results-card">
                        <div class="results-header">
                            <h4 class="results-title">
                                <i class="bi bi-globe me-2"></i>
                                نتائج البحث
                            </h4>
                            <p class="results-subtitle">اختر الدومينات التي تريد حجزها</p>
                        </div>

                        <div class="search-results-grid" id="searchResults"
                            style="text-align: center !important; display: flex; justify-content: center;">
                            <!-- النتائج ستظهر هنا من Backend API -->
                            <div class="empty-search-state text-center py-5">
                                <i class="bi bi-search text-muted" style="font-size: 4rem;"></i>
                                <h4 class="text-muted mt-3">ابحث عن الدومين المطلوب</h4>
                                <p class="text-muted">أدخل اسم الدومين في الحقل أعلاه واضغط "تحقق من التوفر"</p>
                            </div>
                        </div>
                    </div>

                    <!-- Hosting Plans Section -->
                    <div class="server-hosting-card mt-4">
                        <div class="text-center mb-4">
                            <h4 class="hosting-title">
                                <i class="bi bi-server me-2"></i>
                                خطط الاستضافة
                            </h4>
                            <p class="hosting-subtitle">اختر خطة الاستضافة المناسبة لموقعك</p>
                        </div>

                        <div class="hosting-plans-grid">
                            <div class="hosting-plan" data-plan="basic" data-price="99">
                                <div class="plan-header">
                                    <h5 class="plan-name">الخطة الأساسية</h5>
                                    <div class="plan-price">99 ريال/شهر</div>
                                </div>
                                <div class="plan-features">
                                    <ul>
                                        <li><i class="bi bi-check-circle-fill"></i> 10 جيجا مساحة تخزين</li>
                                        <li><i class="bi bi-check-circle-fill"></i> نقل بيانات غير محدود</li>
                                        <li><i class="bi bi-check-circle-fill"></i> دعم فني 24/7</li>
                                        <li><i class="bi bi-check-circle-fill"></i> شهادة SSL مجانية</li>
                                    </ul>
                                </div>
                                <button class="btn btn-select-plan">اختيار الخطة</button>
                            </div>

                            <div class="hosting-plan featured" data-plan="premium" data-price="199">
                                <div class="popular-badge">الأكثر شعبية</div>
                                <div class="plan-header">
                                    <h5 class="plan-name">الخطة المميزة</h5>
                                    <div class="plan-price">199 ريال/شهر</div>
                                </div>
                                <div class="plan-features">
                                    <ul>
                                        <li><i class="bi bi-check-circle-fill"></i> 50 جيجا مساحة تخزين</li>
                                        <li><i class="bi bi-check-circle-fill"></i> نقل بيانات غير محدود</li>
                                        <li><i class="bi bi-check-circle-fill"></i> دعم فني متقدم</li>
                                        <li><i class="bi bi-check-circle-fill"></i> نسخ احتياطية يومية</li>
                                        <li><i class="bi bi-check-circle-fill"></i> CDN مجاني</li>
                                    </ul>
                                </div>
                                <button class="btn btn-select-plan">اختيار الخطة</button>
                            </div>

                            <div class="hosting-plan" data-plan="business" data-price="399">
                                <div class="plan-header">
                                    <h5 class="plan-name">خطة الأعمال</h5>
                                    <div class="plan-price">399 ريال/شهر</div>
                                </div>
                                <div class="plan-features">
                                    <ul>
                                        <li><i class="bi bi-check-circle-fill"></i> 200 جيجا مساحة تخزين</li>
                                        <li><i class="bi bi-check-circle-fill"></i> نقل بيانات غير محدود</li>
                                        <li><i class="bi bi-check-circle-fill"></i> دعم فني مخصص</li>
                                        <li><i class="bi bi-check-circle-fill"></i> نسخ احتياطية كل ساعة</li>
                                        <li><i class="bi bi-check-circle-fill"></i> أدوات تطوير متقدمة</li>
                                    </ul>
                                </div>
                                <button class="btn btn-select-plan">اختيار الخطة</button>
                            </div>
                        </div>
                    </div>

                    <!-- Summary Section -->
                    <div class="domain-summary-card mt-4">
                        <div class="row">
                            <div class="col-md-8">
                                <h5 class="summary-title">ملخص الطلب</h5>
                                <div class="selected-domains" id="selectedDomains">
                                    <!-- Selected domains will be populated here -->
                                </div>
                                <div class="selected-hosting mt-3" id="selectedHosting">
                                    <!-- Selected hosting will be populated here -->
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="summary-box">
                                    <div class="summary-row">
                                        <span>إجمالي الدومينات</span>
                                        <span id="domainsTotal">0 ريال</span>
                                    </div>
                                    <div class="summary-row">
                                        <span>إجمالي الاستضافة</span>
                                        <span id="hostingTotal">0 ريال</span>
                                    </div>
                                    <hr>
                                    <div class="summary-row total-row">
                                        <span>المجموع الكلي</span>
                                        <span id="totalAmount">0 ريال</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Duration Selection -->
                        <div class="duration-selection mt-4">
                            <h6 class="duration-title">مدة الحجز</h6>
                            <div class="duration-options">
                                <div class="duration-option active" data-duration="1">
                                    <span class="duration-text">سنة واحدة</span>
                                    <span class="duration-price">15 ريال</span>
                                </div>
                            </div>
                        </div>

                        <!-- Checkout Button -->
                        <div class="text-center mt-4">
                            <button class="btn btn-checkout" id="checkoutBtn">
                                متابعة الدفع
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal -->
            <div class="modal fade" id="paymentModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-md">
                    <div class="modal-content shadow-lg border-0" style="border-radius: 20px;">

                        <div class="modal-header border-0"
                            style="background: #273a41;border-top-left-radius: 20px; border-top-right-radius: 20px;">
                            <h1 class="modal-title fw-bold text-end w-100" style="background: #273a41; color: #dec080;">
                                اكمال عملية الدفع
                            </h1>
                            <button type="button" class="btn-close btn-white" data-bs-dismiss="modal"
                                aria-label="Close"></button>
                        </div>


                        <div class="modal-body p-5">
                            <div class="text-center mb-4">
                                <h6 class="fw-bold">ملخص الدفع</h6>
                                <p class="text-muted">راجع تفاصيل المبلغ قبل إتمام العملية</p>
                            </div>

                            <!-- تفاصيل الطلب -->
                            <div class="order-details mb-4">
                                <h6 class="mb-3">تفاصيل الطلب:</h6>
                                <div id="orderItemsList">
                                    <!-- سيتم ملء تفاصيل الطلب هنا -->
                                </div>
                            </div>

                            <!-- إدخال الكوبون -->
                            <div class="mb-3">
                                <label for="couponCode" class="form-label">هل لديك كوبون خصم؟</label>
                                <div class="input-group">
                                    <input type="text" id="couponCode" class="form-control"
                                        placeholder="ادخل الكود هنا">
                                    <button type="button" class="btn btn-primary" onclick="applyCoupon()">تطبيق</button>
                                </div>
                                <small id="couponResult" class="text-success mt-2 d-block"></small>
                            </div>

                            <!-- ملخص الأسعار -->
                            <div class="price-breakdown">
                                <div class="d-flex justify-content-between mb-2">
                                    <span>إجمالي الدومينات:</span>
                                    <span id="modalDomainsTotal">0 ريال</span>
                                </div>
                                <div class="d-flex justify-content-between mb-2">
                                    <span>إجمالي الاستضافة:</span>
                                    <span id="modalHostingTotal">0 ريال</span>
                                </div>
                                <div class="d-flex justify-content-between mb-2">
                                    <span>السعر الأصلي:</span>
                                    <span id="originalPrice">0 ريال</span>
                                </div>
                                <div class="d-flex justify-content-between mb-2">
                                    <span>الخصم:</span>
                                    <span id="discountValue" class="text-success">0 ريال</span>
                                </div>
                                <p class="text-success fw-bold" id="promotionMessage"></p>
                                <hr>
                                <div class="d-flex justify-content-between fw-bold fs-5">
                                    <span>المبلغ المطلوب:</span>
                                    <span id="finalPrice" class="text-primary">0 ريال</span>
                                </div>
                            </div>

                            <!-- نموذج الدفع -->
                            <div class="payment-form-container mt-4">
                                <div class="payment-header mb-3">
                                    <h6 class="mb-0">
                                        <i class="bi bi-credit-card me-2"></i>
                                        معلومات الدفع
                                    </h6>
                                    <small class="text-muted">جميع المعاملات مؤمنة ومشفرة</small>
                                </div>
                                <div class="mysr-form"></div>
                            </div>
                        </div>


                        <!-- Footer -->
                        <div class="modal-footer border-0 d-flex justify-content-between px-4 pb-4">
                            <small class="text-muted">🔒 الدفع مؤمن بواسطة Moyasar</small>
                            <button type="button" class="btn btn-outline-secondary px-4"
                                data-bs-dismiss="modal">إلغاء</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
</div>



    <!-- Js -->
    <script src="{{ asset('front/js/all.min.js') }}"></script>
    <script src="{{ asset('front/js/bootstrap.bundle.min.js') }}"></script>
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/moyasar-payment-form@2.1.1/dist/moyasar.umd.min.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/moyasar-payment-form@2.1.1/dist/moyasar.css" />
    <script src="{{ asset('front/js/domain.js') }}"></script>
</body>

</html>
