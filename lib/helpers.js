const localeDate = (date) => {
  return new Date(date).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const formPrice = (number) => {
  const n = Number(number);
  if (isNaN(n)) return "-";
  return n.toLocaleString("tr-TR", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
};

// Türkçe capitalize — Unicode \p{L} ile Türkçe karakterleri doğru işler
const capitalizeTR = (str) => {
  if (!str || typeof str !== "string") return str;
  return str
    .toLocaleLowerCase("tr-TR")
    .replace(/(?<!\p{L})\p{L}/gu, (c) => c.toLocaleUpperCase("tr-TR"));
};

const CURRENCY_SYMBOLS = { TRY: "₺", USD: "$", EUR: "€", GBP: "£" };
const currencySymbol = (code) => CURRENCY_SYMBOLS[code] || code || "₺";

module.exports = {
  localeDate,
  formPrice,
  capitalizeTR,
  currencySymbol,
};
