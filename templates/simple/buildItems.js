const { formPrice, currencySymbol } = require("../../lib/helpers");

const HDR_BG = "#0ea5e9";
const C = { accent: "#0ea5e9", muted: "#6b7280" };
const s = (v) => (v != null ? String(v) : "-");

const CURRENCY_LABEL = { EUR: "💶 EUR", USD: "💵 USD", TRY: "₺ TRY", GBP: "💷 GBP" };

function sectionLabel(text) {
  return {
    columns: [
      { canvas: [{ type: "rect", x: 0, y: 1, w: 2, h: 8, color: C.accent }], width: 8 },
      { text, fontSize: 7, bold: true, color: C.muted, margin: [0, 1, 0, 0] },
    ],
    margin: [0, 0, 0, 3],
  };
}

function buildTable(currency, items, startIndex, labelText) {
  const sym = currencySymbol(currency);

  const headerRow = [
    { text: "#", style: "tableHeader", fillColor: HDR_BG, alignment: "center" },
    { text: "AÇIKLAMA", style: "tableHeader", fillColor: HDR_BG },
    { text: "MİKTAR", style: "tableHeader", fillColor: HDR_BG, alignment: "center" },
    { text: `BİRİM FİYAT (${sym})`, style: "tableHeader", fillColor: HDR_BG, alignment: "right" },
    { text: `TOPLAM (${sym})`, style: "tableHeader", fillColor: HDR_BG, alignment: "right" },
  ];

  const dataRows = items.map((item, i) => {
    const descStack = [
      { text: s(item.title).toLocaleUpperCase("tr-TR"), style: "tableRow", bold: true },
      item.notes ? { text: s(item.notes), fontSize: 7.5, color: "#9ca3af", italics: true, margin: [0, 1, 0, 0] } : null,
    ].filter(Boolean);

    return [
      { text: String(startIndex + i + 1).padStart(2, "0"), alignment: "center", style: "tableRow" },
      { stack: descStack },
      { text: String(item.quantity ?? 1), alignment: "center", style: "tableRow" },
      { text: formPrice(item.priceOffer), alignment: "right", style: "tableRow" },
      { text: formPrice(item.priceOfferTotal?.value), alignment: "right", style: "tableRow" },
    ];
  });

  return {
    table: {
      headerRows: 1,
      dontBreakRows: true,
      keepWithHeaderRows: 1,
      widths: [22, "*", "8%", "18%", "18%"],
      body: [headerRow, ...dataRows],
    },
    layout: {
      hLineWidth: (i) => (i === 0 || i === 1) ? 0 : 0.4,
      vLineWidth: () => 0,
      hLineColor: () => "#e5e7eb",
      fillColor: (i) => i === 0 ? HDR_BG : i % 2 === 0 ? "#f9fafb" : null,
      paddingTop: () => 4,
      paddingBottom: () => 4,
      paddingLeft: (j) => (j === 0 ? 5 : 4),
      paddingRight: (j) => (j === 0 ? 5 : 4),
    },
    margin: [0, 0, 0, 2],
    headlineLevel: 1,
  };
}

function buildCurrencyTotals(currency, totals, ver) {
  const sym = currencySymbol(currency);
  const label = CURRENCY_LABEL[currency] || currency;
  const rows = [];

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
      { text: `${label} TOPLAM`, fontSize: 10, bold: true, alignment: "right", color: "#0f172a" },
      { text: `${formPrice(totals.priceGrandTotal)} ${sym}`, fontSize: 10, bold: true, alignment: "right", color: "#0f172a" },
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
          hLineColor: () => "#e2e8f0",
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

module.exports = function buildItemsTable(ver) {
  const items = ver.lineItems || [];
  const totalsMap = ver.totalsByCurrency || {};

  const grouped = {};
  const currencyOrder = [];
  items.forEach((item) => {
    const cur = item.currency || "TRY";
    if (!grouped[cur]) {
      grouped[cur] = [];
      currencyOrder.push(cur);
    }
    grouped[cur].push(item);
  });

  // Tek currency
  if (currencyOrder.length === 1) {
    const currency = currencyOrder[0];
    const totalsBlock = buildCurrencyTotals(currency, totalsMap[currency] || {}, ver);
    return {
      stack: [
        sectionLabel("ÜRÜNLER / HİZMETLER"),
        buildTable(currency, grouped[currency], 0, "ÜRÜNLER / HİZMETLER"),
        ...(totalsBlock ? [totalsBlock] : []),
      ],
      headlineLevel: 1,
    };
  }

  // Multi-currency
  const blocks = [];
  let runningIndex = 0;
  currencyOrder.forEach((currency) => {
    const label = `${CURRENCY_LABEL[currency] || currency} ÜRÜNLERİ`;
    const totalsBlock = buildCurrencyTotals(currency, totalsMap[currency] || {}, ver);
    blocks.push({
      stack: [
        sectionLabel(label),
        buildTable(currency, grouped[currency], runningIndex, label),
        ...(totalsBlock ? [totalsBlock] : []),
      ],
      headlineLevel: 1,
    });
    runningIndex += grouped[currency].length;
  });

  return { stack: blocks, headlineLevel: 1 };
};
