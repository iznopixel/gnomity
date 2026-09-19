import { create } from 'zustand';
import type { Geometry } from '../models/geometry';

export type EditorMode = 'explore' | 'edit-layout' | 'add-area' | 'add-plant';
export type ViewMode = 'plants' | 'sunlight' | 'watering' | 'bloom';

export type SelectedObject =
  | { kind: 'zone'; id: number }
  | { kind: 'object'; id: number }
  | { kind: 'plant'; id: number }
  | null;

interface DragState {
  kind: 'zone' | 'object' | 'plant';
  id: number;
  originX: number;
  originY: number;
}

interface EditorState {
  editorMode: EditorMode;
  activeView: ViewMode;
  selectedMonth: number; // 1-12
  selected: SelectedObject;
  hovered: SelectedObject;
  temporaryGeometry: Geometry | null;
  dragState: DragState | null;
  viewport: { zoom: number; panX: number; panY: number };

  setEditorMode: (m: EditorMode) => void;
  setActiveView: (v: ViewMode) => void;
  setSelectedMonth: (m: number) => void;
  select: (obj: SelectedObject) => void;
  setHovered: (obj: SelectedObject) => void;
  setTemporaryGeometry: (g: Geometry | null) => void;
  startDrag: (d: DragState) => void;
  endDrag: () => void;
  setViewport: (v: Partial<{ zoom: number; panX: number; panY: number }>) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  editorMode: 'explore',
  activeView: 'plants',
  selectedMonth: new Date().getMonth() + 1,
  selected: null,
  hovered: null,
  temporaryGeometry: null,
  dragState: null,
  viewport: { zoom: 1, panX: 0, panY: 0 },

  setEditorMode: (editorMode) =>
    set((s) => ({ editorMode, selected: editorMode === 'explore' ? s.selected : null })),
  setActiveView: (activeView) => set({ activeView }),
  setSelectedMonth: (selectedMonth) => set({ selectedMonth }),
  select: (selected) => set({ selected }),
  setHovered: (hovered) => set({ hovered }),
  setTemporaryGeometry: (temporaryGeometry) => set({ temporaryGeometry }),
  startDrag: (dragState) => set({ dragState }),
  endDrag: () => set({ dragState: null }),
  setViewport: (v) => set((s) => ({ viewport: { ...s.viewport, ...v } })),
}));

export const MONTH_LABELS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];
