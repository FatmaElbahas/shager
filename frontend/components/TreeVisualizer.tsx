import React, { useMemo, useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { FamilyMember } from '../types';

interface TreeVisualizerProps {
  data: FamilyMember;
  width: number;
  height: number;
  selectedId: string | null;
  onSelect: (member: FamilyMember) => void;
  screenSize: 'mobile' | 'tablet' | 'desktop';
}

// Helper for Cubic Bezier interpolation
function getCubicBezierPoint(t: number, p0: {x: number, y: number}, p1: {x: number, y: number}, p2: {x: number, y: number}, p3: {x: number, y: number}) {
  const k = 1 - t;
  const x = k*k*k*p0.x + 3*k*k*t*p1.x + 3*k*t*t*p2.x + t*t*t*p3.x;
  const y = k*k*k*p0.y + 3*k*k*t*p1.y + 3*k*t*t*p2.y + t*t*t*p3.y;
  return { x, y };
}

export const TreeVisualizer: React.FC<TreeVisualizerProps> = ({ 
  data, 
  width, 
  height, 
  selectedId, 
  onSelect,
  screenSize
}) => {
  // Zoom and pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [lastPinchDistance, setLastPinchDistance] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Function to filter out specific branches
  const filterBranches = (node: FamilyMember): FamilyMember | null => {
    // Remove branches of Abbas, Omar, and Saleem
    if (node.name === 'عباس' || node.name === 'عمر' || node.name === 'سليم') {
      return null; // Remove this node and all its children
    }
    
    // Process children recursively
    if (node.children && node.children.length > 0) {
      const filteredChildren = node.children
        .map(filterBranches)
        .filter(child => child !== null) as FamilyMember[];
      
      return {
        ...node,
        children: filteredChildren
      };
    }
    
    return node;
  };
  
  // Filter the data to remove unwanted branches
  const filteredData = useMemo(() => {
    return filterBranches(data) || {
      id: 'root',
      name: 'محمد',
      age: 'الجد',
      children: []
    };
  }, [data]);

  // Responsive settings based on screen size
  const responsiveSettings = useMemo(() => {
    if (screenSize === 'mobile') {
      return {
        marginX: 100,
        marginY: 200,
        rootScale: 1.1,
        fruitRadius: 30,
        leafScale: 1.5,
        separation: 0.5,
        trunkWidth: width * 0.4,
        treeHeight: height * 0.6,
        rootTextSize: 'text-lg',
        fruitTextSize: 'text-sm',
        leafTextSize: 'text-sm'
      };
    } else if (screenSize === 'tablet') {
      return {
        marginX: 150,
        marginY: 250,
        rootScale: 1.3,
        fruitRadius: 34,
        leafScale: 1.8,
        separation: 0.7,
        trunkWidth: width * 0.5,
        treeHeight: height * 0.7,
        rootTextSize: 'text-xl',
        fruitTextSize: 'text-base',
        leafTextSize: 'text-base'
      };
    } else {
      // Desktop - optimized for clear spacing
      return {
        marginX: 200,
        marginY: 300,
        rootScale: 1.5,
        fruitRadius: 38,
        leafScale: 2.1,
        separation: 1.5,
        trunkWidth: width * 0.6,
        treeHeight: height * 0.8,
        rootTextSize: 'text-2xl',
        fruitTextSize: 'text-lg',
        leafTextSize: 'text-lg'
      };
    }
  }, [screenSize, width, height]);

  // Calculate tree layout
  const { nodes, links, treePath } = useMemo(() => {
    const root = d3.hierarchy(filteredData);
    
    // Count total members to determine size factor
    const totalMembers = root.descendants().length;
    
    // Determine size factor based on number of members (compacted for better spacing)
    const sizeFactor = totalMembers < 20 ? 1.8 : totalMembers < 50 ? 1.5 : 1.2; // Reduced from 2.2/1.8/1.5
    
    // Use responsive settings
    const { marginX, marginY, separation } = responsiveSettings;
    
    // Reduce tree dimensions for more compact layout
    const treeW = Math.max(width * 1.5, screenSize === 'mobile' ? 800 : 2000); // Reduced from 1.8/1000/2500
    const treeH = Math.max(height * 1.2, screenSize === 'mobile' ? 1000 : 1500); // Reduced from 1.5/1200/1800

    const treeLayout = d3.tree<FamilyMember>()
      .size([
        (treeW - marginX) * sizeFactor,
        (treeH - marginY) * sizeFactor
      ])
      .separation((a, b) => {
        // Calculate number of children for common parent
        const parent = a.parent === b.parent ? a.parent : null;
        const siblingsCount = parent ? (parent.children?.length || 0) : 0;
        
        // Density factor based on sibling count (enhanced for better spacing)
        let densityFactor = 1.0;
        if (siblingsCount > 10) {
          densityFactor = 0.85;  // Many siblings = bring closer but still maintain spacing
        } else if (siblingsCount > 6) {
          densityFactor = 0.9;   // Several siblings = slight closer
        } else if (siblingsCount > 3) {
          densityFactor = 0.95;  // Few siblings = minimal adjustment
        }
        
        // Enhanced separation for different node types
        if (a.depth === 0 || b.depth === 0) {
          // Root node spacing
          return 1.8; // Reduced from 2.0
        } else if (a.depth === 1 || b.depth === 1) {
          // First generation branches (fruits) - increased spacing
          const baseSeparation = a.parent === b.parent ? 1.8 : 3.0; // Reduced from 2.0/3.5
          const screenFactor = screenSize === 'mobile' ? 1.1 : screenSize === 'tablet' ? 1.3 : 1.5; // Reduced from 1.2/1.4/1.6
          return (baseSeparation * screenFactor * densityFactor);
        } else if ((!a.children || a.children.length === 0) && (!b.children || b.children.length === 0)) {
          // Leaf nodes - maximum spacing to prevent overlap
          const baseSeparation = a.parent === b.parent ? 1.5 : 2.5; // Reduced from 1.8/2.8
          const screenFactor = screenSize === 'mobile' ? 1.0 : screenSize === 'tablet' ? 1.2 : 1.4; // Reduced from 1.1/1.3/1.5
          return (baseSeparation * screenFactor * densityFactor);
        } else {
          // Intermediate nodes
          const baseSeparation = a.parent === b.parent ? 1.3 : 2.0; // Reduced from 1.5/2.2
          const screenFactor = screenSize === 'mobile' ? 0.9 : screenSize === 'tablet' ? 1.1 : 1.3; // Reduced from 1.0/1.2/1.4
          return (baseSeparation * screenFactor * densityFactor);
        }
      });

    treeLayout(root);

    // RTL Adjustment and Bottom-Up Inversion
    const descendants = root.descendants();
    
    // First, find current bounds
    let minX = Infinity, maxX = -Infinity;
    descendants.forEach(d => {
      if (d.x < minX) minX = d.x;
      if (d.x > maxX) maxX = d.x;
    });
    
    // Fixed width flip (RTL)
    descendants.forEach(d => {
       d.x = (treeW - marginX) - d.x; 
    });

    // Re-center after flip
    let minX2 = Infinity, maxX2 = -Infinity;
    descendants.forEach(d => {
        if (d.x < minX2) minX2 = d.x;
        if (d.x > maxX2) maxX2 = d.x;
    });
    const currentCenter = (minX2 + maxX2) / 2;
    const screenCenter = treeW / 2;
    const shiftX = screenCenter - currentCenter;

    descendants.forEach(d => {
        d.x += shiftX;
        d.y = -d.y; // Invert Y (Bottom-Up)
    });
    
    // Enhanced manual adjustment for first generation branches (fruits)
    const firstGenNodes = descendants.filter(d => d.depth === 1);
    
    if (firstGenNodes.length > 1) {
      const positions = firstGenNodes.map(n => n.x);
      const minX = Math.min(...positions);
      const maxX = Math.max(...positions);
      const center = (minX + maxX) / 2;
      const currentSpan = maxX - minX;
      
      // 45% of the width for better distribution (reduced from 50%)
      const targetSpan = (treeW - marginX) * 0.45;
      const spreadFactor = currentSpan > 0 ? targetSpan / currentSpan : 1.5; // Reduced from 1.6
      
      // Maximum spread based on screen size (reduced for more compact spacing)
      const maxSpread = screenSize === 'mobile' ? 1.6 : screenSize === 'tablet' ? 1.8 : 2.0; // Reduced from 1.8/2.0/2.2
      
      firstGenNodes.forEach(node => {
        const offset = node.x - center;
        node.x = center + (offset * Math.min(spreadFactor, maxSpread));
      });
    }
    
    // Enhanced spacing for leaf nodes to prevent overlap
    const leafNodes = descendants.filter(d => !d.children || d.children.length === 0);
    if (leafNodes.length > 1) {
      // Sort by y position (depth) then by x position
      leafNodes.sort((a, b) => {
        if (Math.abs(a.y - b.y) < 30) { // If roughly same row
          return a.x - b.x;
        }
        return a.y - b.y;
      });
      
      // Adjust x positions to prevent horizontal overlap
      for (let i = 1; i < leafNodes.length; i++) {
        const prevNode = leafNodes[i - 1];
        const currentNode = leafNodes[i];
        
        // If nodes are on the same level and too close horizontally
        if (Math.abs(currentNode.y - prevNode.y) < 30) {
          // Reduced minimum distances for more compact layout
          const minDistance = screenSize === 'mobile' ? 100 : screenSize === 'tablet' ? 120 : 150; // Reduced from 120/150/180
          const currentDistance = currentNode.x - prevNode.x;
          
          if (currentDistance < minDistance) {
            const adjustment = (minDistance - currentDistance) / 2;
            prevNode.x -= adjustment;
            currentNode.x += adjustment;
          }
        }
      }
    }

    // Generate a background shape (Convex Hull-ish) for the foliage
    const foliageNodes = descendants.filter(d => d.depth > 0);
    const foliagePoints: [number, number][] = foliageNodes.map(d => [d.x, d.y]);
    
    if (foliagePoints.length > 0) {
        // Reduced padding for more compact layout
        const topY = d3.min(foliagePoints, p => p[1])! - (screenSize === 'mobile' ? 60 : 120); // Reduced from 80/150
        const leftX = d3.min(foliagePoints, p => p[0])! - (screenSize === 'mobile' ? 60 : 120); // Reduced from 80/150
        const rightX = d3.max(foliagePoints, p => p[0])! + (screenSize === 'mobile' ? 60 : 120); // Reduced from 80/150
        
        foliagePoints.push([leftX, 0]);
        foliagePoints.push([rightX, 0]);
        foliagePoints.push([(leftX + rightX)/2, topY]);
    }

    let hullPath = "";
    try {
        if (foliagePoints.length > 2) {
            const hull = d3.polygonHull(foliagePoints);
            if (hull) {
                const lineGen = d3.line().curve(d3.curveBasisClosed);
                hullPath = lineGen(hull) || "";
            }
        }
    } catch (e) {
        console.warn("Hull generation failed", e);
    }

    return {
      nodes: descendants,
      links: root.links(),
      treePath: hullPath
    };
  }, [filteredData, width, height, responsiveSettings, screenSize]);

  // SVG Shapes
  const leafPath = "M0,0 Q25,-30 0,-80 Q-25,-30 0,0";
  const rootPath = "M-70,0 C-70,-40 -30,-80 0,-90 C30,-80 70,-40 70,0 C70,50 30,70 0,80 C-30,70 -70,50 -70,0";

  // Zoom functions
  const zoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.3));
  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Auto-fit on load
  useEffect(() => {
    // Auto-fit to show entire tree
    if (svgRef.current) {
      // Calculate bounding box of the tree
      const bbox = svgRef.current.getBBox();
      if (bbox.width > 0 && bbox.height > 0) {
        const scaleX = width / bbox.width;
        const scaleY = height / bbox.height;
        const autoZoom = Math.min(scaleX, scaleY, 1) * 0.9; // 90% of the space
        setZoom(Math.max(0.3, Math.min(3, autoZoom)));
        
        // Center the content
        setPan({
          x: (width - bbox.width * autoZoom) / 2 - bbox.x * autoZoom,
          y: (height - bbox.height * autoZoom) / 2 - bbox.y * autoZoom
        });
      }
    }
  }, [data, width, height]);

  // Dynamic font size based on zoom
  const getFontSize = (baseSize: string) => {
    if (zoom < 0.5) return 'text-lg';
    if (zoom < 0.8) return baseSize;
    return baseSize;
  };

  // Dynamic stroke width based on zoom
  const getStrokeWidth = (baseWidth: number) => {
    return baseWidth / zoom;
  };

  // Dynamic hit area based on zoom
  const getHitAreaRadius = (baseRadius: number) => {
    return Math.max(baseRadius, 30 / zoom);
  };

  // Wheel event for zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.3, Math.min(3, prev + delta)));
  };

  // Mouse events for pan
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Touch events for pinch zoom and pan
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch to zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      setLastPinchDistance(distance);
    } else if (e.touches.length === 1) {
      // Single touch for panning
      setIsPanning(true);
      setStartPan({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch to zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const delta = (distance - lastPinchDistance) * 0.01;
      setZoom(prev => Math.max(0.3, Math.min(3, prev + delta)));
      setLastPinchDistance(distance);
    } else if (e.touches.length === 1 && isPanning) {
      // Single touch panning
      setPan({
        x: e.touches[0].clientX - startPan.x,
        y: e.touches[0].clientY - startPan.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.key === '+' || e.key === '=') zoomIn();
      if (e.key === '-' || e.key === '_') zoomOut();
      if (e.key === '0') resetZoom();
      
      // Arrow keys for pan
      if (e.key === 'ArrowUp') setPan(p => ({...p, y: p.y + 50}));
      if (e.key === 'ArrowDown') setPan(p => ({...p, y: p.y - 50}));
      if (e.key === 'ArrowLeft') setPan(p => ({...p, x: p.x + 50}));
      if (e.key === 'ArrowRight') setPan(p => ({...p, x: p.x - 50}));
    };
    
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, []);

  return (
    <>
      {/* Zoom Controls */}
      <div className="fixed top-4 left-4 z-50 flex flex-col gap-2 bg-white/90 p-2 rounded-lg shadow-lg">
        <button 
          onClick={zoomIn}
          className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors text-sm"
          disabled={zoom >= 3}
        >
          🔍 + تكبير
        </button>
        
        <button 
          onClick={zoomOut}
          className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors text-sm"
          disabled={zoom <= 0.3}
        >
          🔍 - تصغير
        </button>
        
        <button 
          onClick={resetZoom}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
        >
          🔄 إعادة ضبط
        </button>
        
        <div className="text-center text-sm font-semibold text-gray-700 mt-2">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Main visualization container with zoom and pan */}
      <div 
        className="w-full h-full relative"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          cursor: isPanning ? 'grabbing' : 'grab',
          touchAction: 'none'
        }}
      >
        <svg 
          ref={svgRef}
          width={width} 
          height={height}
          className="overflow-visible select-none font-cairo"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center',
            transition: isPanning ? 'none' : 'transform 0.3s ease-out'
          }}
        >
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.2"/>
            </filter>
            <filter id="deepShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="4" dy="6" stdDeviation="4" floodColor="#000000" floodOpacity="0.3"/>
            </filter>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="15" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            {/* Rough Bark Filter for Branches */}
            <filter id="bark">
                <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            {/* Softer bark for thin branches */}
            <filter id="bark-soft">
                <feTurbulence type="fractalNoise" baseFrequency="0.1" numOctaves="2" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="1" xChannelSelector="R" yChannelSelector="G" />
            </filter>

            {/* Leaf Gradient */}
            <linearGradient id="leafGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>

            <linearGradient id="leafGradientHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
               <stop offset="0%" stopColor="#86efac" /> 
               <stop offset="100%" stopColor="#16a34a" /> 
            </linearGradient>

            {/* Fruit/Orange Gradient */}
            <linearGradient id="fruitGradient" x1="30%" y1="30%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fcd34d" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
            
            <linearGradient id="fruitGradientDark" x1="30%" y1="30%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" /> 
              <stop offset="100%" stopColor="#d97706" /> 
            </linearGradient>

            {/* Trunk Gradient */}
            <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5d4037" />
              <stop offset="30%" stopColor="#8d6e63" />
              <stop offset="70%" stopColor="#8d6e63" />
              <stop offset="100%" stopColor="#4e342e" />
            </linearGradient>
          </defs>

          {/* Main Container - Shifted to bottom center with adaptive positioning */}
          <g transform={`translate(0, ${height - (height < 800 ? 400 : 480)})`}>
            
            {/* 0. Background Crown (Foliage) */}
            {treePath && (
               <path 
                 d={treePath} 
                 fill="#ecfccb" 
                 stroke="#bef264" 
                 strokeWidth="2"
                 opacity="0.6"
                 filter="url(#glow)"
                 transform={`scale(${width < 1400 ? 1.05 : 1.1})`}
                 style={{ transformBox: 'fill-box', transformOrigin: 'center bottom' }}
               />
            )}

            {/* 1. Trunk (Root Extension) */}
            {nodes.length > 0 && (
              <g transform={`translate(${nodes[0].x}, 0)`}>
                 {/* Main thick trunk base */}
                 <path 
                    d="M-50,20 
                       Q-60,180 -130,420 
                       L130,420 
                       Q60,180 50,20 
                       Z" 
                    fill="url(#trunkGradient)" 
                    stroke="#3e2723"
                    strokeWidth="2"
                    filter="url(#bark)" 
                 />
                 
                 {/* Roots */}
                 <path d="M-130,420 Q-160,460 -200,450" fill="none" stroke="#5d4037" strokeWidth="10" strokeLinecap="round" filter="url(#bark)" />
                 <path d="M-60,420 Q-80,460 -110,480" fill="none" stroke="#5d4037" strokeWidth="7" strokeLinecap="round" filter="url(#bark)" />
                 <path d="M130,420 Q160,460 200,450" fill="none" stroke="#5d4037" strokeWidth="10" strokeLinecap="round" filter="url(#bark)" />
                 <path d="M60,420 Q80,460 110,480" fill="none" stroke="#5d4037" strokeWidth="7" strokeLinecap="round" filter="url(#bark)" />
                 
                 {/* Central tap roots */}
                 <path d="M-20,420 Q-30,470 0,500" fill="none" stroke="#5d4037" strokeWidth="6" strokeLinecap="round" />
                 
                 {/* Texture lines / Bark */}
                 <path d="M-15,60 Q-35,180 -40,300" stroke="#3e2723" strokeWidth="2" fill="none" opacity="0.4"/>
                 <path d="M15,60 Q35,180 40,300" stroke="#3e2723" strokeWidth="2" fill="none" opacity="0.4"/>
                 <path d="M0,80 Q5,220 0,350" stroke="#3e2723" strokeWidth="2" fill="none" opacity="0.3"/>
              </g>
            )}

            {/* 2. Links (Branches) */}
            {links.map((link, i) => {
              const sourceX = link.source.x;
              const sourceY = link.source.y;
              const targetX = link.target.x;
              const targetY = link.target.y;

              // Enhanced control points for better branch routing and reduced intersections
              // Calculate vertical distance and adjust curve tension accordingly
              const verticalDistance = Math.abs(targetY - sourceY);
              // Shorten branches by reducing curve tension (decreased from 0.8/0.4 to 0.6/0.3)
              const curveTension = Math.min(0.6, Math.max(0.3, verticalDistance / 300));
              
              // Adjust control points based on node types to reduce intersections and shorten branches
              let cp1, cp2;
              
              if (link.source.depth === 0) {
                // From root - more dramatic curves but shorter
                cp1 = { x: sourceX, y: sourceY - (verticalDistance * 0.6) }; // Reduced from 0.8
                cp2 = { x: targetX, y: targetY + 45 }; // Reduced from 60
              } else if (link.target.depth === 1) {
                // To first generation - moderate curves but shorter
                cp1 = { x: sourceX, y: sourceY - (verticalDistance * 0.45) }; // Reduced from 0.6
                cp2 = { x: targetX, y: targetY + 35 }; // Reduced from 50
              } else {
                // Other connections - standard curves with adaptive tension but shorter
                cp1 = { x: sourceX, y: sourceY - (verticalDistance * curveTension) };
                cp2 = { x: targetX, y: targetY + 30 }; // Reduced from 40
              }

              // Width calculation for tapering
              // Start width is based on parent depth, end width on child depth
              // This ensures continuity and tapering
              const parentDepth = link.source.depth;
              const childDepth = link.target.depth;
              
              // Formula: Max Width * Decay^Depth (adjusted for better visibility)
              const startWidth = Math.max(50 * Math.pow(0.65, parentDepth), 5); // Reduced from 60
              const endWidth = Math.max(50 * Math.pow(0.65, childDepth), 3); // Reduced from 60

              const sw = startWidth / 2;
              const ew = endWidth / 2;

              // Create a closed polygon path for the tapered branch
              // By offsetting the control points horizontally (approximation for vertical branches)
              const taperedPathD = `
                M ${sourceX - sw},${sourceY}
                C ${cp1.x - sw},${cp1.y} ${cp2.x - ew},${cp2.y} ${targetX - ew},${targetY}
                L ${targetX + ew},${targetY}
                C ${cp2.x + ew},${cp2.y} ${cp1.x + sw},${cp1.y} ${sourceX + sw},${sourceY}
                Z
              `;

              const maxDepth = 5;
              const depth = link.target.depth;
              
              // Generate pseudo-random twigs along the branch
              const seed = (sourceX + targetX + i) * 1.1;
              const hasTwig = (seed % 1) > 0.3; // 70% chance of twigs
              let twigs: React.ReactNode[] = [];
              
              if (hasTwig) {
                const t = 0.4 + (seed % 0.3); // Position along curve 0.4-0.7
                const pos = getCubicBezierPoint(t, 
                  {x: sourceX, y: sourceY}, 
                  cp1, 
                  cp2, 
                  {x: targetX, y: targetY}
                );
                
                // Twig direction - alternate based on index
                const dir = i % 2 === 0 ? 1 : -1;
                // Shorten twigs proportionally
                const twigLen = 10 + (seed % 10); // Reduced from 15 + (seed % 15)
                
                twigs.push(
                   <path 
                     key={`twig-${i}`}
                     d={`M${pos.x},${pos.y} Q${pos.x + (8*dir)},${pos.y - 4} ${pos.x + (twigLen*dir)},${pos.y - (twigLen*0.6)}`} // Reduced proportions
                     fill="none"
                     stroke="#5d4037"
                     strokeWidth={Math.max(endWidth * 0.5, 1.5)} // Reduced from 0.6 to 0.5
                     strokeLinecap="round"
                     filter="url(#bark-soft)"
                   />
                );
                
                // Add a small leaf at the end of the twig sometimes
                if ((seed % 1) > 0.6) {
                   twigs.push(
                     <path 
                       key={`leaf-${i}`}
                       d="M0,0 Q5,-5 0,-15 Q-5,-5 0,0"
                       transform={`translate(${pos.x + (twigLen*dir)}, ${pos.y - (twigLen*0.6)}) rotate(${dir * 45}) scale(0.6)`} // Reduced from 0.8
                       fill="#65a30d"
                     />
                   );
                }
              }

              return (
                <g key={`link-${i}`}>
                    {/* Branch Shadow/Outline for depth - slightly wider than the fill */}
                    <path
                        d={taperedPathD}
                        fill="none"
                        stroke="#3e2723"
                        strokeWidth="1"
                        opacity="0.3"
                    />
                    
                    {/* Main Branch Fill with Tapering */}
                    <path
                      d={taperedPathD}
                      fill="#5d4037"
                      className="transition-all duration-700 ease-in-out"
                      filter={depth > 3 ? "url(#bark-soft)" : "url(#bark)"}
                    />
                    
                    {/* Twigs */}
                    {twigs}
                </g>
              );
            })}

            {/* 3. Nodes */}
            {nodes.map((node) => {
              const isRoot = node.depth === 0;
              const isLeaf = !node.children || node.children.length === 0;
              const isSelected = node.data.id === selectedId;

              return (
                <g
                  key={node.data.id}
                  transform={`translate(${node.x},${node.y})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(node.data);
                  }}
                  className={`cursor-pointer transition-all duration-300 group ${isSelected ? 'scale-110 z-50' : 'hover:scale-105 z-10'}`}
                >
                  {isRoot ? (
                    // --- Root Node ---
                    <g>
                       <circle r="75" fill="#fcd34d" opacity="0.8" filter="url(#glow)" />
                      <path 
                        d={rootPath} 
                        fill="url(#leafGradient)" 
                        stroke="#14532d" 
                        strokeWidth="3"
                        filter="url(#deepShadow)"
                        transform={`scale(${responsiveSettings.rootScale})`}
                      />
                      <text
                        y="10"
                        textAnchor="middle"
                        className={`${getFontSize(responsiveSettings.rootTextSize)} font-black fill-white drop-shadow-lg pointer-events-none`}
                        style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.6)' }}
                      >
                        {node.data.name}
                      </text>
                      <text
                        y="35"
                        textAnchor="middle"
                        className="text-sm font-bold fill-green-100 opacity-90 pointer-events-none"
                      >
                        {node.data.age}
                      </text>
                    </g>
                  ) : isLeaf ? (
                    // --- Leaf Node ---
                    <g>
                      {/* Stem connecting to branch - shorter to create more compact layout */}
                      <path 
                        d={`M0,0 L0,${screenSize === 'mobile' ? 20 : screenSize === 'tablet' ? 25 : 30}`} 
                        stroke="#5d4037" 
                        strokeWidth={screenSize === 'mobile' ? 2 : 2.5}
                        filter="url(#bark-soft)"
                      />
                      
                      {/* Leaf - larger with better spacing */}
                      <path 
                        d={leafPath} 
                        fill="url(#leafGradientHighlight)" 
                        stroke="#15803d" 
                        strokeWidth={screenSize === 'mobile' ? 2 : 2.5}
                        filter="url(#shadow)"
                        transform={`scale(${screenSize === 'mobile' ? 1.6 : screenSize === 'tablet' ? 1.9 : 2.2})`}
                      />
                      
                      {/* Vein - adjusted for shorter stem */}
                      <path 
                        d={`M0,${screenSize === 'mobile' ? -40 : screenSize === 'tablet' ? -50 : -60} Q0,${screenSize === 'mobile' ? -25 : screenSize === 'tablet' ? -30 : -35} 0,-10`} 
                        stroke="#166534" 
                        strokeWidth="2" 
                        opacity="0.5" 
                      />
                      
                      <text
                        y={screenSize === 'mobile' ? -25 : screenSize === 'tablet' ? -30 : -35}
                        textAnchor="middle"
                        className={`${getFontSize(screenSize === 'mobile' ? 'text-base' : screenSize === 'tablet' ? 'text-lg' : 'text-xl')} font-bold fill-white drop-shadow-md pointer-events-none`}
                        style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}
                      >
                        {node.data.name}
                      </text>
                    </g>
                  ) : (
                    // --- Intermediate (Fruit) ---
                    <g>
                      {/* Leaf behind fruit */}
                      <path d="M-10,-25 Q-20,-45 0,-50 Q20,-45 10,-25" fill="#65a30d" stroke="#365314" strokeWidth="1" />
                      
                      {/* Stem - shortened for more compact layout */}
                      <path d="M0,0 L0,25" stroke="#5d4037" strokeWidth={getStrokeWidth(Math.max(40 * Math.pow(0.6, node.depth), 3))} filter="url(#bark)"/>
                      
                      <circle 
                        r={node.depth === 1 ? responsiveSettings.fruitRadius + 4 : responsiveSettings.fruitRadius} 
                        fill={node.depth === 1 ? "url(#fruitGradientDark)" : "url(#fruitGradient)"}
                        stroke="#b45309" 
                        strokeWidth="2"
                        filter="url(#shadow)"
                      />
                      {/* Shine */}
                      <path d="M-20,-10 Q-10,-25 10,-10" stroke="white" strokeWidth="2" opacity="0.4" fill="none" />
                      
                      <text
                        y="5"
                        textAnchor="middle"
                        className={`${getFontSize(node.depth === 1 ? (screenSize === 'mobile' ? 'text-base' : 'text-xl') : responsiveSettings.fruitTextSize)} font-bold fill-amber-950 pointer-events-none`}
                      >
                        {node.data.name}
                      </text>
                    </g>

                  )}
                  
                  {/* Selection Ring */}
                  {isSelected && (
                    <circle 
                        r={isRoot ? 85 : isLeaf ? 45 : 42} 
                        fill="none" 
                        stroke="#3b82f6" 
                        strokeWidth="4" 
                        strokeDasharray="8 4" 
                        className="animate-spin-slow" 
                        opacity="0.8"
                    />
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </>
  );
};