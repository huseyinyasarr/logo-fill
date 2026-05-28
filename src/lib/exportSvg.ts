import type { AnalysisResult, Region, SvgAsset, ViewBox } from '../types';
import { recolorSvg } from './svgRenderer';

function scalePath(path: string, assetBox: ViewBox, width: number, height: number): string {
  const sx = assetBox.width / width;
  const sy = assetBox.height / height;
  return path.replace(/-?\d+(\.\d+)?\s+-?\d+(\.\d+)?/g, (pair) => {
    const [x, y] = pair.split(/\s+/).map(Number);
    return `${(assetBox.x + x * sx).toFixed(2)} ${(assetBox.y + y * sy).toFixed(2)}`;
  });
}

export function createFilledSvg(
  asset: SvgAsset,
  analysis: AnalysisResult,
  selectedIds: Set<number>,
  fillColor: string,
  strokeColor: string,
  showContours: boolean,
): string {
  const selectedRegions: Region[] = analysis.regions.filter((region) => selectedIds.has(region.id));
  const fillPaths = selectedRegions
    .filter((region) => region.pathData.trim().length > 0)
    .map((region) => {
      const d = scalePath(region.pathData, asset.viewBox, analysis.width, analysis.height);
      return `<path d="${d}" fill="${fillColor}" stroke="none" fill-rule="evenodd"/>`;
    })
    .join('\n');

  const overlaySvg = showContours
    ? (() => {
        const overlayDoc = new DOMParser().parseFromString(recolorSvg(asset.text, strokeColor), 'image/svg+xml');
        return Array.from(overlayDoc.documentElement.childNodes)
          .map((node) => new XMLSerializer().serializeToString(node))
          .join('\n');
      })()
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${asset.viewBox.x} ${asset.viewBox.y} ${asset.viewBox.width} ${asset.viewBox.height}">
<g id="detected-fills">
${fillPaths}
</g>
<g id="original-contours" display="${showContours ? 'inline' : 'none'}">
${overlaySvg}
</g>
</svg>`;
}

export function downloadSvg(svg: string): void {
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'filled-logo.svg';
  link.click();
  URL.revokeObjectURL(url);
}
