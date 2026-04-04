const https = require("https");
const http = require("http");

/**
 * URL'den image'ı base64'e çevirir.
 * @param {string} url
 * @returns {Promise<string>} data URI
 */
function urlToBase64(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client.get(url, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const mime = res.headers["content-type"] || "image/png";
        const b64 = Buffer.concat(chunks).toString("base64");
        resolve(`data:${mime};base64,${b64}`);
      });
      res.on("error", reject);
    }).on("error", reject);
  });
}

/**
 * Image kaynağını çözer.
 * - Zaten data URI ise olduğu gibi döner
 * - http/https URL ise fetch edip base64'e çevirir
 * - undefined/null ise null döner
 */
async function resolveImage(src) {
  if (!src) return null;
  if (src.startsWith("data:")) return src;
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return urlToBase64(src);
  }
  return src; // local path gibi durumlar
}

module.exports = { resolveImage };
