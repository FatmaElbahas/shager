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
            z-index: 3;
        }

        /* Hover effect for tree node names - بدون حركة */
        .tree-node {
            transition: none;
        }

        .tree-node text.node-name-text {
            cursor: pointer;
            transition: color 0.3s ease, filter 0.3s ease;
            pointer-events: all;
        }

        .tree-node:hover text.node-name-text {
            fill: rgba(211, 171, 85, 1) !important;
            font-weight: 900 !important;
            filter: drop-shadow(0 2px 6px rgba(211, 171, 85, 0.6));
        }

        .tree-node:hover path[fill*="leaf"],
        .tree-node:hover circle[fill*="leaf"],
        .tree-node:hover path[fill*="fruit"],
        .tree-node:hover circle[fill*="fruit"] {
            filter: brightness(1.15) drop-shadow(0 4px 12px rgba(211, 171, 85, 0.4));
        }

        /* Smooth transition for colors only - بدون transform */
        .tree-node path,
        .tree-node circle {
            transition: filter 0.3s ease;
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
            /* لا حركة - ثابت تماماً */
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

        /* Template 1 - Cards - Modern Design */
        .template-1 .family-tree-cards {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .family-card {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin: 10px;
            padding: 12px 15px;
            min-width: 200px;
            text-align: center;
            transition: transform 0.3s;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .family-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }

        /* Male nodes - Blue border */
        .template-1 .node-group[data-gender="male"] rect,
        .template-1 .node-group[data-gender="male"] .node-rect {
            fill: white;
            stroke: #3b82f6;
            stroke-width: 2.5px;
        }

        /* Female nodes - Pink border */
        .template-1 .node-group[data-gender="female"] rect,
        .template-1 .node-group[data-gender="female"] .node-rect {
            fill: white;
            stroke: #ec4899;
            stroke-width: 2.5px;
        }

        /* Node text styling */
        .template-1 .node-text text {
            fill: #1f2937;
            font-weight: 500;
        }

        /* Deceased label */
        .template-1 .deceased-label {
            font-size: 11px;
            fill: #6b7280;
            font-weight: 400;
        }

        .template-1 .deceased-label-male {
            fill: #3b82f6;
        }

        .template-1 .deceased-label-female {
            fill: #ec4899;
        }

        /* Icons styling */
        .template-1 .node-icon {
            pointer-events: none;
        }

        .template-1 .green-icon {
            fill: #10b981;
        }

        .template-1 .person-icon {
            fill: #6b7280;
        }

        .template-1 .add-icon {
            fill: #3b82f6;
        }

        .template-1 .add-icon-female {
            fill: #ec4899;
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

        /* Template 2 - Modern Hierarchical Cards */
        .template-2 .family-tree-circles {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 20px;
        }

        /* Node text styling */
        .template-2 .node-text text {
            fill: #212121;
            font-weight: 600;
        }

        .template-2 .node-text .date-text {
            fill: #757575;
            font-size: 12px;
            font-weight: 400;
        }

        /* Icons styling */
        .template-2 .node-icon {
            pointer-events: none;
        }

        .template-2 .avatar-background {
            fill: #E3F2FD;
        }

        .template-2 .avatar-icon {
            fill: #2196F3;
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

        /* Template 3 - Modern Cards with Generation Colors */
        .template-3 .family-tree-boxes {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        /* Node text styling */
        .template-3 .node-text text {
            fill: #000000;
            font-weight: 500;
            background: none !important;
            background-image: none !important;
            background-color: transparent !important;
        }

        .template-3 .node-text .date-text {
            fill: #666666;
            font-size: 11px;
            background: none !important;
            background-image: none !important;
            background-color: transparent !important;
        }

        .template-3 .node-text .phone-text {
            fill: #666666;
            font-size: 10px;
            background: none !important;
            background-image: none !important;
            background-color: transparent !important;
        }

        /* Icons styling */
        .template-3 .node-icon {
            pointer-events: none;
        }

        .template-3 .green-icon {
            fill: #10b981;
        }

        .template-3 .person-icon {
            fill: #6b7280;
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

        /* Template 4 - Modern Horizontal Cards */
        .template-4 .family-tree-vertical {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        /* Node card styling */
        .template-4 .node-group[data-gender="male"] rect,
        .template-4 .node-group[data-gender="female"] rect,
        .template-4 .node-group .node-rect {
            fill: #E8F4F8;
            stroke: none;
            filter: drop-shadow(0 2px 6px rgba(0,0,0,0.08));
            transition: all 0.3s ease;
        }

        .template-4 .node-group:hover rect {
            filter: drop-shadow(0 4px 12px rgba(0,0,0,0.12));
        }

        /* Node text styling */
        .template-4 .node-text .name-text {
            fill: #212121;
            font-weight: 700;
            font-size: 16px;
        }

        .template-4 .node-text .date-text {
            fill: #757575;
            font-weight: 400;
            font-size: 12px;
        }

        .template-4 .node-text .status-text {
            fill: #616161;
            font-weight: 500;
            font-size: 11px;
        }

        .template-4 .node-text .status-alive {
            fill: #4CAF50;
        }

        .template-4 .node-text .status-deceased {
            fill: #616161;
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

        /* Template 5 - Hierarchical Tree with Golden Badges */
        .template-5 .family-tree-horizontal {
            display: flex;
            align-items: center;
            padding: 20px;
        }

        /* Container - Clean white background */
        .template-5 .template-container {
            border: none;
            border-radius: 0;
            padding: 40px;
            background-color: #FFFFFF;
        }

        /* Node card styling - Golden Pill/Capsule shape for name badge */
        .template-5 .node-group[data-gender="male"] rect,
        .template-5 .node-group[data-gender="female"] rect,
        .template-5 .node-group .node-rect {
            fill: #D4AF37;
            stroke: none;
            filter: none;
            transition: none;
            cursor: pointer;
        }

        .template-5 .node-group:hover rect {
            fill: #D4AF37;
            filter: none;
        }

        /* Circular profile picture styling */
        .template-5 .node-group .profile-circle {
            fill: white;
            stroke: rgba(0,0,0,0.1);
            stroke-width: 1;
            filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
        }

        /* Node text styling - White text on golden background */
        .template-5 .node-text text {
            fill: #FFFFFF;
            font-weight: 500;
            font-size: 14px;
            text-anchor: middle;
            dominant-baseline: middle;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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

        /* Template 6 - Same as Template 5 (Simple Flat Pill Design) */
        .template-6 .family-tree-horizontal {
            display: flex;
            align-items: center;
            padding: 20px;
        }

        /* Container with blue border */
        .template-6 .template-container {
            border: 3px solid #2196F3;
            border-radius: 10px;
            padding: 40px;
            background-color: #FFFFFF;
        }

        /* Node card styling - Pill/Capsule shape */
        .template-6 .node-group[data-gender="male"] rect,
        .template-6 .node-group[data-gender="female"] rect,
        .template-6 .node-group .node-rect {
            fill: #E8D4A0;
            stroke: none;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.05));
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .template-6 .node-group:hover rect {
            fill: #D4C490;
            filter: drop-shadow(0 3px 8px rgba(0,0,0,0.1));
        }

        /* Node text styling */
        .template-6 .node-text text {
            fill: #4A3F35;
            font-weight: 500;
            font-size: 15px;
            text-anchor: middle;
            dominant-baseline: middle;
        }

        /* Template 7 - Radial Mind-map Style */
        .template-7 .template-container {
            border: none;
            border-radius: 0;
            padding: 40px;
            background-color: #FFFFFF;
        }

        /* Node card styling - Golden rounded rectangle */
        .template-7 .node-group[data-gender="male"] rect,
        .template-7 .node-group[data-gender="female"] rect,
        .template-7 .node-group .node-rect {
            fill: #EED39A;
            stroke: none;
            filter: none;
            transition: none;
            cursor: pointer;
        }

        .template-7 .node-group:hover rect {
            fill: #EED39A;
            filter: none;
        }

        /* Node text styling - Black text */
        .template-7 .node-text {
            pointer-events: none;
        }

        .template-7 .node-text text {
            fill: #000000 !important;
            font-weight: 500;
            font-size: 14px;
            text-anchor: middle;
            dominant-baseline: middle;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            pointer-events: none;
        }

        .timeline-item.level-2 .timeline-content {
            background: #2ecc71;
            color: white;
        }

        /* Template 8 - Modern Horizontal Cards */
        .template-8 .template-container {
            border: none;
            border-radius: 0;
            padding: 40px;
            background-color: #F5F5F5;
        }

        /* Node card styling - Horizontal blue gradient card */
        .template-8 .node-group[data-gender="male"] rect,
        .template-8 .node-group[data-gender="female"] rect,
        .template-8 .node-group .node-rect {
            fill: url(#blueGradient8);
            stroke: none;
            filter: drop-shadow(0 2px 6px rgba(0,0,0,0.1));
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .template-8 .node-group:hover rect {
            filter: drop-shadow(0 4px 12px rgba(0,0,0,0.15));
        }

        /* Circular profile picture styling */
        .template-8 .node-group .profile-circle {
            fill: white;
            stroke: rgba(255,255,255,0.3);
            stroke-width: 2;
        }

        /* Node text styling */
        .template-8 .node-text .name-text {
            fill: #212121;
            font-weight: 600;
            font-size: 15px;
        }

        .template-8 .node-text .date-text {
            fill: #424242;
            font-weight: 400;
            font-size: 12px;
        }

        /* Template 9 - Clean Minimal Vertical Cards */
        .template-9 .template-container {
            border: none;
            border-radius: 0;
            padding: 40px;
            background-color: #F8F8F8;
        }

        /* Node card styling - Vertical white card with border */
        .template-9 .node-group[data-gender="male"] rect,
        .template-9 .node-group[data-gender="female"] rect,
        .template-9 .node-group .node-rect {
            fill: #FFFFFF;
            stroke: #E0E0E0;
            stroke-width: 1;
            filter: drop-shadow(0 1px 3px rgba(0,0,0,0.05));
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .template-9 .node-group:hover rect {
            filter: drop-shadow(0 4px 12px rgba(0,0,0,0.1));
            stroke: #BDBDBD;
        }

        /* Circular profile picture styling */
        .template-9 .node-group .profile-circle {
            fill: #B8D4E8;
            stroke: none;
        }

        /* Node text styling */
        .template-9 .node-text .name-text {
            fill: #212121;
            font-weight: 600;
            font-size: 15px;
        }

        .template-9 .node-text .date-text {
            fill: #757575;
            font-weight: 400;
            font-size: 11px;
        }

        /* Template 10 - Free-form Multi-directional Cards */
        .template-10 .template-container {
            border: none;
            border-radius: 0;
            padding: 40px;
            background-color: #F8F8F8;
        }

        /* Node card styling - Vertical beige/cream card */
        .template-10 .node-group[data-gender="male"] rect,
        .template-10 .node-group[data-gender="female"] rect,
        .template-10 .node-group .node-rect {
            fill: #E8E3D8;
            stroke: none;
            filter: drop-shadow(0 3px 8px rgba(0,0,0,0.1));
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .template-10 .node-group:hover rect {
            filter: drop-shadow(0 6px 16px rgba(0,0,0,0.15));
        }

        /* Deceased badge styling */
        .template-10 .deceased-badge {
            fill: #2E2E2E;
        }

        .template-10 .deceased-badge-text {
            fill: #FFFFFF;
            font-size: 9px;
            font-weight: 500;
        }

        /* Node text styling */
        .template-10 .node-text .name-text {
            fill: #212121;
            font-weight: 700;
            font-size: 17px;
        }

        .template-10 .node-text .date-text,
        .template-10 .node-text .phone-text {
            fill: #424242;
            font-weight: 400;
            font-size: 10px;
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

        /* Family Members Table Styles - Enhanced & Dynamic */
        .family-members-container {
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
            margin: 30px 0;
            animation: fadeInUp 0.6s ease;
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .family-members-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 3px solid rgba(211, 171, 85, 0.2);
        }

        .family-members-header h3 {
            font-size: 28px;
            font-weight: 700;
            background: linear-gradient(135deg, rgba(211, 171, 85, 1) 0%, rgb(216, 162, 47) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin: 0;
        }

        #add-member-btn {
            background: linear-gradient(135deg, rgba(211, 171, 85, 1) 0%, rgb(216, 162, 47) 100%);
            border: none;
            padding: 12px 30px;
            border-radius: 50px;
            color: white;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 15px rgba(211, 171, 85, 0.3);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        #add-member-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(211, 171, 85, 0.4);
            background: linear-gradient(135deg, rgb(216, 162, 47) 0%, rgb(207, 145, 10) 100%);
        }

        #add-member-btn:active {
            transform: translateY(0);
        }

        #family-members-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
        }

        #family-members-table thead {
            background: linear-gradient(135deg, rgba(211, 171, 85, 0.95) 0%, rgb(216, 162, 47) 100%);
        }

        #family-members-table th {
            color: white;
            font-weight: 700;
            font-size: 15px;
            text-align: center;
            padding: 18px 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border: none;
            position: relative;
        }

        #family-members-table th:not(:last-child)::after {
            content: '';
            position: absolute;
            left: 0;
            top: 20%;
            height: 60%;
            width: 1px;
            background: rgba(255, 255, 255, 0.3);
        }

        #family-members-table tbody tr {
            transition: all 0.3s ease;
            border-bottom: 1px solid rgba(211, 171, 85, 0.1);
            animation: slideInRow 0.5s ease;
            animation-fill-mode: both;
        }

        @keyframes slideInRow {
            from {
                opacity: 0;
                transform: translateX(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        #family-members-table tbody tr:nth-child(even) {
            background: rgba(248, 247, 247, 0.5);
        }

        #family-members-table tbody tr:nth-child(odd) {
            background: white;
        }

        #family-members-table tbody tr:hover {
            background: linear-gradient(135deg, rgba(211, 171, 85, 0.08) 0%, rgba(216, 162, 47, 0.05) 100%);
            transform: scale(1.01);
            box-shadow: 0 4px 15px rgba(211, 171, 85, 0.15);
            z-index: 1;
            position: relative;
        }

        #family-members-table td {
            text-align: center;
            vertical-align: middle;
            padding: 18px 12px;
            color: #333;
            font-size: 14px;
            border: none;
        }

        #family-members-table tbody tr:last-child {
            border-bottom: none;
        }

        #family-members-table img {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 50%;
            border: 3px solid rgba(211, 171, 85, 0.3);
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
        }

        #family-members-table tbody tr:hover img {
            border-color: rgba(211, 171, 85, 0.8);
            transform: scale(1.1);
            box-shadow: 0 5px 15px rgba(211, 171, 85, 0.3);
        }

        .member-name {
            font-weight: 700;
            color: rgba(211, 171, 85, 1);
            font-size: 16px;
        }

        .member-relation {
            padding: 6px 15px;
            background: linear-gradient(135deg, rgba(211, 171, 85, 0.15) 0%, rgba(216, 162, 47, 0.1) 100%);
            border-radius: 20px;
            color: rgba(211, 171, 85, 1);
            font-weight: 600;
            font-size: 13px;
            display: inline-block;
        }

        .member-actions {
            display: flex;
            gap: 8px;
            justify-content: center;
            align-items: center;
        }

        .member-actions .btn {
            padding: 8px 16px;
            font-size: 13px;
            font-weight: 600;
            border-radius: 10px;
            border: none;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .member-actions .btn-warning {
            background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
            color: white;
        }

        .member-actions .btn-warning:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(255, 193, 7, 0.4);
            background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
        }

        .member-actions .btn-danger {
            background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
            color: white;
        }

        .member-actions .btn-danger:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
            background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%);
        }

        .member-actions .btn:active {
            transform: translateY(0);
        }

        .status-badge {
            padding: 8px 16px;
            border-radius: 25px;
            font-size: 12px;
            font-weight: 700;
            display: inline-block;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
        }

        .status-badge:hover {
            transform: scale(1.05);
        }

        .status-alive {
            background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
            color: white;
        }

        .status-deceased {
            background: linear-gradient(135deg, #f44336 0%, #c62828 100%);
            color: white;
        }

        /* Empty state */
        #family-members-table tbody tr td[colspan] {
            padding: 60px 20px;
            text-align: center;
            color: #999;
            font-size: 18px;
            font-style: italic;
        }

        /* Loading state */
        .table-loading {
            text-align: center;
            padding: 40px;
            color: rgba(211, 171, 85, 1);
        }

        .table-loading::after {
            content: '...';
            animation: dots 1.5s steps(4, end) infinite;
        }

        @keyframes dots {
            0%, 20% { content: '.'; }
            40% { content: '..'; }
            60%, 100% { content: '...'; }
        }

        /* Responsive Design for Table */
        @media (max-width: 1200px) {
            #family-members-table th,
            #family-members-table td {
                padding: 12px 8px;
                font-size: 13px;
            }

            .member-actions .btn {
                padding: 6px 12px;
                font-size: 12px;
            }
        }

        @media (max-width: 992px) {
            .family-members-container {
                padding: 20px;
            }

            .family-members-header {
                flex-direction: column;
                gap: 15px;
                align-items: flex-start;
            }

            .family-members-header h3 {
                font-size: 24px;
            }

            #add-member-btn {
                width: 100%;
                justify-content: center;
            }

            #family-members-table {
                font-size: 12px;
            }

            #family-members-table th,
            #family-members-table td {
                padding: 10px 6px;
            }

            #family-members-table img {
                width: 50px;
                height: 50px;
            }

            .member-name {
                font-size: 14px;
            }

            .member-relation {
                font-size: 11px;
                padding: 4px 10px;
            }
        }

        @media (max-width: 768px) {
            .family-members-container {
                padding: 15px;
                margin: 20px 0;
            }

            .family-members-header h3 {
                font-size: 20px;
            }

            .table-responsive {
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
            }

            #family-members-table {
                min-width: 800px;
            }

            #family-members-table th {
                font-size: 11px;
                padding: 10px 5px;
            }

            #family-members-table th i {
                display: none;
            }

            #family-members-table td {
                font-size: 11px;
                padding: 10px 5px;
            }

            #family-members-table img {
                width: 40px;
                height: 40px;
            }

            .member-actions {
                flex-direction: column;
                gap: 5px;
            }

            .member-actions .btn {
                width: 100%;
                padding: 8px;
                font-size: 11px;
            }

            .status-badge {
                font-size: 10px;
                padding: 5px 10px;
            }
        }

        @media (max-width: 576px) {
            .family-members-header h3 {
                font-size: 18px;
            }

            #add-member-btn {
                padding: 10px 20px;
                font-size: 14px;
            }

            #family-members-table {
                min-width: 700px;
            }

            .member-name {
                font-size: 13px;
            }
        }

        /* Print Styles */
        @media print {
            .family-members-container {
                box-shadow: none;
                padding: 0;
            }

            .family-members-header {
                border-bottom: 2px solid #000;
            }

            #add-member-btn {
                display: none;
            }

            #family-members-table {
                box-shadow: none;
            }

            #family-members-table thead {
                background: #f0f0f0 !important;
            }

            #family-members-table th {
                color: #000 !important;
            }

            .member-actions {
                display: none;
            }
        }

        /* Enhanced Modal Styles - Matching Site Colors */
        .modal-content {
            border: none;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
            animation: modalSlideIn 0.3s ease;
        }

        @keyframes modalSlideIn {
            from {
                opacity: 0;
                transform: translateY(-50px) scale(0.9);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        .modal-header {
            background: linear-gradient(135deg, rgba(211, 171, 85, 1) 0%, rgb(216, 162, 47) 100%);
            border: none;
            padding: 25px 30px;
            color: white;
            position: relative;
        }

        .modal-header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: rgba(255, 255, 255, 0.3);
        }

        .modal-title {
            font-size: 24px;
            font-weight: 700;
            color: white;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .modal-title i {
            font-size: 28px;
        }

        .btn-close {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            width: 35px;
            height: 35px;
            opacity: 1;
            transition: all 0.3s ease;
        }

        .btn-close:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: rotate(90deg);
        }

        .modal-body {
            padding: 30px;
            background: #f8f9fa;
        }

        .modal-footer {
            border-top: 2px solid rgba(211, 171, 85, 0.2);
            padding: 20px 30px;
            background: white;
            display: flex;
            justify-content: flex-end;
            gap: 15px;
        }

        /* Enhanced Form Styles */
        .form-label {
            font-weight: 700;
            margin-bottom: 10px;
            color: rgba(211, 171, 85, 1);
            font-size: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .form-label::before {
            content: '';
            width: 4px;
            height: 18px;
            background: linear-gradient(135deg, rgba(211, 171, 85, 1) 0%, rgb(216, 162, 47) 100%);
            border-radius: 2px;
        }

        .form-control,
        .form-select {
            border: 2px solid rgba(211, 171, 85, 0.2);
            border-radius: 12px;
            padding: 12px 18px;
            font-size: 15px;
            transition: all 0.3s ease;
            background: white;
        }

        .form-control:focus,
        .form-select:focus {
            border-color: rgba(211, 171, 85, 1);
            box-shadow: 0 0 0 0.2rem rgba(211, 171, 85, 0.25);
            outline: none;
            transform: translateY(-2px);
        }

        .form-control:hover,
        .form-select:hover {
            border-color: rgba(211, 171, 85, 0.5);
        }

        input[type="file"].form-control {
            padding: 10px;
            cursor: pointer;
        }

        input[type="file"].form-control::file-selector-button {
            background: linear-gradient(135deg, rgba(211, 171, 85, 1) 0%, rgb(216, 162, 47) 100%);
            color: white;
            border: none;
            padding: 8px 20px;
            border-radius: 8px;
            margin-left: 10px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
        }

        input[type="file"].form-control::file-selector-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(211, 171, 85, 0.3);
        }

        /* Enhanced Button Styles */
        .modal-footer .btn {
            padding: 12px 30px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 16px;
            border: none;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .modal-footer .btn-secondary {
            background: #6c757d;
            color: white;
        }

        .modal-footer .btn-secondary:hover {
            background: #5a6268;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
        }

        .modal-footer .btn-primary {
            background: linear-gradient(135deg, rgba(211, 171, 85, 1) 0%, rgb(216, 162, 47) 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(211, 171, 85, 0.3);
        }

        .modal-footer .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(211, 171, 85, 0.4);
            background: linear-gradient(135deg, rgb(216, 162, 47) 0%, rgb(207, 145, 10) 100%);
        }

        .modal-footer .btn:active {
            transform: translateY(0);
        }

        /* Form Row Animation */
        .modal-body .row > div {
            animation: fadeInUp 0.4s ease;
            animation-fill-mode: both;
        }

        .modal-body .row > div:nth-child(1) { animation-delay: 0.1s; }
        .modal-body .row > div:nth-child(2) { animation-delay: 0.15s; }
        .modal-body .row > div:nth-child(3) { animation-delay: 0.2s; }
        .modal-body .row > div:nth-child(4) { animation-delay: 0.25s; }
        .modal-body .row > div:nth-child(5) { animation-delay: 0.3s; }
        .modal-body .row > div:nth-child(6) { animation-delay: 0.35s; }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Required Field Indicator */
        .form-label:has(+ .form-control[required])::after,
        .form-label:has(+ .form-select[required])::after {
            content: ' *';
            color: #f44336;
            font-weight: 700;
        }

        /* Select Dropdown Enhancement */
        .form-select {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23d3ab55' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: left 0.75rem center;
            background-size: 16px 12px;
            padding-left: 2.5rem;
            cursor: pointer;
        }

        .form-select option {
            padding: 10px;
        }

        /* Image Preview Enhancement */
        .modal-body img {
            transition: all 0.3s ease;
        }

        .modal-body img:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 20px rgba(211, 171, 85, 0.3);
        }

        /* Loading State for Submit Buttons */
        .modal-footer .btn.loading {
            opacity: 0.7;
            pointer-events: none;
            position: relative;
        }

        .modal-footer .btn.loading::after {
            content: '';
            position: absolute;
            width: 16px;
            height: 16px;
            margin: auto;
            border: 2px solid transparent;
            border-top-color: currentColor;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Modal Backdrop Enhancement */
        .modal-backdrop {
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
        }

        .modal-backdrop.show {
            animation: fadeIn 0.3s ease;
        }

        /* Input Placeholder Styling */
        .form-control::placeholder,
        .form-select::placeholder {
            color: #999;
            opacity: 0.7;
        }

        /* File Input Preview */
        input[type="file"]:focus {
            outline: none;
        }

        /* Responsive Modal */
        @media (max-width: 768px) {
            .modal-dialog {
                margin: 10px;
            }

            .modal-content {
                border-radius: 15px;
            }

            .modal-header {
                padding: 20px;
            }

            .modal-title {
                font-size: 20px;
            }

            .modal-body {
                padding: 20px;
            }

            .modal-footer {
                padding: 15px 20px;
                flex-direction: column-reverse;
            }

            .modal-footer .btn {
                width: 100%;
                justify-content: center;
            }

            .form-control,
            .form-select {
                padding: 10px 15px;
                font-size: 14px;
            }
        }

        .status-badge {
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: 600;
        }

        .status-alive {
            background-color: #d4edda;
            color: #155724;
        }

        .status-deceased {
            background-color: #f8d7da;
            color: #721c24;
        }

        /* Custom Confirmation Modal Styles */
        .custom-confirm-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            animation: fadeIn 0.3s ease;
        }

        .custom-confirm-modal {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 450px;
            width: 90%;
            padding: 0;
            overflow: hidden;
            animation: slideUp 0.3s ease;
            transform-origin: center;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }

        @keyframes slideUp {
            from {
                transform: translateY(30px) scale(0.9);
                opacity: 0;
            }
            to {
                transform: translateY(0) scale(1);
                opacity: 1;
            }
        }

        .custom-confirm-header {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            padding: 25px 30px;
            text-align: center;
            color: white;
        }

        .custom-confirm-icon {
            width: 70px;
            height: 70px;
            margin: 0 auto 15px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 35px;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.05);
            }
        }

        .custom-confirm-title {
            font-size: 24px;
            font-weight: 700;
            margin: 0;
        }

        .custom-confirm-body {
            padding: 30px;
            text-align: center;
        }

        .custom-confirm-message {
            font-size: 16px;
            color: #333;
            line-height: 1.6;
            margin-bottom: 10px;
        }

        .custom-confirm-member-name {
            font-weight: 700;
            color: #ee5a24;
            font-size: 18px;
            margin-top: 10px;
        }

        .custom-confirm-footer {
            padding: 20px 30px;
            display: flex;
            gap: 15px;
            justify-content: center;
            background: #f8f9fa;
        }

        .custom-confirm-btn {
            padding: 12px 30px;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            min-width: 120px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .custom-confirm-btn-cancel {
            background: #6c757d;
            color: white;
        }

        .custom-confirm-btn-cancel:hover {
            background: #5a6268;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(108, 117, 125, 0.3);
        }

        .custom-confirm-btn-delete {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            color: white;
        }

        .custom-confirm-btn-delete:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(238, 90, 36, 0.4);
        }

        .custom-confirm-btn:active {
            transform: translateY(0);
        }

        /* Custom Alert Modal Styles */
        .custom-alert-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            animation: fadeIn 0.3s ease;
        }

        .custom-alert-modal {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 400px;
            width: 90%;
            padding: 0;
            overflow: hidden;
            animation: slideUp 0.3s ease;
        }

        .custom-alert-header {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            padding: 25px 30px;
            text-align: center;
            color: white;
        }

        .custom-alert-icon {
            width: 60px;
            height: 60px;
            margin: 0 auto 15px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
        }

        .custom-alert-title {
            font-size: 22px;
            font-weight: 700;
            margin: 0;
        }

        .custom-alert-body {
            padding: 30px;
            text-align: center;
        }

        .custom-alert-message {
            font-size: 16px;
            color: #333;
            line-height: 1.6;
        }

        .custom-alert-footer {
            padding: 20px 30px;
            display: flex;
            justify-content: center;
            background: #f8f9fa;
        }

        .custom-alert-btn {
            padding: 12px 40px;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
        }

        .custom-alert-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(79, 172, 254, 0.4);
        }

        .custom-alert-btn:active {
            transform: translateY(0);
        }

        /* Success Alert */
        .custom-alert-success .custom-alert-header {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        }

        .custom-alert-success .custom-alert-btn {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        }

        .custom-alert-success .custom-alert-btn:hover {
            box-shadow: 0 5px 20px rgba(17, 153, 142, 0.4);
        }

        /* Error Alert */
        .custom-alert-error .custom-alert-header {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
        }

        .custom-alert-error .custom-alert-btn {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
        }

        .custom-alert-error .custom-alert-btn:hover {
            box-shadow: 0 5px 20px rgba(238, 90, 36, 0.4);
        }

        /* Responsive */
        @media (max-width: 768px) {
            .custom-confirm-modal,
            .custom-alert-modal {
                width: 95%;
                max-width: none;
            }

            .custom-confirm-header,
            .custom-alert-header {
                padding: 20px;
            }

            .custom-confirm-body,
            .custom-alert-body {
                padding: 20px;
            }

            .custom-confirm-footer,
            .custom-alert-footer {
                padding: 15px 20px;
                flex-direction: column;
            }

            .custom-confirm-btn {
                width: 100%;
            }

            .custom-confirm-icon {
                width: 60px;
                height: 60px;
                font-size: 30px;
            }

            .custom-confirm-title,
            .custom-alert-title {
                font-size: 20px;
            }

            .custom-confirm-message,
            .custom-alert-message {
                font-size: 14px;
            }
        }

        /* Keyboard accessibility */
        .custom-confirm-btn:focus,
        .custom-alert-btn:focus {
            outline: 3px solid rgba(79, 172, 254, 0.5);
            outline-offset: 2px;
        }

        /* Loading state for buttons */
        .custom-confirm-btn.loading,
        .custom-alert-btn.loading {
            opacity: 0.7;
            pointer-events: none;
        }

        .custom-confirm-btn.loading::after,
        .custom-alert-btn.loading::after {
            content: '';
            width: 16px;
            height: 16px;
            margin-left: 8px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
            display: inline-block;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
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
                        <div>جاري تحميل بيانات العائلة  </div>
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

            <!-- Family Members Table -->
            <div class="family-members-container">
                <div class="family-members-header">
                    <h3><i class="fas fa-users" style="margin-left: 10px;"></i>جدول أفراد العائلة</h3>
                    <button id="add-member-btn" style="display: none;">
                        <i class="fas fa-plus"></i> إضافة فرد جديد
                    </button>
                </div>
                <div class="table-responsive" style="border-radius: 15px; overflow: hidden;">
                    <table id="family-members-table">
                        <thead>
                            <tr>
                                <th><i class="fas fa-hashtag"></i> #</th>
                                <th><i class="fas fa-image"></i> الصورة</th>
                                <th><i class="fas fa-user"></i> الاسم</th>
                                <th><i class="fas fa-sitemap"></i> صلة القرابة</th>
                                <th><i class="fas fa-heartbeat"></i> الحالة</th>
                                <th><i class="fas fa-calendar"></i> تاريخ الميلاد</th>
                                <th><i class="fas fa-briefcase"></i> الوظيفة</th>
                                <th><i class="fas fa-phone"></i> رقم الهاتف</th>
                                <th><i class="fas fa-cog"></i> الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody id="family-members-tbody">
                            <tr>
                                <td colspan="9" class="table-loading">جاري التحميل</td>
                            </tr>
                        </tbody>
                    </table>
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
            if (templateId === 5 || templateId === 6 || templateId === 7 || templateId === 8) {
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
                    if (templateId === 5 || templateId === 6) {
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
                            if (templateId === 5 || templateId === 6) {
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

            // PASS 2 – Position phase: Position nodes based on subtree widths
            function positionNodes(node, level = 0, xOffset = 0, parentX = null) {
                if (!node) return;

                // Position this node
                const y = level * V_GAP + 100; // Add top margin

                // For root node, center it
                if (parentX === null) {
                    node._x = xOffset;
                } else {
                    node._x = xOffset;
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
                if (parentX !== null) {
                    links.push({
                        from: node._parentId,
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

                    // Position each child using cumulative offsets
                    node.children.forEach(child => {
                        child._parentId = node.id; // Store parent ID for linking

                        // Position child
                        positionNodes(child, level + 1, currentX, node._x);

                        // Move to next position
                        currentX += (child._subtreeWidth || 1) * BASE_NODE_WIDTH + H_GAP;
                    });
                }
            }

            // Execute layout passes
            if (treeData) {
                calculateSubtreeWidths(treeData);
                // Position root at center of container
                const containerWidth = document.getElementById('tree-container').offsetWidth || 1200;
                positionNodes(treeData, 0, containerWidth / 2);
            }

            return { nodes, links };
        }

        // Helper functions for spacing based on template
        function getHorizontalSpacing(templateId) {
            // For templates 1-4, 9, 10, we now use dynamic spacing in the layout engine
            // But keep these for templates 5, 6, 7, 8
            const spacingMap = {
                1: 350, 2: 200, 3: 320, 4: 270, 5: 180, // Template 5: More spacing for hierarchical layout
                6: 120, 7: 320, 8: 300, 9: 320, 10: 250 // Template 6: Same as Template 5
            };
            return spacingMap[templateId] || 350;
        }

        function getVerticalSpacing(templateId) {
            // For templates 1-4, 9, 10, we now use dynamic spacing in the layout engine
            // But keep these for templates 5, 6, 7, 8
            const spacingMap = {
                1: 250, 2: 220, 3: 230, 4: 300, 5: 150, // Template 5: More vertical spacing for hierarchical layout
                6: 75, 7: 220, 8: 320, 9: 250, 10: 200 // Template 6: Same as Template 5
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

        // Render function for free templates (1-10) using D3.js tree layout
        function renderFreeTemplateGraph(templateId, treeData) {
            clearTreeContainer();

            const container = document.getElementById('tree-container');
            if (!container || !treeData) {
                console.error('Container or treeData is missing');
                return;
            }

            // Apply template-specific CSS class
            container.className = '';
            container.classList.add('template-container', `template-${templateId}`);

            // Template 5 & 6: Add blue border container styling
            if (templateId === 5 || templateId === 6) {
                container.style.border = '3px solid #2196F3';
                container.style.borderRadius = '10px';
                container.style.padding = '40px';
                container.style.backgroundColor = '#FFFFFF';
            }

            // Template 7: Clean white background
            if (templateId === 7) {
                container.style.border = 'none';
                container.style.borderRadius = '0';
                container.style.padding = '40px';
                container.style.backgroundColor = '#FFFFFF';
            }

            // Template 8: Light gray background
            if (templateId === 8) {
                container.style.border = 'none';
                container.style.borderRadius = '0';
                container.style.padding = '40px';
                container.style.backgroundColor = '#F5F5F5';
            }

            // Template 9: Light gray background
            if (templateId === 9) {
                container.style.border = 'none';
                container.style.borderRadius = '0';
                container.style.padding = '40px';
                container.style.backgroundColor = '#F8F8F8';
            }

            // Template 10: Light gray background
            if (templateId === 10) {
                container.style.border = 'none';
                container.style.borderRadius = '0';
                container.style.padding = '40px';
                container.style.backgroundColor = '#F8F8F8';
            }

            // Get container dimensions
            const containerWidth = container.offsetWidth || 1200;
            const containerHeight = container.offsetHeight || 600;

            // Create SVG element for the entire tree (nodes + links)
            const svg = d3.select(container)
                .append('svg')
                .attr('width', containerWidth)
                .attr('height', containerHeight)
                .style('position', 'absolute')
                .style('top', 0)
                .style('left', 0);

            // Create a group for zoom/pan
            const g = svg.append('g');

            // Add gradient definition for template 8
            if (templateId === 8) {
                const defs = svg.append('defs');
                const gradient = defs.append('linearGradient')
                    .attr('id', 'blueGradient8')
                    .attr('x1', '0%')
                    .attr('y1', '0%')
                    .attr('x2', '100%')
                    .attr('y2', '100%');
                gradient.append('stop')
                    .attr('offset', '0%')
                    .attr('stop-color', '#4A9ED3'); // Stronger blue (darker)
                gradient.append('stop')
                    .attr('offset', '100%')
                    .attr('stop-color', '#3A8BC8'); // Stronger blue (darker)
            }

            // Use D3.js hierarchy to build tree structure
            const root = d3.hierarchy(treeData);

            // Calculate tree dimensions dynamically based on tree depth and width
            const maxDepth = root.height;
            const maxLeaves = Math.max(...root.leaves().map(d => {
                let count = 0;
                let node = d;
                while (node.parent) {
                    count++;
                    node = node.parent;
                }
                return count;
            }), 1);

            // Dynamic spacing based on tree size
            let nodeWidth = 180;
            let nodeHeight = 80;

            // Template 2 specific dimensions
            if (templateId === 2) {
                nodeWidth = 120;
                nodeHeight = 140;
            }

            // Template 7 specific dimensions (pill-shaped cards)
            if (templateId === 7) {
                nodeWidth = 160;
                nodeHeight = 45;
            }

            // Template 8 specific dimensions (horizontal cards)
            if (templateId === 8) {
                nodeWidth = 230;
                nodeHeight = 65;
            }

            // Template 9 specific dimensions (vertical cards)
            if (templateId === 9) {
                nodeWidth = 100;
                nodeHeight = 125;
            }

            // Template 10 specific dimensions (vertical beige cards)
            if (templateId === 10) {
                nodeWidth = 105;
                nodeHeight = 145;
            }

            const horizontalSpacing = nodeWidth * 1.5;
            const verticalSpacing = nodeHeight * 2.5;

            // Calculate tree size
            const treeWidth = Math.max(containerWidth, maxLeaves * horizontalSpacing);
            const treeHeight = Math.max(containerHeight, (maxDepth + 1) * verticalSpacing);

            // Configure D3 tree layout - use nodeSize for consistent spacing
            const treeLayout = d3.tree()
                .nodeSize([horizontalSpacing, verticalSpacing])
                .separation((a, b) => {
                    // Ensure proper separation between siblings
                    return a.parent === b.parent ? 1 : 1.2;
                });

            // Apply layout to root
            treeLayout(root);

            // For template 8, use column-based vertical layout
            if (templateId === 8) {
                const centerX = containerWidth / 2;
                const topMargin = 80;
                const level1Y = topMargin; // Root at top
                const level2Y = topMargin + 120; // Children level
                const level3Y = topMargin + 280; // Grandchildren level (increased from 220)
                const columnSpacing = 250; // Horizontal spacing between columns
                const cardSpacing = 90; // Vertical spacing between cards in same column (increased from 20)

                // Position root at top center
                root.x = centerX;
                root.y = level1Y;

                root.descendants().forEach((d) => {
                    if (d.depth === 0) {
                        // Root: already positioned
                        return;
                    } else if (d.depth === 1) {
                        // Children: distribute horizontally in columns
                        const siblings = d.parent.children;
                        const index = siblings.indexOf(d);
                        const totalSiblings = siblings.length;

                        // Calculate total width needed
                        const totalWidth = (totalSiblings - 1) * columnSpacing;
                        const startX = centerX - totalWidth / 2;

                        d.x = startX + index * columnSpacing;
                        d.y = level2Y;
                    } else {
                        // Grandchildren: position vertically below their parent
                        const parent = d.parent;
                        const siblings = parent.children;
                        const index = siblings.indexOf(d);
                        const totalSiblings = siblings.length;

                        // Calculate total height needed for all grandchildren
                        const totalHeight = (totalSiblings - 1) * cardSpacing;
                        const startY = level3Y;

                        d.x = parent.x; // Same column as parent
                        d.y = startY + index * cardSpacing;
                    }
                });
            }

            // For template 10: Root in center, each parent with their children in separate groups
            if (templateId === 10) {
                const centerX = containerWidth / 2;
                const centerY = containerHeight / 2;

                // Very large spacing between levels - each group has its own space
                const childrenHorizontalSpacing = 420; // Very large distance from center to children (left/right)
                const childrenVerticalSpacing = 250; // Large vertical spacing between parent groups on same side
                const grandchildrenVerticalSpacing = 500; // Large vertical spacing between grandchildren
                const gapBetweenParentAndChildren = 400; // Large gap between parent and their children

                // Position root in center
                root.x = centerX;
                root.y = centerY;

                root.descendants().forEach((d) => {
                    if (d.depth === 0) {
                        // Root: already positioned in center
                        return;
                    } else if (d.depth === 1) {
                        // Children (parents): distribute on left and right of root, with large spacing
                        const siblings = d.parent.children;
                        const index = siblings.indexOf(d);
                        const totalSiblings = siblings.length;

                        // Split children: half on left, half on right
                        const leftCount = Math.ceil(totalSiblings / 2);
                        const rightCount = totalSiblings - leftCount;

                        let x, y;
                        if (index < leftCount) {
                            // Left side
                            const leftIndex = index;
                            // Calculate total height needed for all left parents and their children
                            // Each parent group needs: parent card (145px) + gap (150px) + children space
                            // For now, just space parents vertically
                            const totalLeftHeight = (leftCount - 1) * childrenVerticalSpacing;
                            const startY = centerY - totalLeftHeight / 2;

                            x = centerX - childrenHorizontalSpacing;
                            y = startY + leftIndex * childrenVerticalSpacing;
                        } else {
                            // Right side
                            const rightIndex = index - leftCount;
                            const totalRightHeight = (rightCount - 1) * childrenVerticalSpacing;
                            const startY = centerY - totalRightHeight / 2;

                            x = centerX + childrenHorizontalSpacing;
                            y = startY + rightIndex * childrenVerticalSpacing;
                        }

                        d.x = x;
                        d.y = y;
                    } else {
                        // Grandchildren: position vertically below their parent with large spacing
                        const parent = d.parent;
                        const siblings = parent.children;
                        const index = siblings.indexOf(d);
                        const totalSiblings = siblings.length;

                        // Calculate position relative to parent
                        const parentBottomY = parent.y + 72.5; // Half of card height (145/2)
                        const startY = parentBottomY + gapBetweenParentAndChildren; // Large gap below parent
                        const totalHeight = (totalSiblings - 1) * grandchildrenVerticalSpacing;

                        // Center grandchildren vertically relative to parent
                        const firstGrandchildY = startY;

                        d.x = parent.x; // Same X as parent (directly below)
                        d.y = firstGrandchildY + index * grandchildrenVerticalSpacing;
                    }
                });
            }

            // For template 7: Root in center, children on left/right, grandchildren below each parent
            if (templateId === 7) {
                const centerX = containerWidth / 2;
                const centerY = containerHeight / 2;
                const childrenHorizontalSpacing = 280; // Increased distance from center to children
                const childrenVerticalSpacing = 180; // Increased vertical spacing between children
                const grandchildrenVerticalSpacing = 250; // Increased vertical spacing between grandchildren
                const grandchildrenHorizontalOffset = 260; // Increased horizontal distance from parent to grandchildren

                // Position root in center
                root.x = centerX;
                root.y = centerY;

                root.descendants().forEach((d) => {
                    if (d.depth === 0) {
                        // Root: already positioned
                        return;
                    } else if (d.depth === 1) {
                        // Children: distribute on left and right
                        const siblings = d.parent.children;
                        const index = siblings.indexOf(d);
                        const totalSiblings = siblings.length;

                        // Split children: half on left, half on right
                        const leftCount = Math.ceil(totalSiblings / 2);
                        const rightCount = totalSiblings - leftCount;

                        let x, y;
                        if (index < leftCount) {
                            // Left side
                            const leftIndex = index;
                            const totalLeftHeight = (leftCount - 1) * childrenVerticalSpacing;
                            const startY = centerY - totalLeftHeight / 2;

                            x = centerX - childrenHorizontalSpacing;
                            y = startY + leftIndex * childrenVerticalSpacing;
                        } else {
                            // Right side
                            const rightIndex = index - leftCount;
                            const totalRightHeight = (rightCount - 1) * childrenVerticalSpacing;
                            const startY = centerY - totalRightHeight / 2;

                            x = centerX + childrenHorizontalSpacing;
                            y = startY + rightIndex * childrenVerticalSpacing;
                        }

                        d.x = x;
                        d.y = y;
                    } else {
                        // Grandchildren: position below their parent
                        const parent = d.parent;
                        const siblings = parent.children;
                        const index = siblings.indexOf(d);
                        const totalSiblings = siblings.length;

                        // Determine if parent is on left or right
                        const isParentLeft = parent.x < centerX;
                        const isParentRight = parent.x > centerX;

                        // Calculate position relative to parent
                        let x, y;
                        if (isParentLeft) {
                            // Parent is on left: grandchildren go further left
                            const totalWidth = (totalSiblings - 1) * grandchildrenVerticalSpacing;
                            const startY = parent.y - totalWidth / 2;

                            x = parent.x - grandchildrenHorizontalOffset;
                            y = startY + index * grandchildrenVerticalSpacing;
                        } else if (isParentRight) {
                            // Parent is on right: grandchildren go further right
                            const totalWidth = (totalSiblings - 1) * grandchildrenVerticalSpacing;
                            const startY = parent.y - totalWidth / 2;

                            x = parent.x + grandchildrenHorizontalOffset;
                            y = startY + index * grandchildrenVerticalSpacing;
                        } else {
                            // Parent is in center (shouldn't happen for depth > 1)
                            x = parent.x;
                            y = parent.y + (index + 1) * grandchildrenVerticalSpacing;
                        }

                        d.x = x;
                        d.y = y;
                    }
                });
            }

            // Calculate bounds for centering
            let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
            root.descendants().forEach(d => {
                if (d.x < minX) minX = d.x;
                if (d.x > maxX) maxX = d.x;
                if (d.y < minY) minY = d.y;
                if (d.y > maxY) maxY = d.y;
            });

            // Calculate center offset
            let offsetX, offsetY;
            if (templateId === 7) {
                // For template 7, center the tree properly
                const treeWidth_actual = maxX - minX;
                const treeHeight_actual = maxY - minY;
                offsetX = (containerWidth - treeWidth_actual) / 2 - minX;
                offsetY = (containerHeight - treeHeight_actual) / 2 - minY;
            } else {
                const treeWidth_actual = maxX - minX;
                const treeHeight_actual = maxY - minY;
                offsetX = (containerWidth - treeWidth_actual) / 2 - minX;
                offsetY = (containerHeight - treeHeight_actual) / 2 - minY;
            }

            // Draw links (connections) first so they appear behind nodes
            const links = g.selectAll('.link')
                .data(root.links())
                .enter()
                .append('path')
                .attr('class', 'link')
                .attr('d', function(d) {
                    if (templateId === 2) {
                        // Template 2: Orthogonal lines (vertical + horizontal)
                        const cardHeight = 140;
                        const sourceX = d.source.x + offsetX;
                        const sourceY = d.source.y + offsetY + cardHeight / 2; // Bottom of parent card
                        const targetX = d.target.x + offsetX;
                        const targetY = d.target.y + offsetY - cardHeight / 2; // Top of child card

                        // Calculate midpoint for horizontal line
                        const midY = (sourceY + targetY) / 2;

                        // Create orthogonal path: down from parent, horizontal, down to child
                        return `M ${sourceX},${sourceY}
                                L ${sourceX},${midY}
                                L ${targetX},${midY}
                                L ${targetX},${targetY}`;
                    } else if (templateId === 4) {
                        // Template 4: Smooth curved lines (Bezier curves)
                        const cardHeight = 80;
                        const sourceX = d.source.x + offsetX;
                        const sourceY = d.source.y + offsetY + cardHeight / 2; // Bottom of parent card
                        const targetX = d.target.x + offsetX;
                        const targetY = d.target.y + offsetY - cardHeight / 2; // Top of child card

                        // Calculate control points for smooth curve
                        const dy = targetY - sourceY;
                        const cp1Y = sourceY + dy * 0.5;
                        const cp2Y = sourceY + dy * 0.5;

                        // Create smooth Bezier curve path
                        return `M ${sourceX},${sourceY}
                                C ${sourceX},${cp1Y} ${targetX},${cp2Y} ${targetX},${targetY}`;
                    } else if (templateId === 5 || templateId === 6) {
                        // Template 5 & 6: Straight lines with 90° angles (L-shaped)
                        if (templateId === 5) {
                            // Template 5: Image (80px) + gap (15px) + badge (35px)
                            // Total node height: 80 + 15 + 35 = 130px
                            // Image center Y relative to node center: -imageSize/2 - 10 = -50
                            // Image top relative to node center: -50 - 40 = -90
                            // Badge center Y relative to node center: -50 + 40 + 15 = 5
                            // Badge bottom relative to node center: 5 + 17.5 = 22.5

                            const imageSize = 80;
                            const badgeHeight = 35;
                            const totalNodeHeight = imageSize + 15 + badgeHeight; // 130

                            // Source: bottom of parent badge
                            const sourceX = d.source.x + offsetX;
                            const sourceY = d.source.y + offsetY + (5 + badgeHeight / 2); // 22.5 from center

                            // Target: top of child image
                            const targetX = d.target.x + offsetX;
                            const targetY = d.target.y + offsetY - (imageSize / 2 + 10); // -50 - 40 = -90 from center

                            // Calculate midpoint Y for horizontal segment
                            const midY = (sourceY + targetY) / 2;

                            // L-shaped path: vertical down from source, horizontal to target X, vertical to target
                            return `M ${sourceX},${sourceY} L ${sourceX},${midY} L ${targetX},${midY} L ${targetX},${targetY}`;
                        } else {
                            // Template 6: Simple pill shape
                            const badgeHeight = 45;
                            const sourceX = d.source.x + offsetX;
                            const sourceY = d.source.y + offsetY + badgeHeight / 2; // Bottom center of parent card
                            const targetX = d.target.x + offsetX;
                            const targetY = d.target.y + offsetY - badgeHeight / 2; // Top center of child card

                            // Calculate midpoint Y for horizontal segment
                            const midY = (sourceY + targetY) / 2;

                            // L-shaped path: vertical down from source, horizontal to target X, vertical to target
                            return `M ${sourceX},${sourceY} L ${sourceX},${midY} L ${targetX},${midY} L ${targetX},${targetY}`;
                        }
                    } else if (templateId === 7) {
                        // Template 7: L-shaped lines to avoid overlap
                        const cardHeight = 45;
                        const sourceX = d.source.x + offsetX;
                        const sourceY = d.source.y + offsetY;
                        const targetX = d.target.x + offsetX;
                        const targetY = d.target.y + offsetY;

                        // Check if connection is from root to child (depth 0 to 1) or from parent to grandchild (depth 1+ to 2+)
                        if (d.source.depth === 0 && d.target.depth === 1) {
                            // Root to child: L-shaped line
                            const isLeft = targetX < sourceX;
                            const isRight = targetX > sourceX;

                            if (isLeft) {
                                // Left side: horizontal left, then vertical
                                const midX = sourceX - 60;
                                return `M ${sourceX},${sourceY} L ${midX},${sourceY} L ${midX},${targetY} L ${targetX},${targetY}`;
                            } else if (isRight) {
                                // Right side: horizontal right, then vertical
                                const midX = sourceX + 60;
                                return `M ${sourceX},${sourceY} L ${midX},${sourceY} L ${midX},${targetY} L ${targetX},${targetY}`;
                            } else {
                                // Same X: vertical only
                                return `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
                            }
                        } else {
                            // Parent to grandchild: L-shaped line (horizontal then vertical)
                            const isLeft = targetX < sourceX;
                            const isRight = targetX > sourceX;

                            if (isLeft) {
                                // Grandchild on left: go left first, then down
                                const midX = sourceX - 50;
                                return `M ${sourceX},${sourceY} L ${midX},${sourceY} L ${midX},${targetY} L ${targetX},${targetY}`;
                            } else if (isRight) {
                                // Grandchild on right: go right first, then down
                                const midX = sourceX + 50;
                                return `M ${sourceX},${sourceY} L ${midX},${sourceY} L ${midX},${targetY} L ${targetX},${targetY}`;
                            } else {
                                // Same X: vertical only
                                return `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
                            }
                        }
                    } else if (templateId === 8) {
                        // Template 8: Orthogonal lines (vertical + horizontal)
                        const cardHeight = 65;
                        const sourceX = d.source.x + offsetX;
                        const sourceY = d.source.y + offsetY + cardHeight / 2; // Bottom of parent card
                        const targetX = d.target.x + offsetX;
                        const targetY = d.target.y + offsetY - cardHeight / 2; // Top of child card

                        // Check if connection is from root to children or from parent to grandchildren
                        if (d.source.depth === 0 && d.target.depth === 1) {
                            // Root to children: vertical down, horizontal, vertical down
                            const midY = (sourceY + targetY) / 2;
                            return `M ${sourceX},${sourceY} L ${sourceX},${midY} L ${targetX},${midY} L ${targetX},${targetY}`;
                        } else {
                            // Parent to grandchildren: vertical down only (same column)
                            return `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
                        }
                    } else if (templateId === 9) {
                        // Template 9: Orthogonal lines (vertical + horizontal)
                        const cardHeight = 125;
                        const sourceX = d.source.x + offsetX;
                        const sourceY = d.source.y + offsetY + cardHeight / 2; // Bottom of parent card
                        const targetX = d.target.x + offsetX;
                        const targetY = d.target.y + offsetY - cardHeight / 2; // Top of child card

                        // Calculate midpoint for horizontal line
                        const midY = (sourceY + targetY) / 2;

                        // Create orthogonal path: down from parent, horizontal, down to child
                        return `M ${sourceX},${sourceY} L ${sourceX},${midY} L ${targetX},${midY} L ${targetX},${targetY}`;
                    } else if (templateId === 10) {
                        // Template 10: Straight diagonal lines (direct connection)
                        const sourceX = d.source.x + offsetX;
                        const sourceY = d.source.y + offsetY; // Center of source card
                        const targetX = d.target.x + offsetX;
                        const targetY = d.target.y + offsetY; // Center of target card

                        // Direct diagonal line from center to center
                        return `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
                    } else if (templateId === 1 || templateId === 3) {
                        // For template 1 & 3, connect from bottom of parent to top of child
                        const sourceX = d.source.x + offsetX;
                        const sourceY = d.source.y + offsetY + nodeHeight / 2;
                        const targetX = d.target.x + offsetX;
                        const targetY = d.target.y + offsetY - nodeHeight / 2;
                        return `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
                    } else {
                        // For other templates, use standard vertical link
                        return d3.linkVertical()
                            .x(d => d.x + offsetX)
                            .y(d => d.y + offsetY)(d);
                    }
                })
                .attr('fill', 'none')
                .attr('stroke', function() {
                    // Template 2 uses light gray (#BDBDBD or #9E9E9E)
                    if (templateId === 2) return '#BDBDBD';
                    // Template 3 uses lighter gray for connections
                    if (templateId === 3) return '#CCCCCC';
                    // Template 4 uses medium gray (#BDBDBD or #9E9E9E)
                    if (templateId === 4) return '#BDBDBD';
                    // Template 5 & 6 use golden color (#D4AF37)
                    if (templateId === 5 || templateId === 6) return '#D4AF37';
                    // Template 7 uses light gray for connections
                    if (templateId === 7) return '#CCCCCC';
                    // Template 8 uses medium gray for connections
                    if (templateId === 8) return '#9E9E9E';
                    // Template 9 uses light gray for connections
                    if (templateId === 9) return '#CCCCCC';
                    // Template 10 uses light gray for diagonal connections
                    if (templateId === 10) return '#CCCCCC';
                    return '#94a3b8';
                })
                .attr('stroke-width', function() {
                    // Template 5 & 6 use thinner lines (1.5-2px)
                    if (templateId === 5 || templateId === 6) return 1.5;
                    // Template 10 uses 2px for diagonal lines
                    if (templateId === 10) return 2;
                    return 2;
                })
                .attr('opacity', function() {
                    if (templateId === 2 || templateId === 3 || templateId === 4) return 0.8;
                    if (templateId === 7) return 0.6; // Lighter opacity for template 7
                    return 0.8;
                });

            // Draw nodes
            const nodeGroups = g.selectAll('.node-group')
                .data(root.descendants())
                .enter()
                .append('g')
                .attr('class', 'node-group')
                .attr('transform', d => `translate(${d.x + offsetX},${d.y + offsetY})`)
                .attr('data-id', d => d.data.id)
                .attr('data-gender', d => d.data.gender || 'male');

            // Add node rectangles/circles based on template
            nodeGroups.each(function(d) {
                const nodeGroup = d3.select(this);
                const nodeData = d.data;
                const gender = nodeData.gender || 'male';
                const isMale = gender === 'male';
                const isDeceased = nodeData.status === 'deceased';

                // Determine border color based on gender
                const borderColor = isMale ? '#3b82f6' : '#ec4899';

                // Create node container
                let nodeElement;
                if (templateId === 2) {
                    // Template 2: White card with blue top border
                    const cardWidth = 120;
                    const cardHeight = 140;

                    // White background card
                    nodeElement = nodeGroup.append('rect')
                        .attr('class', 'node-rect')
                        .attr('width', cardWidth)
                        .attr('height', cardHeight)
                        .attr('x', -cardWidth / 2)
                        .attr('y', -cardHeight / 2)
                        .attr('rx', 8)
                        .attr('fill', '#FFFFFF')
                        .attr('stroke', '#E0E0E0')
                        .attr('stroke-width', 1)
                        .attr('style', 'filter: drop-shadow(0 2px 8px rgba(0,0,0,0.1));');

                    // Blue top border (4px)
                    nodeGroup.append('rect')
                        .attr('class', 'node-top-border')
                        .attr('width', cardWidth)
                        .attr('height', 4)
                        .attr('x', -cardWidth / 2)
                        .attr('y', -cardHeight / 2)
                        .attr('rx', 8)
                        .attr('ry', 8)
                        .attr('fill', '#2196F3');
                } else {
                    // Rectangles for other templates
                    if (templateId === 1) {
                        // Template 1: White background with colored border
                        nodeElement = nodeGroup.append('rect')
                            .attr('class', 'node-rect')
                            .attr('width', nodeWidth)
                            .attr('height', nodeHeight)
                            .attr('x', -nodeWidth / 2)
                            .attr('y', -nodeHeight / 2)
                            .attr('rx', 8)
                            .attr('fill', 'white')
                            .attr('stroke', borderColor)
                            .attr('stroke-width', 2.5);
                    } else if (templateId === 3) {
                        // Template 3: White background with generation-based colors
                        const nodeDepth = d.depth || 0;
                        const nodeIndex = d.parent ? d.parent.children.indexOf(d) : 0;

                        // Color palette based on generation (depth)
                        const generationColors = [
                            '#F4C430', // Generation 0 (root): Yellow/Gold
                            ['#B8D4E8', '#F5D5B8', '#D4B8E8', '#B8D4E8', '#F5D5B8', '#D4B8E8'], // Generation 1: Light Blue, Peach, Purple
                            ['#B8D4E8', '#A0C4D8', '#C8E8B8', '#E8D8C8', '#F5D5B8', '#E8D4F0'], // Generation 2: Various
                            ['#D0E4F0', '#C8E8B8', '#F5D5B8', '#B8B8B8', '#B8E4F0'] // Generation 3: Very Light Blue, Green, Peach, Gray
                        ];

                        let cardColor = '#B8D4E8'; // Default light blue
                        if (nodeDepth < generationColors.length) {
                            const depthColors = generationColors[nodeDepth];
                            if (Array.isArray(depthColors)) {
                                cardColor = depthColors[nodeIndex % depthColors.length];
                            } else {
                                cardColor = depthColors;
                            }
                        }

                        // White background card
                        nodeElement = nodeGroup.append('rect')
                            .attr('class', 'node-rect')
                            .attr('width', nodeWidth)
                            .attr('height', nodeHeight)
                            .attr('x', -nodeWidth / 2)
                            .attr('y', -nodeHeight / 2)
                            .attr('rx', 8)
                            .attr('fill', 'white')
                            .attr('stroke', '#E0E0E0')
                            .attr('stroke-width', 1);

                        // Colored header section (top part of card)
                        const headerHeight = 30;
                        nodeGroup.append('rect')
                            .attr('class', 'node-header')
                            .attr('width', nodeWidth)
                            .attr('height', headerHeight)
                            .attr('x', -nodeWidth / 2)
                            .attr('y', -nodeHeight / 2)
                            .attr('rx', 8)
                            .attr('ry', 8)
                            .attr('fill', cardColor);
                    } else if (templateId === 4) {
                        // Template 4: Horizontal card with light blue background
                        const cardWidth = 180;
                        const cardHeight = 80;

                        // Create clipPath for the entire node to ensure content stays inside
                        const nodeClipId = `node-clip-${nodeData.id || Math.random().toString(36).substr(2, 9)}`;
                        nodeGroup.append('defs')
                            .append('clipPath')
                            .attr('id', nodeClipId)
                            .append('rect')
                            .attr('x', -cardWidth / 2)
                            .attr('y', -cardHeight / 2)
                            .attr('width', cardWidth)
                            .attr('height', cardHeight)
                            .attr('rx', 8);

                        // Apply clipPath to the entire nodeGroup
                        nodeGroup.attr('clip-path', `url(#${nodeClipId})`);

                        // Light blue background card
                        nodeElement = nodeGroup.append('rect')
                            .attr('class', 'node-rect')
                            .attr('width', cardWidth)
                            .attr('height', cardHeight)
                            .attr('x', -cardWidth / 2)
                            .attr('y', -cardHeight / 2)
                            .attr('rx', 8)
                            .attr('fill', '#E8F4F8')
                            .attr('stroke', 'none');
                    } else if (templateId === 5 || templateId === 6) {
                        // Template 5 & 6: Golden pill shape for name badge (will be positioned below image)
                        // Calculate width based on name length
                        const nameLength = (nodeData.name || '').length;
                        const cardWidth = Math.max(100, Math.min(140, nameLength * 8 + 40));
                        const cardHeight = 35;
                        const borderRadius = cardHeight / 2; // Full pill shape

                        // Golden background card with pill shape (positioned below image)
                        // Position will be set after image is added
                        nodeElement = nodeGroup.append('rect')
                            .attr('class', 'node-rect')
                            .attr('width', cardWidth)
                            .attr('height', cardHeight)
                            .attr('x', -cardWidth / 2)
                            .attr('y', 0) // Will be adjusted after image
                            .attr('rx', borderRadius)
                            .attr('ry', borderRadius)
                            .attr('fill', '#D4AF37')
                            .attr('stroke', 'none');
                    } else if (templateId === 7) {
                        // Template 7: Golden rounded rectangle (mind-map style)
                        // Reduced card size to prevent overlap
                        const nameLength = (nodeData.name || '').length;
                        const cardWidth = Math.max(110, Math.min(150, nameLength * 8 + 35));
                        const cardHeight = 42;
                        const borderRadius = 12; // Large radius for smooth rounded rectangle

                        // Golden background card with rounded rectangle
                        nodeElement = nodeGroup.append('rect')
                            .attr('class', 'node-rect')
                            .attr('width', cardWidth)
                            .attr('height', cardHeight)
                            .attr('x', -cardWidth / 2)
                            .attr('y', -cardHeight / 2)
                            .attr('rx', borderRadius)
                            .attr('ry', borderRadius)
                            .attr('fill', '#EED39A')
                            .attr('stroke', 'none');
                    } else if (templateId === 8) {
                        // Template 8: Horizontal card with blue gradient
                        const cardWidth = 230;
                        const cardHeight = 65;
                        const borderRadius = 10;

                        // Blue gradient background card
                        nodeElement = nodeGroup.append('rect')
                            .attr('class', 'node-rect')
                            .attr('width', cardWidth)
                            .attr('height', cardHeight)
                            .attr('x', -cardWidth / 2)
                            .attr('y', -cardHeight / 2)
                            .attr('rx', borderRadius)
                            .attr('ry', borderRadius)
                            .attr('fill', 'url(#blueGradient8)')
                            .attr('stroke', 'none');
                    } else if (templateId === 9) {
                        // Template 9: Vertical card with white background and border
                        const cardWidth = 100;
                        const cardHeight = 125;
                        const borderRadius = 10;

                        // White background card with light gray border
                        nodeElement = nodeGroup.append('rect')
                            .attr('class', 'node-rect')
                            .attr('width', cardWidth)
                            .attr('height', cardHeight)
                            .attr('x', -cardWidth / 2)
                            .attr('y', -cardHeight / 2)
                            .attr('rx', borderRadius)
                            .attr('ry', borderRadius)
                            .attr('fill', '#FFFFFF')
                            .attr('stroke', '#E0E0E0')
                            .attr('stroke-width', 1);
                    } else if (templateId === 10) {
                        // Template 10: Vertical card with beige/cream background
                        const cardWidth = 105;
                        const cardHeight = 145;
                        const borderRadius = 18;

                        // Beige/cream background card
                        nodeElement = nodeGroup.append('rect')
                            .attr('class', 'node-rect')
                            .attr('width', cardWidth)
                            .attr('height', cardHeight)
                            .attr('x', -cardWidth / 2)
                            .attr('y', -cardHeight / 2)
                            .attr('rx', borderRadius)
                            .attr('ry', borderRadius)
                            .attr('fill', '#E8E3D8')
                            .attr('stroke', 'none');
                    } else {
                        // Other templates: original styling
                        nodeElement = nodeGroup.append('rect')
                            .attr('width', nodeWidth)
                            .attr('height', nodeHeight)
                            .attr('x', -nodeWidth / 2)
                            .attr('y', -nodeHeight / 2)
                            .attr('rx', 8)
                            .attr('fill', '#667eea')
                            .attr('stroke', '#fff')
                            .attr('stroke-width', 2);
                    }
                }

                // For template 2, add icons and special styling
                if (templateId === 2) {
                    const cardWidth = 120;
                    const cardHeight = 140;
                    const avatarSize = 60;
                    const avatarX = 0; // Center of card
                    const avatarY = -cardHeight / 2 + 20 + avatarSize / 2; // Below top border

                    // Avatar background circle (light blue)
                    nodeGroup.append('circle')
                        .attr('class', 'avatar-background')
                        .attr('cx', avatarX)
                        .attr('cy', avatarY)
                        .attr('r', avatarSize / 2)
                        .attr('fill', '#E3F2FD');

                    // Profile picture or icon
                    const defaultImage = isMale
                        ? ''
                        : 'front/images/hugeicons_female-02.svg';

                    let profileImage = nodeData.profile_picture || nodeData.photo || defaultImage;
                    if (profileImage && !profileImage.startsWith('http') && !profileImage.startsWith('/') && !profileImage.startsWith('front/')) {
                        if (profileImage.startsWith('storage/')) {
                            profileImage = '/' + profileImage;
                        } else {
                            profileImage = '/storage/' + profileImage;
                        }
                    }

                    if (profileImage) {
                        const clipId = `clip-${nodeData.id || Math.random().toString(36).substr(2, 9)}`;
                        nodeGroup.append('defs')
                            .append('clipPath')
                            .attr('id', clipId)
                            .append('circle')
                            .attr('cx', avatarX)
                            .attr('cy', avatarY)
                            .attr('r', avatarSize / 2);

                        nodeGroup.append('image')
                            .attr('xlink:href', profileImage)
                            .attr('x', avatarX - avatarSize / 2)
                            .attr('y', avatarY - avatarSize / 2)
                            .attr('width', avatarSize)
                            .attr('height', avatarSize)
                            .attr('clip-path', `url(#${clipId})`)
                            .on('error', function() {
                                d3.select(this).remove();
                            });
                    } else {
                        // Default user icon (blue silhouette)
                        // Simple person icon representation
                        const iconGroup = nodeGroup.append('g')
                            .attr('class', 'avatar-icon-group')
                            .attr('transform', `translate(${avatarX}, ${avatarY})`);

                        // Head circle
                        iconGroup.append('circle')
                            .attr('class', 'avatar-icon')
                            .attr('r', avatarSize / 4)
                            .attr('cy', -avatarSize / 6)
                            .attr('fill', '#2196F3');

                        // Body (shoulders)
                        iconGroup.append('path')
                            .attr('class', 'avatar-icon')
                            .attr('d', `M ${-avatarSize / 3},${avatarSize / 8} Q 0,${avatarSize / 4} ${avatarSize / 3},${avatarSize / 8}`)
                            .attr('fill', '#2196F3')
                            .attr('stroke', 'none');
                    }

                    // Add "+" icon below card (light blue background, blue plus)
                    const addIconSize = 30;
                    const addIconY = cardHeight / 2 + 15;
                    const addIconGroup = nodeGroup.append('g')
                        .attr('class', 'add-icon-group')
                        .attr('transform', `translate(0, ${addIconY})`);

                    // Light blue circle background
                    addIconGroup.append('circle')
                        .attr('r', addIconSize / 2)
                        .attr('fill', '#E3F2FD');

                    // Blue plus sign
                    addIconGroup.append('text')
                        .attr('text-anchor', 'middle')
                        .attr('dy', '0.35em')
                        .attr('fill', '#2196F3')
                        .attr('font-size', '16px')
                        .attr('font-weight', 'bold')
                        .text('+');
                }

                // For template 4, add profile picture and content
                if (templateId === 4) {
                    const cardWidth = 180;
                    const cardHeight = 80;
                    const imageSize = 60;
                    const padding = 12;
                    const imageX = -cardWidth / 2 + padding + imageSize / 2;
                    const imageY = 0;

                    // Profile picture (square with rounded corners)
                    const defaultImage = isMale
                        ? ''
                        : 'front/images/hugeicons_female-02.svg';

                    let profileImage = nodeData.profile_picture || nodeData.photo || defaultImage;
                    if (profileImage && !profileImage.startsWith('http') && !profileImage.startsWith('/') && !profileImage.startsWith('front/')) {
                        if (profileImage.startsWith('storage/')) {
                            profileImage = '/' + profileImage;
                        } else {
                            profileImage = '/storage/' + profileImage;
                        }
                    }

                    if (profileImage) {
                        // White background for image
                        nodeGroup.append('rect')
                            .attr('x', imageX - imageSize / 2)
                            .attr('y', imageY - imageSize / 2)
                            .attr('width', imageSize)
                            .attr('height', imageSize)
                            .attr('rx', 8)
                            .attr('fill', 'white');

                        const clipId = `clip-${nodeData.id || Math.random().toString(36).substr(2, 9)}`;
                        nodeGroup.append('defs')
                            .append('clipPath')
                            .attr('id', clipId)
                            .append('rect')
                            .attr('x', imageX - imageSize / 2)
                            .attr('y', imageY - imageSize / 2)
                            .attr('width', imageSize)
                            .attr('height', imageSize)
                            .attr('rx', 8);

                        nodeGroup.append('image')
                            .attr('xlink:href', profileImage)
                            .attr('x', imageX - imageSize / 2)
                            .attr('y', imageY - imageSize / 2)
                            .attr('width', imageSize)
                            .attr('height', imageSize)
                            .attr('clip-path', `url(#${clipId})`)
                            .attr('preserveAspectRatio', 'xMidYMid slice')
                            .on('error', function() {
                                d3.select(this).remove();
                            });
                    }
                }

                // For template 5, add circular profile picture above name badge
                if (templateId === 5) {
                    const imageSize = 80; // 70-90px range, using 80px
                    const imageY = -imageSize / 2 - 10; // Position above name badge
                    const imageX = 0; // Centered

                    // White circle background with subtle border
                    nodeGroup.append('circle')
                        .attr('class', 'profile-circle')
                        .attr('cx', imageX)
                        .attr('cy', imageY)
                        .attr('r', imageSize / 2)
                        .attr('fill', 'white')
                        .attr('stroke', 'rgba(0,0,0,0.1)')
                        .attr('stroke-width', 1)
                        .attr('filter', 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))');

                    // Profile picture
                    const defaultImage = isMale
                        ? ''
                        : 'front/images/hugeicons_female-02.svg';

                    let profileImage = nodeData.profile_picture || nodeData.photo || defaultImage;
                    if (profileImage && !profileImage.startsWith('http') && !profileImage.startsWith('/') && !profileImage.startsWith('front/')) {
                        if (profileImage.startsWith('storage/')) {
                            profileImage = '/' + profileImage;
                        } else {
                            profileImage = '/storage/' + profileImage;
                        }
                    }

                    if (profileImage) {
                        const clipId = `clip-circle-${nodeData.id || Math.random().toString(36).substr(2, 9)}`;
                        nodeGroup.append('defs')
                            .append('clipPath')
                            .attr('id', clipId)
                            .append('circle')
                            .attr('cx', imageX)
                            .attr('cy', imageY)
                            .attr('r', imageSize / 2);

                        nodeGroup.append('image')
                            .attr('xlink:href', profileImage)
                            .attr('x', imageX - imageSize / 2)
                            .attr('y', imageY - imageSize / 2)
                            .attr('width', imageSize)
                            .attr('height', imageSize)
                            .attr('clip-path', `url(#${clipId})`)
                            .attr('preserveAspectRatio', 'xMidYMid slice')
                            .on('error', function() {
                                d3.select(this).remove();
                            });
                    } else {
                        // Default user icon (simple circle)
                        nodeGroup.append('circle')
                            .attr('cx', imageX)
                            .attr('cy', imageY)
                            .attr('r', imageSize / 2 - 5)
                            .attr('fill', '#D4AF37')
                            .attr('opacity', 0.3);
                    }

                    // Adjust name badge position to be below image
                    const nameBadgeY = imageY + imageSize / 2 + 15; // 15px gap between image and badge
                    nodeGroup.select('.node-rect')
                        .attr('y', nameBadgeY - 17.5); // Center the badge (half of cardHeight which is 35)
                }

                // For template 8, add circular profile picture on left and text on right
                if (templateId === 8) {
                    const cardWidth = 230;
                    const cardHeight = 65;
                    const imageSize = 52;
                    const padding = 10;
                    const imageX = -cardWidth / 2 + padding + imageSize / 2; // Left side of card
                    const imageY = 0; // Center vertically

                    // White circle background
                    nodeGroup.append('circle')
                        .attr('class', 'profile-circle')
                        .attr('cx', imageX)
                        .attr('cy', imageY)
                        .attr('r', imageSize / 2)
                        .attr('fill', 'white')
                        .attr('stroke', 'rgba(255,255,255,0.3)')
                        .attr('stroke-width', 2);

                    // Profile picture
                    const defaultImage = isMale
                        ? ''
                        : 'front/images/hugeicons_female-02.svg';

                    let profileImage = nodeData.profile_picture || nodeData.photo || defaultImage;
                    if (profileImage && !profileImage.startsWith('http') && !profileImage.startsWith('/') && !profileImage.startsWith('front/')) {
                        if (profileImage.startsWith('storage/')) {
                            profileImage = '/' + profileImage;
                        } else {
                            profileImage = '/storage/' + profileImage;
                        }
                    }

                    if (profileImage) {
                        const clipId = `clip-circle-8-${nodeData.id || Math.random().toString(36).substr(2, 9)}`;
                        nodeGroup.append('defs')
                            .append('clipPath')
                            .attr('id', clipId)
                            .append('circle')
                            .attr('cx', imageX)
                            .attr('cy', imageY)
                            .attr('r', imageSize / 2);

                        nodeGroup.append('image')
                            .attr('xlink:href', profileImage)
                            .attr('x', imageX - imageSize / 2)
                            .attr('y', imageY - imageSize / 2)
                            .attr('width', imageSize)
                            .attr('height', imageSize)
                            .attr('clip-path', `url(#${clipId})`)
                            .attr('preserveAspectRatio', 'xMidYMid slice')
                            .on('error', function() {
                                d3.select(this).remove();
                            });
                    } else {
                        // Default placeholder
                        nodeGroup.append('circle')
                            .attr('cx', imageX)
                            .attr('cy', imageY)
                            .attr('r', imageSize / 2 - 5)
                            .attr('fill', 'rgba(255,255,255,0.5)');
                    }
                }

                // For template 9, add circular profile picture on top and text below
                if (templateId === 9) {
                    const cardWidth = 100;
                    const cardHeight = 125;
                    const imageSize = 65;
                    const imageY = -cardHeight / 2 + 20 + imageSize / 2; // Top of card
                    const imageX = 0; // Centered

                    // Light blue circle background
                    nodeGroup.append('circle')
                        .attr('class', 'profile-circle')
                        .attr('cx', imageX)
                        .attr('cy', imageY)
                        .attr('r', imageSize / 2)
                        .attr('fill', '#B8D4E8')
                        .attr('stroke', 'none');

                    // Profile picture
                    const defaultImage = isMale
                        ? ''
                        : 'front/images/hugeicons_female-02.svg';

                    let profileImage = nodeData.profile_picture || nodeData.photo || defaultImage;
                    if (profileImage && !profileImage.startsWith('http') && !profileImage.startsWith('/') && !profileImage.startsWith('front/')) {
                        if (profileImage.startsWith('storage/')) {
                            profileImage = '/' + profileImage;
                        } else {
                            profileImage = '/storage/' + profileImage;
                        }
                    }

                    if (profileImage) {
                        const clipId = `clip-circle-9-${nodeData.id || Math.random().toString(36).substr(2, 9)}`;
                        nodeGroup.append('defs')
                            .append('clipPath')
                            .attr('id', clipId)
                            .append('circle')
                            .attr('cx', imageX)
                            .attr('cy', imageY)
                            .attr('r', imageSize / 2);

                        nodeGroup.append('image')
                            .attr('xlink:href', profileImage)
                            .attr('x', imageX - imageSize / 2)
                            .attr('y', imageY - imageSize / 2)
                            .attr('width', imageSize)
                            .attr('height', imageSize)
                            .attr('clip-path', `url(#${clipId})`)
                            .attr('preserveAspectRatio', 'xMidYMid slice')
                            .on('error', function() {
                                d3.select(this).remove();
                            });
                    } else {
                        // Default icon placeholder
                        const iconGroup = nodeGroup.append('g')
                            .attr('class', 'avatar-icon-group')
                            .attr('transform', `translate(${imageX}, ${imageY})`);

                        // Simple person icon
                        iconGroup.append('circle')
                            .attr('r', imageSize / 4)
                            .attr('cy', -imageSize / 6)
                            .attr('fill', '#5A7A8F');

                        iconGroup.append('path')
                            .attr('d', `M ${-imageSize / 3},${imageSize / 8} Q 0,${imageSize / 4} ${imageSize / 3},${imageSize / 8}`)
                            .attr('fill', '#5A7A8F')
                            .attr('stroke', 'none');
                    }
                }

                // For template 10, add rounded square image on top and text below
                if (templateId === 10) {
                    const cardWidth = 105;
                    const cardHeight = 145;
                    const imageWidth = 70;
                    const imageHeight = 80;
                    const imageY = -cardHeight / 2 + 15 + imageHeight / 2; // Top of card
                    const imageX = 0; // Centered
                    const borderRadius = 12;

                    // Rounded square background for image
                    nodeGroup.append('rect')
                        .attr('x', imageX - imageWidth / 2)
                        .attr('y', imageY - imageHeight / 2)
                        .attr('width', imageWidth)
                        .attr('height', imageHeight)
                        .attr('rx', borderRadius)
                        .attr('ry', borderRadius)
                        .attr('fill', '#FFFFFF');

                    // Profile picture
                    const defaultImage = isMale
                        ? ''
                        : 'front/images/hugeicons_female-02.svg';

                    let profileImage = nodeData.profile_picture || nodeData.photo || defaultImage;
                    if (profileImage && !profileImage.startsWith('http') && !profileImage.startsWith('/') && !profileImage.startsWith('front/')) {
                        if (profileImage.startsWith('storage/')) {
                            profileImage = '/' + profileImage;
                        } else {
                            profileImage = '/storage/' + profileImage;
                        }
                    }

                    if (profileImage) {
                        const clipId = `clip-square-10-${nodeData.id || Math.random().toString(36).substr(2, 9)}`;
                        nodeGroup.append('defs')
                            .append('clipPath')
                            .attr('id', clipId)
                            .append('rect')
                            .attr('x', imageX - imageWidth / 2)
                            .attr('y', imageY - imageHeight / 2)
                            .attr('width', imageWidth)
                            .attr('height', imageHeight)
                            .attr('rx', borderRadius)
                            .attr('ry', borderRadius);

                        nodeGroup.append('image')
                            .attr('xlink:href', profileImage)
                            .attr('x', imageX - imageWidth / 2)
                            .attr('y', imageY - imageHeight / 2)
                            .attr('width', imageWidth)
                            .attr('height', imageHeight)
                            .attr('clip-path', `url(#${clipId})`)
                            .attr('preserveAspectRatio', 'xMidYMid slice')
                            .on('error', function() {
                                d3.select(this).remove();
                            });
                    } else {
                        // Default placeholder
                        nodeGroup.append('rect')
                            .attr('x', imageX - imageWidth / 2)
                            .attr('y', imageY - imageHeight / 2)
                            .attr('width', imageWidth)
                            .attr('height', imageHeight)
                            .attr('rx', borderRadius)
                            .attr('fill', '#D0D0D0')
                            .attr('opacity', 0.3);
                    }
                }

                // For template 1 & 3, add icons and special styling
                if (templateId === 1 || templateId === 3) {
                    if (templateId === 3) {
                        // Template 3: Profile picture, name, dates, phone, icons
                        const nodeDepth = d.depth || 0;
                        const nodeIndex = d.parent ? d.parent.children.indexOf(d) : 0;
                        const generationColors = [
                            '#F4C430',
                            ['#B8D4E8', '#F5D5B8', '#D4B8E8', '#B8D4E8', '#F5D5B8', '#D4B8E8'],
                            ['#B8D4E8', '#A0C4D8', '#C8E8B8', '#E8D8C8', '#F5D5B8', '#E8D4F0'],
                            ['#D0E4F0', '#C8E8B8', '#F5D5B8', '#B8B8B8', '#B8E4F0']
                        ];
                        let cardColor = '#B8D4E8';
                        if (nodeDepth < generationColors.length) {
                            const depthColors = generationColors[nodeDepth];
                            if (Array.isArray(depthColors)) {
                                cardColor = depthColors[nodeIndex % depthColors.length];
                            } else {
                                cardColor = depthColors;
                            }
                        }

                        const profileSize = 32;
                        const profileX = -nodeWidth / 2 + 25;
                        const profileY = -nodeHeight / 2 + 20;

                        const defaultImage = isMale
                            ? ''
                            : 'front/images/hugeicons_female-02.svg';

                        let profileImage = nodeData.profile_picture || nodeData.photo || defaultImage;
                        if (profileImage && !profileImage.startsWith('http') && !profileImage.startsWith('/') && !profileImage.startsWith('front/')) {
                            if (profileImage.startsWith('storage/')) {
                                profileImage = '/' + profileImage;
                            } else {
                                profileImage = '/storage/' + profileImage;
                            }
                        }

                        const clipId = `clip-${nodeData.id || Math.random().toString(36).substr(2, 9)}`;
                        nodeGroup.append('defs')
                            .append('clipPath')
                            .attr('id', clipId)
                            .append('circle')
                            .attr('cx', profileX)
                            .attr('cy', profileY)
                            .attr('r', profileSize / 2);

                        nodeGroup.append('image')
                            .attr('xlink:href', profileImage)
                            .attr('x', profileX - profileSize / 2)
                            .attr('y', profileY - profileSize / 2)
                            .attr('width', profileSize)
                            .attr('height', profileSize)
                            .attr('clip-path', `url(#${clipId})`)
                            .on('error', function() {
                                d3.select(this).attr('xlink:href', defaultImage);
                            });

                        // Green icon on far left
                        nodeGroup.append('circle')
                            .attr('class', 'node-icon green-icon')
                            .attr('cx', -nodeWidth / 2 + 10)
                            .attr('cy', -nodeHeight / 2 + 15)
                            .attr('r', 6)
                            .attr('fill', '#10b981');

                        // Person icon on right
                        nodeGroup.append('circle')
                            .attr('class', 'node-icon person-icon')
                            .attr('cx', nodeWidth / 2 - 15)
                            .attr('cy', -nodeHeight / 2 + 15)
                            .attr('r', 7)
                            .attr('fill', '#6b7280');

                        // Add "+" icon below (colored by card color)
                        const addIconSize = 14;
                        const addIconY = nodeHeight / 2 + 15;
                        const addIconGroup = nodeGroup.append('g')
                            .attr('class', 'add-icon-group')
                            .attr('transform', `translate(0, ${addIconY})`);
                        addIconGroup.append('circle')
                            .attr('r', addIconSize / 2)
                            .attr('fill', cardColor);
                        addIconGroup.append('text')
                            .attr('text-anchor', 'middle')
                            .attr('dy', '0.35em')
                            .attr('fill', 'white')
                            .attr('font-size', '10px')
                            .attr('font-weight', 'bold')
                            .text('+');
                    }
                }

                // For template 1, add icons and special styling
                if (templateId === 1) {
                    // Green icon on the left
                    const greenIconSize = 12;
                    nodeGroup.append('circle')
                        .attr('class', 'node-icon green-icon')
                        .attr('cx', -nodeWidth / 2 + 15)
                        .attr('cy', 0)
                        .attr('r', greenIconSize / 2)
                        .attr('fill', '#10b981');

                    // Person icon on the right (simple circle representation)
                    const personIconSize = 14;
                    nodeGroup.append('circle')
                        .attr('class', 'node-icon person-icon')
                        .attr('cx', nodeWidth / 2 - 15)
                        .attr('cy', 0)
                        .attr('r', personIconSize / 2)
                        .attr('fill', '#6b7280');

                    // Add "+" icon below the node
                    const addIconSize = 16;
                    const addIconY = nodeHeight / 2 + 20;
                    const addIconColor = isMale ? '#3b82f6' : '#ec4899';
                    const addIconGroup = nodeGroup.append('g')
                        .attr('class', 'add-icon-group')
                        .attr('transform', `translate(0, ${addIconY})`);

                    addIconGroup.append('circle')
                        .attr('r', addIconSize / 2)
                        .attr('fill', addIconColor)
                        .attr('class', isMale ? 'add-icon' : 'add-icon-female');

                    addIconGroup.append('text')
                        .attr('text-anchor', 'middle')
                        .attr('dy', '0.35em')
                        .attr('fill', 'white')
                        .attr('font-size', '12px')
                        .attr('font-weight', 'bold')
                        .text('+');
                }

                // Add text
                const textGroup = nodeGroup.append('g')
                    .attr('class', 'node-text');

                if (templateId === 4) {
                    // Template 4: Name, dates, status on the right side
                    const cardWidth = 180;
                    const cardHeight = 80;
                    const imageSize = 60;
                    const padding = 12;
                    const textStartX = -cardWidth / 2 + padding + imageSize + padding + 30; // Moved 24px to the right
                    // Calculate available text width (from text start to right edge of card minus padding)
                    const textMaxWidth = (cardWidth / 2) - padding - (textStartX - (-cardWidth / 2));
                    // Start text from top of card, aligned with top of image
                    const textStartY = -cardHeight / 2 + padding + 18;

                    // Name - bold, large (top of text area)
                    const nameText = nodeData.name || '';
                    const nameFontSize = nameText.length > 15 ? '14px' : '16px'; // Reduce font size for long names
                    textGroup.append('text')
                        .attr('class', 'name-text')
                        .attr('text-anchor', 'start')
                        .attr('x', textStartX)
                        .attr('y', textStartY)
                        .attr('fill', '#212121')
                        .attr('font-size', nameFontSize)
                        .attr('font-weight', '700')
                        .attr('dominant-baseline', 'hanging')
                        .text(nameText);

                    // Birth date
                    let currentY = textStartY + 20;
                    if (nodeData.birth_date) {
                        textGroup.append('text')
                            .attr('class', 'date-text')
                            .attr('text-anchor', 'start')
                            .attr('x', textStartX)
                            .attr('y', currentY)
                            .attr('fill', '#757575')
                            .attr('font-size', '12px')
                            .attr('font-weight', '400')
                            .attr('dominant-baseline', 'hanging')
                            .text(nodeData.birth_date);
                        currentY += 16;
                    }

                    // Death date
                    if (nodeData.death_date) {
                        textGroup.append('text')
                            .attr('class', 'date-text')
                            .attr('text-anchor', 'start')
                            .attr('x', textStartX)
                            .attr('y', currentY)
                            .attr('fill', '#757575')
                            .attr('font-size', '12px')
                            .attr('font-weight', '400')
                            .attr('dominant-baseline', 'hanging')
                            .text(nodeData.death_date);
                        currentY += 16;
                    }

                    // Status (متوفى/حي)
                    const statusText = isDeceased ? 'متوفى' : 'حي';
                    const statusClass = isDeceased ? 'status-deceased' : 'status-alive';
                    textGroup.append('text')
                        .attr('class', `status-text ${statusClass}`)
                        .attr('text-anchor', 'start')
                        .attr('x', textStartX)
                        .attr('y', currentY)
                        .attr('fill', isDeceased ? '#616161' : '#4CAF50')
                        .attr('font-size', '11px')
                        .attr('font-weight', '500')
                        .attr('dominant-baseline', 'hanging')
                        .text(statusText);
                } else if (templateId === 5 || templateId === 6) {
                    // Template 5 & 6: Name only, centered in pill shape
                    const nameLength = (nodeData.name || '').length;
                    const cardWidth = Math.max(100, Math.min(140, nameLength * 8 + 40));
                    const cardHeight = 35;

                    // Calculate Y position for text (same as badge position)
                    let textY = 0;
                    if (templateId === 5) {
                        // For template 5, text should be in the badge below the image
                        const imageSize = 80;
                        const imageY = -imageSize / 2 - 10;
                        const nameBadgeY = imageY + imageSize / 2 + 15;
                        textY = nameBadgeY; // Center of badge
                    } else if (templateId === 6) {
                        // For template 6, move text down slightly
                        textY = 14; // Move down 3px
                    }

                    // Name - centered, white text on golden background
                    textGroup.append('text')
                        .attr('class', 'name-text')
                        .attr('text-anchor', 'middle')
                        .attr('x', 0)
                        .attr('y', textY)
                        .attr('fill', '#FFFFFF')
                        .attr('font-size', '14px')
                        .attr('font-weight', '500')
                        .attr('dominant-baseline', 'middle')
                        .text(nodeData.name || '');
                } else if (templateId === 7) {
                    // Template 7: Name only, centered in golden rounded rectangle
                    const nameLength = (nodeData.name || '').length;
                    const cardWidth = Math.max(120, Math.min(160, nameLength * 9 + 40));
                    const cardHeight = 45;

                    // Name - centered, black text on golden background
                    textGroup.append('text')
                        .attr('class', 'name-text')
                        .attr('text-anchor', 'middle')
                        .attr('x', 0)
                        .attr('y', 0)
                        .attr('fill', '#000000')
                        .attr('font-size', '14px')
                        .attr('font-weight', '500')
                        .attr('dominant-baseline', 'middle')
                        .text(nodeData.name || '');
                } else if (templateId === 8) {
                    // Template 8: Name and date on the right side of horizontal card
                    const cardWidth = 230;
                    const cardHeight = 65;
                    const imageSize = 52;
                    const padding = 10;
                    const textStartX = -cardWidth / 2 + padding + imageSize + 100; // Right of image (moved more to the right)
                    const textStartY = -8; // Slightly above center for name

                    // Name - bold, dark
                    textGroup.append('text')
                        .attr('class', 'name-text')
                        .attr('text-anchor', 'start')
                        .attr('x', textStartX)
                        .attr('y', textStartY)
                        .attr('fill', '#212121')
                        .attr('font-size', '15px')
                        .attr('font-weight', '600')
                        .attr('dominant-baseline', 'hanging')
                        .text(nodeData.name || '');

                    // Date - below name
                    const dateText = nodeData.birth_date || nodeData.death_date || '';
                    if (dateText) {
                        textGroup.append('text')
                            .attr('class', 'date-text')
                            .attr('text-anchor', 'start')
                            .attr('x', textStartX)
                            .attr('y', textStartY + 18)
                            .attr('fill', '#424242')
                            .attr('font-size', '12px')
                            .attr('font-weight', '400')
                            .attr('dominant-baseline', 'hanging')
                            .text(dateText);
                    }
                } else if (templateId === 10) {
                    // Template 10: Vertical card with image on top, name, deceased badge, date, phone
                    const cardWidth = 105;
                    const cardHeight = 145;
                    const imageHeight = 80;
                    const padding = 12;
                    const imageTopY = -cardHeight / 2 + 15;
                    const imageBottomY = imageTopY + imageHeight;
                    const nameStartY = imageBottomY + 8; // 8px below image

                    // Name - bold, black, centered
                    const nameText = nodeData.name || '';
                    textGroup.append('text')
                        .attr('class', 'name-text')
                        .attr('text-anchor', 'middle')
                        .attr('x', 0)
                        .attr('y', nameStartY)
                        .attr('fill', '#212121')
                        .attr('font-size', '17px')
                        .attr('font-weight', '700')
                        .attr('dominant-baseline', 'hanging')
                        .text(nameText);

                    // Deceased badge (if deceased)
                    let currentY = nameStartY + 20; // Approximate name height + 5px spacing
                    if (isDeceased) {
                        // Badge background
                        const badgeWidth = 45;
                        const badgeHeight = 18;
                        const badgeX = -badgeWidth / 2;
                        const badgeY = currentY;

                        textGroup.append('rect')
                            .attr('class', 'deceased-badge')
                            .attr('x', badgeX)
                            .attr('y', badgeY)
                            .attr('width', badgeWidth)
                            .attr('height', badgeHeight)
                            .attr('rx', 10)
                            .attr('ry', 10)
                            .attr('fill', '#2E2E2E');

                        // Badge text
                        textGroup.append('text')
                            .attr('class', 'deceased-badge-text')
                            .attr('text-anchor', 'middle')
                            .attr('x', 0)
                            .attr('y', badgeY + badgeHeight / 2)
                            .attr('fill', '#FFFFFF')
                            .attr('font-size', '9px')
                            .attr('font-weight', '500')
                            .attr('dominant-baseline', 'middle')
                            .text('متوفى');

                        currentY += badgeHeight + 6; // Badge height + spacing
                    }

                    // Birth date with icon
                    if (nodeData.birth_date) {
                        const dateIconX = -cardWidth / 2 + padding;
                        const dateTextX = dateIconX + 12; // Icon width + spacing

                        // Date icon (📅 emoji or simple circle)
                        textGroup.append('text')
                            .attr('x', dateIconX)
                            .attr('y', currentY)
                            .attr('fill', '#424242')
                            .attr('font-size', '10px')
                            .attr('dominant-baseline', 'hanging')
                            .text('📅');

                        // Date text
                        textGroup.append('text')
                            .attr('class', 'date-text')
                            .attr('text-anchor', 'start')
                            .attr('x', dateTextX)
                            .attr('y', currentY)
                            .attr('fill', '#424242')
                            .attr('font-size', '10px')
                            .attr('font-weight', '400')
                            .attr('dominant-baseline', 'hanging')
                            .text(nodeData.birth_date);

                        currentY += 14; // Line height + spacing
                    }

                    // Phone number with icon
                    if (nodeData.phone) {
                        const phoneIconX = -cardWidth / 2 + padding;
                        const phoneTextX = phoneIconX + 12;

                        // Phone icon (📞 emoji)
                        textGroup.append('text')
                            .attr('x', phoneIconX)
                            .attr('y', currentY)
                            .attr('fill', '#424242')
                            .attr('font-size', '10px')
                            .attr('dominant-baseline', 'hanging')
                            .text('📞');

                        // Phone text
                        textGroup.append('text')
                            .attr('class', 'phone-text')
                            .attr('text-anchor', 'start')
                            .attr('x', phoneTextX)
                            .attr('y', currentY)
                            .attr('fill', '#424242')
                            .attr('font-size', '10px')
                            .attr('font-weight', '400')
                            .attr('dominant-baseline', 'hanging')
                            .text(nodeData.phone);
                    }
                } else if (templateId === 9) {
                    // Template 9: Name and date centered below circular image
                    const cardWidth = 100;
                    const cardHeight = 125;
                    const imageSize = 65;
                    const imageY = -cardHeight / 2 + 20 + imageSize / 2;
                    const nameY = imageY + imageSize / 2 + 10; // 10px below image

                    // Name - centered, bold, dark
                    textGroup.append('text')
                        .attr('class', 'name-text')
                        .attr('text-anchor', 'middle')
                        .attr('x', 0)
                        .attr('y', nameY)
                        .attr('fill', '#212121')
                        .attr('font-size', '15px')
                        .attr('font-weight', '600')
                        .attr('dominant-baseline', 'hanging')
                        .text(nodeData.name || '');

                    // Date - below name
                    const dateText = nodeData.birth_date || nodeData.death_date || '';
                    if (dateText) {
                        textGroup.append('text')
                            .attr('class', 'date-text')
                            .attr('text-anchor', 'middle')
                            .attr('x', 0)
                            .attr('y', nameY + 18)
                            .attr('fill', '#757575')
                            .attr('font-size', '11px')
                            .attr('font-weight', '400')
                            .attr('dominant-baseline', 'hanging')
                            .text(dateText);
                    }
                } else if (templateId === 2) {
                    // Template 2: Name and dates centered below avatar
                    const cardWidth = 120;
                    const cardHeight = 140;
                    const avatarSize = 60;
                    const avatarY = -cardHeight / 2 + 20 + avatarSize / 2;

                    // Name - centered, black, bold
                    const nameY = avatarY + avatarSize / 2 + 20;
                    textGroup.append('text')
                        .attr('text-anchor', 'middle')
                        .attr('x', 0)
                        .attr('y', nameY)
                        .attr('fill', '#212121')
                        .attr('font-size', '14px')
                        .attr('font-weight', '600')
                        .text(nodeData.name || '');

                    // Dates - centered, gray, below name
                    if (nodeData.birth_date || nodeData.death_date) {
                        let dateText = '';
                        if (nodeData.birth_date && nodeData.death_date) {
                            dateText = `${nodeData.birth_date} - ${nodeData.death_date}`;
                        } else if (nodeData.birth_date) {
                            dateText = nodeData.birth_date;
                        } else if (nodeData.death_date) {
                            dateText = nodeData.death_date;
                        }
                        if (dateText) {
                            textGroup.append('text')
                                .attr('class', 'date-text')
                                .attr('text-anchor', 'middle')
                                .attr('x', 0)
                                .attr('y', nameY + 18)
                                .attr('fill', '#757575')
                                .attr('font-size', '12px')
                                .attr('font-weight', '400')
                                .text(dateText);
                        }
                    }
                } else if (templateId === 3) {
                    // Template 3: Name, dates, phone number
                    const profileX = -nodeWidth / 2 + 25;
                    const profileY = -nodeHeight / 2 + 20;
                    const profileSize = 32;
                    // Center the text below the profile picture
                    const textStartX = 0; // Center of the card
                    const textStartY = profileY + profileSize / 2 + 25; // Below profile picture

                    // Name - centered below profile picture
                    textGroup.append('text')
                        .attr('text-anchor', 'middle')
                        .attr('x', textStartX)
                        .attr('y', textStartY)
                        .attr('fill', '#000000')
                        .attr('font-size', '14px')
                        .attr('font-weight', '500')
                        .text(nodeData.name || '');

                    // Dates - centered
                    let dateY = textStartY + 18;
                    if (nodeData.birth_date || nodeData.death_date) {
                        let dateText = '';
                        if (nodeData.birth_date && nodeData.death_date) {
                            dateText = `${nodeData.birth_date} - ${nodeData.death_date}`;
                        } else if (nodeData.birth_date) {
                            dateText = nodeData.birth_date;
                        } else if (nodeData.death_date) {
                            dateText = nodeData.death_date;
                        }
                        if (dateText) {
                            textGroup.append('text')
                                .attr('class', 'date-text')
                                .attr('text-anchor', 'middle')
                                .attr('x', textStartX)
                                .attr('y', dateY)
                                .attr('fill', '#666666')
                                .attr('font-size', '11px')
                                .text(dateText);
                            dateY += 16;
                        }
                    }

                    // Phone number - centered
                    if (nodeData.phone_number) {
                        textGroup.append('text')
                            .attr('class', 'phone-text')
                            .attr('text-anchor', 'middle')
                            .attr('x', textStartX)
                            .attr('y', dateY)
                            .attr('fill', '#666666')
                            .attr('font-size', '10px')
                            .text(nodeData.phone_number);
                    }

                    // Deceased label (if applicable) - centered
                    if (isDeceased) {
                        const deceasedText = isMale ? 'متوفي' : 'متوفية';
                        textGroup.append('text')
                            .attr('text-anchor', 'middle')
                            .attr('x', textStartX)
                            .attr('y', dateY + 16)
                            .attr('fill', '#FFFFFF')
                            .attr('font-size', '10px')
                            .attr('font-weight', '400')
                            .attr('style', 'background: rgba(0,0,0,0.7); padding: 2px 4px; border-radius: 3px;')
                            .text(deceasedText);
                    }
                } else {
                    // Template 1 and others
                    // Name text - dark color for template 1 (white background)
                    const textColor = templateId === 1 ? '#1f2937' : '#fff';
                    textGroup.append('text')
                        .attr('text-anchor', 'middle')
                        .attr('dy', '-0.3em')
                        .attr('fill', textColor)
                        .attr('font-size', '14px')
                        .attr('font-weight', '500')
                        .text(nodeData.name || '');

                    // Deceased label for template 1
                    if (templateId === 1 && isDeceased) {
                        const deceasedText = isMale ? 'متوفي' : 'متوفية';
                        const deceasedColor = isMale ? '#3b82f6' : '#ec4899';
                        textGroup.append('text')
                            .attr('class', `deceased-label deceased-label-${gender}`)
                            .attr('text-anchor', 'middle')
                            .attr('dy', '1.2em')
                            .attr('fill', deceasedColor)
                            .attr('font-size', '11px')
                            .attr('font-weight', '400')
                            .text(deceasedText);
                    }

                    if (nodeData.age && templateId !== 1 && templateId !== 3) {
                        textGroup.append('text')
                            .attr('text-anchor', 'middle')
                            .attr('dy', '1em')
                            .attr('fill', '#fff')
                            .attr('font-size', '12px')
                            .text(nodeData.age);
                    }
                }
            });

            // Add zoom/pan functionality using D3 zoom
            const zoom = d3.zoom()
                .scaleExtent([0.3, 3])
                .on('zoom', (event) => {
                    g.attr('transform', event.transform);
                    // Update zoom display
                    const zoomDisplay = document.getElementById('zoom-display');
                    if (zoomDisplay) {
                        zoomDisplay.textContent = Math.round(event.transform.k * 100) + '%';
                    }
                });

            svg.call(zoom);

            // Center and fit the tree
            const initialScale = Math.min(
                (containerWidth * 0.9) / treeWidth_actual,
                (containerHeight * 0.9) / treeHeight_actual,
                1
            );

            const initialX = (containerWidth - treeWidth_actual * initialScale) / 2 - minX * initialScale;
            const initialY = (containerHeight - treeHeight_actual * initialScale) / 2 - minY * initialScale;

            const initialTransform = d3.zoomIdentity
                .translate(initialX, initialY)
                .scale(initialScale);

            svg.call(zoom.transform, initialTransform);

            // Expose zoom functions to global scope for button handlers
            window.freeTemplateZoomIn = function() {
                const currentTransform = d3.zoomTransform(svg.node());
                const newScale = Math.min(currentTransform.k * 1.2, 3);
                svg.transition().call(zoom.scaleTo, newScale);
            };

            window.freeTemplateZoomOut = function() {
                const currentTransform = d3.zoomTransform(svg.node());
                const newScale = Math.max(currentTransform.k / 1.2, 0.3);
                svg.transition().call(zoom.scaleTo, newScale);
            };

            window.freeTemplateResetZoom = function() {
                svg.transition().call(zoom.transform, initialTransform);
            };

            // Store tree data globally for dynamic updates
            window.currentTreeData = treeData;
            window.currentTreeRoot = root;
            window.currentTreeSvg = svg;
            window.currentTreeG = g;
            window.currentTreeZoom = zoom;
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
                }
            };

            window.freeTemplateZoomOut = function() {
                if (scale > 0.3) {
                    scale = Math.max(scale - 0.3, 0.3); // Increased zoom step
                    updateTransform();
                    updateZoomButtons();
                }
            };

            window.freeTemplateResetZoom = function() {
                scale = 1;
                translateX = 0;
                translateY = 0;
                updateTransform();
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
                    const sourceX = sourceNode.x + 80;  // Center of source node (using new BASE_NODE_WIDTH/2)
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
                // Remove all SVG elements using D3
                d3.select(container).selectAll('svg').remove();
                // Clear inner HTML
                container.innerHTML = '';
            }

            // Remove any existing connection SVG
            const existingSvg = document.querySelector('.tree-links-svg');
            if (existingSvg) {
                existingSvg.remove();
            }

            // Remove any existing template containers
            const templateContainers = document.querySelectorAll('.template-container');
            templateContainers.forEach(tc => {
                if (tc.parentNode) {
                    tc.parentNode.removeChild(tc);
                }
            });
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
                // Check if this is a free template (1-10) - don't draw lines for these
                const templateId = window.currentTemplateId || 1;
                if (templateId >= 1 && templateId <= 10) {
                    return; // Don't draw lines for templates 1-10
                }
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
                    // For free templates, re-render the entire tree with D3.js
                    renderFreeTemplateGraph(templateId, window.treeDataGlobal);
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

            // Auto-fit on initial load to center tree - with multiple attempts to ensure it works
            setTimeout(() => {
                autoFit();
                // Try again after a short delay to ensure nodes are fully rendered
                setTimeout(() => {
                    autoFit();
                }, 200);
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
                        .attr('class', 'node-name-text')
                        .attr('pointer-events', 'all')
                        .style('cursor', 'pointer')
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
                        .attr('class', 'node-name-text')
                        .attr('pointer-events', 'all')
                        .style('cursor', 'pointer')
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
                        .attr('class', 'node-name-text')
                        .attr('pointer-events', 'all')
                        .style('cursor', 'pointer')
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
            if (!svg || !nodesData || nodesData.length === 0) {
                console.warn('autoFit: SVG or nodesData not available');
                return;
            }

            const bounds = getTreeBounds();
            if (!bounds) {
                console.warn('autoFit: Could not get tree bounds');
                return;
            }

            // Ensure we have valid dimensions
            if (!width || !height) {
                const container = document.getElementById('tree-container');
                if (container) {
                    width = container.offsetWidth || 1200;
                    height = 600;
                } else {
                    console.warn('autoFit: Container not found');
                    return;
                }
            }

            // Calculate zoom to fit tree nicely in viewport
            const padding = 80; // Increased padding for better centering
            const scaleX = bounds.width > 0 ? (width - padding * 2) / bounds.width : 1;
            const scaleY = bounds.height > 0 ? (height - padding * 2) / bounds.height : 1;
            const autoZoom = Math.min(scaleX, scaleY, 1) * 0.9; // Slightly smaller to show more context

            zoom = Math.max(0.3, Math.min(5, autoZoom)); // Updated max zoom limit

            // Center the tree perfectly in viewport
            const treeCenterX = (bounds.minX + bounds.maxX) / 2;
            const treeCenterY = (bounds.minY + bounds.maxY) / 2;

            // Calculate pan to center tree in viewport
            panX = (width / 2) - (treeCenterX * zoom);
            panY = (height / 2) - (treeCenterY * zoom);

            console.log('Auto-fit: zoom=', zoom, 'panX=', panX, 'panY=', panY, 'bounds=', bounds);

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
                        // Ensure tree is centered after re-rendering
                        setTimeout(() => {
                            if (typeof autoFit === 'function') {
                                autoFit();
                            }
                        }, 300);
                    }
                    // Reload family members table
                    if (typeof loadFamilyMembers === 'function') {
                        loadFamilyMembers();
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

        // ============================================================
        // Family Members Table Management
        // ============================================================

        let currentUser = null;
        let allMembers = [];

        // Check user role on page load
        function checkUserRole() {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                currentUser = JSON.parse(userStr);
                if (currentUser && currentUser.role === 'tree_creator') {
                    document.getElementById('add-member-btn').style.display = 'block';
                }
            }
        }

        // Load all family members
        async function loadFamilyMembers() {
            const token = localStorage.getItem('authToken');
            if (!token) {
                document.getElementById('family-members-tbody').innerHTML =
                    '<tr><td colspan="9" class="text-center text-danger">يجب تسجيل الدخول أولاً</td></tr>';
                return;
            }

            try {
                const response = await fetch('/api/tree_creator/family-members-data', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('فشل في تحميل البيانات');
                }

                const data = await response.json();
                allMembers = data.family_data_members_tree || [];
                renderFamilyMembersTable(allMembers);
            } catch (error) {
                console.error('Error loading family members:', error);
                document.getElementById('family-members-tbody').innerHTML = `
                    <tr>
                        <td colspan="9" style="padding: 60px 20px; text-align: center;">
                            <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #f44336; margin-bottom: 15px; display: block;"></i>
                            <span style="color: #f44336; font-size: 18px; font-weight: 600;">حدث خطأ في تحميل البيانات</span>
                        </td>
                    </tr>
                `;
            }
        }

        // Render family members table
        function renderFamilyMembersTable(members) {
            const tbody = document.getElementById('family-members-tbody');

            if (!members || members.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="9" style="padding: 60px 20px; text-align: center; color: #999; font-size: 18px;">
                            <i class="fas fa-users" style="font-size: 48px; color: rgba(211, 171, 85, 0.3); margin-bottom: 15px; display: block;"></i>
                            لا يوجد أفراد في الشجرة
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = members.map((member, index) => {
                const profilePic = member.profile_picture
                    ? `/storage/${member.profile_picture}`
                    : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(member.name || 'User') + '&background=d3ab55&color=fff&size=128';
                const relationText = {
                    'father': 'أب',
                    'mother': 'أم',
                    'son': 'ابن',
                    'daughter': 'ابنة',
                    'grandfather': 'جد'
                }[member.relation] || member.relation;
                const statusClass = member.status === 'alive' ? 'status-alive' : 'status-deceased';
                const statusText = member.status === 'alive' ? 'على قيد الحياة' : 'متوفى';
                const birthDate = member.birth_date ? new Date(member.birth_date).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }) : '-';
                const canEdit = currentUser && currentUser.role === 'tree_creator';

                // Add animation delay for each row
                const animationDelay = index * 0.05;

                return `
                    <tr style="animation-delay: ${animationDelay}s;">
                        <td style="font-weight: 700; color: rgba(211, 171, 85, 1);">${index + 1}</td>
                        <td>
                            <img src="${profilePic}" alt="${member.name}"
                                 onerror="this.src='https://ui-avatars.com/api/?name=' + encodeURIComponent('${member.name || 'User'}') + '&background=d3ab55&color=fff&size=128'"
                                 style="width: 60px; height: 60px; object-fit: cover; border-radius: 50%; border: 3px solid rgba(211, 171, 85, 0.3); box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);">
                        </td>
                        <td><span class="member-name">${member.name || '-'}</span></td>
                        <td><span class="member-relation">${relationText}</span></td>
                        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                        <td style="color: #666;">${birthDate}</td>
                        <td style="color: #666;">${member.job || '-'}</td>
                        <td style="color: #666; direction: ltr; text-align: center;">${member.phone_number || '-'}</td>
                        <td>
                            <div class="member-actions">
                                ${canEdit ? `
                                    <button class="btn btn-warning" onclick="editMember(${member.id})" title="تعديل">
                                        <i class="fas fa-edit"></i> تعديل
                                    </button>
                                    <button class="btn btn-danger" onclick="deleteMember(${member.id})" title="حذف">
                                        <i class="fas fa-trash"></i> حذف
                                    </button>
                                ` : '<span style="color: #999; font-style: italic;">غير مسموح</span>'}
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // Add new member
        document.getElementById('add-member-btn').addEventListener('click', async function() {
            if (currentUser && currentUser.role === 'tree_creator') {
                showAddMemberModal();
            } else {
                await showCustomAlert('ليس لديك صلاحية لإضافة أفراد', 'error', 'خطأ في الصلاحيات');
            }
        });

        function showAddMemberModal() {
            // Create modal HTML with enhanced design
            const modalHTML = `
                <div class="modal fade" id="addMemberModal" tabindex="-1" aria-labelledby="addMemberModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="addMemberModalLabel">
                                    <i class="fas fa-user-plus"></i>
                                    إضافة فرد جديد
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <form id="add-member-form">
                                    <div class="row">
                                        <div class="col-md-6 mb-4">
                                            <label class="form-label">
                                                <i class="fas fa-user"></i>
                                                الاسم
                                            </label>
                                            <input type="text" class="form-control" name="name" required placeholder="أدخل الاسم الكامل">
                                        </div>
                                        <div class="col-md-6 mb-4">
                                            <label class="form-label">
                                                <i class="fas fa-sitemap"></i>
                                                صلة القرابة
                                            </label>
                                            <select class="form-select" name="relation" required>
                                                <option value="">اختر صلة القرابة...</option>
                                                <option value="father">أب</option>
                                                <option value="mother">أم</option>
                                                <option value="son">ابن</option>
                                                <option value="daughter">ابنة</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6 mb-4">
                                            <label class="form-label">
                                                <i class="fas fa-heartbeat"></i>
                                                الحالة
                                            </label>
                                            <select class="form-select" name="status" required>
                                                <option value="alive">على قيد الحياة</option>
                                                <option value="deceased">متوفى</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6 mb-4">
                                            <label class="form-label">
                                                <i class="fas fa-calendar-alt"></i>
                                                تاريخ الميلاد
                                            </label>
                                            <input type="date" class="form-control" name="birth_date">
                                        </div>
                                        <div class="col-md-6 mb-4">
                                            <label class="form-label">
                                                <i class="fas fa-briefcase"></i>
                                                الوظيفة
                                            </label>
                                            <input type="text" class="form-control" name="job" placeholder="أدخل الوظيفة">
                                        </div>
                                        <div class="col-md-6 mb-4">
                                            <label class="form-label">
                                                <i class="fas fa-phone"></i>
                                                رقم الهاتف
                                            </label>
                                            <input type="text" class="form-control" name="phone_number" placeholder="أدخل رقم الهاتف">
                                        </div>
                                        <div class="col-md-6 mb-4">
                                            <label class="form-label">
                                                <i class="fas fa-envelope"></i>
                                                البريد الإلكتروني
                                            </label>
                                            <input type="email" class="form-control" name="email" placeholder="example@email.com">
                                        </div>
                                        <div class="col-md-6 mb-4">
                                            <label class="form-label">
                                                <i class="fas fa-heart"></i>
                                                الحالة الاجتماعية
                                            </label>
                                            <select class="form-select" name="marital_status">
                                                <option value="">اختر الحالة الاجتماعية...</option>
                                                <option value="single">أعزب</option>
                                                <option value="married">متزوج</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6 mb-4">
                                            <label class="form-label">
                                                <i class="fas fa-male"></i>
                                                الأب (اختياري)
                                            </label>
                                            <select class="form-select" name="father_id" id="father-select">
                                                <option value="">لا يوجد</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6 mb-4">
                                            <label class="form-label">
                                                <i class="fas fa-female"></i>
                                                الأم (اختياري)
                                            </label>
                                            <select class="form-select" name="mother_id" id="mother-select">
                                                <option value="">لا يوجد</option>
                                            </select>
                                        </div>
                                        <div class="col-md-12 mb-4">
                                            <label class="form-label">
                                                <i class="fas fa-image"></i>
                                                صورة الملف الشخصي
                                            </label>
                                            <input type="file" class="form-control" name="profile_picture" accept="image/*">
                                            <small class="form-text text-muted" style="margin-top: 5px; display: block;">
                                                <i class="fas fa-info-circle"></i> الصيغ المدعومة: JPG, PNG, GIF (حجم أقصى: 10MB)
                                            </small>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    <i class="fas fa-times"></i> إلغاء
                                </button>
                                <button type="button" class="btn btn-primary" onclick="submitAddMember()">
                                    <i class="fas fa-plus"></i> إضافة
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Remove existing modal if any
            const existingModal = document.getElementById('addMemberModal');
            if (existingModal) {
                existingModal.remove();
            }

            // Add modal to body
            document.body.insertAdjacentHTML('beforeend', modalHTML);

            // Populate parent selects
            populateParentSelects();

            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('addMemberModal'));
            modal.show();

            // Clean up on hide
            document.getElementById('addMemberModal').addEventListener('hidden.bs.modal', function() {
                this.remove();
            });
        }

        // Edit member
        async function editMember(memberId) {
            if (!currentUser || currentUser.role !== 'tree_creator') {
                await showCustomAlert('ليس لديك صلاحية لتعديل الأفراد', 'error', 'خطأ في الصلاحيات');
                return;
            }

            const member = allMembers.find(m => m.id === memberId);
            if (!member) {
                await showCustomAlert('الفرد غير موجود', 'error', 'خطأ');
                return;
            }

            showEditMemberModal(member);
        }

        function showEditMemberModal(member) {
            const modalHTML = `
                <div class="modal fade" id="editMemberModal" tabindex="-1" aria-labelledby="editMemberModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="editMemberModalLabel">
                                    <i class="fas fa-user-edit"></i>
                                    تعديل بيانات الفرد
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <form id="edit-member-form">
                                    <div class="row">
                                        <div class="col-md-6 mb-4">
                                            <label class="form-label">
                                                <i class="fas fa-user"></i>
                                                الاسم
                                            </label>
                                            <input type="text" class="form-control" name="name" value="${member.name || ''}" required placeholder="أدخل الاسم الكامل">
                                        </div>
                                        <div class="col-md-6 mb-4">
                                            <label class="form-label">
                                                <i class="fas fa-sitemap"></i>
                                                صلة القرابة
                                            </label>
                                            <select class="form-select" name="relation" required>
                                                <option value="father" ${member.relation === 'father' ? 'selected' : ''}>أب</option>
                                                <option value="mother" ${member.relation === 'mother' ? 'selected' : ''}>أم</option>
                                                <option value="son" ${member.relation === 'son' ? 'selected' : ''}>ابن</option>
                                                <option value="daughter" ${member.relation === 'daughter' ? 'selected' : ''}>ابنة</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6 mb-4">
                                            <label class="form-label">
                                                <i class="fas fa-heartbeat"></i>
                                                الحالة
                                            </label>
                                            <select class="form-select" name="status" required>
                                                <option value="alive" ${member.status === 'alive' ? 'selected' : ''}>على قيد الحياة</option>
                                                <option value="deceased" ${member.status === 'deceased' ? 'selected' : ''}>متوفى</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6 mb-4">
                                            <label class="form-label">
                                                <i class="fas fa-calendar-alt"></i>
                                                تاريخ الميلاد
                                            </label>
                                            <input type="date" class="form-control" name="birth_date" value="${member.birth_date ? member.birth_date.split(' ')[0] : ''}">
                                        </div>
                                        <div class="col-md-6 mb-4">
                                            <label class="form-label">
                                                <i class="fas fa-briefcase"></i>
                                                الوظيفة
                                            </label>
                                            <input type="text" class="form-control" name="job" value="${member.job || ''}" placeholder="أدخل الوظيفة">
                                        </div>
                                        <div class="col-md-6 mb-4">
                                            <label class="form-label">
                                                <i class="fas fa-phone"></i>
                                                رقم الهاتف
                                            </label>
                                            <input type="text" class="form-control" name="phone_number" value="${member.phone_number || ''}" placeholder="أدخل رقم الهاتف">
                                        </div>
                                        <div class="col-md-6 mb-4">
                                            <label class="form-label">
                                                <i class="fas fa-heart"></i>
                                                الحالة الاجتماعية
                                            </label>
                                            <select class="form-select" name="marital_status">
                                                <option value="">اختر الحالة الاجتماعية...</option>
                                                <option value="single" ${member.marital_status === 'single' ? 'selected' : ''}>أعزب</option>
                                                <option value="married" ${member.marital_status === 'married' ? 'selected' : ''}>متزوج</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6 mb-4">
                                            <label class="form-label">
                                                <i class="fas fa-male"></i>
                                                الأب (اختياري)
                                            </label>
                                            <select class="form-select" name="father_id" id="edit-father-select">
                                                <option value="">لا يوجد</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6 mb-4">
                                            <label class="form-label">
                                                <i class="fas fa-female"></i>
                                                الأم (اختياري)
                                            </label>
                                            <select class="form-select" name="mother_id" id="edit-mother-select">
                                                <option value="">لا يوجد</option>
                                            </select>
                                        </div>
                                        <div class="col-md-12 mb-4">
                                            <label class="form-label">
                                                <i class="fas fa-image"></i>
                                                صورة الملف الشخصي
                                            </label>
                                            ${member.profile_picture ? `
                                                <div style="margin-bottom: 15px;">
                                                    <img src="/storage/${member.profile_picture}"
                                                         style="width: 120px; height: 120px; object-fit: cover; border-radius: 12px; border: 3px solid rgba(211, 171, 85, 0.3); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
                                                    <p style="margin-top: 8px; color: #666; font-size: 13px;">
                                                        <i class="fas fa-info-circle"></i> الصورة الحالية
                                                    </p>
                                                </div>
                                            ` : ''}
                                            <input type="file" class="form-control" name="profile_picture" accept="image/*">
                                            <small class="form-text text-muted" style="margin-top: 5px; display: block;">
                                                <i class="fas fa-info-circle"></i> اتركه فارغاً للاحتفاظ بالصورة الحالية
                                            </small>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    <i class="fas fa-times"></i> إلغاء
                                </button>
                                <button type="button" class="btn btn-primary" onclick="submitEditMember(${member.id})">
                                    <i class="fas fa-save"></i> حفظ التعديلات
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            const existingModal = document.getElementById('editMemberModal');
            if (existingModal) {
                existingModal.remove();
            }

            document.body.insertAdjacentHTML('beforeend', modalHTML);

            // Populate parent selects
            populateParentSelectsForEdit(member);

            const modal = new bootstrap.Modal(document.getElementById('editMemberModal'));
            modal.show();

            document.getElementById('editMemberModal').addEventListener('hidden.bs.modal', function() {
                this.remove();
            });
        }

        // Populate parent selects for add
        function populateParentSelects() {
            const fatherSelect = document.getElementById('father-select');
            const motherSelect = document.getElementById('mother-select');

            if (!fatherSelect || !motherSelect) return;

            fatherSelect.innerHTML = '<option value="">لا يوجد</option>';
            motherSelect.innerHTML = '<option value="">لا يوجد</option>';

            allMembers.forEach(member => {
                if (member.relation === 'father') {
                    fatherSelect.innerHTML += `<option value="${member.id}">${member.name}</option>`;
                }
                if (member.relation === 'mother') {
                    motherSelect.innerHTML += `<option value="${member.id}">${member.name}</option>`;
                }
            });
        }

        // Populate parent selects for edit
        function populateParentSelectsForEdit(currentMember) {
            const fatherSelect = document.getElementById('edit-father-select');
            const motherSelect = document.getElementById('edit-mother-select');

            if (!fatherSelect || !motherSelect) return;

            fatherSelect.innerHTML = '<option value="">لا يوجد</option>';
            motherSelect.innerHTML = '<option value="">لا يوجد</option>';

            const currentFatherId = currentMember.father_relation?.father_id || null;
            const currentMotherId = currentMember.mother_relation?.mother_id || null;

            allMembers.forEach(member => {
                if (member.id === currentMember.id) return; // Skip self

                if (member.relation === 'father') {
                    fatherSelect.innerHTML += `<option value="${member.id}" ${member.id == currentFatherId ? 'selected' : ''}>${member.name}</option>`;
                }
                if (member.relation === 'mother') {
                    motherSelect.innerHTML += `<option value="${member.id}" ${member.id == currentMotherId ? 'selected' : ''}>${member.name}</option>`;
                }
            });
        }

        // Submit add member
        async function submitAddMember() {
            const form = document.getElementById('add-member-form');
            const formData = new FormData(form);
            const token = localStorage.getItem('authToken');

            try {
                const response = await fetch('/api/tree_creator/family-members-data', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    },
                    body: formData,
                    credentials: 'include',
                });

                const result = await response.json();

                if (response.ok) {
                    bootstrap.Modal.getInstance(document.getElementById('addMemberModal')).hide();
                    await showCustomAlert('تم إضافة الفرد بنجاح', 'success', 'نجح الإضافة');
                    await loadFamilyMembers();
                    await loadTreeDataFromAPI(); // Reload tree
                } else {
                    await showCustomAlert(result.message || 'حدث خطأ في إضافة الفرد', 'error', 'خطأ');
                }
            } catch (error) {
                console.error('Error adding member:', error);
                await showCustomAlert('حدث خطأ في إضافة الفرد', 'error', 'خطأ');
            }
        }

        // Submit edit member
        async function submitEditMember(memberId) {
            const form = document.getElementById('edit-member-form');
            const formData = new FormData(form);
            const token = localStorage.getItem('authToken');

            try {
                const response = await fetch(`/api/tree_creator/family-members-data/${memberId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    },
                    body: formData,
                    credentials: 'include',
                });

                const result = await response.json();

                if (response.ok) {
                    bootstrap.Modal.getInstance(document.getElementById('editMemberModal')).hide();
                    await showCustomAlert('تم تحديث بيانات الفرد بنجاح', 'success', 'نجح التحديث');
                    await loadFamilyMembers();
                    await loadTreeDataFromAPI(); // Reload tree
                } else {
                    await showCustomAlert(result.message || 'حدث خطأ في تحديث البيانات', 'error', 'خطأ');
                }
            } catch (error) {
                console.error('Error updating member:', error);
                await showCustomAlert('حدث خطأ في تحديث البيانات', 'error', 'خطأ');
            }
        }

        // Custom Confirmation Modal
        function showCustomConfirm(message, memberName = '', onConfirm, onCancel = null) {
            return new Promise((resolve) => {
                // Remove existing modals
                const existing = document.querySelector('.custom-confirm-overlay');
                if (existing) existing.remove();

                const overlay = document.createElement('div');
                overlay.className = 'custom-confirm-overlay';
                overlay.innerHTML = `
                    <div class="custom-confirm-modal">
                        <div class="custom-confirm-header">
                            <div class="custom-confirm-icon">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <h3 class="custom-confirm-title">تأكيد الحذف</h3>
                        </div>
                        <div class="custom-confirm-body">
                            <p class="custom-confirm-message">${message}</p>
                            ${memberName ? `<p class="custom-confirm-member-name">${memberName}</p>` : ''}
                        </div>
                        <div class="custom-confirm-footer">
                            <button class="custom-confirm-btn custom-confirm-btn-cancel" data-action="cancel">
                                <i class="fas fa-times"></i> إلغاء
                            </button>
                            <button class="custom-confirm-btn custom-confirm-btn-delete" data-action="confirm">
                                <i class="fas fa-trash"></i> حذف
                            </button>
                        </div>
                    </div>
                `;

                // Handle button clicks
                overlay.querySelector('[data-action="confirm"]').addEventListener('click', () => {
                    overlay.style.animation = 'fadeOut 0.3s ease';
                    setTimeout(() => {
                        overlay.remove();
                        if (onConfirm) onConfirm();
                        resolve(true);
                    }, 300);
                });

                overlay.querySelector('[data-action="cancel"]').addEventListener('click', () => {
                    overlay.style.animation = 'fadeOut 0.3s ease';
                    setTimeout(() => {
                        overlay.remove();
                        if (onCancel) onCancel();
                        resolve(false);
                    }, 300);
                });

                // Close on overlay click
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) {
                        overlay.style.animation = 'fadeOut 0.3s ease';
                        setTimeout(() => {
                            overlay.remove();
                            if (onCancel) onCancel();
                            resolve(false);
                        }, 300);
                    }
                });

                // Keyboard support (ESC to cancel, Enter to confirm)
                const handleKeyDown = (e) => {
                    if (e.key === 'Escape') {
                        overlay.querySelector('[data-action="cancel"]').click();
                        document.removeEventListener('keydown', handleKeyDown);
                    } else if (e.key === 'Enter' && e.ctrlKey) {
                        overlay.querySelector('[data-action="confirm"]').click();
                        document.removeEventListener('keydown', handleKeyDown);
                    }
                };
                document.addEventListener('keydown', handleKeyDown);

                // Add fadeOut animation
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes fadeOut {
                        from { opacity: 1; }
                        to { opacity: 0; }
                    }
                `;
                if (!document.getElementById('fadeOutAnimation')) {
                    style.id = 'fadeOutAnimation';
                    document.head.appendChild(style);
                }

                document.body.appendChild(overlay);
            });
        }

        // Custom Alert Modal
        function showCustomAlert(message, type = 'info', title = 'تنبيه') {
            return new Promise((resolve) => {
                // Remove existing modals
                const existing = document.querySelector('.custom-alert-overlay');
                if (existing) existing.remove();

                const icons = {
                    'success': 'fa-check-circle',
                    'error': 'fa-exclamation-circle',
                    'info': 'fa-info-circle',
                    'warning': 'fa-exclamation-triangle'
                };

                const overlay = document.createElement('div');
                overlay.className = 'custom-alert-overlay';
                overlay.innerHTML = `
                    <div class="custom-alert-modal custom-alert-${type}">
                        <div class="custom-alert-header">
                            <div class="custom-alert-icon">
                                <i class="fas ${icons[type] || icons.info}"></i>
                            </div>
                            <h3 class="custom-alert-title">${title}</h3>
                        </div>
                        <div class="custom-alert-body">
                            <p class="custom-alert-message">${message}</p>
                        </div>
                        <div class="custom-alert-footer">
                            <button class="custom-alert-btn" data-action="ok">
                                <i class="fas fa-check"></i> موافق
                            </button>
                        </div>
                    </div>
                `;

                // Handle button click
                overlay.querySelector('[data-action="ok"]').addEventListener('click', () => {
                    overlay.style.animation = 'fadeOut 0.3s ease';
                    setTimeout(() => {
                        overlay.remove();
                        resolve();
                    }, 300);
                });

                // Close on overlay click
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) {
                        overlay.style.animation = 'fadeOut 0.3s ease';
                        setTimeout(() => {
                            overlay.remove();
                            resolve();
                        }, 300);
                    }
                });

                // Keyboard support (ESC or Enter to close)
                const handleKeyDown = (e) => {
                    if (e.key === 'Escape' || e.key === 'Enter') {
                        overlay.querySelector('[data-action="ok"]').click();
                        document.removeEventListener('keydown', handleKeyDown);
                    }
                };
                document.addEventListener('keydown', handleKeyDown);

                document.body.appendChild(overlay);
            });
        }

        // Delete member
        async function deleteMember(memberId) {
            if (!currentUser || currentUser.role !== 'tree_creator') {
                await showCustomAlert('ليس لديك صلاحية لحذف الأفراد', 'error', 'خطأ في الصلاحيات');
                return;
            }

            // Find member name for display
            const member = allMembers.find(m => m.id === memberId);
            const memberName = member ? member.name : '';

            // Show custom confirmation
            const confirmed = await showCustomConfirm(
                'هل أنت متأكد من حذف هذا الفرد؟',
                memberName,
                async () => {
                    // User confirmed deletion
                    const token = localStorage.getItem('authToken');

                    try {
                        const response = await fetch(`/api/tree_creator/family-members-data/${memberId}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                            },
                            credentials: 'include',
                        });

                        const result = await response.json();

                        if (response.ok) {
                            await showCustomAlert('تم حذف الفرد بنجاح', 'success', 'نجح الحذف');
                            await loadFamilyMembers();
                            await loadTreeDataFromAPI(); // Reload tree
                        } else {
                            await showCustomAlert(result.message || 'حدث خطأ في حذف الفرد', 'error', 'خطأ');
                        }
                    } catch (error) {
                        console.error('Error deleting member:', error);
                        await showCustomAlert('حدث خطأ في حذف الفرد', 'error', 'خطأ');
                    }
                }
            );
        }

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            checkUserRole();
            loadFamilyMembers();
        });
    </script>
</body>

</html>
