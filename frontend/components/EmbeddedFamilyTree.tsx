import React, { useState, useRef, useEffect } from 'react';
import { TreeVisualizer } from './TreeVisualizer';
import { ControlPanel } from './ControlPanel';

// Initial data matching the provided image structure
const initialData = {
  id: 'root',
  name: 'الجذرة',
  age: 'الجد',
  children: [
    // Right Side Branch (Low)
    {
      id: 'mosaad-branch',
      name: 'مسعود',
      age: '50',
      children: [
        { id: 'mohamed-sub', name: 'محمد', age: '25', children: [] }
      ]
    },
    // Left Side Branch (Low) - Kamal
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
    // Left Side Branch (Middle) - Mohsen
    {
      id: 'mohsen',
      name: 'محسن',
      age: '55',
      children: [
        { id: 'hamza', name: 'حمزة', age: '30', children: [] },
        { id: 'oweiss', name: 'اوييس', age: '28', children: [] },
        { id: 'tamim', name: 'تيم', age: '25', children: [] },
        { id: 'tamim2', name: 'تميم', age: '24', children: [] },
        { id: 'rajab', name: 'رجب', age: '22', children: [] },
        { id: 'jumaa', name: 'جمعة', age: '20', children: [] },
        { id: 'abdelnasser', name: 'عبدالناصر', age: '30', children: [] },
        { id: 'ibrahim', name: 'ابراهيم', age: '28', children: [] },
        { id: 'anwar', name: 'انوار', age: '26', children: [] }
      ]
    },
    // Right Side Branch (Middle) - Mahmoud
    {
      id: 'mahmoud',
      name: 'محمود',
      age: '52',
      children: [
        { id: 'othman', name: 'عثمان', age: '28', children: [] },
        { id: 'zaid', name: 'زيد', age: '26', children: [] },
        { id: 'majed', name: 'ماجد', age: '24', children: [] },
        { id: 'youssef', name: 'يوسف', age: '22', children: [] },
        { id: 'khaled', name: 'خالد', age: '20', children: [] }
      ]
    },
    // Right Side Branch (Top) - Ali
    {
      id: 'ali',
      name: 'علي',
      age: '48',
      children: [
        { id: 'ahmed', name: 'أحمد', age: '25', children: [] },
        { id: 'mohammed', name: 'محمد', age: '23', children: [] },
        { id: 'yassin', name: 'ياسين', age: '21', children: [] },
        { id: 'omar', name: 'عمر', age: '19', children: [] }
      ]
    },
    // Left Side Branch (Top) - Hassan
    {
      id: 'hassan-top',
      name: 'حسن',
      age: '58',
      children: [
        { id: 'taha', name: 'طاها', age: '32', children: [] },
        { id: 'sameer', name: 'سمير', age: '30', children: [] },
        { id: 'nasser', name: 'ناصر', age: '28', children: [] },
        { id: 'fawzi', name: 'فوزي', age: '26', children: [] },
        { id: 'adel', name: 'عادل', age: '24', children: [] }
      ]
    }
  ]
};

export const EmbeddedFamilyTree = () => {
  const [data, setData] = useState(initialData);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1); // Zoom scale state

  // Handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Handle adding a new member
  const handleAddMember = async (name, age) => {
    if (!selectedMember || !name || !age) return;

    // Create new member object
    const newMember = {
      id: `member-${Date.now()}`,
      name,
      age,
      children: []
    };

    // Update frontend state
    setData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      
      const updateNode = (node) => {
        if (node.id === selectedMember.id) {
          node.children.push(newMember);
          return true;
        }
        if (node.children) {
          for (let child of node.children) {
            if (updateNode(child)) return true;
          }
        }
        return false;
      };

      updateNode(newData);
      return newData;
    });

    setSelectedMember(newMember);
  };

  // Handle deleting a member
  const handleDeleteMember = async () => {
    if (!selectedMember) return;

    // Prevent deleting the main root to avoid empty tree state
    if (selectedMember.id === data.id) {
      alert("لا يمكن حذف الجذر (جسد الشجرة).");
      return;
    }

    if (window.confirm(`هل أنت متـأكد من حذف ${selectedMember.name} وجميع أبنائه؟`)) {
      // Update frontend state
      setData(prevData => {
        const newData = JSON.parse(JSON.stringify(prevData));
        
        const deleteNode = (node, idToDelete) => {
          if (!node.children) return node;
          
          node.children = node.children.filter(child => child.id !== idToDelete);
          node.children.forEach(child => deleteNode(child, idToDelete));
          
          return node;
        };

        const result = deleteNode(newData, selectedMember.id);
        return result;
      });
      setSelectedMember(null);
    }
  };

  // Handle node selection
  const handleSelectMember = (member) => {
    setSelectedMember(member);
  };

  // Handle scale change for zoom
  const handleScaleChange = (newScale) => {
    setScale(newScale);
  };

  // Zoom functions
  const handleZoomIn = () => {
    handleScaleChange(Math.min(scale * 1.2, 3)); // Max zoom 3x
  };

  const handleZoomOut = () => {
    handleScaleChange(Math.max(scale * 0.8, 0.5)); // Min zoom 0.5x
  };

  const handleResetZoom = () => {
    handleScaleChange(1);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#f7f5eb]">
        <div className="text-2xl font-bold text-emerald-800">جاري تحميل شجرة العائلة...</div>
      </div>
    );
  }

  return (
    <div className="family-tree-wrapper flex h-full w-full overflow-hidden bg-[#f7f5eb]">
      {/* Zoom Panel */}
      <div className="zoom-panel">
        <button className="zoom-btn zoom-in" onClick={handleZoomIn}>
          + تكبير 🔍
        </button>
        <button className="zoom-btn zoom-out" onClick={handleZoomOut}>
          - تصغير 🔍
        </button>
        <button className="zoom-btn zoom-reset" onClick={handleResetZoom}>
          إعادة ضبط 🔄
        </button>
        <div className="zoom-percent">
          {Math.round(scale * 100)}%
        </div>
      </div>
      
      {/* Visualizer Area - Takes remaining space */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden relative"
      >
        <TreeVisualizer
          data={data}
          width={dimensions.width}
          height={dimensions.height}
          selectedId={selectedMember?.id || null}
          onSelect={handleSelectMember}
          screenSize="desktop"
          scale={scale}
          onScaleChange={handleScaleChange}
        />
      </div>
    </div>
  );
};