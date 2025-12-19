export interface FamilyMember {
  id: string;
  name: string;
  age: string;
  children: FamilyMember[];
}

// Flat node used for rendering after D3 calculation
export interface RenderNode {
  x: number;
  y: number;
  data: FamilyMember;
  parent?: { x: number; y: number };
  depth: number;
}
