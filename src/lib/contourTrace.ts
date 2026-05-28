type Point = { x: number; y: number };

function key(point: Point): string {
  return `${point.x},${point.y}`;
}

function perpendicularDistance(point: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (dx === 0 && dy === 0) return Math.hypot(point.x - a.x, point.y - a.y);
  return Math.abs(dy * point.x - dx * point.y + b.x * a.y - b.y * a.x) / Math.hypot(dx, dy);
}

export function simplifyRdp(points: Point[], epsilon = 1.2): Point[] {
  if (points.length < 3) return points;
  let maxDistance = 0;
  let index = 0;

  for (let i = 1; i < points.length - 1; i += 1) {
    const distance = perpendicularDistance(points[i], points[0], points[points.length - 1]);
    if (distance > maxDistance) {
      index = i;
      maxDistance = distance;
    }
  }

  if (maxDistance > epsilon) {
    const left = simplifyRdp(points.slice(0, index + 1), epsilon);
    const right = simplifyRdp(points.slice(index), epsilon);
    return left.slice(0, -1).concat(right);
  }

  return [points[0], points[points.length - 1]];
}

export function traceMaskToPath(
  mask: Uint8Array,
  width: number,
  height: number,
  simplification = 1.5,
): string {
  const edges = new Map<string, Point[]>();
  const addEdge = (a: Point, b: Point) => {
    const start = key(a);
    const list = edges.get(start);
    if (list) list.push(b);
    else edges.set(start, [b]);
  };

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = y * width + x;
      if (!mask[idx]) continue;
      if (y === 0 || !mask[idx - width]) addEdge({ x, y }, { x: x + 1, y });
      if (x === width - 1 || !mask[idx + 1]) addEdge({ x: x + 1, y }, { x: x + 1, y: y + 1 });
      if (y === height - 1 || !mask[idx + width]) addEdge({ x: x + 1, y: y + 1 }, { x, y: y + 1 });
      if (x === 0 || !mask[idx - 1]) addEdge({ x, y: y + 1 }, { x, y });
    }
  }

  const paths: string[] = [];
  while (edges.size) {
    const firstKey = edges.keys().next().value as string;
    const [sx, sy] = firstKey.split(',').map(Number);
    const start = { x: sx, y: sy };
    const loop: Point[] = [start];
    let current = start;
    let guard = 0;

    while (guard < width * height * 4) {
      guard += 1;
      const options = edges.get(key(current));
      if (!options?.length) break;
      const next = options.shift()!;
      if (options.length === 0) edges.delete(key(current));
      current = next;
      loop.push(current);
      if (current.x === start.x && current.y === start.y) break;
    }

    if (loop.length > 3) {
      const closed = loop[0].x === loop[loop.length - 1].x && loop[0].y === loop[loop.length - 1].y;
      const simple = simplifyRdp(closed ? loop.slice(0, -1) : loop, simplification);
      paths.push(`M ${simple.map((p) => `${p.x} ${p.y}`).join(' L ')} Z`);
    }
  }

  return paths.join(' ');
}
