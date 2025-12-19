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
            overflow: hidden; /* Keep overflow hidden for zoom/pan */
        }
        
        /* Unified CSS classes for free templates */
        .template-container {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden; /* Keep overflow hidden for zoom/pan */
        }
        
        .free-template-wrapper {
            position: relative;
            width: 100%;
            height: 100%;
            transform-origin: center center;
            transition: transform 0.2s ease; /* Smooth transitions */
        }
        
        .nodes-layer {
            position: relative;
            width: 100%;
            height: 100%;
        }
        
        .tree-links-svg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        }
        
        .node {
            position: absolute;
            z-index: 2;
            border-radius: 8px;
            padding: 10px;
            min-width: 160px; /* Updated to match BASE_NODE_WIDTH */
            text-align: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            transition: transform 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        }
        
        .node:hover {
            transform: scale(1.05);
            z-index: 3;
        }
        
        .node-body {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
        }
        
        .node-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
        }
        
        .node-name {
            font-weight: bold;
            margin-bottom: 5px;
            font-size: 16px;
        }
        
        .node-age {
            font-size: 0.9em;
            opacity: 0.8;
        }
        
        /* Template-specific styling */
        .node-1 {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: 2px solid gold;
            min-width: 160px; /* Updated to match BASE_NODE_WIDTH */
            min-height: 70px;
        }
        
        .node-2 {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            border-radius: 50%;
            min-width: 160px; /* Updated to match BASE_NODE_WIDTH */
            min-height: 160px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .node-3 {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            border: 2px solid #3498db;
            min-width: 160px; /* Updated to match BASE_NODE_WIDTH */
            min-height: 60px;
        }
        
        .node-4 {
            background: #9b59b6;
            color: white;
            border: 2px solid #8e44ad;
            min-width: 160px; /* Updated to match BASE_NODE_WIDTH */
            min-height: 80px;
        }
        
        .node-5 {
            background: #e67e22;
            color: white;
            border: 2px solid #d35400;
            min-width: 160px; /* Updated to match BASE_NODE_WIDTH */
            min-height: 50px;
        }
        
        .node-6 {
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: white;
            min-width: 160px; /* Updated to match BASE_NODE_WIDTH */
            min-height: 90px;
        }
        
        .node-7 {
            background: #2c3e50;
            color: white;
            min-width: 160px; /* Updated to match BASE_NODE_WIDTH */
            min-height: 60px;
        }
        
        .node-8 {
            background: #1abc9c;
            color: white;
            transform: rotate(15deg);
            min-width: 160px; /* Updated to match BASE_NODE_WIDTH */
            min-height: 70px;
        }
        
        .node-9 {
            background: linear-gradient(135deg, #5f27cd, #341f97);
            color: white;
            border-radius: 0;
            min-width: 160px; /* Updated to match BASE_NODE_WIDTH */
            min-height: 75px;
        }
        
        .node-10 {
            background: #e74c3c;
            color: white;
            border-radius: 20px;
            padding: 5px;
            min-width: 160px; /* Updated to match BASE_NODE_WIDTH */
            min-height: 50px;
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
        
        // Layout Engine - converts treeData to nodes and links for free templates
        function layoutEngine(treeData, templateId) {
            const nodes = [];
            const links = [];
            
            // Skip special layout for non-standard templates
            if (templateId === 5 || templateId === 7 || templateId === 8) {
                // Use existing logic for special templates
                const visited = new Set();
                
                function dfs(node, level = 0, index = 0, parentIndex = null, xOffset = 0, yOffset = 0) {
                    if (!node || visited.has(node.id)) return;
                    
                    visited.add(node.id);
                    
                    // Calculate spacing based on templateId
                    const horizontalSpacing = getHorizontalSpacing(templateId);
                    const verticalSpacing = getVerticalSpacing(templateId);
                    
                    // Position calculation with offset for better layout
                    let x, y;
                    
                    // Special handling for different templates
                    if (templateId === 5) {
                        // Horizontal tree - arrange nodes horizontally
                        x = xOffset + level * horizontalSpacing;
                        y = yOffset + index * verticalSpacing;
                    } else if (templateId === 7) {
                        // Timeline - alternate positions
                        x = xOffset + index * horizontalSpacing;
                        y = yOffset + (level % 2 === 0 ? 100 : 300);
                    } else if (templateId === 8) {
                        // Fan chart - radial positioning
                        const angle = (index * 30) * (Math.PI / 180);
                        const radius = level * 150;
                        x = xOffset + Math.cos(angle) * radius;
                        y = yOffset + Math.sin(angle) * radius;
                    } else {
                        // Standard vertical tree
                        x = xOffset + index * horizontalSpacing;
                        y = yOffset + level * verticalSpacing;
                    }
                    
                    // Add node
                    nodes.push({
                        id: node.id,
                        name: node.name,
                        age: node.age,
                        x: x,
                        y: y,
                        level: level
                    });
                    
                    // Add link to parent if exists
                    if (parentIndex !== null) {
                        links.push({
                            from: parentIndex,
                            to: node.id
                        });
                    }
                    
                    // Process children
                    if (node.children && node.children.length > 0) {
                        // Calculate total width needed for children
                        const totalWidth = node.children.length * horizontalSpacing;
                        const startX = x - totalWidth / 2 + horizontalSpacing / 2;
                        
                        node.children.forEach((child, childIndex) => {
                            if (templateId === 5) {
                                // For horizontal tree, increment level for x-axis
                                dfs(child, level + 1, childIndex, node.id, xOffset, yOffset);
                            } else if (templateId === 7) {
                                // For timeline, alternate y positions
                                dfs(child, level + 1, childIndex, node.id, xOffset, yOffset);
                            } else if (templateId === 8) {
                                // For fan chart, use radial positioning
                                dfs(child, level + 1, childIndex, node.id, xOffset, yOffset);
                            } else {
                                // Standard vertical tree
                                dfs(child, level + 1, childIndex, node.id, startX, yOffset);
                            }
                        });
                    }
                }
                
                // Start DFS from root
                if (treeData) {
                    dfs(treeData, 0, 0, null, 400, 100);
                }
                
                return { nodes, links };
            }
            
            // Proper two-pass tree layout algorithm for standard templates (1-4, 6, 9, 10)
            
            // Constants for dynamic spacing
            const BASE_NODE_WIDTH = 160;
            const H_GAP = 40;
            const V_GAP = 220;
            
            // PASS 1 – Measure phase: Calculate subtree widths
            function calculateSubtreeWidths(node) {
                if (!node) return 0;
                
                // A leaf node has width = 1
                if (!node.children || node.children.length === 0) {
                    node._subtreeWidth = 1;
                    return 1;
                }
                
                // A parent width = sum(children widths)
                let totalWidth = 0;
                node.children.forEach(child => {
                    totalWidth += calculateSubtreeWidths(child);
                });
                
                node._subtreeWidth = totalWidth;
                return node._subtreeWidth;
            }
            
            // PASS 2 – Position phase: Position nodes based on subtree widths with proper centering
            function positionNodes(node, level = 0, parent = null) {
                if (!node) return;
                
                // Calculate y position based on level
                const y = level * V_GAP + 100; // Add top margin
                
                // Position this node
                if (parent === null) {
                    // Root node - center it in the container
                    const containerWidth = document.getElementById('tree-container').offsetWidth || 1200;
                    node._x = containerWidth / 2;
                } else {
                    // Position will be set by parent during children positioning
                }
                
                // Add node to result
                nodes.push({
                    id: node.id,
                    name: node.name,
                    age: node.age,
                    x: node._x,
                    y: y,
                    level: level
                });
                
                // Add link to parent if exists
                if (parent !== null) {
                    links.push({
                        from: parent.id,
                        to: node.id
                    });
                }
                
                // Position children
                if (node.children && node.children.length > 0) {
                    // Calculate total width needed for children including gaps
                    let totalChildrenWidth = 0;
                    node.children.forEach(child => {
                        totalChildrenWidth += (child._subtreeWidth || 1);
                    });
                    
                    // Add gaps between children
                    const totalWidthWithGaps = totalChildrenWidth * BASE_NODE_WIDTH + (node.children.length - 1) * H_GAP;
                    
                    // Start position for first child (centered under parent)
                    let currentX = node._x - totalWidthWithGaps / 2 + BASE_NODE_WIDTH / 2;
                    
                    // Position each child and calculate their positions
                    node.children.forEach(child => {
                        // Set child's x position
                        child._x = currentX;
                        
                        // Position child
                        positionNodes(child, level + 1, node);
                        
                        // Move to next position
                        currentX += (child._subtreeWidth || 1) * BASE_NODE_WIDTH + H_GAP;
                    });
                }
            }
            
            // Improved two-pass algorithm with proper parent centering
            function improvedLayout(node) {
                if (!node) return;
                
                // First pass: calculate subtree widths
                function firstPass(n) {
                    if (!n) return 0;
                    
                    // Leaf node
                    if (!n.children || n.children.length === 0) {
                        n._subtreeWidth = 1;
                        return 1;
                    }
                    
                    // Internal node: sum of children widths
                    let width = 0;
                    n.children.forEach(child => {
                        width += firstPass(child);
                    });
                    
                    n._subtreeWidth = width;
                    return width;
                }
                
                // Second pass: position nodes
                function secondPass(n, level, x, y, parentX) {
                    if (!n) return;
                    
                    // Set position
                    n._x = x;
                    n._y = y;
                    
                    // Add to nodes array
                    nodes.push({
                        id: n.id,
                        name: n.name,
                        age: n.age,
                        x: n._x,
                        y: n._y,
                        level: level
                    });
                    
                    // Add link to parent
                    if (parentX !== undefined) {
                        links.push({
                            from: n._parentId,
                            to: n.id
                        });
                    }
                    
                    // Position children if they exist
                    if (n.children && n.children.length > 0) {
                        // Calculate total width of children
                        let totalWidth = 0;
                        n.children.forEach(child => {
                            totalWidth += child._subtreeWidth;
                        });
                        
                        // Total space needed including gaps
                        const totalSpace = totalWidth * BASE_NODE_WIDTH + (n.children.length - 1) * H_GAP;
                        
                        // Starting position (leftmost child)
                        let startX = x - totalSpace / 2 + BASE_NODE_WIDTH / 2;
                        
                        // Position each child
                        let currentX = startX;
                        n.children.forEach(child => {
                            // Store parent ID for linking
                            child._parentId = n.id;
                            
                            // Position child
                            secondPass(child, level + 1, currentX, y + V_GAP, x);
                            
                            // Move to next position
                            currentX += child._subtreeWidth * BASE_NODE_WIDTH + H_GAP;
                        });
                    }
                }
                
                // Execute passes
                firstPass(node);
                
                // Position root at center of container
                const containerWidth = document.getElementById('tree-container').offsetWidth || 1200;
                secondPass(node, 0, containerWidth / 2, 100);
            }
            
            // Execute improved layout algorithm
            if (treeData) {
                improvedLayout(treeData);
            }
            
            return { nodes, links };
        }

        // Helper functions for spacing based on template
        function getHorizontalSpacing(templateId) {
            // For templates 1-4, 6, 9, 10, we now use dynamic spacing in the layout engine
            // But keep these for templates 5, 7, 8
            const spacingMap = {
                1: 350, 2: 300, 3: 320, 4: 270, 5: 400,
                6: 300, 7: 320, 8: 300, 9: 320, 10: 250
            };
            return spacingMap[templateId] || 350;
        }
        
        function getVerticalSpacing(templateId) {
            // For templates 1-4, 6, 9, 10, we now use dynamic spacing in the layout engine
            // But keep these for templates 5, 7, 8
            const spacingMap = {
                1: 250, 2: 270, 3: 230, 4: 300, 5: 200,
                6: 270, 7: 220, 8: 320, 9: 250, 10: 200
            };
            return spacingMap[templateId] || 250;
        }

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
            
            // For templates 1-10, use the new free template renderer
            if (templateId >= 1 && templateId <= 10) {
                renderFreeTemplateGraph(templateId, treeData);
            }
            // For templates 11-15 (paid), use the existing renderer
            else if (templateId >= 11 && templateId <= 15) {
                renderPaidTemplate(treeData);
            }
            // Default fallback
            else {
                renderPaidTemplate(treeData);
            }
        }
        
        // Render function for free templates (1-10)
        function renderFreeTemplateGraph(templateId, treeData) {
            clearTreeContainer();
            
            const container = document.getElementById('tree-container');
            if (!container) return;
            
            // Apply template-specific CSS class
            container.className = '';
            container.classList.add('template-container', `template-${templateId}`);
            
            // Use layout engine to convert treeData to nodes and links
            const { nodes, links } = layoutEngine(treeData, templateId);
            
            // Create wrapper for zoom/pan functionality
            const wrapper = document.createElement('div');
            wrapper.className = 'free-template-wrapper';
            wrapper.style.position = 'relative';
            wrapper.style.width = '100%';
            wrapper.style.height = '100%';
            wrapper.style.transformOrigin = 'center center';
            
            // Create container for nodes
            const nodesLayer = document.createElement('div');
            nodesLayer.className = 'nodes-layer';
            nodesLayer.style.position = 'relative';
            nodesLayer.style.width = '100%';
            nodesLayer.style.height = '100%';
            
            // Render nodes
            nodes.forEach(node => {
                const nodeElement = document.createElement('div');
                nodeElement.className = `node node-${templateId}`;
                nodeElement.dataset.id = node.id;
                nodeElement.style.position = 'absolute';
                nodeElement.style.left = `${node.x}px`;
                nodeElement.style.top = `${node.y}px`;
                
                // Add template-specific content based on template ID
                let nodeContent = '';
                switch(templateId) {
                    case 1: // Cards
                        nodeContent = `
                            <div class="node-body">
                                <div class="node-content">
                                    <div class="node-name">${node.name}</div>
                                    <div class="node-age">${node.age}</div>
                                </div>
                            </div>`;
                        break;
                    case 2: // Circles
                        nodeContent = `
                            <div class="node-body">
                                <div class="node-content">
                                    <div class="node-name">${node.name}</div>
                                    <div class="node-age">${node.age}</div>
                                </div>
                            </div>`;
                        break;
                    case 3: // Boxes
                        nodeContent = `
                            <div class="node-body">
                                <div class="node-content">
                                    <div class="node-name">${node.name}</div>
                                    <div class="node-age">${node.age}</div>
                                </div>
                            </div>`;
                        break;
                    case 4: // Vertical Tree
                        nodeContent = `
                            <div class="node-body">
                                <div class="node-content">
                                    <div class="node-name">${node.name}</div>
                                    <div class="node-age">${node.age}</div>
                                </div>
                            </div>`;
                        break;
                    case 5: // Horizontal Tree
                        nodeContent = `
                            <div class="node-body">
                                <div class="node-content">
                                    <div class="node-name">${node.name}</div>
                                    <div class="node-age">${node.age}</div>
                                </div>
                            </div>`;
                        break;
                    case 6: // Grid
                        nodeContent = `
                            <div class="node-body">
                                <div class="node-content">
                                    <div class="node-name">${node.name}</div>
                                    <div class="node-age">${node.age}</div>
                                </div>
                            </div>`;
                        break;
                    case 7: // Timeline
                        nodeContent = `
                            <div class="node-body">
                                <div class="node-content">
                                    <div class="node-name">${node.name}</div>
                                    <div class="node-age">${node.age}</div>
                                </div>
                            </div>`;
                        break;
                    case 8: // Fan Chart
                        nodeContent = `
                            <div class="node-body">
                                <div class="node-content">
                                    <div class="node-name">${node.name}</div>
                                    <div class="node-age">${node.age}</div>
                                </div>
                            </div>`;
                        break;
                    case 9: // Images
                        nodeContent = `
                            <div class="node-body">
                                <div class="node-content">
                                    <div class="node-name">${node.name}</div>
                                    <div class="node-age">${node.age}</div>
                                </div>
                            </div>`;
                        break;
                    case 10: // Compact
                        nodeContent = `
                            <div class="node-body">
                                <div class="node-content">
                                    <div class="node-name">${node.name}</div>
                                    <div class="node-age">${node.age}</div>
                                </div>
                            </div>`;
                        break;
                    default:
                        nodeContent = `
                            <div class="node-body">
                                <div class="node-content">
                                    <div class="node-name">${node.name}</div>
                                    <div class="node-age">${node.age}</div>
                                </div>
                            </div>`;
                }
                
                nodeElement.innerHTML = nodeContent;
                nodesLayer.appendChild(nodeElement);
            });
            
            wrapper.appendChild(nodesLayer);
            container.appendChild(wrapper);
            
            // Draw SVG connections after a small delay to ensure DOM is rendered
            setTimeout(() => {
                drawSvgConnections(wrapper, nodes, links, templateId);
            }, 0);
            
            // Add zoom/pan functionality
            addZoomPanFunctionality(wrapper, templateId);
        }
        
        // Render function for paid templates (11-15)
        function renderPaidTemplate(treeData) {
            clearTreeContainer();
            
            const container = document.getElementById('tree-container');
            if (!container) return;
            
            // Apply template-specific CSS class
            container.className = '';
            container.classList.add('template-container', `template-11`);
            
            // Use layout engine to convert treeData to nodes and links
            const { nodes, links } = layoutEngine(treeData, 11);
            
            // Create container for nodes
            const nodesLayer = document.createElement('div');
            nodesLayer.className = 'nodes-layer';
            nodesLayer.style.position = 'relative';
            nodesLayer.style.width = '100%';
            nodesLayer.style.height = '100%';
            
            // Render nodes
            nodes.forEach(node => {
                const nodeElement = document.createElement('div');
                nodeElement.className = `node node-11`;
                nodeElement.dataset.id = node.id;
                nodeElement.style.position = 'absolute';
                nodeElement.style.left = `${node.x}px`;
                nodeElement.style.top = `${node.y}px`;
                
                // Add template-specific content based on template ID
                const nodeContent = `
                    <div class="node-body">
                        <div class="node-content">
                            <div class="node-name">${node.name}</div>
                            <div class="node-age">${node.age}</div>
                        </div>
                    </div>`;
                nodeElement.innerHTML = nodeContent;

                // Add click event listener to select node
                nodeElement.addEventListener('click', function() {
                    selectNode(node.id);
                });
                
                nodesLayer.appendChild(nodeElement);
            });
            
            // Render connections
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.className = 'tree-links-svg';
            svg.style.position = 'absolute';
            svg.style.width = '100%';
            svg.style.height = '100%';
            
            links.forEach(link => {
                const fromNode = nodes.find(n => n.id === link.from);
                const toNode = nodes.find(n => n.id === link.to);
                
                if (fromNode && toNode) {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', fromNode.x);
                    line.setAttribute('y1', fromNode.y);
                    line.setAttribute('x2', toNode.x);
                    line.setAttribute('y2', toNode.y);
                    line.setAttribute('stroke', 'rgba(39, 58, 65, 1)');
                    line.setAttribute('stroke-width', '2');
                    svg.appendChild(line);
                }
            });
            
            container.appendChild(nodesLayer);
            container.appendChild(svg);
            
            // Set up zoom/pan behavior
            setupZoomPan();
        }
        
        // Setup zoom and pan behavior
        function setupZoomPan() {
            const container = document.getElementById('tree-container');
            if (!container) return;
            
            const wrapper = container.querySelector('.free-template-wrapper');
            if (!wrapper) return;
            
            // Initialize zoom behavior
            window.zoomBehavior = d3.zoom()
                .scaleExtent([0.1, 4])
                .translateExtent([[-10000, -10000], [10000, 10000]])
                .on('zoom', function(event) {
                    wrapper.style.transform = `translate(${event.transform.x}px, ${event.transform.y}px) scale(${event.transform.k})`;
                    window.zoom = event.transform.k;
                    window.panX = event.transform.x;
                    window.panY = event.transform.y;
                    updateZoomDisplay();
                });
            
            // Apply zoom behavior to container
            d3.select(container).call(window.zoomBehavior);
            
            // Initialize panning behavior
            container.addEventListener('mousedown', function(event) {
                isPanning = true;
                startPan = { x: event.clientX, y: event.clientY };
            });
            
            container.addEventListener('mousemove', function(event) {
                if (isPanning) {
                    const dx = event.clientX - startPan.x;
                    const dy = event.clientY - startPan.y;
                    const newPanX = window.panX + dx;
                    const newPanY = window.panY + dy;
                    wrapper.style.transform = `translate(${newPanX}px, ${newPanY}px) scale(${window.zoom})`;
                    window.panX = newPanX;
                    window.panY = newPanY;
                }
            });
            
            container.addEventListener('mouseup', function() {
                isPanning = false;
            });
            
            container.addEventListener('mouseleave', function() {
                isPanning = false;
            });
        }
        
        // Update zoom display
        function updateZoomDisplay() {
            const zoomDisplay = document.getElementById('zoom-display');
            if (zoomDisplay) {
                zoomDisplay.innerText = `${Math.round(window.zoom * 100)}%`;
            }
        }
        
        // Redraw connections when zooming/panning
        function redrawConnectionsEnhanced() {
            const container = document.getElementById('tree-container');
            if (!container) return;
            
            const linksSvg = container.querySelector('.tree-links-svg');
            if (!linksSvg) return;
            
            const nodes = container.querySelectorAll('.node');
            const links = linksSvg.querySelectorAll('line');
            
            links.forEach(link => {
                const fromNode = nodes.find(n => n.dataset.id === link.getAttribute('from'));
                const toNode = nodes.find(n => n.dataset.id === link.getAttribute('to'));
                
                if (fromNode && toNode) {
                    const fromRect = fromNode.getBoundingClientRect();
                    const toRect = toNode.getBoundingClientRect();
                    
                    const fromX = fromRect.left + fromRect.width / 2;
                    const fromY = fromRect.bottom;
                    const toX = toRect.left + toRect.width / 2;
                    const toY = toRect.top;
                    
                    link.setAttribute('x1', fromX);
                    link.setAttribute('y1', fromY);
                    link.setAttribute('x2', toX);
                    link.setAttribute('y2', toY);
                }
            });
        }
        
        // Zoom in
        function zoomIn() {
            const container = document.getElementById('tree-container');
            if (!container) return;
            
            container.dispatchEvent(new WheelEvent('wheel', {
                deltaY: -100, // Negative deltaY simulates zooming in
                wheelDeltaY: -100,
                bubbles: true
            }));
        }
        
        // Zoom out
        function zoomOut() {
            const container = document.getElementById('tree-container');
            if (!container) return;
            
            container.dispatchEvent(new WheelEvent('wheel', {
                deltaY: 100, // Positive deltaY simulates zooming out
                wheelDeltaY: 100,
                bubbles: true
            }));
        }
        
        // Reset zoom
        function resetZoom() {
            const container = document.getElementById('tree-container');
            if (!container) return;
            
            container.dispatchEvent(new WheelEvent('wheel', {
                deltaY: 0,
                wheelDeltaY: 0,
                bubbles: true
            }));
        }
        
        // Clear tree container
        function clearTreeContainer() {
            const container = document.getElementById('tree-container');
            if (container) {
                container.innerHTML = '';
            }
        }
        
        // Select node
        function selectNode(id) {
            const container = document.getElementById('tree-container');
            if (!container) return;
            
            if (selectedId) {
                const previouslySelectedNode = container.querySelector(`.node[data-id="${selectedId}"]`);
                if (previouslySelectedNode) {
                    previouslySelectedNode.classList.remove('selected');
                }
            }
            
            const node = container.querySelector(`.node[data-id="${id}"]`);
            if (node) {
                node.classList.add('selected');
                selectedId = id;
            }
        }
                                <div class="node-content">
                                    <div class="node-name">${node.name}</div>
                                    <div class="node-age">${node.age}</div>
                                </div>
                            </div>`;
                        break;
                    case 5: // Horizontal Tree
                        nodeContent = `
                            <div class="node-body">
                                <div class="node-content">
                                    <div class="node-name">${node.name}</div>
                                    <div class="node-age">${node.age}</div>
                                </div>
                            </div>`;
                        break;
                    case 6: // Grid
                        nodeContent = `
                            <div class="node-body">
                                <div class="node-content">
                                    <div class="node-name">${node.name}</div>
                                    <div class="node-age">${node.age}</div>
                                </div>
                            </div>`;
                        break;
                    case 7: // Timeline
                        nodeContent = `
                            <div class="node-body">
                                <div class="node-content">
                                    <div class="node-name">${node.name}</div>
                                    <div class="node-age">${node.age}</div>
                                </div>
                            </div>`;
                        break;
                    case 8: // Fan Chart
                        nodeContent = `
                            <div class="node-body">
                                <div class="node-content">
                                    <div class="node-name">${node.name}</div>
                                    <div class="node-age">${node.age}</div>
                                </div>
                            </div>`;
                        break;
                    case 9: // Images
                        nodeContent = `
                            <div class="node-body">
                                <div class="node-content">
                                    <div class="node-name">${node.name}</div>
                                    <div class="node-age">${node.age}</div>
                                </div>
                            </div>`;
                        break;
                    case 10: // Compact
                        nodeContent = `
                            <div class="node-body">
                                <div class="node-content">
                                    <div class="node-name">${node.name}</div>
                                    <div class="node-age">${node.age}</div>
                                </div>
                            </div>`;
                        break;
                    default:
                        nodeContent = `
                            <div class="node-body">
                                <div class="node-content">
                                    <div class="node-name">${node.name}</div>
                                    <div class="node-age">${node.age}</div>
                                </div>
                            </div>`;
                }
                
                nodeElement.innerHTML = nodeContent;
                nodesLayer.appendChild(nodeElement);
            });
            
            wrapper.appendChild(nodesLayer);
            container.appendChild(wrapper);
            
            // Draw SVG connections after a small delay to ensure DOM is rendered
            setTimeout(() => {
                drawSvgConnections(wrapper, nodes, links, templateId);
            }, 0);
            
            // Add zoom/pan functionality
            addZoomPanFunctionality(wrapper, templateId);
        }
        
        // Add zoom/pan functionality for free templates
        function addZoomPanFunctionality(wrapper, templateId) {
            if (!wrapper) return;
            
            let scale = 1;
            let translateX = 0;
            let translateY = 0;
            let isPanning = false;
            let startX, startY, startTranslateX, startTranslateY;
            
            // Add event listeners for mouse interactions
            wrapper.style.cursor = 'grab';
            
            wrapper.addEventListener('mousedown', function(e) {
                if (e.button === 0) { // Left mouse button
                    isPanning = true;
                    startX = e.clientX;
                    startY = e.clientY;
                    startTranslateX = translateX;
                    startTranslateY = translateY;
                    wrapper.style.cursor = 'grabbing';
                    e.preventDefault();
                }
            });
            
            wrapper.addEventListener('mousemove', function(e) {
                if (isPanning) {
                    const dx = e.clientX - startX;
                    const dy = e.clientY - startY;
                    translateX = startTranslateX + dx;
                    translateY = startTranslateY + dy;
                    updateTransform();
                }
            });
            
            wrapper.addEventListener('mouseup', function() {
                isPanning = false;
                wrapper.style.cursor = 'grab';
            });
            
            wrapper.addEventListener('mouseleave', function() {
                isPanning = false;
                wrapper.style.cursor = 'grab';
            });
            
            // Add wheel zoom functionality with improved sensitivity
            wrapper.addEventListener('wheel', function(e) {
                e.preventDefault();
                
                const rect = wrapper.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                
                // Calculate zoom point relative to current transform
                const pointX = (mouseX - translateX) / scale;
                const pointY = (mouseY - translateY) / scale;
                
                // Adjust scale with improved sensitivity
                const zoomIntensity = 0.15; // Increased sensitivity
                const wheel = e.deltaY < 0 ? 1 : -1;
                const zoom = Math.exp(wheel * zoomIntensity);
                
                // Limit zoom scale
                const newScale = Math.max(0.3, Math.min(5, scale * zoom)); // Extended zoom range
                
                // Adjust translation to zoom towards mouse position
                translateX = mouseX - pointX * newScale;
                translateY = mouseY - pointY * newScale;
                scale = newScale;
                
                updateTransform();
                updateZoomButtons();
                
                // Redraw connections when zooming
                setTimeout(redrawConnectionsEnhanced, 0);
            });
            
            // Update CSS transform with smooth transition
            function updateTransform() {
                wrapper.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
                wrapper.style.transition = isPanning ? 'none' : 'transform 0.2s ease'; // Smooth transition when not panning
            }
            
            // Update zoom buttons display
            function updateZoomButtons() {
                const zoomDisplay = document.getElementById('zoom-display');
                if (zoomDisplay) {
                    zoomDisplay.textContent = Math.round(scale * 100) + '%';
                }
                
                const zoomInBtn = document.getElementById('zoom-in-btn');
                const zoomOutBtn = document.getElementById('zoom-out-btn');
                
                if (zoomInBtn) zoomInBtn.disabled = scale >= 5;
                if (zoomOutBtn) zoomOutBtn.disabled = scale <= 0.3;
            }
            
            // Expose zoom functions to global scope for button handlers
            window.freeTemplateZoomIn = function() {
                if (scale < 5) {
                    scale = Math.min(scale + 0.3, 5); // Increased zoom step and max zoom
                    updateTransform();
                    updateZoomButtons();
                    // Redraw connections when zooming
                    setTimeout(redrawConnectionsEnhanced, 0);
                }
            };
            
            window.freeTemplateZoomOut = function() {
                if (scale > 0.3) {
                    scale = Math.max(scale - 0.3, 0.3); // Increased zoom step
                    updateTransform();
                    updateZoomButtons();
                    // Redraw connections when zooming
                    setTimeout(redrawConnectionsEnhanced, 0);
                }
            };
            
            window.freeTemplateResetZoom = function() {
                scale = 1;
                translateX = 0;
                translateY = 0;
                updateTransform();
                updateZoomButtons();
                // Redraw connections when resetting zoom
                setTimeout(redrawConnectionsEnhanced, 0);
            };
            
            // Initialize zoom display
            updateZoomButtons();
        }

                updateZoomButtons();
            };
            
            // Initialize zoom display
            updateZoomButtons();
        }
        
        // Draw SVG connections for free templates
        function drawSvgConnections(container, nodes, links, templateId) {
            // Remove any existing connection SVG
            const existingSvg = container.querySelector('.tree-links-svg');
            if (existingSvg) {
                existingSvg.remove();
            }
            
            // Create new SVG overlay for connections
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.classList.add('tree-links-svg');
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
            svg.style.position = 'absolute';
            svg.style.top = '0';
            svg.style.left = '0';
            svg.style.pointerEvents = 'none';
            svg.style.zIndex = '1';
            
            container.appendChild(svg);
            
            // Draw connections using improved cubic Bezier curves
            links.forEach(link => {
                const sourceNode = nodes.find(n => n.id === link.from);
                const targetNode = nodes.find(n => n.id === link.to);
                
                if (sourceNode && targetNode) {
                    // Calculate connection points - always connect from bottom center of parent to top center of child
                    const sourceX = sourceNode.x + 80;  // Center of source node (using BASE_NODE_WIDTH/2)
                    const sourceY = sourceNode.y + 70;  // Bottom of source node (assuming ~70px height)
                    const targetX = targetNode.x + 80;  // Center of target node
                    const targetY = targetNode.y;       // Top of target node
                    
                    // Create smooth cubic Bezier curve with improved control points
                    // Control points are calculated to create smooth, non-overlapping curves
                    const controlPoint1X = sourceX;
                    const controlPoint1Y = sourceY + 50;  // Extend 50px below parent for smoother curve
                    const controlPoint2X = targetX;
                    const controlPoint2Y = targetY - 50;  // Extend 50px above child for smoother curve
                    
                    // For special templates, use existing logic
                    let finalSourceX = sourceX, finalSourceY = sourceY;
                    let finalTargetX = targetX, finalTargetY = targetY;
                    let finalCP1X = controlPoint1X, finalCP1Y = controlPoint1Y;
                    let finalCP2X = controlPoint2X, finalCP2Y = controlPoint2Y;
                    
                    switch(templateId) {
                        case 5: // Horizontal tree
                            finalSourceX = sourceNode.x + 140; // Right edge of source node
                            finalSourceY = sourceNode.y + 25;  // Middle of source node
                            finalTargetX = targetNode.x;       // Left edge of target node
                            finalTargetY = targetNode.y + 25;  // Middle of target node
                            finalCP1X = finalSourceX + 60;
                            finalCP1Y = finalSourceY;
                            finalCP2X = finalTargetX - 60;
                            finalCP2Y = finalTargetY;
                            break;
                        case 7: // Timeline
                            finalSourceX = sourceNode.x + 75;  // Center of source node
                            finalSourceY = sourceNode.y + 60;  // Bottom of source node
                            finalTargetX = targetNode.x + 75;  // Center of target node
                            finalTargetY = targetNode.y;       // Top of target node
                            finalCP1X = finalSourceX;
                            finalCP1Y = finalSourceY + 50;
                            finalCP2X = finalTargetX;
                            finalCP2Y = finalTargetY - 50;
                            break;
                        case 8: // Fan chart
                            finalSourceX = sourceNode.x + 65;  // Center of source node
                            finalSourceY = sourceNode.y + 37;  // Bottom of source node
                            finalTargetX = targetNode.x + 65;  // Center of target node
                            finalTargetY = targetNode.y;       // Top of target node
                            finalCP1X = finalSourceX + (finalTargetX - finalSourceX) * 0.3;
                            finalCP1Y = finalSourceY + (finalTargetY - finalSourceY) * 0.3;
                            finalCP2X = finalSourceX + (finalTargetX - finalSourceX) * 0.7;
                            finalCP2Y = finalSourceY + (finalTargetY - finalSourceY) * 0.7;
                            break;
                    }
                    
                    const pathData = `M ${finalSourceX},${finalSourceY} C ${finalCP1X},${finalCP1Y} ${finalCP2X},${finalCP2Y} ${finalTargetX},${finalTargetY}`;
                    
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute('d', pathData);
                    path.setAttribute('fill', 'none');
                    path.setAttribute('stroke', '#94a3b8');
                    path.setAttribute('stroke-width', '2');
                    
                    svg.appendChild(path);
                }
            });
        }

        // Template layout generators (kept for reference but not used in new implementation)
        // These functions are no longer used as templates 1-10 now use renderFreeTemplateGraph
        /*
        function renderTemplate1(treeData) { ... }
        function renderTemplate2(treeData) { ... }
        function renderTemplate3(treeData) { ... }
        function renderTemplate4(treeData) { ... }
        function renderTemplate5(treeData) { ... }
        function renderTemplate6(treeData) { ... }
        function renderTemplate7(treeData) { ... }
        function renderTemplate8(treeData) { ... }
        function renderTemplate9(treeData) { ... }
        function renderTemplate10(treeData) { ... }
        */

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
            
            // Remove any existing template containers
            const templateContainers = document.querySelectorAll('.template-container');
            templateContainers.forEach(tc => tc.remove());
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
                // Check if this is a free template (1-10)
                const templateId = window.currentTemplateId || 1;
                if (templateId >= 1 && templateId <= 10) {
                    // For free templates, redraw SVG connections
                    // Find the wrapper element
                    const wrapper = containerEl.querySelector('.free-template-wrapper') || containerEl;
                    
                    // Use our improved layout engine
                    const { nodes, links } = layoutEngine(window.treeDataGlobal, templateId);
                    drawSvgConnections(wrapper, nodes, links, templateId);
                } else {
                    // For paid templates, use the existing connection drawing
                    setTimeout(() => {
                        drawConnections(window.treeDataGlobal, containerEl);
                    }, 0);
                }
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
            // Check if we're using free templates (1-10)
            const templateId = window.currentTemplateId || 1;
            if (templateId >= 1 && templateId <= 10) {
                // Use free template zoom functions
                if (window.freeTemplateZoomIn) {
                    window.freeTemplateZoomIn();
                }
                return;
            }
            
            // Use paid template zoom functions
            const centerX = width / 2;
            const centerY = height / 2;

            // Calculate zoom point in tree coordinates
            const treeX = (centerX - panX - width / 2) / zoom;
            const treeY = (centerY - panY - height / 2) / zoom;

            // Apply zoom with increased step
            zoom = Math.min(zoom + 0.3, 5);

            // Adjust pan to zoom towards center
            panX = centerX - (treeX * zoom) - (width / 2 - treeX * zoom);
            panY = centerY - (treeY * zoom) - (height / 2 - treeY * zoom);

            // No constraints - user can move freely
            updateZoom();
            updateZoomButtons();
        }

        function zoomOut() {
            // Check if we're using free templates (1-10)
            const templateId = window.currentTemplateId || 1;
            if (templateId >= 1 && templateId <= 10) {
                // Use free template zoom functions
                if (window.freeTemplateZoomOut) {
                    window.freeTemplateZoomOut();
                }
                return;
            }
            
            // Use paid template zoom functions
            const centerX = width / 2;
            const centerY = height / 2;

            // Calculate zoom point in tree coordinates
            const treeX = (centerX - panX - width / 2) / zoom;
            const treeY = (centerY - panY - height / 2) / zoom;

            // Apply zoom with increased step
            zoom = Math.max(zoom - 0.3, 0.3);

            // Adjust pan to zoom towards center
            panX = centerX - (treeX * zoom) - (width / 2 - treeX * zoom);
            panY = centerY - (treeY * zoom) - (height / 2 - treeY * zoom);

            // No constraints - free movement
            updateZoom();
            updateZoomButtons();
        }

        function resetZoom() {
            // Check if we're using free templates (1-10)
            const templateId = window.currentTemplateId || 1;
            if (templateId >= 1 && templateId <= 10) {
                // Use free template zoom functions
                if (window.freeTemplateResetZoom) {
                    window.freeTemplateResetZoom();
                }
                return;
            }
            
            // Use paid template zoom functions
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

            if (zoomInBtn) zoomInBtn.disabled = zoom >= 5;
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

            zoom = Math.max(0.3, Math.min(5, autoZoom)); // Updated max zoom limit

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
