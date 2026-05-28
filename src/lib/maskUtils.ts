export function buildBoundaryMask(
  imageData: ImageData,
  threshold: number,
  gapTolerance: number,
): Uint8Array {
  const { data, width, height } = imageData;
  const source = new Uint8Array(width * height);

  for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
    const alpha = data[i + 3];
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    source[p] = alpha > 20 && avg < threshold ? 1 : 0;
  }

  const radius = Math.max(0, Math.round(gapTolerance));
  if (radius === 0) return source;

  const dilated = new Uint8Array(width * height);
  const r2 = radius * radius;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = y * width + x;
      if (!source[idx]) continue;
      for (let dy = -radius; dy <= radius; dy += 1) {
        const ny = y + dy;
        if (ny < 0 || ny >= height) continue;
        for (let dx = -radius; dx <= radius; dx += 1) {
          if (dx * dx + dy * dy > r2) continue;
          const nx = x + dx;
          if (nx >= 0 && nx < width) dilated[ny * width + nx] = 1;
        }
      }
    }
  }

  return dilated;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '').trim();
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const value = Number.parseInt(full, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

export function makeRegionMask(labels: Int32Array, selectedIds: Set<number>): Uint8Array {
  const mask = new Uint8Array(labels.length);
  for (let i = 0; i < labels.length; i += 1) {
    if (selectedIds.has(labels[i])) mask[i] = 1;
  }
  return mask;
}
