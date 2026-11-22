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
      ["How it works today", "You can paste a link to see whether it matches one of the platforms listed on our site. FrameDrop does not currently connect to a video-processing or download service, so it cannot retrieve or save videos."],
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
      ["Information you enter", "The current link checker processes the URL you enter in your browser to identify a matching platform. It does not submit video links to a download backend because no download backend is connected."],
      ["Technical information", "Our hosting provider may process standard connection information, such as an IP address and browser details, to deliver and secure the website. Any analytics or cookies used by a particular deployment should be disclosed by that deployment."],
      ["Third-party services", "Links to third-party platforms are provided for convenience. Those services have their own privacy policies and practices."],
      ["Contact", "A privacy contact address will be published here before the service launches."]
    ]
  },
  terms: {
    title: "Terms of service",
    description: "Review the terms for using FrameDrop's video-link tools and website.",
    intro: "By using FrameDrop, you agree to use the site responsibly and in accordance with applicable laws.",
    sections: [
      ["The service", "FrameDrop currently offers a browser-based link recognition interface. It does not provide video downloads, store videos, or guarantee that a link will be recognized."],
      ["Your responsibilities", "You are responsible for ensuring that your use of a link or any content is authorized and complies with relevant laws and the terms of the platform where it appears. Do not misuse or disrupt this website."],
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
      ["Important", "FrameDrop currently does not host or download video files. A notice concerning material on a third-party platform should also be directed to that platform."]
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

function inputForm(placeholder = "Paste a video link here (https://...)") {
  return `<form class="download-box" novalidate><div class="input-wrap"><svg class="link-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10 13.5a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.7 1.7m2.7 4a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.7-1.7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg><input class="url-input" type="url" name="video-url" placeholder="${placeholder}" aria-label="Video URL" autocomplete="url" inputmode="url"></div><button class="button-primary" type="submit"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 3v9m0 0 3.5-3.5M10 12 6.5 8.5M4 13v3h12v-3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>Check link</button></form><p class="input-hint" aria-live="polite">Paste a public video link to check which platform it belongs to. No download service is connected.</p>`;
}

function cards() {
  return `<div class="platform-grid">${platforms.map(item => `<a class="platform-card" href="${siteUrl(`${item.slug}-video-downloader/`)}"><span class="platform-icon" aria-hidden="true">${item.initials}</span><span><h3>${item.name}</h3><p>Explore the ${item.name} link tool</p></span><span class="platform-arrow" aria-hidden="true">↗</span></a>`).join("")}</div>`;
}

const features = [
  ["Simple by design", "A clean, focused interface helps you check a supported link without installing software."],
  ["Works across devices", "Use the same responsive experience on a desktop, tablet, or mobile browser."],
  ["Clear about limits", "Link recognition is not downloading. We tell you plainly that no video download backend is connected."]
];

function homePage() {
  setSEO("FrameDrop — Free Online Video Downloader", "Explore FrameDrop's simple online video tools. Check whether a supported video link is recognized—no account or software required.");
  return `<main><section class="hero"><div class="shell hero-inner"><span class="eyebrow"><span class="eyebrow-dot"></span> A simpler way to check video links</span><h1>Free Online <span>Video Downloader</span></h1><p class="hero-copy">Download supported videos easily with our simple online tools.</p>${inputForm()}<div class="trust-row"><span class="trust-item"><span class="trust-check">✓</span> No software to install</span><span class="trust-item"><span class="trust-check">✓</span> Works on mobile</span><span class="trust-item"><span class="trust-check">✓</span> No account required</span></div></div></section><section class="section section-white" id="tools"><div class="shell"><div class="section-heading"><h2>One simple tool for every platform</h2><p>Choose a platform to explore its dedicated link checker.</p></div>${cards()}</div></section><section class="section"><div class="shell"><div class="section-heading"><h2>How it works</h2><p>Three simple steps to check a video link.</p></div><div class="steps-grid"><article class="step-card"><div class="step-number">01</div><h3>Copy a video link</h3><p>Copy a public video URL from one of the supported platforms.</p></article><article class="step-card"><div class="step-number">02</div><h3>Paste it here</h3><p>Paste the URL into the checker. We’ll identify the platform when the link is recognized.</p></article><article class="step-card"><div class="step-number">03</div><h3>See the link status</h3><p>We’ll tell you whether the link matches a supported platform. Video downloads aren’t available on this site.</p></article></div></div></section><section class="section section-white"><div class="shell"><div class="section-heading"><h2>A better link-checking experience</h2><p>Simple tools should be easy to use and honest about what they do.</p></div><div class="feature-grid">${features.map((item, index) => `<article class="feature-card"><div class="feature-icon" aria-hidden="true">${index === 0 ? "✦" : index === 1 ? "↗" : "✓"}</div><h3>${item[0]}</h3><p>${item[1]}</p></article>`).join("")}</div><p class="disclaimer"><strong>Good to know:</strong> FrameDrop currently checks link formats only. It does not fetch, process, or download video files. Always respect the content owner’s rights and each platform’s terms.</p></div></section><section class="section"><div class="shell"><div class="section-heading"><h2>Frequently asked questions</h2><p>Helpful answers before you use the tools.</p></div><div class="faq-list"><details class="faq-item"><summary>Can I download a video with FrameDrop?</summary><p>Not right now. This website does not have a video-processing backend, so it cannot retrieve or download videos. The link checker only identifies supported URL formats.</p></details><details class="faq-item"><summary>Which platforms are supported?</summary><p>We currently recognize links from Facebook, Pinterest, Instagram, TikTok, YouTube, and Twitter/X. Recognition does not guarantee that a video can be accessed.</p></details><details class="faq-item"><summary>Do I need to install an app or create an account?</summary><p>No. The link checker runs in your browser and this site does not require an account or app installation.</p></details><details class="faq-item"><summary>Is FrameDrop affiliated with these platforms?</summary><p>No. FrameDrop is an independent project. Platform names are used only to describe supported link types; we are not affiliated with or endorsed by those services.</p></details><details class="faq-item"><summary>Can I use a link for any video?</summary><p>Only use content when you have permission and your use complies with applicable law and the terms of the original platform.</p></details></div></div></section></main>`;
}

function toolPage(item) {
  const [title, description] = pageMeta[item.slug];
  setSEO(title, description);
  return `<main class="tool-page"><section class="tool-hero"><div class="shell hero-inner"><p class="breadcrumb"><a href="${siteUrl("")}">Home</a> <span aria-hidden="true">/</span> ${item.name} video downloader</p><span class="eyebrow"><span class="eyebrow-dot"></span> ${item.name} link checker</span><h1>${item.name} Video Downloader</h1><p class="hero-copy">Check whether your ${item.name} video link is recognized. Paste a URL below to identify its platform.</p>${inputForm(`Paste a ${item.name} video link here`)}<p class="disclaimer" style="text-align:left"><strong>Downloads aren’t available yet.</strong> This site does not have a video download service connected. Checking a link will not download or save a video.</p></div></section><section class="section section-white"><div class="shell tool-details"><h2>About the ${item.name} link checker</h2><p>This page provides a simple way to check whether a URL appears to come from ${item.name}. Paste a public link above to see the result. Link recognition only identifies a URL format; it does not access the video or confirm that it is available.</p><h2>How to check a link</h2><p>Copy the video URL from ${item.name}, paste it into the link checker, then select “Check link.” If the format is recognized, we’ll say so. No video is retrieved, processed, or downloaded.</p><p class="disclaimer">Only use links and content you’re authorized to access. FrameDrop is independent and is not affiliated with ${item.name}.</p></div></section></main>`;
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
  form.addEventListener("submit", event => {
    event.preventDefault();
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
      hint.textContent = "We couldn’t match this link to a supported platform. Try a Facebook, Pinterest, Instagram, TikTok, YouTube, or Twitter/X link.";
      return;
    }

    hint.textContent = `${match.name} link recognized. This site has no download service connected, so the video was not downloaded.`;
  });
});
