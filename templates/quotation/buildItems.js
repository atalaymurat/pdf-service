const { formPrice, currencySymbol, capitalizeTR } = require("../../lib/helpers");
const { buildCurrencyTotals } = require("./buildSummary");

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

function buildOptions(options) {
  if (!options?.length) return null;
  return {
    stack: options.map((opt) => {
      const title = capitalizeTR(s(opt.label || opt.title));
      const qty = opt.quantity != null && opt.quantity > 1 ? ` ${opt.quantity} adet` : "";
      return { text: `· ${title}${qty}`, fontSize: 7.5, color: "#9ca3af", margin: [0, 1, 0, 0] };
    }),
  };
}

function buildTable(currency, items, startIndex, labelText) {
  const sym = currencySymbol(currency);

  const headerRow = [
    { text: "#",                        style: "tableHeader", fillColor: HDR_BG, alignment: "center" },
    { text: "ÜRÜN / HİZMET AÇIKLAMASI", style: "tableHeader", fillColor: HDR_BG },
    { text: "MİKTAR",                   style: "tableHeader", fillColor: HDR_BG, alignment: "center" },
    { text: `BİRİM FİYAT (${sym})`,     style: "tableHeader", fillColor: HDR_BG, alignment: "right" },
    { text: `TOPLAM (${sym})`,          style: "tableHeader", fillColor: HDR_BG, alignment: "right" },
  ];

  const dataRows = items.map((item, i) => {
    const opts = buildOptions(item.selectedOptions);
    const descStack = [
      { text: s(item.title).toLocaleUpperCase("tr-TR"), style: "tableRow", bold: true },
      item.caption ? { text: capitalizeTR(s(item.caption)), fontSize: 8, color: "#374151", margin: [0, 1, 0, 0] } : null,
      item.notes   ? { text: capitalizeTR(s(item.notes)),   fontSize: 7.5, color: "#9ca3af", italics: true, margin: [0, 1, 0, 0] } : null,
      opts,
    ].filter(Boolean);

    return [
      { text: String(startIndex + i + 1).padStart(2, "0"), alignment: "center", style: "tableRow" },
      { stack: descStack },
      { text: String(item.quantity ?? 1), alignment: "center", style: "tableRow" },
      { text: formPrice(item.priceOffer),             alignment: "right", style: "tableRow" },
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

module.exports = function buildItemsTable(ver) {
  const items = ver.lineItems || [];
  const totalsMap = ver.totalsByCurrency || {};

  // Currency bazında grupla (orijinal sırayı koruyarak)
  const grouped = {};
  const currencyOrder = [];
  items.forEach((item) => {
    const cur = item.currency || "TRY";
    if (!grouped[cur]) { grouped[cur] = []; currencyOrder.push(cur); }
    grouped[cur].push(item);
  });

  // Tek currency: başlıksız tablo + altına totals
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

  // Multi-currency: her grup başlık + tablo + kendi totals
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
