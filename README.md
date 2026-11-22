# FrameDrop

A responsive video-link website with a Node.js API. The API only streams eligible media from the connected user's own Facebook or Instagram account when Meta's official API returns a file URL. It does not scrape platforms or download other users' videos.

## Run locally

Requires Node.js 22 or later. Run the website preview and API in separate terminals:

```powershell
node preview-server.js
```

Open `http://127.0.0.1:8765/`.

```powershell
npm start
```

The API listens on `http://127.0.0.1:3000`. To run backend tests:

```powershell
npm test
```

## Deploy

The GitHub Actions workflow in `.github/workflows/pages.yml` deploys the site to GitHub Pages when changes are pushed to `main`.
The repository's Pages source must be set to **GitHub Actions** in **Settings > Pages**.

The Render Blueprint in `render.yaml` describes the backend service. Create a Meta developer app with Facebook Login and Instagram API access, then provide `META_APP_ID` and `META_APP_SECRET` in Render. Register the callback URL shown by the Blueprint in that app. Meta may require app review for the `user_videos` and `instagram_business_basic` permissions.

The checked-in `api-config.js` is intentionally blank until the Render service is deployed. Then set its public URL in that file and push the change. The backend keeps OAuth tokens and session data in process memory; users must reconnect after a service restart. Configure a persistent store before scaling to multiple instances.
