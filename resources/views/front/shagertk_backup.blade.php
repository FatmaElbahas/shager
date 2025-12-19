<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>شجرتك</title>

    <!-- CSS -->
    <link rel="stylesheet" href="{{ asset('front/css/all.min.css') }}">
    <link rel="stylesheet" href="{{ asset('front/css/bootstrap.min.css') }}">
    <link rel="stylesheet" href="{{ asset('front/css/usertree.css') }}">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="icon" type="image/png" href="{{ asset('front/images/Asset 141.png') }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display&display=swap" rel="stylesheet">

    <!-- D3.js for tree layout -->
    <script src="https://d3js.org/d3.v7.min.js"></script>

    <style>
        body {
            height: 100vh;
            background: #f8f9fa;
            font-family: 'Playfair Display', serif;
        }

        /* Tree Container Styles */
        #tree-container-wrapper {
            position: relative;
            width: 100%;
            height: 600px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            border-radius: 12px;
            overflow: hidden; /* Keep wrapper overflow hidden, but container can show overflow */
            margin: 20px 0;
        }

        #tree-container {
            width: 100%;
            height: 100%;
            position: relative;
            overflow: visible !important; /* Allow seeing parts outside container when dragging */
        }

        #tree-svg {
            width: 100%;
            height: 100%;
            display: block;
            touch-action: none;
            overflow: visible; /* Allow SVG content to extend beyond bounds */
        }

        #tree-svg:active {
            cursor: grabbing !important;
        }

        /* Ensure SVG group can extend beyond viewport */
        #tree-svg g {
            transform-origin: center center;
        }

        /* Zoom Controls */
        .zoom-controls {
            position: absolute;
            top: 20px;
            left: 20px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            background: rgba(255, 255, 255, 0.9);
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .zoom-btn {
            width: 45px;
            height: 45px;
            border-radius: 50%;
            background: #10b981;
            color: white;
            border: 2px solid #10b981;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            transition: all 0.3s ease;
        }

        .zoom-btn:hover {
            background: #059669;
            transform: scale(1.1);
        }

        .zoom-btn:disabled {
            background: #9ca3af;
            border-color: #9ca3af;
            cursor: not-allowed;
            transform: none;
        }

        .zoom-btn.reset {
            background: #6b7280;
            border-color: #6b7280;
        }

        .zoom-btn.reset:hover {
            background: #4b5563;
        }

        .zoom-display {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            color: #374151;
            margin-top: 5px;
        }

        /* Loading State */
        .tree-loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            color: #10b981;
            font-size: 24px;
            font-weight: bold;
        }

        /* Tree Node Styles */
        .tree-node {
            cursor: pointer;
            transition: transform 0.3s ease;
        }

        .tree-node:hover {
            transform: scale(1.05);
        }

        .tree-node.selected {
            transform: scale(1.1);
        }

        /* Selection Ring */
        .selection-ring {
            fill: none;
            stroke: #3b82f6;
            stroke-width: 4;
            stroke-dasharray: 8 4;
            opacity: 0.8;
            animation: spin 10s linear infinite;
        }

        @keyframes spin {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }

        /* Remove old tree styles */
        .background {
            display: none !important;
        }

        .pointer-events-none {
            text-shadow: 0 1px 2px rgba(0,0,0,0.4);
        }
        
        /* Template Container */
        .template-container {
            padding: 20px;
            direction: rtl;
            font-family: 'Playfair Display', serif;
            position: relative;
        }
        
        /* Connection lines SVG overlay */
        .tree-links-svg {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        }
        
        /* Nodes must be above connections */
        [data-id] {
            position: relative;
            z-index: 2;
        }
        
        .template-title {
            text-align: center;
            margin-bottom: 30px;
            color: #2c3e50;
            font-size: 24px;
        }
        
        /* Template 1 - Cards */
        .template-1 .family-tree-cards {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .family-card {
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            margin: 10px;
            padding: 15px;
            min-width: 200px;
            text-align: center;
            transition: transform 0.3s;
        }
        
        .family-card:hover {
            transform: translateY(-5px);
        }
        
        .card-root {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: 3px solid gold;
        }
        
        .card-parent {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
        }
        
        .card-child {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
        }
        
        .card-children {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            margin-top: 15px;
            gap: 10px;
        }
        
        /* Template 2 - Circles */
        .template-2 .family-tree-circles {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 20px;
        }
        
        .circle-node {
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: white;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            position: relative;
        }
        
        .circle-content {
            padding: 10px;
        }
        
        .circle-children {
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 15px;
            margin-top: 20px;
        }
        
        /* Template 3 - Boxes */
        .template-3 .family-tree-boxes {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .family-box {
            background: white;
            border: 2px solid #3498db;
            border-radius: 8px;
            margin: 10px;
            padding: 15px;
            min-width: 180px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        
        .box-root {
            background: #e74c3c;
            color: white;
            border-color: #c0392b;
        }
        
        .box-parent {
            background: #f39c12;
            color: white;
            border-color: #d35400;
        }
        
        .box-child {
            background: #2ecc71;
            color: white;
            border-color: #27ae60;
        }
        
        .box-children {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            margin-top: 15px;
            gap: 10px;
        }
        
        /* Template 4 - Vertical Tree */
        .template-4 .family-tree-vertical {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .vertical-node {
            background: white;
            border: 2px solid #9b59b6;
            border-radius: 6px;
            padding: 12px 20px;
            margin: 5px 0;
            min-width: 150px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .vertical-node.level-0 {
            background: #9b59b6;
            color: white;
            font-size: 18px;
            font-weight: bold;
        }
        
        .vertical-node.level-1 {
            background: #3498db;
            color: white;
        }
        
        .vertical-node.level-2 {
            background: #1abc9c;
            color: white;
        }
        
        .vertical-children {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 10px;
            border-left: 2px solid #9b59b6;
            padding-left: 20px;
        }
        
        /* Template 5 - Horizontal Tree */
        .template-5 .family-tree-horizontal {
            display: flex;
            align-items: center;
            padding: 20px;
        }
        
        .horizontal-node {
            background: white;
            border: 2px solid #e67e22;
            border-radius: 6px;
            padding: 12px 20px;
            margin: 0 10px;
            min-width: 150px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .horizontal-node.level-0 {
            background: #e67e22;
            color: white;
            font-size: 18px;
            font-weight: bold;
        }
        
        .horizontal-node.level-1 {
            background: #f1c40f;
            color: #333;
        }
        
        .horizontal-node.level-2 {
            background: #2ecc71;
            color: white;
        }
        
        .horizontal-children {
            display: flex;
            align-items: center;
            margin-left: 20px;
            border-top: 2px solid #e67e22;
            padding-top: 10px;
        }
        
        /* Template 6 - Grid */
        .template-6 .family-tree-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 20px;
            padding: 20px;
        }
        
        .grid-item {
            background: white;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            box-shadow: 0 3px 6px rgba(0,0,0,0.1);
            transition: transform 0.3s;
        }
        
        .grid-item:hover {
            transform: scale(1.05);
        }
        
        .grid-item.level-0 {
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: white;
            grid-column: span 2;
        }
        
        .grid-item.level-1 {
            background: linear-gradient(135deg, #00d2d3, #54a0ff);
            color: white;
        }
        
        .grid-item.level-2 {
            background: linear-gradient(135deg, #5f27cd, #341f97);
            color: white;
        }
        
        /* Template 7 - Timeline */
        .template-7 .family-tree-timeline {
            position: relative;
            padding: 20px 0;
        }
        
        .template-7 .family-tree-timeline::before {
            content: '';
            position: absolute;
            top: 0;
            bottom: 0;
            width: 4px;
            background: #2c3e50;
            left: 50%;
            transform: translateX(-50%);
        }
        
        .timeline-item {
            position: relative;
            width: 50%;
            padding: 20px;
            box-sizing: border-box;
        }
        
        .timeline-item:nth-child(odd) {
            left: 0;
        }
        
        .timeline-item:nth-child(even) {
            left: 50%;
        }
        
        .timeline-content {
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 3px 6px rgba(0,0,0,0.1);
            position: relative;
        }
        
        .timeline-item.level-0 .timeline-content {
            background: #e74c3c;
            color: white;
        }
        
        .timeline-item.level-1 .timeline-content {
            background: #f39c12;
            color: white;
        }
        
        .timeline-item.level-2 .timeline-content {
            background: #2ecc71;
            color: white;
        }
        
        /* Template 8 - Fan Chart */
        .template-8 .family-tree-fan {
            position: relative;
            height: 500px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .fan-item {
            position: absolute;
            background: white;
            border-radius: 8px;
            padding: 10px 15px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
            min-width: 100px;
        }
        
        .fan-item.level-0 {
            background: #9b59b6;
            color: white;
            position: static;
        }
        
        .fan-item.level-1 {
            background: #3498db;
            color: white;
        }
        
        .fan-item.level-2 {
            background: #1abc9c;
            color: white;
        }
        
        /* Template 9 - Images */
        .template-9 .family-tree-images {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 20px;
        }
        
        .family-image {
            position: relative;
        }
        
        .image-placeholder {
            width: 150px;
            height: 150px;
            background: #ecf0f1;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .family-image.img-root .image-placeholder {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .family-image.img-parent .image-placeholder {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
        }
        
        .family-image.img-child .image-placeholder {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
        }
        
        .image-content {
            text-align: center;
        }
        
        .image-children {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 15px;
            margin-top: 15px;
        }
        
        /* Template 10 - Compact */
        .template-10 .family-tree-compact {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .compact-node {
            background: white;
            border-radius: 20px;
            padding: 8px 15px;
            margin: 3px 0;
            min-width: 120px;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .compact-node.level-0 {
            background: #e74c3c;
            color: white;
            font-size: 16px;
            font-weight: bold;
        }
        
        .compact-node.level-1 {
            background: #f39c12;
            color: white;
        }
        
        .compact-node.level-2 {
            background: #2ecc71;
            color: white;
        }
        
        .compact-children {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            margin-top: 8px;
            gap: 5px;
        }
        
        /* Common Styles */
        .age {
            font-size: 14px;
            opacity: 0.8;
            margin: 5px 0 0 0;
        }
        
        h3, h4 {
            margin: 0 0 5px 0;
        }
    </style>
</head>

<body>
    <div class="container-fluid">
        <div class="row">
            <!-- Sidebar -->
            <div class="col-lg-2">
                <div class="sidebar d-lg-flex flex-column" id="sidebar">
                    <div class="logo p-3">
                        <img src="{{ asset('front/images/Asset 80.svg') }}" alt="Logo" class="img-fluid">
                    </div>
                    <button id="close" class="btn btn-link sidebar-close">
                        <i class="fas fa-times fa-lg"></i>
                    </button>
                    <ul class="nav flex-column px-3">
                        <li class="nav-item d-flex align-items-center gap-2 mt-3">
                            <img src="{{ asset('front/images/Dashboard.png') }}" alt="" class="icon">
                            <a href="{{ url('front/UserDashboard.html') }}" class="nav-link">الرئيسية</a>
                        </li>
                        <li class="active nav-item d-flex align-items-center gap-2">
                            <img src="{{ asset('front/images/hugeicons_tree-06.png') }}" alt="" class="icon">
                            <a href="{{ url('front/shagertk.html') }}" class="nav-link">شجرتك</a>
                        </li>
                        <li class="nav-item d-flex align-items-center gap-2">
                            <img src="{{ asset('front/images/famicons_map-outline.png') }}" alt="" class="icon">
                            <a href="{{ url('front/map.html') }}" class="nav-link">خريطة العائلة</a>
                        </li>
                        <li class="nav-item d-flex align-items-center gap-2">
                            <img src="{{ asset('front/images/tabler_link-plus.png') }}" alt="" class="icon">
                            <a href="{{ url('front/userevents.html') }}" class="nav-link">المناسبات</a>
                        </li>
                        <li class="nav-item d-flex align-items-center gap-2">
                            <img src="{{ asset('front/images/iconamoon_news-light.png') }}" alt="" class="icon">
                            <a href="{{ url('front/usernews.html') }}" class="nav-link">الاخبار</a>
                        </li>
                        <li class="nav-item d-flex align-items-center gap-2">
                            <img src="{{ asset('front/images/eos-icons_subscriptions-created-outlined.png') }}" alt="" class="icon">
                            <a href="{{ url('front/upgrade.html') }}" class="nav-link">الإشتراكات</a>
                        </li>
                        <li class="nav-item d-flex align-items-center gap-2">
                            <i class="fa-solid fa-user-plus icon" style="color: rgba(39, 58, 65, 1);"></i>
                            <a href="{{ url('front/requests.html') }}" class="nav-link">طلبات الانضمام</a>
                        </li>
                        <li class="nav-item d-flex align-items-center gap-2">
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
            </div>
        </div>
    </div>

    <!-- Content -->
    <div class="content">
        <!-- Navbar for mobile -->
        <nav class="navbar my-3 d-lg-none">
            <div class="container-fluid">
                <span class="navbar-brand fw-bold">شجرتك</span>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#sidebar"
                    aria-controls="sidebar" aria-expanded="false" aria-label="Toggle navigation">
                    <i class="fas fa-bars text-dark"></i>
                </button>
            </div>
        </nav>

        <div class="container-fluid">
            <div class="cover-container position-relative mt-2">
                <img id="cover-image" src="" alt="صورة الغلاف" class="img-fluid shadow-sm rounded-4 w-100"
                    style="height: 500px; object-fit: cover;">
                <button id="edit-cover-btn"
                    class="btn btn-custom rounded-pill py-2 px-3 position-absolute top-0 start-0 m-2 d-flex align-items-center gap-2"
                    style="width: auto;">
                    <i class="bi bi-camera"></i> تعديل صورة الغلاف
                </button>
                <input type="file" id="cover-input" accept="image/*" style="display:none">
            </div>

            <div class="cover-info w-100 my-3">
                <div class="container">
                    <div class="row align-items-center g-1">
                        <div class="col-auto position-relative" style="width: 120px; height: 120px;">
                            <img id="family-logo" src="" alt="شعار العائلة" class="img-fluid rounded-pill"
                                style="width: 120px; height: 120px; display: block;">
                            <img id="edit-logo-btn" src="{{ asset('front/images/Frame 1410126142.png') }}" alt="زر تعديل"
                                style="position: absolute; bottom: 5px; right: 5px; width: 30px; height: 30px; cursor: pointer;">
                            <input type="file" id="logo-input" accept="image/*" style="display:none">
                        </div>
                        <div class="col">
                            <div id="family-name" class="family-name rounded-pill py-3 px-3 text-muted fw-bold"
                                style="font-size: 32px; white-space: nowrap; color: rgba(39, 58, 65, 1);">
                            </div>
                            <div class="search-bar d-flex align-items-center position-relative w-100">
                                <i class="bi bi-search search-icon px-3 position-absolute"></i>
                                <input type="search" class="form-control search-input rounded-pill ps-5"
                                    placeholder="البحث ..">
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Family Tree Visualization -->
            <div class="bg-white rounded-4 p-4 my-5 text-center" style="overflow: hidden !important;">
                <div id="tree-container-wrapper">
                    <div id="tree-loading" class="tree-loading">
                        <div>جاري تحميل بيانات العائلة من API...</div>
                    </div>
                    <div id="tree-container"></div>
                    <div class="zoom-controls">
                        <button class="zoom-btn" onclick="zoomIn()" id="zoom-in-btn" title="تكبير">
                            🔍+
                        </button>
                        <button class="zoom-btn" onclick="zoomOut()" id="zoom-out-btn" title="تصغير">
                            🔍−
                        </button>
                        <button class="zoom-btn reset" onclick="resetZoom()" title="إعادة ضبط">
                            🔄
                        </button>
                        <div class="zoom-display" id="zoom-display">100%</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- JS Libraries -->
    <script src="{{ asset('front/js/all.min.js') }}"></script>
    <script src="{{ asset('front/js/bootstrap.bundle.min.js') }}"></script>
    <script src="{{ asset('front/js/notify.js') }}"></script>

    <script>
        // Tree data from Laravel
        const treeData = @json($treeData ?? null);
        
        // Add resize event listener to redraw connections
        window.addEventListener('resize', function() {
            // Debounce the redraw to avoid excessive calls
            clearTimeout(window.redrawTimeout);
            window.redrawTimeout = setTimeout(redrawConnectionsEnhanced, 100);
        });

        // Mock data for demonstration (will be used if no real data)
        const mockTreeData = {
            id: 'root',
            name: 'محمد عبد',
            age: 'الجد',
            children: [
                {
                    id: 'khalil',
                    name: 'خليل',
                    age: '48',
                    children: [
                        { id: 'karam', name: 'كرم', age: '20', children: [] },
                        { id: 'khaled', name: 'خالد', age: '18', children: [] },
                        {
                            id: 'salim',
                            name: 'سليم',
                            age: '25',
                            children: [
                                { id: 'salim-sub', name: 'سليم', age: '5', children: [] },
                                { id: 'mahmoud', name: 'محمود', age: '4', children: [] },
                                { id: 'mortada', name: 'مرتضى', age: '3', children: [] },
                                { id: 'ali', name: 'علي', age: '2', children: [] }
                            ]
                        },
                        {
                            id: 'omar',
                            name: 'عمر',
                            age: '22',
                            children: [
                                { id: 'seif', name: 'سيف', age: '5', children: [] },
                                { id: 'mustafa', name: 'مصطفى', age: '4', children: [] },
                                { id: 'karim', name: 'كريم', age: '2', children: [] }
                            ]
                        }
                    ]
                },
                {
                    id: 'amr',
                    name: 'عمرو',
                    age: '50',
                    children: [
                        { id: 'yahya', name: 'يحيى', age: '21', children: [] },
                        { id: 'kamel', name: 'كامل', age: '27', children: [] },
                        { id: 'mahmoud-sub', name: 'محمود', age: '25', children: [] },
                        {
                            id: 'abbas',
                            name: 'عباس',
                            age: '35',
                            children: [
                                { id: 'salman', name: 'سلمان', age: '10', children: [] },
                                { id: 'nasser', name: 'ناصر', age: '8', children: [] },
                                { id: 'bilal', name: 'بلال', age: '6', children: [] },
                                { id: 'ahmed', name: 'أحمد', age: '5', children: [] },
                                { id: 'ismail', name: 'اسماعيل', age: '4', children: [] },
                                { id: 'moamen', name: 'مؤمن', age: '12', children: [] },
                                { id: 'khaled-sub', name: 'خالد', age: '11', children: [] },
                                { id: 'ibrahim-sub', name: 'ابراهيم', age: '9', children: [] }
                            ]
                        }
                    ]
                },
                {
                    id: 'yassin',
                    name: 'ياسين',
                    age: '52',
                    children: [
                        { id: 'sofian', name: 'سفيان', age: '26', children: [] },
                        { id: 'hesham', name: 'هشام', age: '24', children: [] },
                        { id: 'khalil-sub', name: 'خليل', age: '22', children: [] },
                        { id: 'essam', name: 'عصام', age: '20', children: [] },
                        { id: 'karim-sub', name: 'كريم', age: '18', children: [] }
                    ]
                },
                {
                    id: 'mohsen',
                    name: 'محسن',
                    age: '55',
                    children: [
                        { id: 'hamza', name: 'حمزة', age: '30', children: [] },
                        { id: 'oweiss', name: 'اويس', age: '28', children: [] },
                        { id: 'tamim', name: 'تيم', age: '25', children: [] },
                        { id: 'tamim2', name: 'تميم', age: '24', children: [] },
                        { id: 'rajab', name: 'رجب', age: '22', children: [] },
                        { id: 'jumaa', name: 'جمعه', age: '20', children: [] },
                        { id: 'abdelnasser', name: 'عبدالناصر', age: '30', children: [] },
                        { id: 'ibrahim', name: 'ابراهيم', age: '28', children: [] },
                        { id: 'anwar', name: 'انور', age: '26', children: [] },
                        { id: 'morsi', name: 'مرسي', age: '24', children: [] }
                    ]
                },
                {
                    id: 'kamal',
                    name: 'كمال',
                    age: '45',
                    children: [
                        { id: 'abubakr', name: 'ابوبكر', age: '20', children: [] },
                        { id: 'hassan', name: 'حسن', age: '18', children: [] },
                        { id: 'abdelaziz', name: 'عبدالعزيز', age: '15', children: [] }
                    ]
                },
                {
                    id: 'mosaad',
                    name: 'مسعد',
                    age: '50',
                    children: [
                        { id: 'mohamed-sub', name: 'محمد', age: '25', children: [] }
                    ]
                }
            ]
        };

        // Global variables
        let zoom = 1;
        let panX = 0;
        let panY = 0;
        let isPanning = false;
        let startPan = { x: 0, y: 0 };
        let selectedId = null;
        let svg, g, treeLayout, nodesData, linksData;
        let width, height;
        let zoomBehavior;
        let currentTemplateId = null;

        // Dispatcher function to render tree based on template ID
        function renderByTemplate(templateId, treeData) {
            console.log('Rendering with template ID:', templateId);
            window.currentTemplateId = templateId;
            
            // Clear any existing connections
            const container = document.getElementById('tree-container');
            if (container) {
                const existingSvg = container.querySelector('.tree-links-svg');
                if (existingSvg) {
                    existingSvg.remove();
                }
            }
            
            // For templates 1-10, use custom renderers
            switch (templateId) {
                case 1:
                    renderTemplate1(treeData);
                    break;
                case 2:
                    renderTemplate2(treeData);
                    break;
                case 3:
                    renderTemplate3(treeData);
                    break;
                case 4:
                    renderTemplate4(treeData);
                    break;
                case 5:
                    renderTemplate5(treeData);
                    break;
                case 6:
                    renderTemplate6(treeData);
                    break;
                case 7:
                    renderTemplate7(treeData);
                    break;
                case 8:
                    renderTemplate8(treeData);
                    break;
                case 9:
                    renderTemplate9(treeData);
                    break;
                case 10:
                    renderTemplate10(treeData);
                    break;
                default:
                    // For templates 11-15 (paid), use the existing renderer
                    renderPaidTemplate(treeData);
            }
        }

        // Template 1 Renderer - Cards Layout
        function renderTemplate1(treeData) {
            clearTreeContainer();
            const container = document.getElementById('tree-container');
            container.innerHTML = `
                <div class="template-container template-1">
                    <h2 class="template-title">قالب 1 - تصميم البطاقات</h2>
                    <div class="family-tree-cards">
                        ${generateCardsLayout(treeData)}
                    </div>
                </div>
            `;
            
            // Draw connections after a small delay to ensure DOM is rendered
            setTimeout(() => {
                const templateContainer = container.querySelector('.template-container') || container;
                if (templateContainer) {
                    drawConnections(treeData, templateContainer);
                }
            }, 0);
        }

        // Template 2 Renderer - Circles Layout
        function renderTemplate2(treeData) {
            clearTreeContainer();
            const container = document.getElementById('tree-container');
            container.innerHTML = `
                <div class="template-container template-2">
                    <h2 class="template-title">قالب 2 - تصميم الدوائر</h2>
                    <div class="family-tree-circles">
                        ${generateCirclesLayout(treeData)}
                    </div>
                </div>
            `;
            
            // Draw connections after a small delay to ensure DOM is rendered
            setTimeout(() => {
                const templateContainer = container.querySelector('.template-container');
                if (templateContainer) {
                    drawConnections(treeData, templateContainer);
                }
            }, 0);
        }

        // Template 3 Renderer - Boxes Layout
        function renderTemplate3(treeData) {
            clearTreeContainer();
            const container = document.getElementById('tree-container');
            container.innerHTML = `
                <div class="template-container template-3">
                    <h2 class="template-title">قالب 3 - تصميم الصناديق</h2>
                    <div class="family-tree-boxes">
                        ${generateBoxesLayout(treeData)}
                    </div>
                </div>
            `;
            
            // Draw connections after a small delay to ensure DOM is rendered
            setTimeout(() => {
                const templateContainer = container.querySelector('.template-container');
                if (templateContainer) {
                    drawConnections(treeData, templateContainer);
                }
            }, 0);
        }

        // Template 4 Renderer - Vertical Tree
        function renderTemplate4(treeData) {
            clearTreeContainer();
            const container = document.getElementById('tree-container');
            container.innerHTML = `
                <div class="template-container template-4">
                    <h2 class="template-title">قالب 4 - شجرة عمودية</h2>
                    <div class="family-tree-vertical">
                        ${generateVerticalTreeLayout(treeData)}
                    </div>
                </div>
            `;
            
            // Draw connections after a small delay to ensure DOM is rendered
            setTimeout(() => {
                const templateContainer = container.querySelector('.template-container');
                if (templateContainer) {
                    drawConnections(treeData, templateContainer);
                }
            }, 0);
        }

        // Template 5 Renderer - Horizontal Tree
        function renderTemplate5(treeData) {
            clearTreeContainer();
            const container = document.getElementById('tree-container');
            container.innerHTML = `
                <div class="template-container template-5">
                    <h2 class="template-title">قالب 5 - شجرة أفقية</h2>
                    <div class="family-tree-horizontal">
                        ${generateHorizontalTreeLayout(treeData)}
                    </div>
                </div>
            `;
            
            // Draw connections after a small delay to ensure DOM is rendered
            setTimeout(() => {
                const templateContainer = container.querySelector('.template-container');
                if (templateContainer) {
                    drawConnections(treeData, templateContainer);
                }
            }, 0);
        }

        // Template 6 Renderer - Grid Layout
        function renderTemplate6(treeData) {
            clearTreeContainer();
            const container = document.getElementById('tree-container');
            container.innerHTML = `
                <div class="template-container template-6">
                    <h2 class="template-title">قالب 6 - تصميم الشبكة</h2>
                    <div class="family-tree-grid">
                        ${generateGridLayout(treeData)}
                    </div>
                </div>
            `;
            
            // Draw connections after a small delay to ensure DOM is rendered
            setTimeout(() => {
                const templateContainer = container.querySelector('.template-container');
                if (templateContainer) {
                    drawConnections(treeData, templateContainer);
                }
            }, 0);
        }
        
        // Paid Templates Renderer (11-15) - Keep existing implementation

        // Template 7 Renderer - Timeline Layout
        function renderTemplate7(treeData) {
            clearTreeContainer();
            const container = document.getElementById('tree-container');
            container.innerHTML = `
                <div class="template-container template-7">
                    <h2 class="template-title">قالب 7 - تصميم الخط الزمني</h2>
                    <div class="family-tree-timeline">
                        ${generateTimelineLayout(treeData)}
                    </div>
                </div>
            `;
            
            // Draw connections after a small delay to ensure DOM is rendered
            setTimeout(() => {
                const templateContainer = container.querySelector('.template-container');
                if (templateContainer) {
                    drawConnections(treeData, templateContainer);
                }
            }, 0);
        }

        // Template 8 Renderer - Fan Chart
        function renderTemplate8(treeData) {
            clearTreeContainer();
            const container = document.getElementById('tree-container');
            container.innerHTML = `
                <div class="template-container template-8">
                    <h2 class="template-title">قالب 8 - مخطط المروحة</h2>
                    <div class="family-tree-fan">
                        ${generateFanChartLayout(treeData)}
                    </div>
                </div>
            `;
            
            // Draw connections after a small delay to ensure DOM is rendered
            setTimeout(() => {
                const templateContainer = container.querySelector('.template-container');
                if (templateContainer) {
                    drawConnections(treeData, templateContainer);
                }
            }, 0);
        }

        // Template 9 Renderer - Images Layout
        function renderTemplate9(treeData) {
            clearTreeContainer();
            const container = document.getElementById('tree-container');
            container.innerHTML = `
                <div class="template-container template-9">
                    <h2 class="template-title">قالب 9 - تصميم الصور</h2>
                    <div class="family-tree-images">
                        ${generateImagesLayout(treeData)}
                    </div>
                </div>
            `;
            
            // Draw connections after a small delay to ensure DOM is rendered
            setTimeout(() => {
                const templateContainer = container.querySelector('.template-container');
                if (templateContainer) {
                    drawConnections(treeData, templateContainer);
                }
            }, 0);
        }

        // Template 10 Renderer - Compact Layout
        function renderTemplate10(treeData) {
            clearTreeContainer();
            const container = document.getElementById('tree-container');
            container.innerHTML = `
                <div class="template-container template-10">
                    <h2 class="template-title">قالب 10 - تصميم مدمج</h2>
                    <div class="family-tree-compact">
                        ${generateCompactLayout(treeData)}
                    </div>
                </div>
            `;
            
            // Draw connections after a small delay to ensure DOM is rendered
            setTimeout(() => {
                const templateContainer = container.querySelector('.template-container');
                if (templateContainer) {
                    drawConnections(treeData, templateContainer);
                }
            }, 0);
        }

            
            // Draw connections after a small delay to ensure DOM is rendered
            setTimeout(() => {
                const templateContainer = container.querySelector('.template-container');
                if (templateContainer) {
                    drawConnections(treeData, templateContainer);
                }
            }, 0);
        

        // Paid Templates Renderer (11-15) - Keep existing implementation
        function renderPaidTemplate(treeData) {
            // For paid templates, we need to initialize the D3 SVG and then render
            const container = document.getElementById('tree-container');
            if (!container) {
                console.error('Tree container not found!');
                return;
            }

            width = container.offsetWidth || 1200;
            height = 600;

            // Clear container
            clearTreeContainer();

            // Create SVG for paid templates
            svg = d3.select('#tree-container')
                .append('svg')
                .attr('id', 'tree-svg')
                .attr('width', width)
                .attr('height', height)
                .style('cursor', 'grab')
                .on('mousedown', function(event) {
                    if (event.button === 0) { // Left mouse button
                        isPanning = true;
                        startPan = { x: event.clientX - panX, y: event.clientY - panY };
                        svg.style('cursor', 'grabbing');
                    }
                })
                .on('mousemove', function(event) {
                    if (isPanning) {
                        // Free movement in all directions - no constraints
                        panX = event.clientX - startPan.x;
                        panY = event.clientY - startPan.y;

                        updateZoom();
                    }
                })
                .on('mouseup', function() {
                    if (isPanning) {
                        isPanning = false;
                        svg.style('cursor', 'grab');
                    }
                })
                .on('mouseleave', function() {
                    if (isPanning) {
                        isPanning = false;
                        svg.style('cursor', 'grab');
                    }
                })
                .on('wheel', function(event) {
                    event.preventDefault();

                    // Get mouse position relative to SVG
                    const rect = svg.node().getBoundingClientRect();
                    const mouseX = event.clientX - rect.left;
                    const mouseY = event.clientY - rect.top;

                    // Zoom direction
                    const delta = event.deltaY > 0 ? -0.1 : 0.1;
                    const newZoom = Math.max(0.3, Math.min(3, zoom + delta));

                    // Calculate zoom point in tree coordinates
                    const treeX = (mouseX - panX - width / 2) / zoom;
                    const treeY = (mouseY - panY - height / 2) / zoom;

                    // Apply zoom
                    zoom = newZoom;

                    // Adjust pan to zoom towards mouse position
                    panX = mouseX - (treeX * zoom) - (width / 2 - treeX * zoom);
                    panY = mouseY - (treeY * zoom) - (height / 2 - treeY * zoom);

                    // No constraints - free movement
                    updateZoom();
                    updateZoomButtons();
                });

            g = svg.append('g');

            // Now render the tree with D3
            renderTreeWithD3(treeData);
        }

        // Helper function to clear tree container
        function clearTreeContainer() {
            const container = document.getElementById('tree-container');
            if (container) {
                container.innerHTML = '';
            }
            // Remove any existing SVG
            d3.select('#tree-container').selectAll('svg').remove();
            
            // Remove any existing connection SVG
            const existingSvg = document.querySelector('.tree-links-svg');
            if (existingSvg) {
                existingSvg.remove();
            }
        }
        
        // Universal connection engine - draws lines between parent and child nodes
        function drawConnections(treeData, containerEl) {
            // Remove any existing connection SVG
            const existingSvg = containerEl.querySelector('.tree-links-svg');
            if (existingSvg) {
                existingSvg.remove();
            }
            
            // Create new SVG overlay for connections
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.classList.add('tree-links-svg');
            containerEl.appendChild(svg);
            
            // Recursive function to draw connections
            function drawNodeConnections(node, level = 0) {
                if (!node || !node.children || node.children.length === 0) return;
                
                // Find parent element
                const parentEl = containerEl.querySelector(`[data-id="${node.id}"]`);
                if (!parentEl) return;
                
                // Get parent position
                const parentRect = parentEl.getBoundingClientRect();
                const parentContainerRect = containerEl.getBoundingClientRect();
                
                // Determine parent connection point (bottom center for most templates)
                let parentX = parentRect.left + parentRect.width / 2 - parentContainerRect.left;
                let parentY = parentRect.bottom - parentContainerRect.top;
                
                // Check if this is a horizontal template (template 5)
                const isHorizontal = containerEl.classList.contains('template-5');
                
                // For horizontal templates, connect from right middle
                if (isHorizontal) {
                    parentX = parentRect.right - parentContainerRect.left;
                    parentY = parentRect.top + parentRect.height / 2 - parentContainerRect.top;
                }
                
                // Draw connections to each child
                node.children.forEach(child => {
                    // Find child element
                    const childEl = containerEl.querySelector(`[data-id="${child.id}"]`);
                    if (!childEl) return;
                    
                    // Get child position
                    const childRect = childEl.getBoundingClientRect();
                    
                    // Determine child connection point (top center for most templates)
                    let childX = childRect.left + childRect.width / 2 - parentContainerRect.left;
                    let childY = childRect.top - parentContainerRect.top;
                    
                    // For horizontal templates, connect to left middle
                    if (isHorizontal) {
                        childX = childRect.left - parentContainerRect.left;
                        childY = childRect.top + childRect.height / 2 - parentContainerRect.top;
                    }
                    
                    // Create SVG path element
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    
                    // Determine if this is a grandchild (level 2+)
                    const isGrandchild = level >= 1;
                    
                    // Set path attributes
                    path.setAttribute('fill', 'none');
                    path.setAttribute('stroke', '#94a3b8');
                    path.setAttribute('stroke-width', isGrandchild ? '1.5' : '2');
                    path.setAttribute('opacity', '0.9');
                    
                    // Use dashed lines for grandchildren
                    if (isGrandchild) {
                        path.setAttribute('stroke-dasharray', '5,5');
                    }
                    
                    // Create smooth Bézier curve
                    // For vertical connections
                    if (!isHorizontal) {
                        const pathData = `M ${parentX},${parentY} C ${parentX},${parentY + 40} ${childX},${childY - 40} ${childX},${childY}`;
                        path.setAttribute('d', pathData);
                    } 
                    // For horizontal connections
                    else {
                        const pathData = `M ${parentX},${parentY} C ${parentX + 40},${parentY} ${childX - 40},${childY} ${childX},${childY}`;
                        path.setAttribute('d', pathData);
                    }
                    
                    // Add path to SVG
                    svg.appendChild(path);
                    
                    // Recursively draw connections for this child
                    drawNodeConnections(child, level + 1);
                });
            }
            
            // Start drawing from root
            if (treeData) {
                drawNodeConnections(treeData, 0);
            }
        }
        
        // Redraw connections (used for resize events)
        function redrawConnections() {
            const containerEl = document.querySelector('.template-container');
            if (containerEl && window.treeDataGlobal) {
                // Small delay to ensure DOM is fully rendered
                setTimeout(() => {
                    drawConnections(window.treeDataGlobal, containerEl);
                }, 0);
            }
        }
        
        // Enhanced redraw connections that works with different container structures
        function redrawConnectionsEnhanced() {
            // Try to find the template container first
            let containerEl = document.querySelector('.template-container');
            
            // If not found, try the tree container
            if (!containerEl) {
                containerEl = document.getElementById('tree-container');
            }
            
            if (containerEl && window.treeDataGlobal) {
                // Small delay to ensure DOM is fully rendered
                setTimeout(() => {
                    drawConnections(window.treeDataGlobal, containerEl);
                }, 0);
            }
        }

        // Layout generators for each template
        function generateCardsLayout(node, level = 0) {
            if (!node) return '';
            
            const hasChildren = node.children && node.children.length > 0;
            const cardClass = level === 0 ? 'card-root' : hasChildren ? 'card-parent' : 'card-child';
            
            let html = `
                <div class="family-card ${cardClass}" data-id="${node.id}">
                    <div class="card-content">
                        <h3>${node.name}</h3>
                        <p class="age">${node.age}</p>
                    </div>
            `;
            
            if (hasChildren) {
                html += `<div class="card-children">`;
                node.children.forEach(child => {
                    html += generateCardsLayout(child, level + 1);
                });
                html += `</div>`;
            }
            
            html += `</div>`;
            return html;
        }

        function generateCirclesLayout(node, level = 0) {
            if (!node) return '';
            
            const size = level === 0 ? 120 : level === 1 ? 80 : 60;
            const hasChildren = node.children && node.children.length > 0;
            
            let html = `
                <div class="circle-node" style="width: ${size}px; height: ${size}px;" data-id="${node.id}">
                    <div class="circle-content">
                        <strong>${node.name}</strong>
                        <span class="age">${node.age}</span>
                    </div>
            `;
            
            if (hasChildren) {
                html += `<div class="circle-children">`;
                node.children.forEach(child => {
                    html += generateCirclesLayout(child, level + 1);
                });
                html += `</div>`;
            }
            
            html += `</div>`;
            return html;
        }

        function generateBoxesLayout(node, level = 0) {
            if (!node) return '';
            
            const hasChildren = node.children && node.children.length > 0;
            const boxClass = level === 0 ? 'box-root' : hasChildren ? 'box-parent' : 'box-child';
            
            let html = `
                <div class="family-box ${boxClass}" data-id="${node.id}">
                    <div class="box-content">
                        <h4>${node.name}</h4>
                        <p class="age">${node.age}</p>
                    </div>
            `;
            
            if (hasChildren) {
                html += `<div class="box-children">`;
                node.children.forEach(child => {
                    html += generateBoxesLayout(child, level + 1);
                });
                html += `</div>`;
            }
            
            html += `</div>`;
            return html;
        }

        function generateVerticalTreeLayout(node, level = 0) {
            if (!node) return '';
            
            const hasChildren = node.children && node.children.length > 0;
            
            let html = `
                <div class="vertical-node level-${level}" data-id="${node.id}">
                    <div class="node-content">
                        <span class="name">${node.name}</span>
                        <span class="age">${node.age}</span>
                    </div>
            `;
            
            if (hasChildren) {
                html += `<div class="vertical-children">`;
                node.children.forEach(child => {
                    html += generateVerticalTreeLayout(child, level + 1);
                });
                html += `</div>`;
            }
            
            html += `</div>`;
            return html;
        }

        function generateHorizontalTreeLayout(node, level = 0) {
            if (!node) return '';
            
            const hasChildren = node.children && node.children.length > 0;
            
            let html = `
                <div class="horizontal-node level-${level}" data-id="${node.id}">
                    <div class="node-content">
                        <span class="name">${node.name}</span>
                        <span class="age">${node.age}</span>
                    </div>
            `;
            
            if (hasChildren) {
                html += `<div class="horizontal-children">`;
                node.children.forEach(child => {
                    html += generateHorizontalTreeLayout(child, level + 1);
                });
                html += `</div>`;
            }
            
            html += `</div>`;
            return html;
        }

        function generateGridLayout(node, level = 0) {
            if (!node) return '';
            
            let html = `
                <div class="grid-item level-${level}" data-id="${node.id}">
                    <div class="grid-content">
                        <h4>${node.name}</h4>
                        <p class="age">${node.age}</p>
                    </div>
                </div>
            `;
            
            if (node.children && node.children.length > 0) {
                node.children.forEach(child => {
                    html += generateGridLayout(child, level + 1);
                });
            }
            
            return html;
        }

        function generateTimelineLayout(node, level = 0) {
            if (!node) return '';
            
            let html = `
                <div class="timeline-item level-${level}" data-id="${node.id}">
                    <div class="timeline-content">
                        <h4>${node.name}</h4>
                        <p class="age">${node.age}</p>
                    </div>
                </div>
            `;
            
            if (node.children && node.children.length > 0) {
                node.children.forEach(child => {
                    html += generateTimelineLayout(child, level + 1);
                });
            }
            
            return html;
        }

        function generateFanChartLayout(node, level = 0) {
            if (!node) return '';
            
            const angle = level === 0 ? 0 : 30 * level;
            const distance = level * 100;
            
            let html = `
                <div class="fan-item level-${level}" style="transform: rotate(${angle}deg) translate(${distance}px);" data-id="${node.id}">
                    <div class="fan-content">
                        <strong>${node.name}</strong>
                        <span class="age">${node.age}</span>
                    </div>
                </div>
            `;
            
            if (node.children && node.children.length > 0) {
                node.children.forEach(child => {
                    html += generateFanChartLayout(child, level + 1);
                });
            }
            
            return html;
        }

        function generateImagesLayout(node, level = 0) {
            if (!node) return '';
            
            const hasChildren = node.children && node.children.length > 0;
            const imgClass = level === 0 ? 'img-root' : hasChildren ? 'img-parent' : 'img-child';
            
            let html = `
                <div class="family-image ${imgClass}" data-id="${node.id}">
                    <div class="image-placeholder">
                        <div class="image-content">
                            <h4>${node.name}</h4>
                            <p class="age">${node.age}</p>
                        </div>
                    </div>
            `;
            
            if (hasChildren) {
                html += `<div class="image-children">`;
                node.children.forEach(child => {
                    html += generateImagesLayout(child, level + 1);
                });
                html += `</div>`;
            }
            
            html += `</div>`;
            return html;
        }

        function generateCompactLayout(node, level = 0) {
            if (!node) return '';
            
            const hasChildren = node.children && node.children.length > 0;
            
            let html = `
                <div class="compact-node level-${level}" data-id="${node.id}">
                    <div class="compact-content">
                        <span class="name">${node.name}</span>
                        <span class="age">${node.age}</span>
                    </div>
            `;
            
            if (hasChildren) {
                html += `<div class="compact-children">`;
                node.children.forEach(child => {
                    html += generateCompactLayout(child, level + 1);
                });
                html += `</div>`;
            }
            
            html += `</div>`;
            return html;
        }

        // Initialize tree visualization
        function initTree() {
            const container = document.getElementById('tree-container');
            if (!container) {
                console.error('Tree container not found!');
                return;
            }

            width = container.offsetWidth || 1200;
            height = 600;

            // Hide loading
            const loadingEl = document.getElementById('tree-loading');
            if (loadingEl) loadingEl.style.display = 'none';

            // Use global tree data (could be from Laravel, mock, or API)
            const dataToRender = window.treeDataGlobal || treeData;

            console.log('initTree - dataToRender:', dataToRender);

            if (dataToRender && dataToRender.id) {
                console.log('Rendering tree with data:', dataToRender.name);
                renderTree(dataToRender);
            } else {
                console.warn('No tree data available, showing empty tree');
                showEmptyTree();
            }
        }

        // Convert flat data to tree structure
        function convertToTree(members) {
            if (!members || members.length === 0) return null;

            console.log('Converting members to tree. Count:', members.length);
            console.log('First member:', members[0]);

            // Create map of all members
            const memberMap = {};
            members.forEach(member => {
                // Handle both direct member object and nested relationships
                const memberId = member.id || member.family_data_member_id;
                if (!memberId) {
                    console.warn('Member without ID:', member);
                    return;
                }

                // Check for parent relationships in FamilyRelation format
                let fatherId = null;
                let motherId = null;

                if (member.father_relation && member.father_relation.father_id) {
                    fatherId = member.father_relation.father_id;
                } else if (member.father_id) {
                    fatherId = member.father_id;
                }

                if (member.mother_relation && member.mother_relation.mother_id) {
                    motherId = member.mother_relation.mother_id;
                } else if (member.mother_id) {
                    motherId = member.mother_id;
                }

                memberMap[memberId] = {
                    id: memberId.toString(),
                    name: member.name || 'غير محدد',
                    age: member.relation || '',
                    children: [],
                    fatherId: fatherId,
                    motherId: motherId
                };
            });

            // Find root (member with no parents)
            let root = null;
            const rootCandidates = [];

            members.forEach(member => {
                const memberId = member.id || member.family_data_member_id;
                if (!memberId) return;

                let hasParent = false;

                // Check if this member has a parent
                if (memberMap[memberId]) {
                    const node = memberMap[memberId];
                    if (node.fatherId || node.motherId) {
                        hasParent = true;
                    }
                }

                if (!hasParent) {
                    rootCandidates.push(memberMap[memberId]);
                    if (!root) {
                        root = memberMap[memberId];
                    }
                }
            });

            // Build tree structure using relationships
            members.forEach(member => {
                const memberId = member.id || member.family_data_member_id;
                if (!memberId || !memberMap[memberId]) return;

                const node = memberMap[memberId];

                // Find children - members that have this member as father or mother
                const children = [];
                members.forEach(m => {
                    const mId = m.id || m.family_data_member_id;
                    if (!mId || !memberMap[mId]) return;

                    const childNode = memberMap[mId];
                    if (childNode.fatherId == memberId || childNode.motherId == memberId) {
                        children.push(childNode);
                    }
                });

                node.children = children;
            });

            // If no root found, use first member
            if (!root && members.length > 0) {
                const firstId = members[0].id || members[0].family_data_member_id;
                if (firstId && memberMap[firstId]) {
                    root = memberMap[firstId];
                }
            }

            console.log('Tree root:', root);
            return root;
        }

        // Render tree dispatcher
        function renderTree(data) {
            console.log('renderTree called with data:', data);

            if (!data) {
                console.error('No data provided to renderTree');
                showEmptyTree();
                return;
            }

            // Extract template ID from data or use default
            const templateId = data.template_id || window.currentTemplateId || 11;
            console.log('Rendering tree with template ID:', templateId);
            
            // Use dispatcher to render based on template
            renderByTemplate(templateId, data);
        }

        // Render tree with D3 (for paid templates)
        function renderTreeWithD3(data) {
            console.log('renderTreeWithD3 called with data:', data);

            if (!data) {
                console.error('No data provided to renderTreeWithD3');
                showEmptyTree();
                return;
            }

            // Make sure SVG and g exist
            if (!svg || !g) {
                console.error('SVG or g not initialized, reinitializing...');
                // Wait a bit and try again
                setTimeout(() => {
                    if (g) renderTreeWithD3(data);
                }, 100);
                return;
            }

            // Clear previous tree elements (but keep SVG structure)
            g.selectAll('.links').remove();
            g.selectAll('.nodes').remove();
            g.selectAll('circle[fill="rgba(76, 175, 80, 0.1)"]').remove();
            // Remove trunk group
            g.selectAll('g').each(function() {
                const group = d3.select(this);
                const hasTrunk = group.select('path[d*="M-50,20"]').size() > 0;
                if (hasTrunk) {
                    group.remove();
                }
            });

            // Setup D3 tree layout with increased separation to prevent overlapping leaves
            treeLayout = d3.tree()
                .size([width - 200, height - 300])
                .separation((a, b) => {
                    if (a.parent === b.parent) {
                        // Increase separation for siblings, especially leaves
                        const isLeaf = !a.children || a.children.length === 0;
                        if (isLeaf) {
                            return 2.5; // More space between leaves
                        }
                        return a.parent ? 2.0 : 2.5;
                    }
                    return 2.5; // More space between different branches
                });

            const root = d3.hierarchy(data);
            treeLayout(root);

            // RTL adjustment - flip horizontally
            root.descendants().forEach(d => {
                d.x = (width - 200) - d.x;
                d.y = -d.y; // Invert Y for bottom-up
            });

            // Re-center after flip
            const descendants = root.descendants();
            let minX = Infinity, maxX = -Infinity;
            descendants.forEach(d => {
                if (d.x < minX) minX = d.x;
                if (d.x > maxX) maxX = d.x;
            });
            const centerX = (minX + maxX) / 2;
            const shiftX = (width / 2) - centerX;
            descendants.forEach(d => {
                d.x += shiftX;
                d.y += height - 150; // Move to bottom
            });

            nodesData = root.descendants();
            linksData = root.links();

            console.log('Tree layout calculated. Nodes:', nodesData.length, 'Links:', linksData.length);

            // Draw background circle (green circle from React)
            const circleRadius = Math.min(width, height) * 0.4;
            g.append('circle')
                .attr('cx', width / 2)
                .attr('cy', height / 2)
                .attr('r', circleRadius)
                .attr('fill', 'rgba(76, 175, 80, 0.1)')
                .attr('stroke', 'rgba(184, 242, 100, 0.3)')
                .attr('stroke-width', 2);

            // Draw trunk (from React design)
            if (nodesData.length > 0) {
                const rootNode = nodesData[0];
                drawTrunk(rootNode.x, rootNode.y);
            }

            // Draw links (branches)
            drawLinks(linksData);

            // Draw nodes
            drawNodes(nodesData);

            console.log('Tree rendered successfully with', nodesData.length, 'nodes');

            // Auto-fit on initial load to center tree
            setTimeout(() => {
                autoFit();
            }, 100);

            // Ensure tree stays visible
            if (g.selectAll('.nodes').empty()) {
                console.error('No nodes were drawn! Re-rendering...');
                setTimeout(() => renderTreeWithD3(data), 100);
            }
        }

        // Draw trunk
        function drawTrunk(x, y) {
            const trunkGroup = g.append('g').attr('transform', `translate(${x}, ${y})`);

            // Main trunk
            trunkGroup.append('path')
                .attr('d', 'M-50,20 Q-60,180 -130,420 L130,420 Q60,180 50,20 Z')
                .attr('fill', 'url(#trunkGradient)')
                .attr('stroke', 'url(#trunkGradient)')
                .attr('stroke-width', 2);

            // Roots
            const roots = [
                { d: 'M-130,420 Q-160,460 -200,450', w: 10 },
                { d: 'M-60,420 Q-80,460 -110,480', w: 7 },
                { d: 'M130,420 Q160,460 200,450', w: 10 },
                { d: 'M60,420 Q80,460 110,480', w: 7 },
                { d: 'M-20,420 Q-30,470 0,500', w: 6 }
            ];

            // Get current template colors for roots
            const templateId = window.currentTemplateId || 11;
            const colors = getTemplateColors(templateId);

            roots.forEach(root => {
                trunkGroup.append('path')
                    .attr('d', root.d)
                    .attr('fill', 'none')
                    .attr('stroke', colors.trunkStart)
                    .attr('stroke-width', root.w)
                    .attr('stroke-linecap', 'round');
            });
        }

        // Draw links (branches)
        function drawLinks(links) {
            const linkGroup = g.append('g').attr('class', 'links');

            links.forEach(link => {
                const sourceX = link.source.x;
                const sourceY = link.source.y;
                const targetX = link.target.x;
                const targetY = link.target.y;

                // Calculate curve control points
                const verticalDistance = Math.abs(targetY - sourceY);
                const curveTension = Math.min(0.6, Math.max(0.3, verticalDistance / 300));

                let cp1, cp2;
                if (link.source.depth === 0) {
                    cp1 = { x: sourceX, y: sourceY - (verticalDistance * 0.6) };
                    cp2 = { x: targetX, y: targetY }; // Changed from y: targetY + 45 to y: targetY to eliminate gap
                } else if (link.source.depth === 1) {
                    // Branches from parents - connect directly to target (leaf attaches at end)
                    cp1 = { x: sourceX, y: sourceY - (verticalDistance * curveTension) };
                    cp2 = { x: targetX, y: targetY }; // Branch ends exactly at leaf node
                } else {
                    cp1 = { x: sourceX, y: sourceY - (verticalDistance * curveTension) };
                    cp2 = { x: targetX, y: targetY }; // Changed from y: targetY + 30 to y: targetY to eliminate gap
                }

                // Branch width based on depth - make branches from parents (depth 1) thinner
                const depth = link.target.depth;
                let baseWidth = 50;

                // Make branches from parents (depth 1) thinner
                if (link.source.depth === 1) {
                    baseWidth = 35; // Thinner branches from parents
                }

                const startWidth = Math.max(baseWidth * Math.pow(0.65, link.source.depth), 3);
                const endWidth = Math.max(baseWidth * Math.pow(0.65, depth), 2);
                const sw = startWidth / 2;
                const ew = endWidth / 2;

                // Tapered branch path
                const pathD = `
                    M ${sourceX - sw},${sourceY}
                    C ${cp1.x - sw},${cp1.y} ${cp2.x - ew},${cp2.y} ${targetX - ew},${targetY}
                    L ${targetX + ew},${targetY}
                    C ${cp2.x + ew},${cp2.y} ${cp1.x + sw},${cp1.y} ${sourceX + sw},${sourceY}
                    Z
                `;

                // Get current template colors for branches
                const templateId = window.currentTemplateId || 11;
                const colors = getTemplateColors(templateId);

                linkGroup.append('path')
                    .attr('d', pathD)
                    .attr('fill', colors.trunkStart)
                    .attr('stroke', colors.trunkEnd)
                    .attr('stroke-width', 1)
                    .attr('opacity', 1.0); // Template-specific branches, not transparent
            });
        }

        // Draw nodes
        function drawNodes(nodes) {
            const nodeGroup = g.append('g').attr('class', 'nodes');

            nodes.forEach(node => {
                const isRoot = node.depth === 0;
                const isLeaf = !node.children || node.children.length === 0;
                const isSelected = node.data.id === selectedId;

                const nodeG = nodeGroup.append('g')
                    .attr('class', 'tree-node' + (isSelected ? ' selected' : ''))
                    .attr('transform', `translate(${node.x}, ${node.y})`)
                    .on('click', () => {
                        selectedId = node.data.id;
                        renderTree(window.treeDataGlobal || treeData); // Re-render to show selection
                    });

                if (isRoot) {
                    // Root node - green leaf shape
                    const rootPath = "M-70,0 C-70,-40 -30,-80 0,-90 C30,-80 70,-40 70,0 C70,50 30,70 0,80 C-30,70 -70,50 -70,0";

                    nodeG.append('circle')
                        .attr('r', 75)
                        .attr('fill', '#fcd34d')
                        .attr('opacity', 0.8);

                    nodeG.append('path')
                        .attr('d', rootPath)
                        .attr('fill', 'url(#leafGradient)')
                        .attr('stroke', '#14532d')
                        .attr('stroke-width', 3)
                        .attr('transform', 'scale(1.5)');

                    nodeG.append('text')
                        .attr('y', 10)
                        .attr('text-anchor', 'middle')
                        .attr('fill', 'white')
                        .attr('font-size', '24px')
                        .attr('font-weight', 'bold')
                        .attr('class', 'pointer-events-none')
                        .text(node.data.name);

                    nodeG.append('text')
                        .attr('y', 35)
                        .attr('text-anchor', 'middle')
                        .attr('fill', '#dcfce7')
                        .attr('font-size', '14px')
                        .attr('font-weight', 'bold')
                        .attr('class', 'pointer-events-none')
                        .text(node.data.age);

                    // Selection ring
                    if (isSelected) {
                        nodeG.append('circle')
                            .attr('r', 85)
                            .attr('class', 'selection-ring');
                    }
                } else if (isLeaf) {
                    // Leaf node - smaller and attached to the end of branch
                    // Dynamic width leaf implementation
                    const rawName = node.data.name || '';

                    // Create a temporary text element to measure width
                    const tempText = g.append('text')
                        .attr('font-size', '12px')
                        .attr('font-weight', 'bold')
                        .text(rawName);

                    const bbox = tempText.node().getBBox();
                    const textWidth = bbox.width;
                    tempText.remove();

                    // Calculate dynamic dimensions
                    const BASE_HEIGHT = 65;
                    const dynamicWidth = textWidth + 40; // 20px padding on each side

                    // Create parametric leaf path using the specified formula
                    const leafPath = `M 0,0 Q ${dynamicWidth/2},-${BASE_HEIGHT/2} 0,-${BASE_HEIGHT} Q -${dynamicWidth/2},-${BASE_HEIGHT/2} 0,0`;

                    // Create a group for leaf and its internal text
                    const leafG = nodeGroup.append('g')
                        .attr('transform', `translate(${node.x}, ${node.y})`);

                    // Draw leaf shape
                    leafG.append('path')
                        .attr('d', leafPath)
                        .attr('fill', 'url(#leafGradientHighlight)')
                        .attr('stroke', '#15803d')
                        .attr('stroke-width', 2);

                    // Add text element centered horizontally
                    leafG.append('text')
                        .attr('text-anchor', 'middle')
                        .attr('x', 0)
                        .attr('y', -BASE_HEIGHT/2)
                        .attr('fill', '#ffffff')
                        .attr('font-size', '12px')
                        .attr('font-weight', 'bold')
                        .attr('class', 'pointer-events-none')
                        .attr('dominant-baseline', 'middle')
                        .text(rawName);

                    // Selection ring if selected - using dynamic width + 20px
                    if (isSelected) {
                        const selectionRingWidth = dynamicWidth + 20;
                        const selectionRingHeight = BASE_HEIGHT + 20;
                        const selectionPath = `M 0,0 Q ${selectionRingWidth/2},-${selectionRingHeight/2} 0,-${selectionRingHeight} Q -${selectionRingWidth/2},-${selectionRingHeight/2} 0,0`;

                        leafG.append('path')
                            .attr('d', selectionPath)
                            .attr('fill', 'none')
                            .attr('stroke', '#3b82f6')
                            .attr('stroke-width', 4)
                            .attr('stroke-dasharray', '8 4')
                            .attr('opacity', 0.8)
                            .attr('class', 'selection-ring')
                            .append('animateTransform')
                            .attr('attributeName', 'transform')
                            .attr('type', 'rotate')
                            .attr('from', '0 0 0')
                            .attr('to', '360 0 0')
                            .attr('dur', '10s')
                            .attr('repeatCount', 'indefinite');
                    }
                } else {
                    // Intermediate node (fruit/orange circle)
                    const fruitRadius = node.depth === 1 ? 42 : 38;

                    nodeG.append('path')
                        .attr('d', 'M-10,-25 Q-20,-45 0,-50 Q20,-45 10,-25')
                        .attr('fill', '#65a30d')
                        .attr('stroke', '#365314')
                        .attr('stroke-width', 1);

                    nodeG.append('path')
                        .attr('d', 'M0,0 L0,25')
                        .attr('stroke', '#5d4037')
                        .attr('stroke-width', Math.max(40 * Math.pow(0.6, node.depth), 3))
                        .attr('fill', 'none');

                    nodeG.append('circle')
                        .attr('r', fruitRadius)
                        .attr('fill', node.depth === 1 ? 'url(#fruitGradientDark)' : 'url(#fruitGradient)')
                        .attr('stroke', '#b45309')
                        .attr('stroke-width', 2);

                    nodeG.append('path')
                        .attr('d', 'M-20,-10 Q-10,-25 10,-10')
                        .attr('stroke', 'white')
                        .attr('stroke-width', 2)
                        .attr('opacity', 0.4)
                        .attr('fill', 'none');

                    nodeG.append('text')
                        .attr('y', 5)
                        .attr('text-anchor', 'middle')
                        .attr('fill', '#7c2d12')
                        .attr('font-size', node.depth === 1 ? '18px' : '16px')
                        .attr('font-weight', 'bold')
                        .attr('class', 'pointer-events-none')
                        .text(node.data.name);

                    if (isSelected) {
                        nodeG.append('circle')
                            .attr('r', 42)
                            .attr('class', 'selection-ring');
                    }
                }
            });

            // Add SVG gradients and filters
            addSVGDefs();
        }

        // Get template-specific colors
        function getTemplateColors(templateId) {
            const colors = {
                // Template 11 (Base) - Brown/Green
                11: {
                    trunkStart: '#5d4037',
                    trunkMid: '#8d6e63',
                    trunkEnd: '#4e342e',
                    leafLight: '#22c55e',
                    leafDark: '#15803d',
                    leafHighlightLight: '#86efac',
                    leafHighlightDark: '#16a34a',
                    fruitLight: '#fcd34d',
                    fruitDark: '#f97316',
                    fruitDarkLight: '#fbbf24',
                    fruitDarkDark: '#d97706'
                },
                // Template 12 - Maroon/Dark Green
                12: {
                    trunkStart: '#8a0404ff',
                    trunkMid: '#660000',
                    trunkEnd: '#660000',
                    leafLight: '#e97f9aff',
                    leafDark: '#ee5aa7ff',
                    leafHighlightLight: '#db345eff',
                    leafHighlightDark: '#db345eff',
                    fruitLight: '#feb2b2ff',
                    fruitDark: '#feb2b2ff',
                    fruitDarkLight: '#feb2b2ff',
                    fruitDarkDark: '#feb2b2ff'
                },
                // Template 13 - Dark Slate Gray/Lime Green
                13: {
                    trunkStart: '#735d47ff',
                    trunkMid: '#6d5a47ff',
                    trunkEnd: '#605040',
                    leafLight: '#70bd23ff',
                    leafDark: '#207030',
                    leafHighlightLight: '#48ae48ff',
                    leafHighlightDark: '#28903dff',
                    fruitLight: '#f98d40ff',
                    fruitDark: '#d87d16ff',
                    fruitDarkLight: '#f4bb49ff',
                    fruitDarkDark: '#f9ce3fff'
                },
                // Template 14 - Navy/Teal
                14: {
                    trunkStart: '#744d03ff',
                    trunkMid: '#744d03ff',
                    trunkEnd: '#744d03ff',
                    leafLight: '#70bd23ff',
                    leafDark: '#e59101ff',
                    leafHighlightLight: '#1f801cff',
                    leafHighlightDark: '#069e48ff',
                    fruitLight: '#70bd23ff',
                    fruitDark: '#e59101ff',
                    fruitDarkLight: '#70bd23ff',
                    fruitDarkDark: '#e59101ff'
                },
                // Template 15 - Purple/Sea Green
                15: {
                    trunkStart: '#8e6314ff',
                    trunkMid: '#8e6314ff',
                    trunkEnd: '#8e6314ff',
                    leafLight: '#e8da3bff',
                    leafDark: '#f8b12dff',
                    leafHighlightLight: '#3a8b2eff',
                    leafHighlightDark: '#3a8b2eff',
                    fruitLight: '#f8b12dff',
                    fruitDark: '#e8da3bff',
                    fruitDarkLight: '#f8b12dff',
                    fruitDarkDark: '#e8da3bff'
                }
            };

            return colors[templateId] || colors[11]; // Default to template 11
        }

        // Add SVG definitions (gradients, filters)
        function addSVGDefs() {
            // Get current template colors
            const templateId = window.currentTemplateId || 11;
            const colors = getTemplateColors(templateId);

            // Clear existing defs to allow redefinition
            svg.select('defs').remove();

            const defs = svg.append('defs');

            // Shadow filter
            defs.append('filter')
                .attr('id', 'shadow')
                .append('feDropShadow')
                .attr('dx', 2)
                .attr('dy', 3)
                .attr('stdDeviation', 2)
                .attr('flood-color', '#000000')
                .attr('flood-opacity', 0.2);

            // Leaf gradient
            const leafGrad = defs.append('linearGradient')
                .attr('id', 'leafGradient')
                .attr('x1', '0%')
                .attr('y1', '100%')
                .attr('x2', '0%')
                .attr('y2', '0%');
            leafGrad.append('stop').attr('offset', '0%').attr('stop-color', colors.leafLight);
            leafGrad.append('stop').attr('offset', '100%').attr('stop-color', colors.leafDark);

            // Leaf highlight gradient
            const leafHighlightGrad = defs.append('linearGradient')
                .attr('id', 'leafGradientHighlight')
                .attr('x1', '0%')
                .attr('y1', '0%')
                .attr('x2', '100%')
                .attr('y2', '100%');
            leafHighlightGrad.append('stop').attr('offset', '0%').attr('stop-color', colors.leafHighlightLight);
            leafHighlightGrad.append('stop').attr('offset', '100%').attr('stop-color', colors.leafHighlightDark);

            // Fruit gradient
            const fruitGrad = defs.append('linearGradient')
                .attr('id', 'fruitGradient')
                .attr('x1', '30%')
                .attr('y1', '30%')
                .attr('x2', '100%')
                .attr('y2', '100%');
            fruitGrad.append('stop').attr('offset', '0%').attr('stop-color', colors.fruitLight);
            fruitGrad.append('stop').attr('offset', '100%').attr('stop-color', colors.fruitDark);

            // Fruit dark gradient
            const fruitDarkGrad = defs.append('linearGradient')
                .attr('id', 'fruitGradientDark')
                .attr('x1', '30%')
                .attr('y1', '30%')
                .attr('x2', '100%')
                .attr('y2', '100%');
            fruitDarkGrad.append('stop').attr('offset', '0%').attr('stop-color', colors.fruitDarkLight);
            fruitDarkGrad.append('stop').attr('offset', '100%').attr('stop-color', colors.fruitDarkDark);

            // Trunk gradient
            const trunkGrad = defs.append('linearGradient')
                .attr('id', 'trunkGradient')
                .attr('x1', '0%')
                .attr('y1', '0%')
                .attr('x2', '100%')
                .attr('y2', '0%');
            trunkGrad.append('stop').attr('offset', '0%').attr('stop-color', colors.trunkStart);
            trunkGrad.append('stop').attr('offset', '30%').attr('stop-color', colors.trunkMid);
            trunkGrad.append('stop').attr('offset', '70%').attr('stop-color', colors.trunkMid);
            trunkGrad.append('stop').attr('offset', '100%').attr('stop-color', colors.trunkEnd);
        }

        // Show empty tree message
        function showEmptyTree() {
            // Only show empty tree if we don't have any data
            if (window.treeDataGlobal && window.treeDataGlobal.id) {
                console.log('Have tree data, not showing empty tree');
                return;
            }

            const container = document.getElementById('tree-container');
            if (container) {
                // Clear SVG if exists
                d3.select('#tree-container').selectAll('svg').remove();
                container.innerHTML = `
                    <div style="text-align: center; padding: 100px 20px; color: #6b7280;">
                        <div style="font-size: 48px; margin-bottom: 20px;">🌳</div>
                        <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">في انتظار البيانات</div>
                        <div style="font-size: 16px;">تحميل بيانات العائلة من API</div>
                    </div>
                `;
            }
        }

        // Zoom functions
        function zoomIn() {
            const centerX = width / 2;
            const centerY = height / 2;

            // Calculate zoom point in tree coordinates
            const treeX = (centerX - panX - width / 2) / zoom;
            const treeY = (centerY - panY - height / 2) / zoom;

            // Apply zoom
            zoom = Math.min(zoom + 0.2, 3);

            // Adjust pan to zoom towards center
            panX = centerX - (treeX * zoom) - (width / 2 - treeX * zoom);
            panY = centerY - (treeY * zoom) - (height / 2 - treeY * zoom);

            // Constrain
            // No constraints - user can move freely
            updateZoom();
            updateZoomButtons();
        }

        function zoomOut() {
            const centerX = width / 2;
            const centerY = height / 2;

            // Calculate zoom point in tree coordinates
            const treeX = (centerX - panX - width / 2) / zoom;
            const treeY = (centerY - panY - height / 2) / zoom;

            // Apply zoom
            zoom = Math.max(zoom - 0.2, 0.3);

            // Adjust pan to zoom towards center
            panX = centerX - (treeX * zoom) - (width / 2 - treeX * zoom);
            panY = centerY - (treeY * zoom) - (height / 2 - treeY * zoom);

            // No constraints - free movement
            updateZoom();
            updateZoomButtons();
        }

        function resetZoom() {
            zoom = 1;
            panX = 0;
            panY = 0;
            updateZoom();
            updateZoomButtons();
            autoFit();
        }

        function updateZoom() {
            if (g) {
                // Apply transform - scale around center, then translate
                g.attr('transform', `translate(${panX + width/2}, ${panY + height/2}) scale(${zoom}) translate(${-width/2}, ${-height/2})`);
                updateZoomDisplay();
            }
        }

        function updateZoomDisplay() {
            const display = document.getElementById('zoom-display');
            if (display) {
                display.textContent = Math.round(zoom * 100) + '%';
            }
        }

        function updateZoomButtons() {
            const zoomInBtn = document.getElementById('zoom-in-btn');
            const zoomOutBtn = document.getElementById('zoom-out-btn');

            if (zoomInBtn) zoomInBtn.disabled = zoom >= 3;
            if (zoomOutBtn) zoomOutBtn.disabled = zoom <= 0.3;
        }

        // Auto-fit tree to viewport - center it perfectly
        function autoFit() {
            if (!svg || !nodesData || nodesData.length === 0) return;

            const bounds = getTreeBounds();
            if (!bounds) return;

            // Calculate zoom to fit tree nicely in viewport
            const padding = 50; // Padding around tree
            const scaleX = (width - padding * 2) / bounds.width;
            const scaleY = (height - padding * 2) / bounds.height;
            const autoZoom = Math.min(scaleX, scaleY, 1) * 0.85; // Slightly smaller to show more context

            zoom = Math.max(0.3, Math.min(3, autoZoom));

            // Center the tree perfectly in viewport
            const treeCenterX = (bounds.minX + bounds.maxX) / 2;
            const treeCenterY = (bounds.minY + bounds.maxY) / 2;

            // Calculate pan to center tree in viewport
            panX = (width / 2) - (treeCenterX * autoZoom);
            panY = (height / 2) - (treeCenterY * autoZoom);

            console.log('Auto-fit: zoom=', zoom, 'panX=', panX, 'panY=', panY);

            updateZoom();
            updateZoomButtons();
        }

        function getTreeBounds() {
            if (!nodesData || nodesData.length === 0) return null;

            let minX = Infinity, maxX = -Infinity;
            let minY = Infinity, maxY = -Infinity;

            nodesData.forEach(node => {
                minX = Math.min(minX, node.x);
                maxX = Math.max(maxX, node.x);
                minY = Math.min(minY, node.y);
                maxY = Math.max(maxY, node.y);
            });

            return {
                minX, maxX, minY, maxY,
                width: maxX - minX,
                height: maxY - minY
            };
        }

        // Pan handlers (now handled directly in SVG event listeners)

        // Load tree data from API if not provided
        async function loadTreeDataFromAPI() {
            // Get token from localStorage
            const token = localStorage.getItem('authToken');

            if (!token) {
                console.log('No auth token found, showing empty tree');
                showEmptyTree();
                return;
            }

            try {
                // Ensure we have the correct API URL
                const apiUrl = '/api/tree_creator/family-members-data';
                console.log('Fetching tree data from:', apiUrl);
                console.log('Token exists:', !!token);
                console.log('Token length:', token ? token.length : 0);

                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                console.log('API Response status:', response.status);

                if (!response.ok) {
                    // Get error message from response
                    let errorMessage = 'Failed to load data';
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorMessage;
                        console.error('API Error Response:', errorData);
                    } catch (e) {
                        console.error('Failed to parse error response. Status:', response.status);
                    }

                    if (response.status === 401 || response.status === 403) {
                        console.warn('Unauthorized (401/403) - User not authenticated or not a tree_creator. Please login.');
                        showEmptyTree();
                        return;
                    }

                    if (response.status === 404) {
                        console.error('❌ API endpoint not found (404):', apiUrl);
                        console.error('Possible causes:');
                        console.error('1. Route not registered - check routes/api.php');
                        console.error('2. Middleware issue - check app/Http/Kernel.php');
                        console.error('3. User not authenticated - check localStorage for authToken');
                        console.error('4. User role is not "tree_creator"');
                        showEmptyTree();
                        return;
                    }

                    throw new Error(`${errorMessage} (Status: ${response.status})`);
                }

                const data = await response.json();
                console.log('API Data received:', data);

                // Extract template ID if available
                const templateId = data.template_id || null;
                console.log('Template ID:', templateId);

                const members = data.family_data_members_tree || data.data || data.members || [];

                // Store template ID globally
                window.currentTemplateId = templateId;

                if (members.length === 0) {
                    console.log('No members found, showing empty tree');
                    showEmptyTree();
                    return;
                }

                // Convert to tree structure
                const treeStructure = convertToTree(members);

                if (!treeStructure) {
                    console.error('Failed to convert members to tree structure');
                    showEmptyTree();
                    return;
                }
                console.log("xxxx");
                console.log(treeStructure);
                // Only replace if we got a valid tree with an id
                if (treeStructure && treeStructure.id) {
                    console.log('loadTreeDataFromAPI: valid tree received, updating global.');
                    window.treeDataGlobal = treeStructure;
                    // If tree already initialized, re-render only once
                    if (window.__shagertk_initialized) {
                        console.log('loadTreeDataFromAPI: tree already initialized - calling renderTree once.');
                        renderTree(treeStructure);
                    }
                } else {
                    console.log('loadTreeDataFromAPI: invalid/no treeStructure - not overriding existing tree.');
                }
            } catch (error) {
                console.error('Error loading tree data from API:', error);
                // Don't show empty tree if we already have mock data - just keep existing tree
                if (!window.treeDataGlobal || !window.treeDataGlobal.id) {
                    console.log('No existing tree data, showing empty tree');
                    showEmptyTree();
                } else {
                    console.log('API failed but keeping existing tree data (mock data)');
                }
            }
        }

        // ---- robust init START ----

        // Guard to prevent double initialization (works across HMR/dev reloads)
        if (!window.__shagertk_init_requested) {
            window.__shagertk_init_requested = true;

            async function startTreeApp() {
                console.log('shagertk: startTreeApp');

                // Hide background placeholders early (avoid flash from static DOM)
                const bg = document.querySelector('.background');
                if (bg) bg.style.display = 'none';

                // If server provided treeData via blade, prefer it (synchronous render)
                try {
                    if (typeof treeData !== 'undefined' && treeData && treeData.id) {
                        console.log('shagertk: using server-provided treeData');
                        window.treeDataGlobal = treeData;
                        // Store template ID if available
                        if (treeData.template_id) {
                            window.currentTemplateId = treeData.template_id;
                        }
                        // Initialize and render once
                        initTree();
                        return;
                    }
                } catch (e) {
                    console.warn('shagertk: server treeData check failed', e);
                }

                // Otherwise, show loader (already present in DOM) and fetch API data.
                const loadingEl = document.getElementById('tree-loading');
                if (loadingEl) loadingEl.style.display = 'block';

                // Try to load data from API (this function exists in file)
                try {
                    await loadTreeDataFromAPI(); // this will set window.treeDataGlobal if successful
                } catch (e) {
                    console.error('shagertk: loadTreeDataFromAPI threw', e);
                }

                // After attempting to load, if we have valid data render, else show empty message (no flash of mock)
                if (window.treeDataGlobal && window.treeDataGlobal.id) {
                    // ensure single init
                    if (!window.__shagertk_initialized) {
                        window.__shagertk_initialized = true;
                        initTree();
                    } else {
                        console.warn('shagertk: already initialized, skipping initTree');
                    }
                } else {
                    // no data -> show elegant empty state (function already handles cleaning)
                    showEmptyTree();
                }

                // hide loader
                if (loadingEl) loadingEl.style.display = 'none';
            }

            // Use DOMContentLoaded once
            document.addEventListener('DOMContentLoaded', function onDomLoad() {
                document.removeEventListener('DOMContentLoaded', onDomLoad);
                // Start the app (no mock immediate rendering)
                startTreeApp();
            }, { once: true });
        } else {
            console.log('shagertk: init already requested (HMR/dev reload protection)');
        }

        // ---- robust init END ----
    </script>
</body>

</html>
