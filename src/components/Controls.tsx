import { Download, Eraser, Eye, EyeOff, MousePointer2, PaintBucket } from 'lucide-react';
import type { AnalysisSettings, FillMode } from '../types';
import { UploadPanel } from './UploadPanel';

type Props = {
  settings: AnalysisSettings;
  fillMode: FillMode;
  hasAsset: boolean;
  regionCount: number;
  onSettingsChange: (settings: AnalysisSettings) => void;
  onSvgLoaded: (text: string, name: string) => void;
  onError: (message: string) => void;
  onFillAll: () => void;
  onReset: () => void;
  onModeChange: (mode: FillMode) => void;
  onDownloadSvg: () => void;
  onDownloadPng: () => void;
};

export function Controls({
  settings,
  fillMode,
  hasAsset,
  regionCount,
  onSettingsChange,
  onSvgLoaded,
  onError,
  onFillAll,
  onReset,
  onModeChange,
  onDownloadSvg,
  onDownloadPng,
}: Props) {
  const update = <K extends keyof AnalysisSettings>(key: K, value: AnalysisSettings[K]) =>
    onSettingsChange({ ...settings, [key]: value });

  return (
    <aside className="w-full border-b border-slate-200 bg-slate-50 p-4 lg:h-screen lg:w-80 lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <div className="mb-5">
        <h1 className="text-xl font-bold tracking-normal text-slate-950">SVG Logo Fill</h1>
        <p className="mt-1 text-sm text-slate-600">Kapalı iç alanları boya kovası mantığıyla doldurur.</p>
      </div>

      <div className="space-y-5">
        <UploadPanel onSvgLoaded={onSvgLoaded} onError={onError} />

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Dolgu rengi</span>
          <div className="mt-2 flex items-center gap-3">
            <input className="h-10 w-12 rounded border border-slate-300" type="color" value={settings.fillColor} onChange={(e) => update('fillColor', e.target.value)} />
            <input className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm" value={settings.fillColor} onChange={(e) => update('fillColor', e.target.value)} />
          </div>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Kontur rengi</span>
          <div className="mt-2 flex items-center gap-3">
            <input className="h-10 w-12 rounded border border-slate-300" type="color" value={settings.strokeColor} onChange={(e) => update('strokeColor', e.target.value)} />
            <input className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm" value={settings.strokeColor} onChange={(e) => update('strokeColor', e.target.value)} />
          </div>
        </label>

        <label className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
            {settings.showContours ? <Eye className="h-4 w-4 text-cyan-700" /> : <EyeOff className="h-4 w-4 text-slate-500" />}
            Konturu göster
          </span>
          <input
            className="h-5 w-5 accent-cyan-700"
            type="checkbox"
            checked={settings.showContours}
            onChange={(e) => update('showContours', e.target.checked)}
          />
        </label>

        <label className="block">
          <span className="flex justify-between text-sm font-medium text-slate-700">
            <span>Analiz kalitesi</span>
            <span>{settings.renderScale}x</span>
          </span>
          <input className="mt-2 w-full accent-cyan-700" type="range" min="1" max="4" step="1" value={settings.renderScale} onChange={(e) => update('renderScale', Number(e.target.value))} />
        </label>

        <label className="block">
          <span className="flex justify-between text-sm font-medium text-slate-700">
            <span>Gap tolerance</span>
            <span>{settings.gapTolerance}px</span>
          </span>
          <input className="mt-2 w-full accent-cyan-700" type="range" min="0" max="10" step="1" value={settings.gapTolerance} onChange={(e) => update('gapTolerance', Number(e.target.value))} />
        </label>

        <label className="block">
          <span className="flex justify-between text-sm font-medium text-slate-700">
            <span>Threshold</span>
            <span>{settings.threshold}</span>
          </span>
          <input className="mt-2 w-full accent-cyan-700" type="range" min="20" max="220" step="1" value={settings.threshold} onChange={(e) => update('threshold', Number(e.target.value))} />
        </label>

        <label className="block">
          <span className="flex justify-between text-sm font-medium text-slate-700">
            <span>Minimum alan</span>
            <span>{settings.minArea}px</span>
          </span>
          <input className="mt-2 w-full accent-cyan-700" type="range" min="8" max="1000" step="8" value={settings.minArea} onChange={(e) => update('minArea', Number(e.target.value))} />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <button className="inline-flex items-center justify-center gap-2 rounded-md bg-cyan-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-45" disabled={!hasAsset} onClick={onFillAll}>
            <PaintBucket className="h-4 w-4" /> Tümünü doldur
          </button>
          <button className={`inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold ${fillMode === 'click' ? 'border-cyan-700 bg-cyan-50 text-cyan-800' : 'border-slate-300 bg-white text-slate-700'}`} disabled={!hasAsset} onClick={() => onModeChange(fillMode === 'click' ? 'all' : 'click')}>
            <MousePointer2 className="h-4 w-4" /> Tıkla
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-45" disabled={!hasAsset} onClick={onReset}>
            <Eraser className="h-4 w-4" /> Sıfırla
          </button>
          <div className="rounded-md bg-white px-3 py-2 text-center text-sm text-slate-600">{regionCount} alan</div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-45" disabled={!hasAsset} onClick={onDownloadSvg}>
            <Download className="h-4 w-4" /> SVG
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-45" disabled={!hasAsset} onClick={onDownloadPng}>
            <Download className="h-4 w-4" /> PNG
          </button>
        </div>
      </div>
    </aside>
  );
}
