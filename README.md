# Logo Fill

Logo Fill, siyah konturlardan oluşan SVG logo dosyalarının kapalı iç alanlarını tarayıcı içinde seçilen renkle dolduran React + Vite + TypeScript uygulamasıdır.

Uygulama backend kullanmaz. SVG dosyasını canvas üzerinde analiz eder, koyu pikselleri sınır olarak algılar, flood fill algoritmasıyla dış alanı ayırır ve kapalı bölgeleri boya kovası mantığıyla doldurur. Sonuç SVG veya şeffaf arka planlı PNG olarak indirilebilir.

## Özellikler

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

## Kurulum

Projeyi klonladıktan veya indirdikten sonra bağımlılıkları kur:

```bash
npm install
```

Geliştirme sunucusunu başlat:

```bash
npm run dev
```

Terminalde görünen localhost adresini tarayıcıda aç.

## Production Build

Projeyi production için derlemek:

```bash
npm run build
```

Derlenmiş dosyalar `dist` klasörüne oluşturulur.

## Kullanım

1. Sol paneldeki yükleme alanına bir SVG dosyası bırak veya dosya seç.
2. Dolgu rengini seç.
3. Gerekirse kontur rengini değiştir.
4. Kontursuz çıktı almak istiyorsan `Konturu göster` seçeneğini kapat.
5. Çizgiler arasında küçük açıklıklar varsa `Gap tolerance` değerini artır.
6. Kenarlar pikselli görünüyorsa `Analiz kalitesi` değerini yükselt.
7. Tüm kapalı alanları doldurmak için `Tümünü doldur` butonuna bas.
8. Sadece belirli bir alanı doldurmak için `Tıkla` modunu aç ve önizleme üzerinde alan seç.
9. Sonucu `SVG` veya `PNG` butonuyla indir.

## Teknik Özet

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

## Proje Yapısı

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

## Komutlar

```bash
npm install
npm run dev
npm run build
```

## Notlar

Bu araç özellikle Canva gibi tasarım araçlarından sadece çizgi/kontur olarak dışa aktarılmış SVG logolar için tasarlanmıştır. En iyi sonuç için SVG'deki kapalı alanların görsel olarak gerçekten kapalı olması gerekir. Küçük açıklıklar `Gap tolerance` ile tolere edilebilir.
