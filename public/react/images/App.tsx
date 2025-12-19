import React, { useState, useRef, useEffect } from 'react';
import { TreeVisualizer } from './components/TreeVisualizer';
import { ControlPanel } from './components/ControlPanel';
import { FamilyMember } from './types';

// Data matching the provided image structure
const initialData: FamilyMember = {
  id: 'root',
  name: 'محمد', // The big green leaf at the bottom
  age: 'الجد',
  children: [
    // Right Side Branch (Low)
    {
      id: 'mosaad-branch',
      name: 'مسعد',
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
        { id: 'abdelaziz', name: 'عبدالعزيز', age: '15', children: [] },
      ]
    },
    // Left Side Branch (Middle) - Mohsen
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
        { id: 'morsi', name: 'مرسي', age: '24', children: [] },
      ]
    },
    // Center Left Branch - Yassin
    {
      id: 'yassin',
      name: 'ياسين',
      age: '52',
      children: [
        { id: 'sofian', name: 'سفيان', age: '26', children: [] },
        { id: 'hesham', name: 'هشام', age: '24', children: [] },
        { id: 'khalil-sub', name: 'خليل', age: '22', children: [] },
        { id: 'essam', name: 'عصام', age: '20', children: [] },
        { id: 'karim-sub', name: 'كريم', age: '18', children: [] },
      ]
    },
    // Center Branch - Amr (Amro)
    {
      id: 'amr',
      name: 'عمرو',
      age: '50',
      children: [
        { id: 'yahya', name: 'يحيي', age: '21', children: [] },
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
            { id: 'ibrahim-sub', name: 'ابراهيم', age: '9', children: [] },
          ] 
        },
      ]
    },
    // Right Branch - Khalil
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
             { id: 'ali', name: 'علي', age: '2', children: [] },
          ] 
        },
        { 
          id: 'omar-sub', 
          name: 'عمر', 
          age: '22', 
          children: [
            { id: 'seif', name: 'سيف', age: '5', children: [] },
            { id: 'mustafa', name: 'مصطفى', age: '4', children: [] },
            { id: 'karim-sub2', name: 'كريم', age: '2', children: [] },
          ] 
        },
      ]
    },
  ]
};

