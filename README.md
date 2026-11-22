# FrameDrop

A responsive static website for checking video-link formats across supported platforms. FrameDrop does not currently download or process videos.

## Run locally

Requires Node.js. From this directory, run:

```powershell
node preview-server.js
```

Open `http://127.0.0.1:8765/`.

## Deploy

The GitHub Actions workflow in `.github/workflows/pages.yml` deploys the site to GitHub Pages when changes are pushed to `main`.
