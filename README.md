# Logo Fill

[Türkçe](#türkçe) | [English](#english)

## Türkçe

Logo Fill, siyah konturlardan oluşan SVG logo dosyalarının kapalı iç alanlarını tarayıcı içinde seçilen renkle dolduran React + Vite + TypeScript uygulamasıdır.

Uygulama backend kullanmaz. SVG dosyasını canvas üzerinde analiz eder, koyu pikselleri sınır olarak algılar, flood fill algoritmasıyla dış alanı ayırır ve kapalı bölgeleri boya kovası mantığıyla doldurur. Sonuç SVG veya şeffaf arka planlı PNG olarak indirilebilir.

### Özellikler

- SVG dosyası yükleme veya drag & drop ile bırakma
- Yüklenen SVG için önce / sonra önizleme
- Dolgu rengi seçme
- Kontur rengini değiştirme
- Konturu gösterme veya tamamen kaldırma
- Gap tolerance ile küçük çizgi açıklıklarını kapatma
- Threshold ayarı ile koyu piksel algısını kontrol etme
- Minimum alan filtresi ile küçük bölgeleri yok sayma
- Analiz kalitesi ayarı ile daha pürüzsüz çapraz kenarlar
- Tüm kapalı alanları tek tıkla doldurma
- Önizleme üzerinde tıklanan alanı seçerek doldurma
- SVG export
- PNG export

### Kurulum

Projeyi klonladıktan veya indirdikten sonra bağımlılıkları kur:

```bash
npm install
```

Geliştirme sunucusunu başlat:

```bash
npm run dev
```

Terminalde görünen localhost adresini tarayıcıda aç.

### Kullanım

1. Sol paneldeki yükleme alanına bir SVG dosyası bırak veya dosya seç.
2. Dolgu rengini seç.
3. Gerekirse kontur rengini değiştir.
4. Kontursuz çıktı almak istiyorsan `Konturu göster` seçeneğini kapat.
5. Çizgiler arasında küçük açıklıklar varsa `Gap tolerance` değerini artır.
6. Kenarlar pikselli görünüyorsa `Analiz kalitesi` değerini yükselt.
7. Tüm kapalı alanları doldurmak için `Tümünü doldur` butonuna bas.
8. Sadece belirli bir alanı doldurmak için `Tıkla` modunu aç ve önizleme üzerinde alan seç.
9. Sonucu `SVG` veya `PNG` butonuyla indir.

### Teknik Özet

- SVG dosyası `FileReader` ile okunur.
- SVG içeriği `DOMParser` ile parse edilir.
- ViewBox değeri korunur.
- SVG yüksek çözünürlüklü offscreen canvas'a render edilir.
- Alpha ve RGB threshold değerlerine göre boundary mask oluşturulur.
- Gap tolerance için boundary mask genişletilir.
- Kenarlardan flood fill yapılarak dış alan bulunur.
- Dış alan dışında kalan bağlı bileşenler doldurulabilir region olarak kaydedilir.
- Region maskelerinden SVG path üretilir.
- Path sadeleştirme için Ramer-Douglas-Peucker algoritması kullanılır.

### Proje Yapısı

```text
src/
  App.tsx
  components/
    Controls.tsx
    PreviewCanvas.tsx
    UploadPanel.tsx
  lib/
    contourTrace.ts
    exportPng.ts
    exportSvg.ts
    floodFill.ts
    maskUtils.ts
    svgRenderer.ts
  types.ts
```

### Komutlar

```bash
npm install
npm run dev
npm run build
```

### Notlar

Bu araç özellikle Canva gibi tasarım araçlarından sadece çizgi/kontur olarak dışa aktarılmış SVG logolar için tasarlanmıştır. En iyi sonuç için SVG'deki kapalı alanların görsel olarak gerçekten kapalı olması gerekir. Küçük açıklıklar `Gap tolerance` ile tolere edilebilir.

## English

Logo Fill is a React + Vite + TypeScript application that fills closed inner areas of SVG logo files made from black outlines, directly in the browser.

The app does not use a backend. It analyzes the SVG on a canvas, treats dark pixels as boundaries, separates the outside area with a flood fill algorithm, and fills closed regions with a paint-bucket style workflow. The result can be downloaded as SVG or as a transparent PNG.

### Features

- Upload SVG files or drop them with drag & drop
- Before / after preview for the uploaded SVG
- Fill color picker
- Stroke color customization
- Option to show or completely remove contours
- Gap tolerance for closing tiny breaks between lines
- Threshold control for dark-pixel detection
- Minimum area filter to ignore tiny regions
- Analysis quality control for smoother diagonal edges
- Fill all closed areas with one click
- Click a region in the preview to fill only that area
- SVG export
- PNG export

### Installation

After cloning or downloading the project, install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the localhost URL shown in the terminal.

### Usage

1. Drop an SVG file into the upload area in the left panel or select a file manually.
2. Choose the fill color.
3. Change the contour color if needed.
4. Turn off `Konturu göster` / `Show contours` if you want an output without contours.
5. Increase `Gap tolerance` if there are small breaks between lines.
6. Increase `Analiz kalitesi` / `Analysis quality` if edges look pixelated.
7. Click `Tümünü doldur` / `Fill all` to fill every closed area.
8. Enable click mode and select an area in the preview to fill only specific regions.
9. Download the result with the `SVG` or `PNG` button.

### Technical Overview

- The SVG file is read with `FileReader`.
- SVG content is parsed with `DOMParser`.
- The original ViewBox is preserved.
- The SVG is rendered to a high-resolution offscreen canvas.
- A boundary mask is created from alpha and RGB threshold values.
- The boundary mask is expanded according to the gap tolerance.
- Flood fill from the canvas edges detects the outside area.
- Connected components outside the exterior area are saved as fillable regions.
- SVG paths are generated from region masks.
- Paths are simplified with the Ramer-Douglas-Peucker algorithm.

### Project Structure

```text
src/
  App.tsx
  components/
    Controls.tsx
    PreviewCanvas.tsx
    UploadPanel.tsx
  lib/
    contourTrace.ts
    exportPng.ts
    exportSvg.ts
    floodFill.ts
    maskUtils.ts
    svgRenderer.ts
  types.ts
```

### Commands

```bash
npm install
npm run dev
npm run build
```

### Notes

This tool is designed especially for SVG logos exported as line or contour artwork from design tools like Canva. For the best result, the closed areas in the SVG should be visually closed. Small openings can be tolerated with `Gap tolerance`.
