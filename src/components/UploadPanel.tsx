import { FileUp } from 'lucide-react';
import { useCallback, useState } from 'react';

type Props = {
  onSvgLoaded: (text: string, name: string) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
};

export function UploadPanel({ onSvgLoaded, onError, disabled }: Props) {
  const [dragging, setDragging] = useState(false);

  const readFile = useCallback(
    (file?: File) => {
      if (!file) return;
      if (!file.name.toLowerCase().endsWith('.svg')) {
        onError?.('Lütfen SVG dosyası seçin.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => onSvgLoaded(String(reader.result), file.name);
      reader.onerror = () => {
        onError?.('Dosya okunamadı.');
      };
      reader.readAsText(file);
    },
    [onSvgLoaded],
  );

  return (
    <label
      className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-5 text-center transition ${
        dragging ? 'border-cyan-500 bg-cyan-50' : 'border-slate-300 bg-white'
      } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        readFile(event.dataTransfer.files[0]);
      }}
    >
      <FileUp className="mb-3 h-7 w-7 text-cyan-700" aria-hidden />
      <span className="text-sm font-semibold text-slate-800">SVG yükle veya buraya bırak</span>
      <span className="mt-1 text-xs text-slate-500">Canva’dan siyah kontur olarak dışa aktarılmış SVG</span>
      <input
        className="sr-only"
        type="file"
        accept=".svg,image/svg+xml"
        onChange={(event) => readFile(event.target.files?.[0])}
      />
    </label>
  );
}
