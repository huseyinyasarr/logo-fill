export type ViewBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type SvgAsset = {
  text: string;
  name: string;
  viewBox: ViewBox;
  width: number;
  height: number;
};

export type AnalysisSettings = {
  fillColor: string;
  strokeColor: string;
  showContours: boolean;
  renderScale: number;
  gapTolerance: number;
  threshold: number;
  minArea: number;
};

export type Region = {
  id: number;
  pixelCount: number;
  bbox: { x: number; y: number; width: number; height: number };
  seed: { x: number; y: number };
  pathData: string;
};

export type AnalysisResult = {
  width: number;
  height: number;
  boundary: Uint8Array;
  fillable: Uint8Array;
  labels: Int32Array;
  regions: Region[];
};

export type FillMode = 'all' | 'click';
