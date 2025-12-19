// ملف مشترك لوظيفة تسجيل الخروج
// يمكن استخدامه في جميع صفحات الموقع

// متغير لمنع التكرار
let logoutInitialized = false;
let isLoggingOut = false;

/**
 * إنشاء نظام إشعارات منسق
 */
function createNotificationSystem() {
    // التحقق من وجود النظام مسبقاً
    if (document.getElementById('logoutNotificationContainer')) {
        return;
    }

    // إنشاء حاوية الإشعارات
    const notificationContainer = document.createElement('div');
    notificationContainer.id = 'logoutNotificationContainer';
    notificationContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        font-family: 'Arial', sans-serif;
        direction: rtl;
    `;
    
    document.body.appendChild(notificationContainer);
    
    // إضافة CSS للإشعارات
    if (!document.getElementById('logoutNotificationStyles')) {
        const style = document.createElement('style');
        style.id = 'logoutNotificationStyles';
        style.textContent = `
            .logout-notification {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px 25px;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                margin-bottom: 15px;
                transform: translateX(400px);
                opacity: 0;
                transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.2);
                max-width: 350px;
                position: relative;
                overflow: hidden;
            }
            
            .logout-notification.show {
                transform: translateX(0);
                opacity: 1;
            }
            
            .logout-notification.success {
                background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            }
            
            .logout-notification.warning {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            }
            
            .logout-notification.info {
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            }
            
            .logout-notification::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
                animation: shimmer 2s infinite;
            }
            
            @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
            
            .logout-notification-header {
                display: flex;
                align-items: center;
                margin-bottom: 8px;
                font-weight: bold;
                font-size: 16px;
            }
            
            .logout-notification-icon {
                margin-left: 10px;
                font-size: 20px;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            
            .logout-notification-body {
                font-size: 14px;
                line-height: 1.4;
                opacity: 0.95;
            }
            
            .logout-notification-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: rgba(255,255,255,0.3);
                border-radius: 0 0 12px 12px;
                animation: progress 3s linear;
            }
            
            @keyframes progress {
                0% { width: 100%; }
                100% { width: 0%; }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * عرض إشعار منسق
 */
function showNotification(title, message, type = 'info', duration = 3000) {
    createNotificationSystem();
    
    const container = document.getElementById('logoutNotificationContainer');
    const notification = document.createElement('div');
    notification.className = `logout-notification ${type}`;
    
    // أيقونات حسب النوع
    const icons = {
        success: '✅',
        warning: '⚠️',
        info: 'ℹ️',
        error: '❌'
    };
    
    notification.innerHTML = `
        <div class="logout-notification-header">
            <span class="logout-notification-icon">${icons[type] || icons.info}</span>
            ${title}
        </div>
        <div class="logout-notification-body">${message}</div>
        <div class="logout-notification-progress"></div>
    `;
    
    container.appendChild(notification);
    
    // إظهار الإشعار مع تأثير
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // إخفاء الإشعار تلقائياً
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        notification.style.opacity = '0';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 400);
    }, duration);
    
    return notification;
}

/**
 * عرض مودال تأكيد منسق
 */
