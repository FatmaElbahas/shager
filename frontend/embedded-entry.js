import React from 'react';
import { createRoot } from 'react-dom/client';
import { EmbeddedFamilyTree } from './components/EmbeddedFamilyTree';

// Mount function for the family tree component
function mountFamilyTree() {
  const el = document.getElementById("family-tree-root");
  if (!el) return;
  
  const root = createRoot(el);
  root.render(<EmbeddedFamilyTree />);
}

// Wait for DOM to be ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountFamilyTree);
} else {
  mountFamilyTree();
}