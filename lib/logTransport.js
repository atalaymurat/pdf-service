const axios = require("axios");

const BACKEND_URL = process.env.BACKEND_URL || "http://192.168.1.100:3021";
const API_KEY = process.env.INTERNAL_API_KEY;

let buffer = [];
let timer = null;

const flush = async () => {
  if (buffer.length === 0) return;
  const toSend = buffer.splice(0);
  try {
    await axios.post(
      `${BACKEND_URL}/api/logs/ingest`,
      { logs: toSend },
      { headers: { "x-internal-api-key": API_KEY }, timeout: 5000 }
    );
  } catch {
    buffer = [...toSend.slice(-50), ...buffer.slice(0, 50)];
  }
};

const send = (entry) => {
  const isDev = !["production", "prod"].includes(process.env.NODE_ENV);
  if (isDev) return;

  buffer.push({ ...entry, service: "pdf-service", timestamp: new Date() });

  if (buffer.length >= 10) {
    if (timer) { clearTimeout(timer); timer = null; }
    flush();
  } else if (!timer) {
    timer = setTimeout(() => { timer = null; flush(); }, 3000);
  }
};

module.exports = { send, flush };
