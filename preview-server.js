const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml"
};
const port = Number(process.env.PORT) || 8765;

http.createServer((request, response) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  } catch {
    response.writeHead(400).end("Bad request");
    return;
  }

  if (urlPath === "/all-video-downloader") {
    urlPath = "/";
  } else if (urlPath.startsWith("/all-video-downloader/")) {
    urlPath = urlPath.slice("/all-video-downloader".length);
  }

  let filePath = path.resolve(root, `.${urlPath}`);
  if (!filePath.startsWith(root + path.sep) && filePath !== root) {
    response.writeHead(403).end("Forbidden");
    return;
  }
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    response.writeHead(404).end("Not found");
    return;
  }

  response.setHeader("Content-Type", types[path.extname(filePath)] || "application/octet-stream");
  fs.createReadStream(filePath).pipe(response);
}).listen(port, "127.0.0.1");
