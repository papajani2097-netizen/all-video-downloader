const platforms = [
  { slug: "facebook", name: "Facebook", label: "Facebook video downloader", domains: ["facebook.com", "fb.watch"], initials: "f" },
  { slug: "pinterest", name: "Pinterest", label: "Pinterest video downloader", domains: ["pinterest.com", "pin.it"], initials: "p" },
  { slug: "instagram", name: "Instagram", label: "Instagram video downloader", domains: ["instagram.com"], initials: "ig" },
  { slug: "tiktok", name: "TikTok", label: "TikTok video downloader", domains: ["tiktok.com"], initials: "tk" },
  { slug: "youtube", name: "YouTube", label: "YouTube video downloader", domains: ["youtube.com", "youtu.be"], initials: "yt" },
  { slug: "twitter", name: "Twitter / X", label: "Twitter video downloader", domains: ["twitter.com", "x.com"], initials: "x" }
];

const infoPages = {
  about: {
    title: "About FrameDrop",
    description: "FrameDrop is a clear, simple collection of video-link tools. Learn what the service does and how it treats downloads.",
    intro: "A simpler way to check a video link.",
    sections: [
      ["What FrameDrop is", "FrameDrop is a lightweight interface for identifying links from supported video platforms. We aim to make the experience straightforward, transparent, and easy to use on any device."],
      ["How it works", "The site recognizes supported link formats. Its optional Meta integration is limited to videos in the connected Facebook or Instagram account and downloads only when the official API provides a media URL."],
      ["Respect and responsibility", "Only access or save content when you have the right to do so and when it is permitted by the platform and applicable law. We do not claim affiliation with any third-party platform."]
    ]
  },
  contact: {
    title: "Contact us",
    description: "Get in touch with FrameDrop about support, feedback, or rights-related questions.",
    intro: "Questions, feedback, or a rights-related request? We’re happy to hear from you.",
    sections: [
      ["General inquiries", "A support contact address will be published here before the service launches."],
      ["Copyright and rights requests", "Please include the relevant page or content URL, a clear description of your concern, and a way to contact you. We’ll review complete requests as soon as reasonably possible."]
    ]
  },
  "privacy-policy": {
    title: "Privacy policy",
    description: "Read how FrameDrop handles information when you browse the site and use its video-link checker.",
    intro: "Your privacy matters. This page describes the limited information involved in using this site.",
    sections: [
      ["Information you enter", "The link checker identifies platform formats in your browser. If you request an eligible Facebook or Instagram download, the video URL is sent to the backend and compared with media returned for your connected account. The backend streams the media to you and does not intentionally store video files."],
      ["Account connection", "If you connect Facebook or Instagram, the platform issues an access token. The backend holds that token in temporary process memory, and this browser keeps a short-lived session token in session storage. Backend restarts clear its sessions; reconnect after a restart or expiration. Do not connect accounts you do not own or manage."],
      ["Technical information", "The GitHub Pages and Render hosting providers may process standard connection information, such as IP addresses and browser details, to deliver and secure the site. FrameDrop does not intentionally persist account tokens or downloaded videos."],
      ["Third-party services", "Links to third-party platforms are provided for convenience. Those services have their own privacy policies and practices."],
      ["Contact", "A privacy contact address will be published here before the service launches."]
    ]
  },
  terms: {
    title: "Terms of service",
    description: "Review the terms for using FrameDrop's video-link tools and website.",
    intro: "By using FrameDrop, you agree to use the site responsibly and in accordance with applicable laws.",
    sections: [
      ["The service", "FrameDrop recognizes supported link formats. If the Meta backend is configured, it may stream eligible videos from the connected Facebook or Instagram account when the official API provides a file URL. Other platform downloads are not supported."],
      ["Your responsibilities", "Connect only an account you own or manage. You are responsible for ensuring that each download is authorized and complies with applicable law and platform terms. Do not misuse or disrupt this website."],
      ["Availability and changes", "The website is provided as available and may change or be unavailable from time to time. No download or processing outcome is promised."],
      ["Contact", "A contact address for questions about these terms will be published here before the service launches."]
    ]
  },
  dmca: {
    title: "DMCA policy",
    description: "Learn how to submit a copyright or DMCA notice concerning content or links associated with FrameDrop.",
    intro: "FrameDrop respects intellectual property rights and reviews complete copyright notices in good faith.",
    sections: [
      ["Submitting a notice", "If you believe material associated with this website infringes your copyright, send a written notice identifying the copyrighted work, the relevant URL or material, your contact details, and a statement that you have a good-faith belief the use is not authorized."],
      ["Required statements", "Include a statement, under penalty of perjury, that your notice is accurate and that you are the rights owner or authorized to act on the owner’s behalf. Include your physical or electronic signature."],
      ["Where to send notices", "A designated address for complete notices will be published here before the service launches."],
      ["Important", "FrameDrop does not host video files long-term. Its optional backend can stream eligible, account-owned Facebook or Instagram media to the connected user. A notice about content hosted on a third-party platform should also be directed to that platform."]
    ]
  }
};

