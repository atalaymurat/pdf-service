const localeDate = (date) => {
  return new Date(date).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const formPrice = (number) => {
  let n = Number(number);
  return n.toLocaleString("tr-TR", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
};

// Türkçe toLowerCase
const toLowerCaseTR = (str) =>
  str.replace(/I/g, "ı").replace(/İ/g, "i").toLowerCase();

// Türkçe toUpperCase
const toUpperCaseTR = (str) =>
  str.replace(/i/g, "İ").replace(/ı/g, "I").toUpperCase();

// Türkçe capitalize (her kelimenin ilk harfi büyük)
const capitalizeTR = (str) =>
  toLowerCaseTR(str).replace(/\b\w/g, (char) => toUpperCaseTR(char));

module.exports = {
  localeDate,
  formPrice,
  toLowerCaseTR,
  toUpperCaseTR,
  capitalizeTR,
};
