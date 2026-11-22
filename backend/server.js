const crypto = require("node:crypto");
const http = require("node:http");
const { pipeline } = require("node:stream/promises");
const { Readable } = require("node:stream");

const SESSION_TTL_MS = 60 * 60 * 1000;
const OAUTH_CODE_TTL_MS = 5 * 60 * 1000;
const PLATFORM_DOMAINS = {
  facebook: ["facebook.com", "fb.watch"],
  instagram: ["instagram.com"]
};
const MEDIA_CDN_DOMAINS = ["fbcdn.net", "cdninstagram.com"];
const RATE_LIMITS = new Map();
const OAUTH_CODES = new Map();
const OAUTH_STATES = new Map();
const SESSIONS = new Map();

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function json(response, status, value, headers = {}) {
  response.writeHead(status, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    ...headers
  });
  response.end(JSON.stringify(value));
}

function isHost(hostname, domains) {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  return domains.some(domain => host === domain || host.endsWith(`.${domain}`));
}

function validVideoUrl(value, provider) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new HttpError(400, "Enter a valid video URL.");
  }
  if (url.protocol !== "https:" || url.username || url.password || !isHost(url.hostname, PLATFORM_DOMAINS[provider] || [])) {
    throw new HttpError(400, `Enter a valid HTTPS ${provider} video URL.`);
  }
  return url;
}

function normalizePermalink(value, provider) {
  let url;
  try {
    url = new URL(value);
  } catch {
    return "";
  }
  if (!isHost(url.hostname, PLATFORM_DOMAINS[provider] || [])) return "";
  const host = provider === "facebook" ? "facebook.com" : "instagram.com";
  return `${host}${url.pathname.replace(/\/+$/, "")}`;
}

function facebookVideoId(url) {
  const queryId = url.searchParams.get("v");
  if (queryId && /^\d+$/.test(queryId)) return queryId;
  const match = url.pathname.match(/\/(?:videos|reel|share\/v)\/(\d+)/);
  return match ? match[1] : "";
}

function trustedMediaUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  return url.protocol === "https:" && !url.username && !url.password && isHost(url.hostname, MEDIA_CDN_DOMAINS);
}

function parseCookies(request) {
  return Object.fromEntries((request.headers.cookie || "").split(";").map(part => {
    const separator = part.indexOf("=");
    if (separator < 0) return ["", ""];
    return [part.slice(0, separator).trim(), part.slice(separator + 1).trim()];
  }).filter(([name]) => name));
}

function sameSecret(left, right) {
  if (typeof left !== "string" || typeof right !== "string") return false;
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function providerConfig(provider, env) {
  if (!["facebook", "instagram"].includes(provider)) {
    throw new HttpError(400, "Downloads are available only for connected Facebook or Instagram accounts.");
  }
  if (!env.META_APP_ID || !env.META_APP_SECRET || !env.META_REDIRECT_URI) {
    throw new HttpError(503, "The Meta app is not configured on the backend yet.");
  }
  return {
    appId: env.META_APP_ID,
    appSecret: env.META_APP_SECRET,
    redirectUri: env.META_REDIRECT_URI,
    graphVersion: env.META_GRAPH_VERSION || "v27.0"
  };
}

function frontendLocation(env, provider, fragment) {
  const origin = env.FRONTEND_ORIGIN;
  if (!origin) throw new HttpError(503, "The frontend origin is not configured.");
  const basePath = `/${(env.FRONTEND_BASE_PATH || "/all-video-downloader").replace(/^\/+|\/+$/g, "")}/`;
  const page = provider === "instagram" ? "instagram-video-downloader/" : "facebook-video-downloader/";
  return `${origin.replace(/\/+$/, "")}${basePath}${page}#${fragment}`;
}

function applyCors(request, response, env) {
  const origin = request.headers.origin;
  const allowed = new Set([
    env.FRONTEND_ORIGIN,
    "http://127.0.0.1:8765",
    "http://localhost:8765"
  ].filter(Boolean));
  if (origin && !allowed.has(origin)) return false;
  if (origin) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
  }
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  response.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
  response.setHeader("Access-Control-Max-Age", "600");
  return true;
}

function pruneExpiringEntries() {
  const now = Date.now();
  for (const [key, value] of OAUTH_STATES) if (value.expiresAt <= now) OAUTH_STATES.delete(key);
  for (const [key, value] of OAUTH_CODES) if (value.expiresAt <= now) OAUTH_CODES.delete(key);
  for (const [key, value] of SESSIONS) if (value.expiresAt <= now) SESSIONS.delete(key);
  for (const [key, value] of RATE_LIMITS) if (now - value.start > 10 * 60 * 1000) RATE_LIMITS.delete(key);
}

