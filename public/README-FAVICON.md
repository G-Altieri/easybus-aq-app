Generare favicon (bus-logo.ico)

Questo progetto contiene `bus-logo.svg` nella cartella `public/`.
Per creare un vero file `bus-logo.ico` usa uno dei seguenti metodi sul tuo computer.

1) Usando ImageMagick (installato come `magick`):

```powershell
magick convert public/bus-logo.svg -resize 64x64 public/bus-logo.ico
```

2) Genera PNG e poi convertili in ICO (meglio per compatibilità):

```powershell
magick convert public/bus-logo.svg -resize 192x192 public/icon-192x192.png
magick convert public/bus-logo.svg -resize 512x512 public/icon-512x512.png
magick convert public/icon-192x192.png public/icon-512x512.png public/bus-logo.ico
```

3) Usando `sharp` e `png-to-ico` via Node (se preferisci npm):

```powershell
# installa i tool (una tantum)
npm install --save-dev sharp png-to-ico

# genera PNG e poi ICO
npx sharp public/bus-logo.svg -resize 64 64 public/bus-logo.png
npx png-to-ico public/bus-logo.png > public/bus-logo.ico
```

Sostituisci il placeholder con il file generato. I browser moderni possono anche usare direttamente `bus-logo.svg` come favicon, ma alcuni ambienti richiedono un `.ico` raster per la massima compatibilità.
