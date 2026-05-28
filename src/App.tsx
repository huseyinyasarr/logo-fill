import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controls } from './components/Controls';
import { PreviewCanvas } from './components/PreviewCanvas';
import { analyzeInteriorRegions, getRegionIdAt } from './lib/floodFill';
import { buildBoundaryMask } from './lib/maskUtils';
import { createFilledSvg, downloadSvg } from './lib/exportSvg';
import { createPngBlob, downloadBlob } from './lib/exportPng';
import { parseSvgAsset, renderSvgToCanvas } from './lib/svgRenderer';
import type { AnalysisResult, AnalysisSettings, FillMode, SvgAsset } from './types';

const DEFAULT_SETTINGS: AnalysisSettings = {
  fillColor: '#9CA3AF',
  strokeColor: '#111827',
  showContours: true,
  renderScale: 3,
  gapTolerance: 2,
  threshold: 100,
  minArea: 32,
};

export default function App() {
  const [asset, setAsset] = useState<SvgAsset | null>(null);
  const [settings, setSettings] = useState<AnalysisSettings>(DEFAULT_SETTINGS);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [fillMode, setFillMode] = useState<FillMode>('all');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const runIdRef = useRef(0);

  const allRegionIds = useMemo(
    () => new Set(analysis?.regions.map((region) => region.id) ?? []),
    [analysis],
  );

  const handleSvgLoaded = useCallback((text: string, name: string) => {
    try {
      setError(null);
      setSelectedIds(new Set());
      setAsset(parseSvgAsset(text, name));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'SVG yüklenirken bilinmeyen bir hata oluştu.');
    }
  }, []);

  useEffect(() => {
    if (!asset) {
      setAnalysis(null);
      return;
    }

    const currentAsset = asset;
    const runId = ++runIdRef.current;
    const canvas = document.createElement('canvas');
    setBusy(true);
    setError(null);

    async function analyze() {
      try {
        const ctx = await renderSvgToCanvas(
          currentAsset,
          canvas,
          settings.strokeColor,
          settings.renderScale,
        );
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const effectiveScale = Math.max(1, canvas.width / currentAsset.viewBox.width);
        const boundary = buildBoundaryMask(
          imageData,
          settings.threshold,
          settings.gapTolerance * effectiveScale,
        );
        const result = analyzeInteriorRegions(
          boundary,
          canvas.width,
          canvas.height,
          Math.round(settings.minArea * effectiveScale * effectiveScale),
          Math.max(1.5, effectiveScale * 0.8),
        );
        if (runId !== runIdRef.current) return;
        setAnalysis(result);
        setSelectedIds((current) => {
          if (current.size === 0) return current;
          const available = new Set(result.regions.map((region) => region.id));
          return new Set([...current].filter((id) => available.has(id)));
        });
      } catch (err) {
        if (runId !== runIdRef.current) return;
        setAnalysis(null);
        setError(err instanceof Error ? err.message : 'Analiz sırasında hata oluştu.');
      } finally {
        if (runId === runIdRef.current) setBusy(false);
      }
    }

    void analyze();
  }, [
    asset,
    settings.gapTolerance,
    settings.threshold,
    settings.minArea,
    settings.strokeColor,
    settings.renderScale,
  ]);

  const fillAll = useCallback(() => {
    setFillMode('all');
    setSelectedIds(new Set(allRegionIds));
  }, [allRegionIds]);

  const reset = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const pickRegion = useCallback(
    (x: number, y: number) => {
      if (!analysis) return;
      const id = getRegionIdAt(analysis, x, y);
      if (!id) return;
      setSelectedIds((current) => {
        const next = new Set(current);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    [analysis],
  );

  const downloadCurrentSvg = useCallback(() => {
    if (!asset || !analysis) return;
    const svg = createFilledSvg(
      asset,
      analysis,
      selectedIds,
      settings.fillColor,
      settings.strokeColor,
      settings.showContours,
    );
    downloadSvg(svg);
  }, [asset, analysis, selectedIds, settings.fillColor, settings.strokeColor, settings.showContours]);

  const downloadCurrentPng = useCallback(async () => {
    if (!asset || !analysis) return;
    try {
      const blob = await createPngBlob(
        asset,
        analysis,
        selectedIds,
        settings.fillColor,
        settings.strokeColor,
        settings.showContours,
        settings.renderScale,
      );
      downloadBlob(blob, 'filled-logo.png');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PNG export başarısız oldu.');
    }
  }, [
    asset,
    analysis,
    selectedIds,
    settings.fillColor,
    settings.strokeColor,
    settings.showContours,
    settings.renderScale,
  ]);

  return (
    <div className="min-h-screen bg-white lg:flex">
      <Controls
        settings={settings}
        fillMode={fillMode}
        hasAsset={Boolean(asset && analysis)}
        regionCount={analysis?.regions.length ?? 0}
        onSettingsChange={setSettings}
        onSvgLoaded={handleSvgLoaded}
        onError={setError}
        onFillAll={fillAll}
        onReset={reset}
        onModeChange={setFillMode}
        onDownloadSvg={downloadCurrentSvg}
        onDownloadPng={downloadCurrentPng}
      />

      <div className="relative flex flex-1 flex-col">
        {(busy || error) && (
          <div className="absolute left-4 right-4 top-4 z-10 rounded-md border border-slate-200 bg-white/95 px-4 py-3 text-sm shadow-soft backdrop-blur">
            {busy && <span className="font-medium text-slate-700">SVG analiz ediliyor...</span>}
            {error && <span className="font-medium text-red-700">{error}</span>}
          </div>
        )}
        <PreviewCanvas
          asset={asset}
          analysis={analysis}
          selectedIds={selectedIds}
          fillColor={settings.fillColor}
          strokeColor={settings.strokeColor}
          showContours={settings.showContours}
          renderScale={settings.renderScale}
          fillMode={fillMode}
          onPickRegion={pickRegion}
        />
      </div>
    </div>
  );
}
