import { useEffect, useRef } from 'react';
import type { AnalysisResult, FillMode, SvgAsset } from '../types';
import { hexToRgb } from '../lib/maskUtils';
import { renderSvgToCanvas } from '../lib/svgRenderer';

type Props = {
  asset: SvgAsset | null;
  analysis: AnalysisResult | null;
  selectedIds: Set<number>;
  fillColor: string;
  strokeColor: string;
  showContours: boolean;
  renderScale: number;
  fillMode: FillMode;
  onPickRegion: (x: number, y: number) => void;
};

function paintFills(
  ctx: CanvasRenderingContext2D,
  analysis: AnalysisResult,
  selectedIds: Set<number>,
  fillColor: string,
) {
  const image = ctx.createImageData(analysis.width, analysis.height);
  const rgb = hexToRgb(fillColor);
  for (let i = 0; i < analysis.labels.length; i += 1) {
    if (!selectedIds.has(analysis.labels[i])) continue;
    const p = i * 4;
    image.data[p] = rgb.r;
    image.data[p + 1] = rgb.g;
    image.data[p + 2] = rgb.b;
    image.data[p + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
}

export function PreviewCanvas({
  asset,
  analysis,
  selectedIds,
  fillColor,
  strokeColor,
  showContours,
  renderScale,
  fillMode,
  onPickRegion,
}: Props) {
  const beforeRef = useRef<HTMLCanvasElement>(null);
  const afterRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!asset || !beforeRef.current || !afterRef.current) return;
    let cancelled = false;

    async function draw() {
      if (!asset || !beforeRef.current || !afterRef.current) return;
      const before = beforeRef.current;
      const after = afterRef.current;
      await renderSvgToCanvas(asset, before, strokeColor, renderScale);
      if (cancelled) return;

      after.width = before.width;
      after.height = before.height;
      const ctx = after.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, after.width, after.height);
      if (analysis) paintFills(ctx, analysis, selectedIds, fillColor);
      if (showContours) ctx.drawImage(before, 0, 0);
    }

    void draw();
    return () => {
      cancelled = true;
    };
  }, [asset, analysis, selectedIds, fillColor, strokeColor, showContours, renderScale]);

  if (!asset) {
    return (
      <main className="flex min-h-screen flex-1 items-center justify-center bg-white p-6">
        <div className="max-w-xl text-center">
          <h2 className="text-2xl font-bold text-slate-950">Siyah konturlu SVG logonu yükle</h2>
          <p className="mt-3 text-slate-600">
            Uygulama SVG’yi yüksek çözünürlüklü canvas’a çizer, koyu pikselleri sınır kabul eder,
            dış alanı flood fill ile ayırır ve kapalı boşlukları seçtiğin renge boyar.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-white p-4 md:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">{asset.name}</h2>
          <p className="text-sm text-slate-500">
            {fillMode === 'click' ? 'Önizlemede kapalı bir alanı tıkla.' : 'Tüm alan modu hazır.'}
          </p>
        </div>
        {analysis && (
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            {analysis.width}x{analysis.height}px analiz
          </div>
        )}
      </div>

      <div className="grid flex-1 gap-4 xl:grid-cols-2">
        <section className="flex min-h-[280px] flex-col rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 text-sm font-semibold text-slate-700">Önce</div>
          <div className="flex flex-1 items-center justify-center overflow-auto rounded-md bg-white bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px]">
            <canvas ref={beforeRef} className="max-h-full max-w-full object-contain" />
          </div>
        </section>

        <section className="flex min-h-[280px] flex-col rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Sonra</span>
            <span className="text-xs text-slate-500">{selectedIds.size} seçili</span>
          </div>
          <div className="flex flex-1 items-center justify-center overflow-auto rounded-md bg-white bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px]">
            <canvas
              ref={afterRef}
              className={`max-h-full max-w-full object-contain ${fillMode === 'click' ? 'cursor-crosshair' : ''}`}
              onClick={(event) => {
                if (!analysis || fillMode !== 'click') return;
                const canvas = event.currentTarget;
                const rect = canvas.getBoundingClientRect();
                const x = ((event.clientX - rect.left) / rect.width) * analysis.width;
                const y = ((event.clientY - rect.top) / rect.height) * analysis.height;
                onPickRegion(x, y);
              }}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