function rateLimit(request, key, maximum, windowMs) {
  const now = Date.now();
  const client = request.headers["x-forwarded-for"]?.split(",").pop().trim() || request.socket.remoteAddress || "unknown";
  const bucketKey = `${key}:${client}`;
  const bucket = RATE_LIMITS.get(bucketKey);
  if (!bucket || now - bucket.start >= windowMs) {
    RATE_LIMITS.set(bucketKey, { start: now, count: 1 });
    return;
  }
  bucket.count += 1;
  if (bucket.count > maximum) throw new HttpError(429, "Too many requests. Please try again later.");
}

async function readJson(request, maxBytes = 16 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBytes) throw new HttpError(413, "Request body is too large.");
    chunks.push(chunk);
  }
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected an object");
    return value;
  } catch {
    throw new HttpError(400, "Request body must be valid JSON.");
  }
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(20_000)
  });
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new HttpError(502, "The platform returned an invalid response.");
  }
  if (!response.ok || data.error) {
    throw new HttpError(502, "The platform API could not complete this request. Check the connected account and its permissions.");
  }
  return data;
}

async function exchangeMetaCode(provider, code, env) {
  const config = providerConfig(provider, env);
  let tokenData;
  if (provider === "instagram") {
    const body = new URLSearchParams({
      client_id: config.appId,
      client_secret: config.appSecret,
      grant_type: "authorization_code",
      redirect_uri: config.redirectUri,
      code
    });
    tokenData = await fetchJson("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });
    const longLivedUrl = new URL("https://graph.instagram.com/access_token");
    longLivedUrl.search = new URLSearchParams({
      grant_type: "ig_exchange_token",
      client_secret: config.appSecret,
      access_token: tokenData.access_token
    });
    tokenData = await fetchJson(longLivedUrl);
  } else {
    const tokenUrl = new URL(`https://graph.facebook.com/${config.graphVersion}/oauth/access_token`);
    tokenUrl.search = new URLSearchParams({
      client_id: config.appId,
      client_secret: config.appSecret,
      redirect_uri: config.redirectUri,
      code
    });
    tokenData = await fetchJson(tokenUrl);

    const longLivedUrl = new URL(`https://graph.facebook.com/${config.graphVersion}/oauth/access_token`);
    longLivedUrl.search = new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: config.appId,
      client_secret: config.appSecret,
      fb_exchange_token: tokenData.access_token
    });
    tokenData = await fetchJson(longLivedUrl);
  }
  if (typeof tokenData.access_token !== "string") {
    throw new HttpError(502, "The platform did not return an access token.");
  }
  return {
    accessToken: tokenData.access_token,
    expiresAt: Date.now() + (Number(tokenData.expires_in) || 3600) * 1000
  };
}

function getSession(request) {
  const authorization = request.headers.authorization || "";
  const match = authorization.match(/^Bearer ([A-Za-z0-9_-]{40,64})$/);
  if (!match) throw new HttpError(401, "Connect your Facebook or Instagram account first.");
  const session = SESSIONS.get(match[1]);
  if (!session || session.expiresAt <= Date.now()) {
    SESSIONS.delete(match[1]);
    throw new HttpError(401, "Your account connection expired. Please reconnect.");
  }
  return { id: match[1], ...session };
}

async function getOwnedMedia(provider, accessToken, inputUrl, env) {
  const config = providerConfig(provider, env);
  const authorization = { Authorization: `Bearer ${accessToken}` };
  let media;

  if (provider === "instagram") {
    const endpoint = new URL(`https://graph.instagram.com/${config.graphVersion}/me/media`);
    endpoint.search = new URLSearchParams({
      fields: "id,media_type,media_url,permalink,timestamp",
      limit: "100"
    });
    const result = await fetchJson(endpoint, { headers: authorization });
    media = (result.data || []).find(item =>
      item.media_type === "VIDEO" &&
      normalizePermalink(item.permalink, provider) === normalizePermalink(inputUrl.href, provider)
    );
    if (!media) throw new HttpError(404, "This video was not found among the connected Instagram account’s own media.");
    if (!media.media_url) {
      throw new HttpError(403, "Instagram did not provide a media URL for this video. It may have restricted or copyrighted audio.");
    }
    return { id: media.id, url: media.media_url };
  }

  const inputId = facebookVideoId(inputUrl);
  const endpoint = new URL(`https://graph.facebook.com/${config.graphVersion}/me/videos`);
  endpoint.search = new URLSearchParams({
    fields: "id,from{id},source,permalink_url",
    limit: "100"
  });
  const result = await fetchJson(endpoint, { headers: authorization });
  const me = await fetchJson(`https://graph.facebook.com/${config.graphVersion}/me?fields=id`, { headers: authorization });
  media = (result.data || []).find(item => {
    if (!item.id || !item.from || item.from.id !== me.id) return false;
    return inputId
      ? item.id === inputId
      : normalizePermalink(item.permalink_url, provider) === normalizePermalink(inputUrl.href, provider);
  });
  if (!media) throw new HttpError(404, "This video was not found among the connected Facebook account’s own uploads.");
  if (!media.source) throw new HttpError(403, "Facebook did not provide a source URL for this video.");
  return { id: media.id, url: media.source };
}