const pageMeta = {
  facebook: ["Free Facebook Video Downloader | FrameDrop", "Check whether a Facebook video link is recognized with FrameDrop's free online link tool."],
  pinterest: ["Free Pinterest Video Downloader | FrameDrop", "Check whether a Pinterest video link is recognized with FrameDrop's free online link tool."],
  instagram: ["Free Instagram Video Downloader | FrameDrop", "Check whether an Instagram video link is recognized with FrameDrop's free online link tool."],
  tiktok: ["Free TikTok Video Downloader | FrameDrop", "Check whether a TikTok video link is recognized with FrameDrop's free online link tool."],
  youtube: ["Free YouTube Video Downloader | FrameDrop", "Check whether a YouTube video link is recognized with FrameDrop's free online link tool."],
  twitter: ["Free Twitter Video Downloader | FrameDrop", "Check whether a Twitter or X video link is recognized with FrameDrop's free online link tool."]
};

const path = window.location.pathname.replace(/\/+$/, "").toLowerCase();
const route = path.split("/").filter(Boolean).pop() || "home";
const platformRoute = route.endsWith("-video-downloader") ? route.slice(0, -"-video-downloader".length) : route;
const platform = platforms.find(item => item.slug === platformRoute);
const info = infoPages[route];
const app = document.getElementById("app");
const siteBase = new URL(".", document.currentScript.src).pathname;
const siteUrl = path => `${siteBase}${path}`;
const configuredApiUrl = (window.FRAME_DROP_API_URL || "").replace(/\/+$/, "");
const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const apiBase = isLocalHost ? "http://127.0.0.1:3000" : configuredApiUrl;

function setSEO(title, description) {
  document.title = title;
  const metadata = [
    ["meta[name='description']", "name", "description", description],
    ["meta[property='og:title']", "property", "og:title", title],
    ["meta[property='og:description']", "property", "og:description", description],
    ["meta[property='og:type']", "property", "og:type", "website"],
    ["meta[name='twitter:card']", "name", "twitter:card", "summary"]
  ];
  metadata.forEach(([selector, attribute, name, content]) => {
    let element = document.querySelector(selector);
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute(attribute, name);
      document.head.appendChild(element);
    }
    element.content = content;
  });

  let canonical = document.querySelector("link[rel='canonical']");
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = `${window.location.origin}${window.location.pathname}`;
}

function logo() {
  return `<a class="brand" href="${siteUrl("")}" aria-label="FrameDrop home"><span class="brand-mark"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 5.5v8l6.5-4-6.5-4Z" fill="white"/><path d="M12 14.5v5m-3-3 3 3 3-3" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span>frame<span style="color:var(--red)">drop</span></span></a>`;
}

function header() {
  return `<header class="site-header"><div class="shell nav">${logo()}<nav class="nav-links" id="nav-links" aria-label="Main navigation"><a href="${siteUrl("")}">Home</a><a href="${siteUrl("#tools")}">Video tools</a><a href="${siteUrl("about/")}">About</a><a href="${siteUrl("contact/")}">Contact</a></nav><a class="nav-cta" href="${siteUrl("#tools")}">Explore tools <span aria-hidden="true">→</span></a><button class="menu-toggle" aria-label="Toggle navigation" aria-expanded="false" aria-controls="nav-links">☰</button></div></header>`;
}

