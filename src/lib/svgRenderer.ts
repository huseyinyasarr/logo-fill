import type { SvgAsset, ViewBox } from '../types';

const MAX_RENDER_SIZE = 4096;

function parseNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const match = value.match(/-?\d*\.?\d+/);
  return match ? Number(match[0]) : undefined;
}

function parseViewBox(svg: SVGSVGElement): ViewBox {
  const raw = svg.getAttribute('viewBox');
  if (raw) {
    const nums = raw
      .trim()
      .split(/[\s,]+/)
      .map(Number)
      .filter(Number.isFinite);
    if (nums.length === 4 && nums[2] > 0 && nums[3] > 0) {
      return { x: nums[0], y: nums[1], width: nums[2], height: nums[3] };
    }
  }

  const width = parseNumber(svg.getAttribute('width')) ?? 1024;
  const height = parseNumber(svg.getAttribute('height')) ?? 1024;
  return { x: 0, y: 0, width, height };
}

export function parseSvgAsset(text: string, name = 'logo.svg'): SvgAsset {
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  const parserError = doc.querySelector('parsererror');
  const svg = doc.documentElement;

  if (parserError || svg.tagName.toLowerCase() !== 'svg') {
    throw new Error('Geçerli bir SVG dosyası okunamadı.');
  }

  const viewBox = parseViewBox(svg as unknown as SVGSVGElement);
  const width = parseNumber(svg.getAttribute('width')) ?? viewBox.width;
  const height = parseNumber(svg.getAttribute('height')) ?? viewBox.height;
  svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
  svg.removeAttribute('script');

  return {
    text: new XMLSerializer().serializeToString(svg),
    name,
    viewBox,
    width,
    height,
  };
}

export function getRenderSize(asset: SvgAsset, renderScale = 3): { width: number; height: number } {
  const requestedScale = Math.max(1, Math.min(4, renderScale));
  const scale = Math.min(MAX_RENDER_SIZE / Math.max(asset.viewBox.width, asset.viewBox.height), requestedScale);
  return {
    width: Math.max(64, Math.round(asset.viewBox.width * scale)),
    height: Math.max(64, Math.round(asset.viewBox.height * scale)),
  };
}

export function recolorSvg(svgText: string, strokeColor: string): string {
  const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
  const svg = doc.documentElement;
  const paintable = new Set([
    'path',
    'rect',
    'circle',
    'ellipse',
    'polygon',
    'polyline',
    'line',
    'text',
    'use',
  ]);

  svg.querySelectorAll('*').forEach((node) => {
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    const fill = el.getAttribute('fill');
    const stroke = el.getAttribute('stroke');
    const style = el.getAttribute('style');

    if (paintable.has(tag) && fill !== 'none') el.setAttribute('fill', strokeColor);
    if (stroke && stroke !== 'none') el.setAttribute('stroke', strokeColor);
    if ((tag === 'line' || tag === 'polyline') && stroke !== 'none') el.setAttribute('stroke', strokeColor);
    if (style) {
      el.setAttribute(
        'style',
        style
          .replace(/fill\s*:\s*(?!none\b)[^;]+/gi, `fill:${strokeColor}`)
          .replace(/stroke\s*:\s*(?!none\b)[^;]+/gi, `stroke:${strokeColor}`),
      );
    }
  });
  return new XMLSerializer().serializeToString(svg);
}

export async function renderSvgToCanvas(
  asset: SvgAsset,
  canvas: HTMLCanvasElement,
  strokeColor = '#111827',
  renderScale = 3,
): Promise<CanvasRenderingContext2D> {
  const { width, height } = getRenderSize(asset, renderScale);
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas başlatılamadı.');

  ctx.clearRect(0, 0, width, height);
  const svg = recolorSvg(asset.text, strokeColor);
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const image = new Image();
  image.decoding = 'async';

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('SVG canvas üzerine render edilemedi.'));
      image.src = url;
    });
    ctx.drawImage(image, 0, 0, width, height);
  } finally {
    URL.revokeObjectURL(url);
  }

  return ctx;
}
