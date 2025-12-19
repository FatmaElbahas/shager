(function() {
    // 1. CSS Styles
    const navbarStyles = `
        /* Notifications Popper - Click & Design Update */
        .notif-wrapper {
            position: relative;
            display: inline-block;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .notif-popup {
            display: none;
            position: absolute;
            top: 140%;
            left: -20px;
            width: 380px;
            max-height: 70vh;
            overflow-y: auto;
            background: #ffffff;
            border-radius: 20px;
            box-shadow: 0 15px 50px rgba(0,0,0,0.15);
            padding: 25px;
            z-index: 1200;
            cursor: default;
            direction: rtl;
            border: 1px solid #f1f1f1;
            color: #000!important;
        }
        
        .notif-popup::before {
            content: "";
            position: absolute;
            top: -10px;
            right: 25px;
            border-width: 10px;
            border-style: solid;
            border-color: transparent transparent #ffffff transparent;
        }

        .notif-header {
            font-size: 20px;
            font-weight: 800;
            color: #000;
            margin-bottom: 25px;
            text-align: right;
            font-family: 'Tajawal', sans-serif;
        }

        .notif-item {
            display: flex;
            align-items: flex-start;
            gap: 15px;
            padding-bottom: 20px;
            margin-bottom: 20px;
            border-bottom: 1px solid #f5f5f5;
            position: relative;
        }
        .notif-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }

        .notif-item .icon-box {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            flex-shrink: 0;
            color: #fff !important;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }
        
        .bg-gold { background-color: #d69e2e !important; }
        .bg-blue { background-color: #3182ce !important; }
        .bg-green { background-color: #38a169 !important; }
        .bg-red { background-color: #e53e3e !important; }
        .bg-purple { background-color: #805ad5 !important; }
        .bg-pink { background-color: #d53f8c !important; }

        .notif-item .notif-content {
            flex: 1;
            padding-left: 10px;
            color: #333 !important;
        }
        
        .notif-item .notif-title {
            font-weight: 800;
            font-size: 15px;
            color: #b7924f !important;
            margin-bottom: 5px;
            display: block;
        }
        
        .notif-item .notif-body {
            font-size: 13px;
            color: #444 !important;
            line-height: 1.5;
            display: block;
        }
        
        .notif-item .notif-time {
            font-size: 12px;
            color: #666 !important;
            white-space: nowrap;
            margin-top: 2px;
            align-self: flex-start;
        }
    `;

    // 2. HTML Structure
    const navbarHTML = `
        <div class="custom-container mt-4">
            <div class="d-flex align-items-center bg-white py-3 rounded-pill">
                <div class="search-bar gap-3 d-flex align-items-center position-relative">
                    <i class="bi bi-search search-icon px-3 position-absolute"></i>
                    <input type="search" id="searchButton" class="form-control search-input rounded-pill" placeholder="البحث ..">
                    <div class="notif-wrapper position-relative ms-3">
                        <div id="notifIcon" class="notif-icon" style="cursor:pointer;">
                            <i class="bi bi-bell-fill" style="font-size:22px;color:#ff9800;"></i>
                            <span id="notifDot" style="width:10px;height:10px;background:red;border-radius:50%;position:absolute;top:-2px;right:-2px;display:none;"></span>
                        </div>
                        <div id="notifPopup" class="notif-popup">
                            <h6 class="notif-header">الإشعارات</h6>
                            <div id="notifList"></div>
                        </div>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-3 mx-4">
                    <a href="settings.html"> <img id="platformLogo" src="images/Asset 80.png" alt="Logo" class="img-fluid rounded-pill" style="width: 120px;object-fit: cover;">
                    </a>
                </div>
            </div>
        </div>
    `;

    // 3. Main Injection Logic
    function initNavbar() {
        // Inject CSS
        const styleSheet = document.createElement("style");
        styleSheet.innerText = navbarStyles;
        document.head.appendChild(styleSheet);

        // Inject HTML
        const placeholder = document.getElementById('navbar-placeholder');
        if (placeholder) {
            placeholder.innerHTML = navbarHTML;
        } else {
            console.warn('Navbar placeholder not found. Navbar injection skipped.');
            return;
        }

        // Initialize Notifications Logic
        setupNotificationsPopper();
    }

    // 4. Notification Logic
    function setupNotificationsPopper() {
        const icon = document.getElementById('notifIcon');
        const popup = document.getElementById('notifPopup');
        const list = document.getElementById('notifList');
        const dot = document.getElementById('notifDot');
        let isOpen = false;

        // Mock Data
        const notifications = [
            {
                id: 1,
                title: "تم تسجيل مستخدم جديد",
                body: "قام محمد أحمد بإنشاء حساب جديد في المنصة.",
                time: "منذ 5 دقائق",
                icon: "bi-person-plus-fill",
                color: "bg-blue"
            },
            {
                id: 2,
                title: "عملية دفع ناجحة",
                body: "تم استلام دفعة بقيمة 500 ريال من شركة الأمل.",
                time: "منذ 2 ساعة",
                icon: "bi-cash-stack",
                color: "bg-green"
            },
            {
                id: 3,
                title: "تنبيه النظام",
                body: "سيتم إجراء صيانة دورية للموقع غداً الساعة 12 ص.",
                time: "منذ 4 ساعات",
                icon: "bi-exclamation-triangle-fill",
                color: "bg-gold"
            },
            {
                id: 4,
                title: "عيد ميلاد سعيد!",
                body: "يوافق اليوم عيد ميلاد العضو سارة علي.",
                time: "منذ 6 ساعات",
                icon: "bi-gift-fill",
                color: "bg-pink"
            },
            {
                id: 5,
                title: "رسالة جديدة",
                body: "لديك رسالة جديدة من الدعم الفني.",
                time: "منذ يوم واحد",
                icon: "bi-envelope-fill",
                color: "bg-purple"
            }
        ];

        // Render
        function renderNotifications() {
            if(!list) return;
            list.innerHTML = '';
            if(notifications.length === 0) {
                list.innerHTML = '<div class="text-center p-3 text-muted">لا توجد إشعارات جديدة</div>';
                if(dot) dot.style.display = 'none';
                return;
            }
            
            if(dot) dot.style.display = 'block';

            notifications.forEach(notif => {
                const div = document.createElement('div');
                div.className = 'notif-item';
                div.style.cursor = 'pointer'; 
                div.onclick = () => window.location.href = 'nafication.html'; 
                
                div.innerHTML = `
                    <div class="icon-box ${notif.color}">
                        <i class="bi ${notif.icon}"></i>
                    </div>
                    <div class="notif-content">
                        <span class="notif-title">${notif.title}</span>
                        <span class="notif-body">${notif.body}</span>
                        <div class="notif-time">${notif.time}</div>
                    </div>
                `;
                list.appendChild(div);
            });
        }

        // Toggle
        if(icon) {
            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                isOpen = !isOpen;
                if(isOpen) {
                    renderNotifications();
                    if(popup) {
                        popup.style.display = 'block';
                        popup.style.animation = 'fadeIn 0.2s ease-out';
                    }
                } else {
                    if(popup) popup.style.display = 'none';
                }
            });
        }

        // Close Outside
        document.addEventListener('click', (e) => {
            if(isOpen && popup && !popup.contains(e.target) && icon && !icon.contains(e.target)) {
                isOpen = false;
                popup.style.display = 'none';
            }
        });

        // Initial Render to show dot if needed
        if(notifications.length > 0 && dot) dot.style.display = 'block';
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavbar);
    } else {
        initNavbar();
    }
})();