const assert = require("node:assert/strict");
const { after, test } = require("node:test");
const {
  createServer,
  facebookVideoId,
  normalizePermalink,
  trustedMediaUrl,
  validVideoUrl
} = require("./server");

test("normalizes canonical owned-account links without accepting unrelated hosts", () => {
  assert.equal(
    normalizePermalink("https://www.instagram.com/reel/ABC123/?igsh=share", "instagram"),
    "instagram.com/reel/ABC123"
  );
  assert.equal(
    normalizePermalink("https://m.facebook.com/watch/?v=123456", "facebook"),
    "facebook.com/watch"
  );
  assert.equal(normalizePermalink("https://facebook.com.attacker.test/video/1", "facebook"), "");
});

test("extracts Facebook video identifiers from canonical URLs", () => {
  assert.equal(facebookVideoId(new URL("https://www.facebook.com/watch/?v=123456")), "123456");
  assert.equal(facebookVideoId(new URL("https://www.facebook.com/reel/654321")), "654321");
  assert.equal(facebookVideoId(new URL("https://www.facebook.com/watch/example")), "");
});

test("only accepts HTTPS platform links and Meta media CDN URLs", () => {
  assert.equal(validVideoUrl("https://www.instagram.com/reel/ABC123/", "instagram").hostname, "www.instagram.com");
  assert.throws(() => validVideoUrl("http://instagram.com/reel/ABC123/", "instagram"), /HTTPS/);
  assert.throws(() => validVideoUrl("https://instagram.com.attacker.test/reel/ABC123/", "instagram"), /HTTPS/);
  assert.equal(trustedMediaUrl("https://scontent.cdninstagram.com/video.mp4"), true);
  assert.equal(trustedMediaUrl("https://video.xx.fbcdn.net/video.mp4"), true);
  assert.equal(trustedMediaUrl("https://127.0.0.1/private"), false);
  assert.equal(trustedMediaUrl("https://cdninstagram.com.attacker.test/video.mp4"), false);
  assert.equal(trustedMediaUrl("http://cdninstagram.com/video.mp4"), false);
});

test("reports health and refuses unauthenticated downloads", async t => {
  const server = createServer({ FRONTEND_ORIGIN: "https://example.github.io" });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const origin = `http://127.0.0.1:${server.address().port}`;

  const health = await fetch(`${origin}/health`, {
    headers: { Origin: "https://example.github.io" }
  });
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { status: "ok" });
  assert.equal(health.headers.get("access-control-expose-headers"), "Content-Disposition");

  const download = await fetch(`${origin}/api/download`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider: "instagram", url: "https://instagram.com/reel/ABC123/" })
  });
  assert.equal(download.status, 401);
  assert.match((await download.json()).error, /Connect your/);
});

test("does not claim downloads for providers without official file support", async t => {
  const server = createServer({});
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/platforms`);
  const { platforms } = await response.json();
  assert.deepEqual(
    platforms.filter(platform => platform.download).map(platform => platform.id),
    []
  );
  assert.equal(platforms.find(platform => platform.id === "youtube").download, false);
  assert.equal(platforms.find(platform => platform.id === "tiktok").download, false);
});
