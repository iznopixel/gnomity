import { useCallback, useRef, useState } from 'react';
import type { GardenObject, GardenPlant, Zone } from '../models/types';
import type { Geometry } from '../models/geometry';
import { clamp01, geometryCentroid, geometryToPath, isPolygon, isRect, rectFromPoints } from '../models/geometry';
import type { EditorMode, SelectedObject, ViewMode } from '../state/editorStore';
import {
  SUNLIGHT_COLORS,
  WATER_COLORS,
  ZONE_TYPE_FILL,
  isPlantBloomingInMonth,
  isPlantComingSoon,
  plantColor,
} from '../features/garden/sceneHelpers';

export const CANVAS_W = 1000;
export const CANVAS_H = 680;

export type DrawShape = 'rect' | 'polygon';

export interface GardenCanvasProps {
  zones: Zone[];
  objects: GardenObject[];
  plants: GardenPlant[];
  viewMode: ViewMode;
  month: number;
  mode: EditorMode;
  drawShape?: DrawShape;
  selected: SelectedObject;
  onSelect: (obj: SelectedObject) => void;
  hovered?: SelectedObject;
  onHover?: (obj: SelectedObject) => void;
  highlightPlantId?: number | null;
  highlightZoneId?: number | null;
  onZoneGeometryChange?: (id: number, geometry: Geometry) => void;
  onPlantMove?: (id: number, x: number, y: number) => void;
  onCreateZoneGeometry?: (geometry: Geometry) => void;
  onCanvasClickForPlacement?: (x: number, y: number) => void;
  className?: string;
}

interface DragInfo {
  kind: 'plant' | 'zone';
  id: number;
  startPointerX: number;
  startPointerY: number;
  originGeometry?: Geometry;
  originX?: number;
  originY?: number;
}

