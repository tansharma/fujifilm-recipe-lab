# Recipe Lab

A mobile-first PWA for photographers to browse, compare, and export Leica-inspired Fujifilm in-camera recipe settings.

## Running locally

No build step required. Start any local HTTP server from the project root:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Installing as a PWA (iOS)

1. Start the server on your Mac
2. Ensure your iPhone is connected to the same Wi-Fi network as your Mac
3. Find your Mac's local IP address on the same network (on macOS, run `ipconfig getifaddr en0` for Wi-Fi or `ipconfig getifaddr en1` for Ethernet)
4. On your iPhone, open Safari and navigate to `http://[YOUR_IP]:8000`
5. Tap Share → Add to Home Screen

## Usage

1. Select your Fujifilm camera from the dropdown
2. Browse **Presets** (Leica-inspired looks) or **Film matcher** (classic film stock emulations)
3. Tap a recipe to view its full settings
4. Use **Compare** to pick up to 4 recipes and see their settings side-by-side in a table — differing values are highlighted
5. Tap **Copy settings** to copy a recipe to your clipboard

## What gets stored locally

- Your camera selection
- Recipe viewing and export history (last 100 items)
- Recently used recipes (up to 10)

All data is stored in `localStorage` and never leaves your device.

## Browser support

- Safari 15+ / iOS 15+
- Chrome / Edge 90+
- Firefox 88+

Requires: Service Worker, Clipboard API, localStorage

## Troubleshooting

**App not loading** — make sure the server is running and you're accessing it over HTTP (not opening `index.html` directly as a file).

**Service Worker not updating** — hard-refresh your browser or clear site data to pick up the latest cached version.

## License

MIT
