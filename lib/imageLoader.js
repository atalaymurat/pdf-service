const https = require("https");
const http  = require("http");

const MAX_REDIRECTS = 5;

function fetchBuffer(url, redirectsLeft = MAX_REDIRECTS) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume(); // drain
        if (redirectsLeft === 0) return reject(new Error("Too many redirects"));
        // Resolve relative redirect location
        const next = res.headers.location.startsWith("http")
          ? res.headers.location
          : new URL(res.headers.location, url).href;
        return fetchBuffer(next, redirectsLeft - 1).then(resolve, reject);
      }
      if (res.statusCode < 200 || res.statusCode >= 300) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const mime = (res.headers["content-type"] || "image/png").split(";")[0].trim();
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve({ mime, buf: Buffer.concat(chunks) }));
      res.on("error", reject);
    });
    req.on("error", reject);
  });
}

/**
 * Image kaynağını pdfmake için data URI'ye çevirir.
 * - Zaten data URI ise olduğu gibi döner
 * - http/https URL ise fetch edip base64'e çevirir (redirect takip eder)
 * - undefined/null ise null döner
 */
async function resolveImage(src) {
  if (!src) return null;
  if (src.startsWith("data:")) return src;
  if (src.startsWith("http://") || src.startsWith("https://")) {
    const { mime, buf } = await fetchBuffer(src);
    return `data:${mime};base64,${buf.toString("base64")}`;
  }
  return src;
}

module.exports = { resolveImage };
