const https = require("https");
const http  = require("http");

const MAX_REDIRECTS = 5;
const TIMEOUT_MS    = 10000; // 10 saniye

// pdfmake'in desteklemediği formatlar — Cloudinary'de JPEG'e çevir
const UNSUPPORTED = ["webp", "avif", "svg", "svg+xml"];

/**
 * Cloudinary URL'sine format dönüşüm transformasyonu ekler.
 * https://res.cloudinary.com/.../upload/v.../file.webp
 * → https://res.cloudinary.com/.../upload/f_jpg/v.../file.jpg
 */
function normalizeCloudinaryUrl(url) {
  if (!url.includes("res.cloudinary.com")) return url;
  const ext = url.split(".").pop().split("?")[0].toLowerCase();
  if (!UNSUPPORTED.includes(ext)) return url;
  return url
    .replace(/\/upload\//, "/upload/f_jpg/")
    .replace(/\.\w+$/, ".jpg");
}

function fetchBuffer(url, redirectsLeft = MAX_REDIRECTS) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        if (redirectsLeft === 0) return reject(new Error("Too many redirects"));
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
      // WebP kontrolü — başlık webp dönüyorsa reddet (pdfmake desteklemez)
      if (UNSUPPORTED.some((f) => mime.includes(f))) {
        res.resume();
        return reject(new Error(`Unsupported image format: ${mime}`));
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve({ mime, buf: Buffer.concat(chunks) }));
      res.on("error", reject);
    });

    req.setTimeout(TIMEOUT_MS, () => {
      req.destroy(new Error(`Image fetch timeout (${TIMEOUT_MS}ms): ${url}`));
    });
    req.on("error", reject);
  });
}

/**
 * Image kaynağını pdfmake için data URI'ye çevirir.
 * - Zaten data URI ise olduğu gibi döner
 * - http/https URL ise fetch edip base64'e çevirir
 * - Cloudinary WebP/AVIF URL'lerini JPEG'e dönüştürür
 * - undefined/null ise null döner
 */
async function resolveImage(src) {
  if (!src) return null;
  if (src.startsWith("data:")) return src;
  if (src.startsWith("http://") || src.startsWith("https://")) {
    const normalized = normalizeCloudinaryUrl(src);
    const { mime, buf } = await fetchBuffer(normalized);
    return `data:${mime};base64,${buf.toString("base64")}`;
  }
  return src;
}

module.exports = { resolveImage };