const App: React.FC = () => {
  const [data, setData] = useState<FamilyMember>(initialData);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(true);
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Screen size breakpoints
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScreenSize('mobile');
      } else if (width >= 640 && width <= 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Load family data from backend on component mount
  useEffect(() => {
    const loadFamilyData = async () => {
      try {
        const response = await fetch('http://localhost:8080/php-backend/api/get_members.php');
        if (response.ok) {
          const result = await response.json();
          if (result.members && result.members.length > 0) {
            // Convert flat array to tree structure
            const treeData = convertFlatToTree(result.members);
            setData(treeData);
          }
        }
      } catch (error) {
        console.error('Failed to load family data:', error);
        // Fallback to initial data if backend fails
        setData(initialData);
      } finally {
        setLoading(false);
      }
    };

    loadFamilyData();
  }, []);

  // Convert flat array from backend to tree structure
  const convertFlatToTree = (members: any[]): FamilyMember => {
    // Create a map of all members by ID
    const memberMap: Record<string, any> = {};
    members.forEach(member => {
      memberMap[member.id] = { ...member, children: [] };
    });

    // Build the tree structure
    let root: FamilyMember | null = null;
    members.forEach(member => {
      if (member.parent_id === null) {
        root = memberMap[member.id];
      } else if (memberMap[member.parent_id]) {
        memberMap[member.parent_id].children.push(memberMap[member.id]);
      }
    });

    return root || initialData;
  };

  // Convert tree structure to flat array for backend
  const convertTreeToFlat = (node: FamilyMember, parentId: string | null = null): any[] => {
    const flatMembers = [{
      id: node.id,
      firstName: node.name,
      lastName: '', // Not used in current structure
      birthDate: new Date().toISOString().split('T')[0], // Placeholder
      relationship: parentId === null ? 'Grandfather' : 'Child',
      parentId: parentId
    }];

    if (node.children) {
      node.children.forEach(child => {
        flatMembers.push(...convertTreeToFlat(child, node.id));
      });
    }

    return flatMembers;
  };

  // Responsive dimensions
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        // Calculate available space for the tree based on screen size
        let sidebarWidth = 0;
        if (screenSize === 'tablet') {
          sidebarWidth = 256; // w-64 = 16rem = 256px
        } else if (screenSize === 'desktop') {
          sidebarWidth = 320; // md:w-80 = 20rem = 320px
        }
        
        const availableWidth = window.innerWidth - sidebarWidth;
        const availableHeight = window.innerHeight;
        
        setDimensions({
          width: availableWidth,
          height: availableHeight
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial calculation
    
    return () => window.removeEventListener('resize', handleResize);
  }, [screenSize]);

  // Recursive function to add a child to the correct parent
  const addChildToNode = (node: FamilyMember, parentId: string, newChild: FamilyMember): FamilyMember => {
    if (node.id === parentId) {
      return {
        ...node,
        children: [...(node.children || []), newChild]
      };
    }
    
    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: node.children.map(child => addChildToNode(child, parentId, newChild))
      };
    }

    return node;
  };

  // Recursive function to delete a node
  const deleteNode = (node: FamilyMember, targetId: string): FamilyMember | null => {
    // If we found the node to delete, return null (so it gets filtered out by parent)
    if (node.id === targetId) {
      return null;
    }

    // Process children if they exist
    if (node.children && node.children.length > 0) {
      const newChildren = node.children
        .map(child => deleteNode(child, targetId))
        .filter((child): child is FamilyMember => child !== null);
      
      // Even if children didn't change content-wise, we return a new object reference 
      // to ensure React state updates propagate correctly.
      return {
        ...node,
        children: newChildren
      };
    }

    return node;
  };

  // Add member to both frontend and backend
  const handleAddMember = async (name: string, age: string) => {
    if (!selectedMember) return;

    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name,
      age,
      children: []
    };

    // Update frontend state
    setData(prevData => addChildToNode(prevData, selectedMember.id, newMember));
    setSelectedMember(newMember);

    // Save to backend
    try {
      const response = await fetch('http://localhost:8080/php-backend/api/add_member.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: name,
          lastName: '', // Not used in current structure
          birthDate: new Date().toISOString().split('T')[0], // Placeholder
          relationship: 'Child',
          parentId: selectedMember.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add member to backend');
      }
    } catch (error) {
      console.error('Failed to save member to backend:', error);
      // Optionally show error to user
    }
  };

  // Delete member from both frontend and backend
  const handleDeleteMember = async () => {
    if (!selectedMember) return;
    
    // Prevent deleting the main root to avoid empty tree state
    if (selectedMember.id === data.id) {
      alert("لا يمكن حذف الجد (جذر الشجرة).");
      return;
    }

    if (window.confirm(`هل أنت متأكد من حذف ${selectedMember.name} وجميع أبنائه؟`)) {
      // Update frontend state
      setData(prevData => {
        const newData = deleteNode(prevData, selectedMember.id);
        // If newData is null (shouldn't happen because of root check), revert to prevData
        return newData || prevData;
      });
      setSelectedMember(null);

      // Delete from backend
      try {
        const response = await fetch(`http://localhost:8080/php-backend/api/delete_member.php?id=${selectedMember.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete member from backend');
        }
      } catch (error) {
        console.error('Failed to delete member from backend:', error);
        // Optionally show error to user
      }
    }
  };

  // Handle node selection
  const handleSelectMember = (member: FamilyMember) => {
    setSelectedMember(member);
    // Show mobile panel when a member is selected on mobile
    if (screenSize === 'mobile') {
      setShowMobilePanel(true);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#f7f5eb]">
        <div className="text-2xl font-bold text-emerald-800">جاري تحميل شجرة العائلة...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f7f5eb]">
      {/* Sidebar Control Panel - Responsive based on screen size */}
      {screenSize === 'mobile' ? (
        // Mobile - hidden by default, shown as bottom sheet when needed
        <></>
      ) : screenSize === 'tablet' ? (
        // Tablet - fixed width sidebar
        <div className="hidden md:block w-64">
          <ControlPanel 
            onAddMember={handleAddMember} 
            onDeleteMember={handleDeleteMember}
            selectedMember={selectedMember} 
          />
        </div>
      ) : (
        // Desktop - wider sidebar
        <div className="hidden md:block md:w-80">
          <ControlPanel 
            onAddMember={handleAddMember} 
            onDeleteMember={handleDeleteMember}
            selectedMember={selectedMember} 
          />
        </div>
      )}
      
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
          screenSize={screenSize}
        />
      </div>
      
      {/* Mobile bottom sheet - shown on mobile when needed */}
      {(screenSize === 'mobile' && (showMobilePanel || selectedMember)) && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50 flex">
          <div className="ml-auto w-full h-full bg-white">
            <ControlPanel 
              onAddMember={handleAddMember} 
              onDeleteMember={handleDeleteMember}
              selectedMember={selectedMember} 
              onClose={() => setShowMobilePanel(false)}
            />
          </div>
        </div>
      )}
      
      {/* Mobile bottom sheet trigger - only show when no panel is open */}
      {screenSize === 'mobile' && !(showMobilePanel || selectedMember) && (
        <div 
          className="md:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg px-4 py-2 cursor-pointer z-40"
          onClick={() => setShowMobilePanel(true)}
        >
          <div className="w-8 h-1 bg-gray-400 rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default App;