const { formPrice, currencySymbol } = require("../../lib/helpers");

const C = {
  ink:    "#0f172a",
  body:   "#374151",
  muted:  "#6b7280",
  accent: "#0ea5e9",
  border: "#e2e8f0",
};

const CURRENCY_LABEL = { EUR: "EUR", USD: "USD", TRY: "TRY", GBP: "GBP" };

function sectionLabel(text) {
  return {
    columns: [
      { canvas: [{ type: "rect", x: 0, y: 1, w: 2, h: 8, color: C.accent }], width: 8 },
      { text, fontSize: 7, bold: true, color: C.muted, margin: [0, 1, 0, 0] },
    ],
    margin: [0, 0, 0, 3],
  };
}

function buildCurrencyTotals(currency, totals, ver) {
  const sym   = currencySymbol(currency);
  const label = CURRENCY_LABEL[currency] || currency;
  const rows  = [];

  if (totals.priceOfferTotal) {
    rows.push([
      { text: "Ara Toplam", style: "totalLabel" },
      { text: `${formPrice(totals.priceOfferTotal)} ${sym}`, style: "totalValue" },
    ]);
  }

  if (ver.showVat && totals.priceVat > 0) {
    const rate = ver.vatRate > 1 ? ver.vatRate : Math.round(ver.vatRate * 100);
    rows.push([
      { text: `KDV (%${rate})`, style: "totalLabel" },
      { text: `${formPrice(totals.priceVat)} ${sym}`, style: "totalValue" },
    ]);
  }

  if (totals.priceGrandTotal) {
    rows.push([
      { text: `${label} TOPLAM`, fontSize: 10, bold: true, alignment: "right", color: C.ink },
      { text: `${formPrice(totals.priceGrandTotal)} ${sym}`, fontSize: 10, bold: true, alignment: "right", color: C.ink },
    ]);
  }

  if (!rows.length) return null;

  return {
    columns: [
      { width: "*", text: "" },
      {
        width: "auto",
        table: { widths: [130, 100], body: rows },
        layout: {
          hLineWidth: (i) => (i === rows.length - 1) ? 0.6 : 0,
          vLineWidth: () => 0,
          hLineColor: () => C.border,
          paddingTop: () => 2,
          paddingBottom: () => 2,
          paddingLeft: () => 4,
          paddingRight: () => 4,
        },
        margin: [0, 4, 0, 8],
      },
    ],
  };
}

function buildTotals(ver) {
  if (!ver.totalsByCurrency) return [];

  const entries = ver.totalsByCurrency instanceof Map
    ? Array.from(ver.totalsByCurrency.entries())
    : Object.entries(ver.totalsByCurrency);

  if (!entries.length) return [];

  return entries
    .map(([currency, totals]) => buildCurrencyTotals(currency, totals, ver))
    .filter(Boolean);
}

function buildTerms(ver) {
  const fields = [
    { label: "TESLİMAT", value: ver.deliveryTerms },
    { label: "GARANTİ",  value: ver.warranty },
    { label: "ÖDEME",    value: ver.paymentTerms },
  ].filter((f) => f.value);

  if (!fields.length) return [];

  return [
    {
      canvas: [{ type: "line", x1: 0, y1: 0, x2: 523, y2: 0, lineWidth: 0.4, lineColor: C.border }],
      margin: [0, 4, 0, 4],
    },
    sectionLabel("KOŞULLAR"),
    {
      columns: fields.map((f) => ({
        stack: [
          { text: f.label, fontSize: 7, bold: true, color: C.muted, margin: [0, 0, 0, 1] },
          { text: f.value, fontSize: 8.5, color: C.body, lineHeight: 1.2 },
        ],
        margin: [0, 0, 14, 0],
      })),
      headlineLevel: 1,
    },
  ];
}

module.exports = { buildTotals, buildCurrencyTotals, buildTerms };