function showConfirmModal(title, message, onConfirm, onCancel) {
    // إنشاء المودال
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        backdrop-filter: blur(5px);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
        direction: rtl;
        font-family: 'Arial', sans-serif;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 16px;
            padding: 30px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            transform: scale(0.7);
            transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            text-align: center;
        " class="modal-content">
            <div style="
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                margin: 0 auto 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                color: white;
                animation: bounce 1s infinite alternate;
            ">🚪</div>
            
            <h3 style="
                margin: 0 0 15px;
                color: #333;
                font-size: 20px;
                font-weight: bold;
            ">${title}</h3>
            
            <p style="
                margin: 0 0 25px;
                color: #666;
                line-height: 1.5;
                font-size: 16px;
            ">${message}</p>
            
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button id="confirmBtn" style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: transform 0.2s ease;
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    نعم، تسجيل الخروج
                </button>
                
                <button id="cancelBtn" style="
                    background: #f8f9fa;
                    color: #666;
                    border: 2px solid #e9ecef;
                    padding: 12px 25px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s ease;
                " onmouseover="this.style.background='#e9ecef'" onmouseout="this.style.background='#f8f9fa'">
                    إلغاء
                </button>
            </div>
        </div>
    `;
    
    // إضافة CSS للأنيميشن
    const style = document.createElement('style');
    style.textContent = `
        @keyframes bounce {
            0% { transform: translateY(0); }
            100% { transform: translateY(-10px); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(modal);
    
    // إظهار المودال
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.querySelector('.modal-content').style.transform = 'scale(1)';
    }, 10);
    
    // ربط الأحداث
    modal.querySelector('#confirmBtn').onclick = () => {
        closeModal();
        if (onConfirm) onConfirm();
    };
    
    modal.querySelector('#cancelBtn').onclick = () => {
        closeModal();
        if (onCancel) onCancel();
    };
    
    // إغلاق عند النقر خارج المودال
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeModal();
            if (onCancel) onCancel();
        }
    };
    
    function closeModal() {
        modal.style.opacity = '0';
        modal.querySelector('.modal-content').style.transform = 'scale(0.7)';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, 300);
    }
}

/**
 * وظيفة تسجيل الخروج العامة
 * تبحث عن زر تسجيل الخروج وتضيف له الوظيفة
 */
function initializeLogoutButton() {
    // منع التكرار
    if (logoutInitialized) {
        console.log("زر تسجيل الخروج مُهيأ مسبقاً");
        return;
    }
    
    console.log("تهيئة زر تسجيل الخروج...");
    
    // البحث عن زر تسجيل الخروج بطرق متعددة
    const logoutSelectors = [
        '#logoutBtn',
        '.logout-btn',
        '[data-action="logout"]',
        'a[href*="logout"]'
    ];
    
    let logoutBtn = null;
    
    // البحث باستخدام جميع المحددات
    for (const selector of logoutSelectors) {
        logoutBtn = document.querySelector(selector);
        if (logoutBtn) {
            console.log(`تم العثور على زر تسجيل الخروج باستخدام: ${selector}`);
            break;
        }
    }
    
    if (logoutBtn) {
        // التحقق من عدم وجود event listener مسبق
        if (!logoutBtn.hasAttribute('data-logout-initialized')) {
            // إضافة علامة للتأكد من عدم التكرار
            logoutBtn.setAttribute('data-logout-initialized', 'true');
            
            // إضافة event listener
            logoutBtn.addEventListener('click', handleLogout, { once: false });
            
            console.log("تم ربط وظيفة تسجيل الخروج بنجاح");
            logoutInitialized = true;
        } else {
            console.log("زر تسجيل الخروج مُهيأ مسبقاً");
        }
    } else {
        console.warn("لم يتم العثور على زر تسجيل الخروج في هذه الصفحة");
    }
}

/**
 * معالج حدث النقر على زر تسجيل الخروج
 */
function handleLogout(e) {
    e.preventDefault();
    
    // منع التكرار أثناء عملية تسجيل الخروج
    if (isLoggingOut) {
        showNotification("تنبيه", "عملية تسجيل الخروج جارية بالفعل...", "warning", 2000);
        return;
    }
    
    console.log("تم النقر على زر تسجيل الخروج");
    
    // عرض مودال تأكيد منسق
    showConfirmModal(
        "تسجيل الخروج",
        "هل أنت متأكد من تسجيل الخروج؟ سيتم مسح جميع بياناتك المحفوظة.",
        () => {
            // عند التأكيد
            isLoggingOut = true;
            
            // تعطيل زر تسجيل الخروج مؤقتاً
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.style.pointerEvents = 'none';
                logoutBtn.style.opacity = '0.5';
                logoutBtn.textContent = 'جاري تسجيل الخروج...';
            }
            
            // عرض إشعار بدء العملية
            showNotification("جاري المعالجة", "جاري تسجيل الخروج ومسح البيانات...", "info", 2000);
            
            console.log("تأكيد تسجيل الخروج، بدء عملية المسح...");
            
            // تأخير قصير لضمان عرض الإشعار
            setTimeout(() => {
                performLogout();
            }, 500);
        },
        () => {
            // عند الإلغاء
            console.log("تم إلغاء تسجيل الخروج");
            showNotification("تم الإلغاء", "تم إلغاء عملية تسجيل الخروج", "info", 2000);
        }
    );
}