function footer() {
  return `<footer class="site-footer"><div class="shell"><div class="footer-top"><div class="footer-about">${logo()}<p>A simple place to check supported video links. No downloads are processed by this website.</p></div><div class="footer-columns"><div class="footer-col"><h3>Video tools</h3><div class="footer-links">${platforms.map(item => `<a href="${siteUrl(`${item.slug}-video-downloader/`)}">${item.name}</a>`).join("")}</div></div><div class="footer-col"><h3>Company</h3><div class="footer-links"><a href="${siteUrl("about/")}">About us</a><a href="${siteUrl("contact/")}">Contact us</a><a href="${siteUrl("privacy-policy/")}">Privacy policy</a><a href="${siteUrl("terms/")}">Terms of service</a><a href="${siteUrl("dmca/")}">DMCA policy</a></div></div></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} FrameDrop. All rights reserved.</span><span>Independent tool · Not affiliated with listed platforms</span></div></div></footer>`;
}

function inputForm(placeholder = "Paste a video link here (https://...)", toolPlatform = "") {
  return `<form class="download-box" data-tool-platform="${toolPlatform}" novalidate><div class="input-wrap"><svg class="link-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10 13.5a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.7 1.7m2.7 4a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.7-1.7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg><input class="url-input" type="url" name="video-url" placeholder="${placeholder}" aria-label="Video URL" autocomplete="url" inputmode="url"></div><button class="button-primary" type="submit"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 3v9m0 0 3.5-3.5M10 12 6.5 8.5M4 13v3h12v-3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>Check link</button></form><p class="input-hint" aria-live="polite">Paste a public video link to check which platform it belongs to.</p>`;
}

function accountExportPanel(item) {
  if (!["facebook", "instagram"].includes(item.slug)) return "";
  const providerName = item.name;
  return `<section class="account-panel" id="account-panel" data-provider="${item.slug}"><div><span class="eyebrow"><span class="eyebrow-dot"></span> Official account connection</span><h2>Download your own ${providerName} videos</h2><p>Connect the account that owns the video. Downloads are available only when the official API returns a file URL for your media.</p></div><label class="ownership-check"><input id="ownership-confirmation" type="checkbox"> I own this video or have permission to download it.</label><div class="account-actions"><a class="button-primary" data-connect href="#">Connect ${providerName} account</a><button class="button-primary" data-download type="button" disabled>Download my video</button><button class="button-secondary" data-disconnect type="button" hidden>Disconnect</button></div><p class="account-status" data-account-status aria-live="polite"></p></section>`;
}

function cards() {
  return `<div class="platform-grid">${platforms.map(item => `<a class="platform-card" href="${siteUrl(`${item.slug}-video-downloader/`)}"><span class="platform-icon" aria-hidden="true">${item.initials}</span><span><h3>${item.name}</h3><p>Explore the ${item.name} link tool</p></span><span class="platform-arrow" aria-hidden="true">↗</span></a>`).join("")}</div>`;
}

const features = [
  ["Simple by design", "A clean, focused interface helps you check a supported link without installing software."],
  ["Works across devices", "Use the same responsive experience on a desktop, tablet, or mobile browser."],
  ["Clear about limits", "Downloads are limited to eligible videos from a connected Facebook or Instagram account; other platforms remain unavailable."]
];