async function fetchMediaStream(value) {
  let url = value;
  for (let redirects = 0; redirects <= 3; redirects += 1) {
    if (!trustedMediaUrl(url)) throw new HttpError(502, "The platform returned an unexpected media host.");
    const response = await fetch(url, {
      redirect: "manual",
      headers: { "User-Agent": "FrameDrop/1.0" },
      signal: AbortSignal.timeout(120_000)
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      await response.body?.cancel();
      if (!location || redirects === 3) throw new HttpError(502, "The media server redirected too many times.");
      url = new URL(location, url).href;
      continue;
    }
    if (!response.ok || !response.body) {
      await response.body?.cancel();
      throw new HttpError(502, "The platform media server could not provide this video.");
    }
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().startsWith("video/")) {
      await response.body.cancel();
      throw new HttpError(502, "The platform media URL did not return a video file.");
    }
    return response;
  }
  throw new HttpError(502, "The media server redirected too many times.");
}

function createServer(env = process.env) {
  return http.createServer(async (request, response) => {
    try {
      pruneExpiringEntries();
      if (!applyCors(request, response, env)) {
        json(response, 403, { error: "This origin is not allowed." });
        return;
      }
      if (request.method === "OPTIONS") {
        response.writeHead(204);
        response.end();
        return;
      }
      const url = new URL(request.url, "http://localhost");

      if (request.method === "GET" && url.pathname === "/health") {
        json(response, 200, { status: "ok" });
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/platforms") {
        const metaConfigured = Boolean(env.META_APP_ID && env.META_APP_SECRET && env.META_REDIRECT_URI);
        json(response, 200, {
          platforms: [
            { id: "facebook", download: metaConfigured, accountOwnedOnly: true },
            { id: "instagram", download: metaConfigured, accountOwnedOnly: true },
            { id: "pinterest", download: false, reason: "No official file-download integration is configured." },
            { id: "tiktok", download: false, reason: "The official API provides video details and embeds, not video-file downloads." },
            { id: "youtube", download: false, reason: "The official API does not provide video-file downloads." },
            { id: "twitter", download: false, reason: "No official file-download integration is configured." }
          ]
        });
        return;
      }

      if (request.method === "GET" && url.pathname === "/auth/meta/start") {
        rateLimit(request, "oauth", 10, 60_000);
        const provider = url.searchParams.get("provider");
        const config = providerConfig(provider, env);
        const state = crypto.randomBytes(32).toString("base64url");
        OAUTH_STATES.set(state, { provider, expiresAt: Date.now() + 10 * 60 * 1000 });
        const secure = config.redirectUri.startsWith("https://") ? "; Secure" : "";
        response.setHeader("Set-Cookie", `framedrop_oauth_state=${state}; Path=/auth/meta/callback; HttpOnly; SameSite=Lax; Max-Age=600${secure}`);
        const authorizationUrl = provider === "instagram"
          ? new URL("https://www.instagram.com/oauth/authorize")
          : new URL(`https://www.facebook.com/${config.graphVersion}/dialog/oauth`);
        authorizationUrl.search = new URLSearchParams({
          client_id: config.appId,
          redirect_uri: config.redirectUri,
          response_type: "code",
          scope: provider === "instagram" ? "instagram_business_basic" : "user_videos",
          state
        });
        response.writeHead(302, { Location: authorizationUrl.href, "Cache-Control": "no-store" });
        response.end();
        return;
      }

      if (request.method === "GET" && url.pathname === "/auth/meta/callback") {
        const stateCookie = parseCookies(request).framedrop_oauth_state;
        const state = url.searchParams.get("state");
        const oauthState = state ? OAUTH_STATES.get(state) : null;
        const provider = oauthState?.provider || "facebook";
        const clearCookie = "framedrop_oauth_state=; Path=/auth/meta/callback; HttpOnly; SameSite=Lax; Max-Age=0; Secure";
        OAUTH_STATES.delete(state);
        if (!oauthState || oauthState.expiresAt <= Date.now() || !sameSecret(stateCookie, state)) {
          response.writeHead(302, {
            Location: frontendLocation(env, provider, "oauth_error=invalid_state"),
            "Set-Cookie": clearCookie,
            "Cache-Control": "no-store"
          });
          response.end();
          return;
        }
        if (url.searchParams.has("error")) {
          response.writeHead(302, {
            Location: frontendLocation(env, provider, "oauth_error=denied"),
            "Set-Cookie": clearCookie,
            "Cache-Control": "no-store"
          });
          response.end();
          return;
        }
        providerConfig(provider, env);
        const code = url.searchParams.get("code");
        if (!code || code.length > 4096) throw new HttpError(400, "The platform did not return an authorization code.");
        const token = await exchangeMetaCode(provider, code, env);
        const oneTimeCode = crypto.randomBytes(32).toString("base64url");
        OAUTH_CODES.set(oneTimeCode, {
          provider,
          accessToken: token.accessToken,
          tokenExpiresAt: token.expiresAt,
          expiresAt: Date.now() + OAUTH_CODE_TTL_MS
        });
        response.writeHead(302, {
          Location: frontendLocation(env, provider, `auth_code=${oneTimeCode}`),
          "Set-Cookie": clearCookie,
          "Cache-Control": "no-store"
        });
        response.end();
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/auth/exchange") {
        rateLimit(request, "exchange", 20, 60_000);
        const body = await readJson(request);
        const code = typeof body.code === "string" ? body.code : "";
        const pending = OAUTH_CODES.get(code);
        OAUTH_CODES.delete(code);
        if (!pending || pending.expiresAt <= Date.now()) throw new HttpError(401, "The sign-in code expired. Connect your account again.");
        const sessionToken = crypto.randomBytes(32).toString("base64url");
        SESSIONS.set(sessionToken, {
          provider: pending.provider,
          accessToken: pending.accessToken,
          expiresAt: Math.min(pending.tokenExpiresAt, Date.now() + SESSION_TTL_MS)
        });
        json(response, 200, {
          sessionToken,
          provider: pending.provider,
          expiresAt: SESSIONS.get(sessionToken).expiresAt
        });
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/me") {
        const session = getSession(request);
        json(response, 200, { connected: true, provider: session.provider, expiresAt: session.expiresAt });
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/logout") {
        const session = getSession(request);
        SESSIONS.delete(session.id);
        json(response, 200, { connected: false });
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/download") {
        rateLimit(request, "download", 12, 60_000);
        const session = getSession(request);
        const body = await readJson(request);
        if (body.provider !== session.provider) throw new HttpError(403, "Connect the account for this platform before downloading.");
        const inputUrl = validVideoUrl(body.url, session.provider);
        const media = await getOwnedMedia(session.provider, session.accessToken, inputUrl, env);
        if (!trustedMediaUrl(media.url)) throw new HttpError(502, "The platform returned an unexpected media host.");
        const upstream = await fetchMediaStream(media.url);
        const safeId = String(media.id).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80) || "video";
        response.writeHead(200, {
          "Cache-Control": "no-store",
          "Content-Disposition": `attachment; filename="framedrop-${session.provider}-${safeId}.mp4"`,
          "Content-Type": upstream.headers.get("content-type"),
          "X-Content-Type-Options": "nosniff"
        });
        await pipeline(Readable.fromWeb(upstream.body), response);
        return;
      }

      json(response, 404, { error: "API route not found." });
    } catch (error) {
      if (response.headersSent) {
        response.destroy(error);
        return;
      }
      const status = error instanceof HttpError ? error.status : 500;
      if (status >= 500) console.error("FrameDrop API request failed:", error.message);
      json(response, status, {
        error: error instanceof HttpError ? error.message : "The backend could not complete this request."
      });
    }
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  createServer().listen(port, "0.0.0.0", () => {
    console.log(`FrameDrop API listening on port ${port}`);
  });
}

module.exports = {
  createServer,
  facebookVideoId,
  isHost,
  normalizePermalink,
  trustedMediaUrl,
  validVideoUrl
};
