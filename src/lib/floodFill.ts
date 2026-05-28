import type { AnalysisResult, Region } from '../types';
import { traceMaskToPath } from './contourTrace';

function push(queue: Int32Array, value: number, tail: number): number {
  queue[tail] = value;
  return tail + 1;
}

export function analyzeInteriorRegions(
  boundary: Uint8Array,
  width: number,
  height: number,
  minArea: number,
  simplification = 1.5,
): AnalysisResult {
  const total = width * height;
  const outside = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;

  const enqueueOpen = (x: number, y: number) => {
    const idx = y * width + x;
    if (!boundary[idx] && !outside[idx]) {
      outside[idx] = 1;
      tail = push(queue, idx, tail);
    }
  };

  for (let x = 0; x < width; x += 1) {
    enqueueOpen(x, 0);
    enqueueOpen(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    enqueueOpen(0, y);
    enqueueOpen(width - 1, y);
  }

  while (head < tail) {
    const idx = queue[head++];
    const x = idx % width;
    const y = Math.floor(idx / width);
    if (x > 0) enqueueOpen(x - 1, y);
    if (x < width - 1) enqueueOpen(x + 1, y);
    if (y > 0) enqueueOpen(x, y - 1);
    if (y < height - 1) enqueueOpen(x, y + 1);
  }

  const fillable = new Uint8Array(total);
  const labels = new Int32Array(total);
  const regions: Region[] = [];
  let nextId = 1;

  for (let start = 0; start < total; start += 1) {
    if (boundary[start] || outside[start] || labels[start]) continue;

    head = 0;
    tail = 0;
    const component: number[] = [];
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    labels[start] = -1;
    tail = push(queue, start, tail);

    while (head < tail) {
      const idx = queue[head++];
      component.push(idx);
      const x = idx % width;
      const y = Math.floor(idx / width);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);

      const visit = (next: number) => {
        if (!boundary[next] && !outside[next] && !labels[next]) {
          labels[next] = -1;
          tail = push(queue, next, tail);
        }
      };
      if (x > 0) visit(idx - 1);
      if (x < width - 1) visit(idx + 1);
      if (y > 0) visit(idx - width);
      if (y < height - 1) visit(idx + width);
    }

    if (component.length < minArea) {
      component.forEach((idx) => {
        labels[idx] = 0;
      });
      continue;
    }

    const id = nextId++;
    const regionMask = new Uint8Array(total);
    component.forEach((idx) => {
      labels[idx] = id;
      fillable[idx] = 1;
      regionMask[idx] = 1;
    });

    regions.push({
      id,
      pixelCount: component.length,
      bbox: { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 },
      seed: { x: minX + Math.round((maxX - minX) / 2), y: minY + Math.round((maxY - minY) / 2) },
      pathData: traceMaskToPath(regionMask, width, height, simplification),
    });
  }

  return { width, height, boundary, fillable, labels, regions };
}

export function getRegionIdAt(result: AnalysisResult, x: number, y: number): number {
  const px = Math.max(0, Math.min(result.width - 1, Math.round(x)));
  const py = Math.max(0, Math.min(result.height - 1, Math.round(y)));
  return result.labels[py * result.width + px] ?? 0;
}