function homePage() {
  setSEO("FrameDrop — Free Online Video Downloader", "Explore FrameDrop's simple online video tools. Check whether a supported video link is recognized—no account or software required.");
  return `<main><section class="hero"><div class="shell hero-inner"><span class="eyebrow"><span class="eyebrow-dot"></span> A simpler way to check video links</span><h1>Free Online <span>Video Downloader</span></h1><p class="hero-copy">Check supported video links, and export eligible videos from your own connected Facebook or Instagram account.</p>${inputForm()}<div class="trust-row"><span class="trust-item"><span class="trust-check">✓</span> No software to install</span><span class="trust-item"><span class="trust-check">✓</span> Works on mobile</span><span class="trust-item"><span class="trust-check">✓</span> No account required to check links</span></div></div></section><section class="section section-white" id="tools"><div class="shell"><div class="section-heading"><h2>One simple tool for every platform</h2><p>Choose a platform to explore its dedicated link checker. Official account exports are currently limited to Facebook and Instagram.</p></div>${cards()}</div></section><section class="section"><div class="shell"><div class="section-heading"><h2>How it works</h2><p>Three simple steps to check a video link.</p></div><div class="steps-grid"><article class="step-card"><div class="step-number">01</div><h3>Copy a video link</h3><p>Copy a public video URL from one of the supported platforms.</p></article><article class="step-card"><div class="step-number">02</div><h3>Paste it here</h3><p>Paste the URL into the checker. We’ll identify the platform when the link is recognized.</p></article><article class="step-card"><div class="step-number">03</div><h3>Connect your account</h3><p>On Facebook or Instagram, connect the account that owns the video. The official API must return an eligible media URL before a download starts.</p></article></div></div></section><section class="section section-white"><div class="shell"><div class="section-heading"><h2>A better link-checking experience</h2><p>Simple tools should be easy to use and honest about what they do.</p></div><div class="feature-grid">${features.map((item, index) => `<article class="feature-card"><div class="feature-icon" aria-hidden="true">${index === 0 ? "✦" : index === 1 ? "↗" : "✓"}</div><h3>${item[0]}</h3><p>${item[1]}</p></article>`).join("")}</div><p class="disclaimer"><strong>Good to know:</strong> FrameDrop checks link formats. The backend only exports account-owned Facebook or Instagram videos when Meta’s official API supplies a media URL. Other platform downloads are not available.</p></div></section><section class="section"><div class="shell"><div class="section-heading"><h2>Frequently asked questions</h2><p>Helpful answers before you use the tools.</p></div><div class="faq-list"><details class="faq-item"><summary>Can I download any video with FrameDrop?</summary><p>No. Downloads are limited to eligible videos owned by the connected Facebook or Instagram account. The official API may omit a media URL, for example when Instagram identifies copyrighted audio. Pinterest, TikTok, YouTube, and X downloads are not supported.</p></details><details class="faq-item"><summary>Which platforms are supported?</summary><p>We recognize links from Facebook, Pinterest, Instagram, TikTok, YouTube, and Twitter/X. Account-authorized downloads are limited to Facebook and Instagram through Meta’s official APIs.</p></details><details class="faq-item"><summary>Do I need to connect an account?</summary><p>No account is needed to check a link. To download an eligible Facebook or Instagram video, connect the account that owns it and grant the permissions requested by Meta.</p></details><details class="faq-item"><summary>Is FrameDrop affiliated with these platforms?</summary><p>No. FrameDrop is independent and is not affiliated with or endorsed by the listed services.</p></details><details class="faq-item"><summary>Can I use a link for any video?</summary><p>Only use content you own or have permission to download. The backend verifies that the video is available in the connected account’s own media list.</p></details></div></div></section></main>`;
}

function toolPage(item) {
  const [title, description] = pageMeta[item.slug];
  setSEO(title, description);
  const accountPanel = accountExportPanel(item);
  const isMetaProvider = ["facebook", "instagram"].includes(item.slug);
  const limitation = isMetaProvider
    ? `Only videos owned by your connected ${item.name} account can be downloaded, and only when Meta’s API returns a media file URL.`
    : `The official ${item.name} API does not provide a supported video-file download integration here. This page checks links only.`;
  return `<main class="tool-page"><section class="tool-hero"><div class="shell hero-inner"><p class="breadcrumb"><a href="${siteUrl("")}">Home</a> <span aria-hidden="true">/</span> ${item.name} video downloader</p><span class="eyebrow"><span class="eyebrow-dot"></span> ${item.name} link checker</span><h1>${item.name} Video Downloader</h1><p class="hero-copy">Check whether your ${item.name} video link is recognized. Paste a URL below to identify its platform.</p>${inputForm(`Paste a ${item.name} video link here`, item.slug)}${accountPanel}<p class="disclaimer" style="text-align:left"><strong>Important:</strong> ${limitation} No other-account downloads or platform workarounds are supported.</p></div></section><section class="section section-white"><div class="shell tool-details"><h2>About the ${item.name} link checker</h2><p>This page recognizes ${item.name} links. Link recognition alone does not access the video or confirm that it can be downloaded. ${limitation}</p><h2>How to check a link</h2><p>Copy the video URL from ${item.name} and paste it into the checker. For Facebook or Instagram, connect the account that owns the video and use the download control only when the official API makes the media file available.</p><p class="disclaimer">Only use content you own or have permission to download. FrameDrop is independent and is not affiliated with ${item.name}.</p></div></section></main>`;
}

