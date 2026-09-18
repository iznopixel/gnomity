// Normalized (0-1) geometry used across the garden scene.
// This shape is our own convention: the OpenAPI contract only guarantees
// `geometry` is an arbitrary JSON object, so the frontend owns this schema
// and writes/reads it consistently.

export interface RectGeometry {
  shape: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

export interface PolygonGeometry {
  shape: 'polygon';
  points: [number, number][];
}

export type Geometry = RectGeometry | PolygonGeometry;

export function isRect(g: Geometry | null | undefined): g is RectGeometry {
  return !!g && g.shape === 'rect';
}

export function isPolygon(g: Geometry | null | undefined): g is PolygonGeometry {
  return !!g && g.shape === 'polygon';
}

export function geometryCentroid(g: Geometry | null | undefined): { x: number; y: number } {
  if (!g) return { x: 0.5, y: 0.5 };
  if (isRect(g)) return { x: g.x + g.width / 2, y: g.y + g.height / 2 };
  if (isPolygon(g) && g.points.length) {
    const n = g.points.length;
    const sum = g.points.reduce((acc, [x, y]) => ({ x: acc.x + x, y: acc.y + y }), { x: 0, y: 0 });
    return { x: sum.x / n, y: sum.y / n };
  }
  return { x: 0.5, y: 0.5 };
}

export function geometryToPath(g: Geometry, w: number, h: number): string {
  if (isRect(g)) {
    const x = g.x * w;
    const y = g.y * h;
    const width = g.width * w;
    const height = g.height * h;
    const r = Math.min(width, height) * 0.06;
    return `M${x + r},${y} L${x + width - r},${y} Q${x + width},${y} ${x + width},${y + r} L${x + width},${y + height - r} Q${x + width},${y + height} ${x + width - r},${y + height} L${x + r},${y + height} Q${x},${y + height} ${x},${y + height - r} L${x},${y + r} Q${x},${y} ${x + r},${y} Z`;
  }
  if (isPolygon(g)) {
    if (!g.points.length) return '';
    const [first, ...rest] = g.points;
    return `M${first[0] * w},${first[1] * h} ` + rest.map(([x, y]) => `L${x * w},${y * h}`).join(' ') + ' Z';
  }
  return '';
}

export function rectFromPoints(x1: number, y1: number, x2: number, y2: number): RectGeometry {
  return {
    shape: 'rect',
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
  };
}

export function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}