export default function GardenCanvas({
  zones,
  objects,
  plants,
  viewMode,
  month,
  mode,
  drawShape = 'rect',
  selected,
  onSelect,
  hovered,
  onHover,
  highlightPlantId,
  highlightZoneId,
  onZoneGeometryChange,
  onPlantMove,
  onCreateZoneGeometry,
  onCanvasClickForPlacement,
  className,
}: GardenCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<DragInfo | null>(null);
  const [localGeom, setLocalGeom] = useState<Record<number, Geometry>>({});
  const [localPos, setLocalPos] = useState<Record<number, { x: number; y: number }>>({});
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null);
  const [polyPoints, setPolyPoints] = useState<[number, number][]>([]);

  const toLocal = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const x = clamp01((clientX - rect.left) / rect.width);
    const y = clamp01((clientY - rect.top) / rect.height);
    return { x, y };
  }, []);

  const editLayout = mode === 'edit-layout';
  const addArea = mode === 'add-area';
  const addPlant = mode === 'add-plant';

  // --- Zone pointer handlers -------------------------------------------------

  const handleZonePointerDown = (zone: Zone) => (e: React.PointerEvent) => {
    if (addArea || addPlant) return;
    e.stopPropagation();
    onSelect({ kind: 'zone', id: zone.id });
    if (!editLayout || !zone.geometry) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    setDrag({
      kind: 'zone',
      id: zone.id,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      originGeometry: localGeom[zone.id] ?? zone.geometry,
    });
  };

  const handlePlantPointerDown = (plant: GardenPlant) => (e: React.PointerEvent) => {
    if (addArea) return;
    e.stopPropagation();
    onSelect({ kind: 'plant', id: plant.id });
    if (!editLayout) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    setDrag({
      kind: 'plant',
      id: plant.id,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      originX: localPos[plant.id]?.x ?? plant.x,
      originY: localPos[plant.id]?.y ?? plant.y,
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!drag) {
      if (addArea && drawStart) {
        setDrawCurrent(toLocal(e.clientX, e.clientY));
      }
      return;
    }
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const dx = (e.clientX - drag.startPointerX) / rect.width;
    const dy = (e.clientY - drag.startPointerY) / rect.height;

    if (drag.kind === 'plant') {
      const x = clamp01((drag.originX ?? 0) + dx);
      const y = clamp01((drag.originY ?? 0) + dy);
      setLocalPos((p) => ({ ...p, [drag.id]: { x, y } }));
    } else if (drag.kind === 'zone' && drag.originGeometry) {
      const g = drag.originGeometry;
      if (isRect(g)) {
        const x = clamp01(g.x + dx);
        const y = clamp01(g.y + dy);
        setLocalGeom((m) => ({ ...m, [drag.id]: { ...g, x, y } }));
      } else if (isPolygon(g)) {
        const points = g.points.map(([px, py]) => [clamp01(px + dx), clamp01(py + dy)] as [number, number]);
        setLocalGeom((m) => ({ ...m, [drag.id]: { ...g, points } }));
      }
    }
  };

  const handlePointerUp = () => {
    if (drag) {
      if (drag.kind === 'plant') {
        const pos = localPos[drag.id];
        if (pos && onPlantMove) onPlantMove(drag.id, pos.x, pos.y);
      } else if (drag.kind === 'zone') {
        const geom = localGeom[drag.id];
        if (geom && onZoneGeometryChange) onZoneGeometryChange(drag.id, geom);
      }
      setDrag(null);
    }
  };

  // --- Resize handles (rect zones only) --------------------------------------

  const handleResizePointerDown = (zone: Zone, corner: 'nw' | 'ne' | 'sw' | 'se') => (e: React.PointerEvent) => {
    e.stopPropagation();
    if (!zone.geometry || !isRect(zone.geometry)) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    const origin = localGeom[zone.id] ?? zone.geometry;
    const svg = svgRef.current;
    if (!svg) return;

    const onMove = (ev: PointerEvent) => {
      const rect = svg.getBoundingClientRect();
      const px = clamp01((ev.clientX - rect.left) / rect.width);
      const py = clamp01((ev.clientY - rect.top) / rect.height);
      const g = origin as Extract<Geometry, { shape: 'rect' }>;
      let { x, y, width, height } = g;
      if (corner === 'se') {
        width = Math.max(0.03, px - x);
        height = Math.max(0.03, py - y);
      } else if (corner === 'nw') {
        width = Math.max(0.03, x + width - px);
        height = Math.max(0.03, y + height - py);
        x = px;
        y = py;
      } else if (corner === 'ne') {
        width = Math.max(0.03, px - x);
        height = Math.max(0.03, y + height - py);
        y = py;
      } else {
        width = Math.max(0.03, x + width - px);
        height = Math.max(0.03, py - y);
        x = px;
      }
      setLocalGeom((m) => ({ ...m, [zone.id]: { shape: 'rect', x, y, width, height } }));
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      const geom = localGeom[zone.id];
      if (geom && onZoneGeometryChange) onZoneGeometryChange(zone.id, geom);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  // --- Add-area drawing --------------------------------------------------------

  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (addPlant) {
      const p = toLocal(e.clientX, e.clientY);
      onCanvasClickForPlacement?.(p.x, p.y);
      return;
    }
    if (!addArea) {
      if (mode === 'explore' || mode === 'edit-layout') onSelect(null);
      return;
    }
    if (drawShape === 'rect') {
      const p = toLocal(e.clientX, e.clientY);
      setDrawStart(p);
      setDrawCurrent(p);
    } else {
      const p = toLocal(e.clientX, e.clientY);
      setPolyPoints((pts) => [...pts, [p.x, p.y]]);
    }
  };

  const handleCanvasPointerUp = () => {
    if (addArea && drawShape === 'rect' && drawStart && drawCurrent) {
      const geom = rectFromPoints(drawStart.x, drawStart.y, drawCurrent.x, drawCurrent.y);
      if (geom.width > 0.015 && geom.height > 0.015) {
        onCreateZoneGeometry?.(geom);
      }
      setDrawStart(null);
      setDrawCurrent(null);
    }
  };

  const finishPolygon = useCallback(() => {
    if (polyPoints.length >= 3) {
      onCreateZoneGeometry?.({ shape: 'polygon', points: polyPoints });
    }
    setPolyPoints([]);
  }, [polyPoints, onCreateZoneGeometry]);

  // --- Rendering helpers --------------------------------------------------------

  const zoneFill = (zone: Zone) => {
    if (viewMode === 'sunlight') return zone.sunlight ? SUNLIGHT_COLORS[zone.sunlight] ?? '#cfc6b4' : '#cfc6b4';
    if (viewMode === 'watering') return zone.water_source ? WATER_COLORS[zone.water_source] ?? '#cfc6b4' : '#cfc6b4';
    return ZONE_TYPE_FILL[zone.type] ?? ZONE_TYPE_FILL.other;
  };

  return (
    <div className={'garden-canvas-wrap' + (className ? ` ${className}` : '')}>
      <svg
        ref={svgRef}
        className={`garden-canvas garden-canvas--${mode}`}
        viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
        role="img"
        aria-label="Garden map"
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(e) => {
          handlePointerUp();
          handleCanvasPointerUp();
          void e;
        }}
        onDoubleClick={() => {
          if (addArea && drawShape === 'polygon') finishPolygon();
        }}
      >
        <defs>
          <pattern id="fence-hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="10" stroke="#a8967a" strokeWidth="2" />
          </pattern>
          <filter id="soft-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#2b2620" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* ground */}
        <rect x={0} y={0} width={CANVAS_W} height={CANVAS_H} fill="var(--color-bg-sunken)" rx={18} />

        {/* zones */}
        <g>
          {zones.map((zone) => {
            const geom = localGeom[zone.id] ?? zone.geometry;
            if (!geom) return null;
            const path = geometryToPath(geom, CANVAS_W, CANVAS_H);
            const isSelected = selected?.kind === 'zone' && selected.id === zone.id;
            const isHovered = hovered?.kind === 'zone' && hovered.id === zone.id;
            const isHighlighted = highlightZoneId === zone.id;
            const centroid = geometryCentroid(geom);
            return (
              <g
                key={zone.id}
                className="zone-shape"
                onPointerDown={handleZonePointerDown(zone)}
                onPointerEnter={() => onHover?.({ kind: 'zone', id: zone.id })}
                onPointerLeave={() => onHover?.(null)}
                style={{ cursor: editLayout ? 'move' : mode === 'explore' ? 'pointer' : 'default' }}
              >
                <path
                  d={path}
                  fill={zoneFill(zone)}
                  fillOpacity={isSelected || isHighlighted ? 0.95 : isHovered ? 0.85 : 0.72}
                  stroke={isSelected || isHighlighted ? 'var(--color-green-700)' : 'var(--color-border-strong)'}
                  strokeWidth={isSelected || isHighlighted ? 2.5 : 1.2}
                  strokeDasharray={isSelected ? '0' : undefined}
                  filter={isSelected ? 'url(#soft-shadow)' : undefined}
                />
                {geom && (
                  <text
                    x={centroid.x * CANVAS_W}
                    y={centroid.y * CANVAS_H}
                    textAnchor="middle"
                    className="zone-label"
                    pointerEvents="none"
                  >
                    {zone.name}
                  </text>
                )}
                {editLayout && isSelected && isRect(geom) && (
                  <>
                    {(['nw', 'ne', 'sw', 'se'] as const).map((corner) => {
                      const hx = geom.x + (corner.includes('e') ? geom.width : 0);
                      const hy = geom.y + (corner.includes('s') ? geom.height : 0);
                      return (
                        <rect
                          key={corner}
                          x={hx * CANVAS_W - 6}
                          y={hy * CANVAS_H - 6}
                          width={12}
                          height={12}
                          rx={3}
                          className="resize-handle"
                          onPointerDown={handleResizePointerDown(zone, corner)}
                          style={{ cursor: corner === 'nw' || corner === 'se' ? 'nwse-resize' : 'nesw-resize' }}
                        />
                      );
                    })}
                  </>
                )}
              </g>
            );
          })}
        </g>

        {/* structures */}
        <g>
          {objects.map((obj) => {
            if (!obj.geometry) return null;
            const path = geometryToPath(obj.geometry, CANVAS_W, CANVAS_H);
            const centroid = geometryCentroid(obj.geometry);
            const isFence = obj.type === 'fence';
            const isTree = obj.type === 'tree';
            const isPath = obj.type === 'path' || obj.type === 'driveway';
            if (isTree) {
              return (
                <g key={obj.id} pointerEvents="none">
                  <circle cx={centroid.x * CANVAS_W} cy={centroid.y * CANVAS_H} r={22} fill="var(--color-green-500)" fillOpacity={0.85} />
                  <circle cx={centroid.x * CANVAS_W} cy={centroid.y * CANVAS_H} r={5} fill="var(--color-green-900)" />
                </g>
              );
            }
            return (
              <path
                key={obj.id}
                d={path}
                fill={isFence ? 'url(#fence-hatch)' : isPath ? '#d9cdb2' : '#e5dcc8'}
                stroke="var(--color-border-strong)"
                strokeWidth={obj.type === 'house' ? 2 : 1}
                fillOpacity={obj.type === 'house' ? 1 : 0.9}
                pointerEvents="none"
              />
            );
          })}
        </g>

        {/* draw-in-progress area */}
        {addArea && drawShape === 'rect' && drawStart && drawCurrent && (
          <rect
            x={Math.min(drawStart.x, drawCurrent.x) * CANVAS_W}
            y={Math.min(drawStart.y, drawCurrent.y) * CANVAS_H}
            width={Math.abs(drawCurrent.x - drawStart.x) * CANVAS_W}
            height={Math.abs(drawCurrent.y - drawStart.y) * CANVAS_H}
            fill="var(--color-green-300)"
            fillOpacity={0.35}
            stroke="var(--color-green-700)"
            strokeDasharray="6 4"
            strokeWidth={1.5}
            pointerEvents="none"
          />
        )}
        {addArea && drawShape === 'polygon' && polyPoints.length > 0 && (
          <polyline
            points={polyPoints.map(([x, y]) => `${x * CANVAS_W},${y * CANVAS_H}`).join(' ')}
            fill="none"
            stroke="var(--color-green-700)"
            strokeDasharray="6 4"
            strokeWidth={1.5}
            pointerEvents="none"
          />
        )}

        {/* plants */}
        <g>
          {plants.map((plant) => {
            const pos = localPos[plant.id] ?? { x: plant.x, y: plant.y };
            const blooming = isPlantBloomingInMonth(plant, month);
            const comingSoon = !blooming && isPlantComingSoon(plant, month);
            const isSelected = selected?.kind === 'plant' && selected.id === plant.id;
            const isHovered = hovered?.kind === 'plant' && hovered.id === plant.id;
            const isHighlighted = highlightPlantId === plant.id;
            const color = plantColor(plant.primary_color);
            const baseR = 8 + Math.min(plant.quantity ?? 1, 6) * 1.6;
            const scale = plant.scale ?? 1;
            const r = baseR * scale;

            let opacity = 1;
            let fill = color;
            if (viewMode === 'bloom') {
              opacity = blooming ? 1 : comingSoon ? 0.55 : 0.22;
              fill = blooming ? color : comingSoon ? '#d8b56c' : '#9a9284';
            } else if (viewMode === 'sunlight' || viewMode === 'watering') {
              opacity = 0.9;
              fill = color;
            }

            return (
              <g
                key={plant.id}
                className="plant-marker"
                transform={`translate(${pos.x * CANVAS_W}, ${pos.y * CANVAS_H})`}
                onPointerDown={handlePlantPointerDown(plant)}
                onPointerEnter={() => onHover?.({ kind: 'plant', id: plant.id })}
                onPointerLeave={() => onHover?.(null)}
                style={{ cursor: editLayout ? 'move' : mode === 'explore' ? 'pointer' : 'default' }}
              >
                {(isSelected || isHighlighted) && (
                  <circle r={r + 7} fill="none" stroke="var(--color-green-700)" strokeWidth={2} strokeDasharray="3 3" className="plant-marker__ring" />
                )}
                <circle
                  r={r}
                  fill={fill}
                  fillOpacity={opacity}
                  stroke={isHovered ? 'var(--color-ink)' : 'rgba(43,38,32,0.35)'}
                  strokeWidth={isHovered ? 1.6 : 1}
                  className="plant-marker__dot"
                />
                {blooming && viewMode !== 'sunlight' && viewMode !== 'watering' && (
                  <circle r={2.4} fill="#fff" fillOpacity={0.85} cx={-r * 0.3} cy={-r * 0.3} pointerEvents="none" />
                )}
                {(plant.quantity ?? 1) > 1 && (
                  <text y={3.5} textAnchor="middle" className="plant-marker__count" pointerEvents="none">
                    {plant.quantity}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {zones.length === 0 && objects.length === 0 && plants.length === 0 && (
        <div className="garden-canvas__empty">
          <p>This garden has no layout yet. Switch to Edit Layout to sketch your first bed.</p>
        </div>
      )}
    </div>
  );
}