function infoPage(data) {
  setSEO(`${data.title} | FrameDrop`, data.description);
  return `<main class="content-page"><div class="shell"><article class="content-card"><p class="breadcrumb"><a href="${siteUrl("")}">Home</a> <span aria-hidden="true">/</span> ${data.title}</p><h1>${data.title}</h1><p class="content-intro">${data.intro}</p>${data.sections.map(([heading, copy]) => `<section><h2>${heading}</h2><p>${copy}</p></section>`).join("")}</article></div></main>`;
}

if (platform) {
  app.innerHTML = `${header()}${toolPage(platform)}${footer()}`;
} else if (info) {
  app.innerHTML = `${header()}${infoPage(info)}${footer()}`;
} else {
  app.innerHTML = `${header()}${homePage()}${footer()}`;
}

const menuButton = document.querySelector(".menu-toggle");
menuButton.addEventListener("click", () => {
  const links = document.getElementById("nav-links");
  const isOpen = links.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.textContent = isOpen ? "×" : "☰";
});

document.querySelectorAll(".download-box").forEach(form => {
  const input = form.querySelector(".url-input");
  const hint = form.nextElementSibling;
  const toolPlatform = form.dataset.toolPlatform;
  form.addEventListener("submit", event => {
    event.preventDefault();
    hint.classList.remove("warning");
    const raw = input.value.trim();
    if (!raw) {
      hint.textContent = "Paste a video link first. No download service is connected.";
      input.focus();
      return;
    }

    let url;
    try {
      url = new URL(raw);
      if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("Unsupported protocol");
    } catch {
      hint.textContent = "Enter a valid link that starts with https:// or http://.";
      input.focus();
      return;
    }

    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const match = platforms.find(item => item.domains.some(domain => host === domain || host.endsWith(`.${domain}`)));
    if (!match) {
      hint.classList.add("warning");
      hint.textContent = "Warning: this domain is unknown or may redirect to another site. FrameDrop cannot verify or download media from it. Use a direct Facebook, Pinterest, Instagram, TikTok, YouTube, or Twitter/X link.";
      return;
    }

    if (toolPlatform === "facebook" || toolPlatform === "instagram") {
      hint.textContent = `${match.name} link recognized. Connect the account that owns this video below to check whether the official API allows a download.`;
    } else {
      hint.textContent = `${match.name} link recognized. The official API does not provide downloads for this tool.`;
    }
  });
});

function savedSession() {
  try {
    const value = JSON.parse(sessionStorage.getItem("framedrop-account-session") || "null");
    if (value && value.expiresAt > Date.now()) return value;
  } catch {
    sessionStorage.removeItem("framedrop-account-session");
  }
  sessionStorage.removeItem("framedrop-account-session");
  return null;
}

