import type { AnalysisResult, SvgAsset } from '../types';
import { hexToRgb } from './maskUtils';
import { renderSvgToCanvas } from './svgRenderer';

export async function createPngBlob(
  asset: SvgAsset,
  analysis: AnalysisResult,
  selectedIds: Set<number>,
  fillColor: string,
  strokeColor: string,
  showContours: boolean,
  renderScale: number,
): Promise<Blob> {
  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = analysis.width * scale;
  canvas.height = analysis.height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('PNG canvas oluşturulamadı.');

  const fillCanvas = document.createElement('canvas');
  fillCanvas.width = analysis.width;
  fillCanvas.height = analysis.height;
  const fillCtx = fillCanvas.getContext('2d');
  if (!fillCtx) throw new Error('Dolgu canvas oluşturulamadı.');

  const image = fillCtx.createImageData(analysis.width, analysis.height);
  const rgb = hexToRgb(fillColor);
  for (let i = 0; i < analysis.labels.length; i += 1) {
    if (!selectedIds.has(analysis.labels[i])) continue;
    const p = i * 4;
    image.data[p] = rgb.r;
    image.data[p + 1] = rgb.g;
    image.data[p + 2] = rgb.b;
    image.data[p + 3] = 255;
  }
  fillCtx.putImageData(image, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(fillCanvas, 0, 0, canvas.width, canvas.height);

  if (showContours) {
    const lineCanvas = document.createElement('canvas');
    await renderSvgToCanvas(asset, lineCanvas, strokeColor, renderScale);
    ctx.drawImage(lineCanvas, 0, 0, canvas.width, canvas.height);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('PNG üretilemedi.'));
    }, 'image/png');
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
