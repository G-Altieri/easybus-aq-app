# EasyBusAq - Progressive Web App 📱

EasyBusAq è un'applicazione per pianificare i percorsi in autobus a L'Aquila, costruita con Next.js, ShadcnUI e funzionalità PWA per un'esperienza mobile ottimale.

## 🚀 Caratteristiche

### PWA (Progressive Web App)
- **Installabile**: L'app può essere installata su smartphone Android e iOS
- **Offline**: Funziona anche senza connessione internet (service worker)
- **Mobile-first**: Ottimizzata per dispositivi mobili
- **App nativa**: Esperienza simile a un'app nativa

### ShadcnUI Components
- ✅ Button, Card, Input, Label, Textarea
- ✅ Select, Dropdown Menu, Dialog, Sheet
- ✅ Navigation Menu, Avatar, Badge
- ✅ Form, Table, Tabs, Alert
- ✅ Toast notifications (Sonner)

### Funzionalità App
-- � Pianificatore mezzi pubblici per L'Aquila
  - Selezione direzione Casa ↔ Università
  - Orario automatico (corrente) o personalizzato
  - Integrazione API L'Aquila trasporti
  - Visualizzazione dettagliata di tutti i percorsi disponibili
  - Selezione direzione Casa ↔ Università
  - Orario automatico (corrente) o personalizzato
  - Integrazione API L'Aquila trasporti
  - Visualizzazione dettagliata di tutti i percorsi disponibili
- �🔔 Notifiche push (in sviluppo)

## 🛠️ Installazione e Avvio

### Sviluppo
```bash
# Installa dipendenze
npm install

# Avvia server di sviluppo
npm run dev

# Apri http://localhost:3000
```

### Produzione
```bash
# Build per produzione
npm run build

# Avvia server produzione
npm start
```

## 📱 Come installare l'app sul telefono

### Android (Chrome)
1. Apri l'app in Chrome
2. Tocca il menu (⋮) in alto a destra
3. Seleziona "Aggiungi a schermata principale"
4. Conferma l'installazione

### iOS (Safari)
1. Apri l'app in Safari
2. Tocca il pulsante di condivisione (⬆️)
3. Scorri e tocca "Aggiungi a schermata principale"
4. Personalizza il nome e tocca "Aggiungi"

### Desktop (Chrome/Edge)
1. Apri l'app nel browser
2. Clicca sull'icona di installazione nella barra degli indirizzi
3. Conferma l'installazione

## 🚌 Funzionalità Mezzi Pubblici (EasyBusAq)

### Caratteristiche
- **Direzione bidirezionale**: Casa → Università o Università → Casa
- **Selezione multipla casa**:
  - **Casa 1**: `42.35706, 13.39041` (direzione Casa → Università)
  - **Casa 2**: `42.35836, 13.38643` (direzione Casa → Università)
  - **Casa Speciale**: `42.35916, 13.38143` (destinazione automatica Università → Casa)
- **Università**: `42.36780, 13.35246`
- **Modalità temporali**:
  - **Automatica**: Usa data e ora correnti
  - **Manuale**: Seleziona data e ora personalizzate
- **Integrazione API**: Trasporti L'Aquila (OpenDataLAquila)
- **Risultati dettagliati**:
  - Tutti i percorsi disponibili
  - Orari di partenza/arrivo
  - Durata totale e a piedi
  - Linee bus con fermate
  - Numero di cambi necessari

### Logica di selezione casa
- **Casa → Università**: Puoi scegliere tra Casa 1 o Casa 2
- **Università → Casa**: Utilizza automaticamente coordinate speciali (42.3592, 13.3814)

### Come usare
1. Clicca su "Mezzi" nella sezione Azioni Rapide
2. Seleziona la direzione del viaggio
3. Se vai da Casa → Università, scegli Casa 1 o Casa 2
4. Scegli se usare orario corrente o personalizzato
5. Premi "Cerca Mezzi" per ottenere tutti i percorsi

## 🎨 Personalizzazione ShadcnUI

### Aggiungere nuovi componenti
```bash
# Installa un nuovo componente
npx shadcn@latest add [component-name]

# Esempi:
npx shadcn@latest add calendar
npx shadcn@latest add datepicker
npx shadcn@latest add chart
```

### Temi disponibili
L'app utilizza il tema "Slate" di ShadcnUI. Per cambiare tema:
```bash
npx shadcn@latest init
# Seleziona un nuovo tema durante la configurazione
```

## 📁 Struttura del Progetto

```
easybusaq/
├── src/
│   ├── app/                 # App Router (Next.js 13+)
│   │   ├── layout.tsx       # Layout principale
│   │   ├── page.tsx         # Homepage
│   │   └── globals.css      # Stili globali
│   ├── components/
│   │   └── ui/              # Componenti ShadcnUI
│   └── lib/
│       └── utils.ts         # Utility functions
├── public/
│   ├── manifest.json        # PWA Manifest
│   ├── icon-192x192.png     # Icone PWA
│   └── icon-512x512.png
├── next.config.ts           # Configurazione Next.js + PWA
└── package.json
```

## 🔧 Configurazione PWA

### Manifest (public/manifest.json)
 - Nome app: "EasyBusAq"
- Modalità: "standalone" (app nativa)
- Orientamento: "portrait-primary"
- Icone: 192x192 e 512x512 pixel

### Service Worker
- Generato automaticamente da next-pwa
- Cache delle risorse statiche
- Funzionamento offline

## 🎯 Prossimi Sviluppi

- [ ] Notifiche push
- [ ] Sincronizzazione dati offline
- [ ] Calendario interattivo
- [ ] Chat gruppi studio
- [ ] Integrazione con sistemi universitari
- [ ] Dark mode migliorato
- [ ] Geolocalizzazione aule

## 💡 Note per lo Sviluppatore

### PWA Testing
- Usa Chrome DevTools > Application > Manifest
- Testa l'installazione su dispositivo reale
- Verifica il funzionamento offline

### ShadcnUI
- Tutti i componenti sono personalizzabili
- Usa le CSS variables per i temi
- Consulta la documentazione: https://ui.shadcn.com

### Performance
- L'app è ottimizzata per il mobile
- Lazy loading dei componenti
- Service worker per cache

---

**Sviluppato con ❤️ per studenti universitari**