async function apiRequest(path, options = {}, token = "") {
  if (!apiBase) throw new Error("The FrameDrop backend has not been connected yet.");
  const headers = { ...(options.headers || {}) };
  if (options.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${apiBase}${path}`, { ...options, headers });
  const contentType = response.headers.get("content-type") || "";
  if (!response.ok) {
    const data = contentType.includes("application/json") ? await response.json() : null;
    const error = new Error(data?.error || `Backend request failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return response;
}

function downloadFilename(response, provider) {
  const header = response.headers.get("content-disposition") || "";
  const match = header.match(/filename="([a-zA-Z0-9._-]+)"/);
  return match ? match[1] : `framedrop-${provider}-video.mp4`;
}

function initializeAccountExport() {
  const panel = document.getElementById("account-panel");
  if (!panel) return;
  const provider = panel.dataset.provider;
  const status = panel.querySelector("[data-account-status]");
  const connect = panel.querySelector("[data-connect]");
  const download = panel.querySelector("[data-download]");
  const disconnect = panel.querySelector("[data-disconnect]");
  const confirmation = panel.querySelector("#ownership-confirmation");
  const input = document.querySelector(".download-box .url-input");
  const activeSession = savedSession();
  let sessionVerified = false;

  if (!apiBase) {
    status.textContent = "The backend URL has not been configured yet. Deploy the Render service and set api-config.js.";
    connect.setAttribute("aria-disabled", "true");
    connect.removeAttribute("href");
  } else {
    connect.href = `${apiBase}/auth/meta/start?provider=${encodeURIComponent(provider)}`;
    if (activeSession?.provider === provider) {
      status.textContent = `Verifying your ${provider} account connection…`;
      download.disabled = true;
      disconnect.hidden = false;
      connect.hidden = true;
    } else if (activeSession) {
      status.textContent = `A ${activeSession.provider} account is connected. Disconnect it before connecting ${provider}.`;
      connect.hidden = true;
      disconnect.hidden = false;
    } else {
      status.textContent = `Connect the ${provider} account that owns the video. Your platform token is held in temporary backend memory.`;
    }
  }

  const fragment = new URLSearchParams(window.location.hash.slice(1));
  const authCode = fragment.get("auth_code");
  const oauthError = fragment.get("oauth_error");
  if (authCode && apiBase) {
    history.replaceState(null, "", window.location.pathname + window.location.search);
    status.textContent = "Finishing account connection…";
    apiRequest("/api/auth/exchange", {
      method: "POST",
      body: JSON.stringify({ code: authCode })
    }).then(async response => {
      const session = await response.json();
      sessionStorage.setItem("framedrop-account-session", JSON.stringify(session));
      window.location.reload();
    }).catch(error => {
      status.textContent = error.message;
    });
  } else if (oauthError) {
    history.replaceState(null, "", window.location.pathname + window.location.search);
    status.textContent = "Account connection was not completed. Try again and approve the requested permissions.";
  }

  if (activeSession?.provider === provider && apiBase && !authCode) {
    apiRequest("/api/me", {}, activeSession.sessionToken).then(async response => {
      const account = await response.json();
      if (!account.connected || account.provider !== provider) {
        throw new Error("The backend session does not match this platform.");
      }
      sessionVerified = true;
      status.textContent = `Your ${provider} account is connected for this browser session.`;
      download.disabled = !confirmation.checked;
    }).catch(error => {
      if (error.status === 401) {
        sessionStorage.removeItem("framedrop-account-session");
        connect.hidden = false;
        disconnect.hidden = true;
        status.textContent = "Your account connection expired. Please reconnect.";
      } else {
        status.textContent = `Could not verify the account connection. ${error.message}`;
      }
      download.disabled = true;
    });
  }

  confirmation.addEventListener("change", () => {
    download.disabled = !confirmation.checked || !sessionVerified;
  });

  download.addEventListener("click", async () => {
    const session = savedSession();
    if (!session || session.provider !== provider || !sessionVerified) {
      status.textContent = "Connect the account that owns this video first.";
      return;
    }
    if (!confirmation.checked) {
      status.textContent = "Confirm that you own or may download this video first.";
      return;
    }
    download.disabled = true;
    status.textContent = "Checking the connected account and requesting the authorized media…";
    try {
      const response = await apiRequest("/api/download", {
        method: "POST",
        body: JSON.stringify({ provider, url: input.value.trim() })
      }, session.sessionToken);
      const file = await response.blob();
      const link = document.createElement("a");
      const objectUrl = URL.createObjectURL(file);
      link.href = objectUrl;
      link.download = downloadFilename(response, provider);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      status.textContent = "The official API provided the video file. Your download has started.";
    } catch (error) {
      status.textContent = error.message;
    } finally {
      download.disabled = !confirmation.checked || !sessionVerified;
    }
  });

  disconnect.addEventListener("click", async () => {
    const session = savedSession();
    let logoutError = "";
    if (session && apiBase) {
      try {
        await apiRequest("/api/logout", { method: "POST" }, session.sessionToken);
      } catch (error) {
        logoutError = error.message;
      }
    }
    sessionStorage.removeItem("framedrop-account-session");
    sessionVerified = false;
    connect.hidden = false;
    disconnect.hidden = true;
    download.disabled = true;
    status.textContent = logoutError
      ? `Disconnected in this browser. The backend session will expire automatically. ${logoutError}`
      : "Account disconnected.";
  });
}

initializeAccountExport();