/**
 * تنفيذ عملية تسجيل الخروج الفعلية
 */
function performLogout() {
    try {
        console.log("بدء عملية مسح البيانات...");
        
        // مسح جميع البيانات من localStorage
        const itemsToRemove = [
            "authToken",
            "user", 
            "hasTreeData",
            "userRole",
            "familyData",
            "treeData",
            "userPreferences"
        ];
        
        let removedCount = 0;
        itemsToRemove.forEach(item => {
            if (localStorage.getItem(item)) {
                localStorage.removeItem(item);
                removedCount++;
                console.log(`✓ تم مسح: ${item}`);
            }
        });
        
        // مسح جميع cookies المتعلقة بالجلسة
        try {
            document.cookie.split(";").forEach(function(c) { 
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
            });
            console.log("✓ تم مسح cookies");
        } catch (cookieError) {
            console.warn("تحذير: لم يتم مسح cookies بالكامل:", cookieError);
        }
        
        console.log("✓ تم تسجيل الخروج بنجاح، إعادة التوجيه...");
        
        // عرض إشعار نجاح
        showNotification(
            "تم بنجاح!", 
            `تم تسجيل الخروج ومسح ${removedCount} عنصر من البيانات`, 
            "success", 
            2000
        );
        
        // إعادة التوجيه بعد عرض الإشعار
        setTimeout(() => {
            window.location.replace("Home.html");
        }, 1500);
        
    } catch (error) {
        console.error("خطأ أثناء تسجيل الخروج:", error);
        
        // عرض إشعار خطأ
        showNotification(
            "حدث خطأ", 
            "حدث خطأ أثناء تسجيل الخروج، سيتم إعادة التوجيه", 
            "error", 
            2000
        );
        
        // إعادة التوجيه حتى في حالة الخطأ
        setTimeout(() => {
            window.location.replace("Home.html");
        }, 1500);
    }
}

/**
 * فحص حالة تسجيل الدخول
 */
function checkLoginStatus() {
    const token = localStorage.getItem("authToken");
    const user = localStorage.getItem("user");
    
    if (!token || !user) {
        console.log("المستخدم غير مسجل دخول");
        return false;
    }
    
    console.log("المستخدم مسجل دخول");
    return true;
}

/**
 * تهيئة النظام عند تحميل الصفحة
 */
function initializeLogoutSystem() {
    // منع التكرار على مستوى النظام
    if (window.logoutSystemInitialized) {
        console.log("نظام تسجيل الخروج مُهيأ مسبقاً على مستوى النافذة");
        return;
    }
    
    console.log("تهيئة نظام تسجيل الخروج...");
    
    // فحص حالة تسجيل الدخول
    if (checkLoginStatus()) {
        // تهيئة زر تسجيل الخروج
        initializeLogoutButton();
        
        // تعيين علامة التهيئة على مستوى النافذة
        window.logoutSystemInitialized = true;
        console.log("✓ تم تهيئة نظام تسجيل الخروج بنجاح");
    } else {
        console.log("المستخدم غير مسجل دخول - لا حاجة لتهيئة زر تسجيل الخروج");
    }
}

// تشغيل النظام مرة واحدة فقط
if (!window.logoutEventListenersAdded) {
    // تشغيل النظام عند تحميل DOM
    document.addEventListener('DOMContentLoaded', initializeLogoutSystem);
    
    // تشغيل النظام أيضاً عند تحميل النافذة كـ backup
    window.addEventListener('load', initializeLogoutSystem);
    
    // علامة لمنع إضافة event listeners متعددة
    window.logoutEventListenersAdded = true;
    
    console.log("تم إضافة event listeners لنظام تسجيل الخروج");
}

// جعل الدوال متاحة عالمياً للاستخدام من صفحات أخرى
window.initializeLogoutButton = initializeLogoutButton;
window.handleLogout = handleLogout;
window.checkLoginStatus = checkLoginStatus;

console.log("تم تحميل نظام تسجيل الخروج المشترك");
