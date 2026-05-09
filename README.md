# Recipe Lab

A mobile-first PWA for photographers to browse, compare, and export Leica-inspired Fujifilm in-camera recipe settings. Runs entirely from a local server — no build step, no external dependencies.

## Running locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

No bundler, no compilation. Edit any file and refresh.

## Installing as a PWA (iOS Safari)

1. Start the server on your Mac
2. Find your Mac's local IP: `ipconfig getifaddr en0`
3. On iPhone, open Safari → `http://[YOUR_IP]:8000`
4. Tap Share → Add to Home Screen

The app must be served from the local server — both Mac and iPhone need to be on the same Wi-Fi network. Safari shows an install nudge automatically on first visit.

## Features

### Library

- **Presets** — 8 Leica-inspired recipes (M10 High Contrast, Vintage Summicron, M-Reporter, etc.)
- **Film matcher** — 10 classic film stock emulations (Portra 400, Tri-X, Kodachrome 64, Velvia 50, etc.)
- **Smart sort** — compatible recipes appear first; incompatible ones are grouped below an "extended library" divider at reduced opacity
- **Hardware filtering** — incompatible settings are highlighted in the recipe card, with sensor-specific fallback suggestions (e.g. "→ try Monochrome" when Acros is unavailable on X-Trans II)
- **DR/ISO guidance** — minimum ISO requirements shown inline when DR200/DR400 is selected

### Recipe card

- Full settings display: Film Simulation, Dynamic Range, WB Shift, Highlight/Shadow Tone, Color, Sharpness, Noise Reduction, Grain, Color Chrome FX Blue
- **Educational annotations** — tap the ⓘ badge next to any setting to read why that value was chosen; annotations adapt to your selected camera (e.g. fallback copy when a setting is incompatible)
- **Visual preview** — upload a photo to see a CSS filter approximation of the recipe applied live
- **Copy settings** — copies the full recipe to clipboard, with a 10ms haptic pulse on success
- **Share** — generates a deep-link URL (`#recipe/key`) via the Web Share API, with clipboard fallback
- **Tweak** — open an edit form to adjust any mutable setting and save it as a named variation

### My Variations

Personal recipe variants saved to `localStorage`. Each variation stores a full snapshot of the tweaked settings. The Variations tab uses the same Smart Sort as the main library — compatible first, sorted by recency.

### Compare

Pick up to 4 recipes side-by-side. Differing values are highlighted. Add a reference photo to compare filter renderings.

### History

Recently viewed recipes (up to 20 unique entries), including variations. Persists between sessions.

### Theming

Light / Auto / Dark toggle in the header. Auto follows the system preference. Selection is persisted in `localStorage`.

## What gets stored locally

| Storage | Data |
|---------|------|
| `localStorage` | Camera selection, theme, recipe history, recently used, user variations |
| `IndexedDB` | Reference image for the Compare tab (persists between sessions) |

Nothing leaves your device.

## Browser support

- **iOS Safari 15+** — full feature set including Web Share, haptics, PWA install
- **Chrome / Edge 90+** — full feature set
- **Firefox 88+** — functional; Web Share falls back to clipboard

Requires: Service Worker, Clipboard API, localStorage, IndexedDB.

## Troubleshooting

**App not loading** — access via `http://localhost:8000`, not by opening `index.html` directly as a file.

**Service Worker not updating** — hard-refresh (`⌘⌥R` in Safari) or clear site data: Safari → Settings → Advanced → Website Data.

**Annotations not showing** — select a camera first; annotations that include ISO thresholds require a camera to be chosen.

## License

MIT