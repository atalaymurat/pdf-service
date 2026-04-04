const { formPrice } = require("../../lib/helpers");

const C = {
  ink:    "#0f172a",
  body:   "#374151",
  muted:  "#6b7280",
  accent: "#0ea5e9",
  border: "#e2e8f0",
};

function sectionLabel(text) {
  return {
    columns: [
      { canvas: [{ type: "rect", x: 0, y: 1, w: 2, h: 8, color: C.accent }], width: 8 },
      { text, fontSize: 7, bold: true, color: C.muted, margin: [0, 1, 0, 0] },
    ],
    margin: [0, 0, 0, 3],
  };
}

function buildTotals(ver) {
  const rows = [];

  if (ver.priceOfferTotal?.value) {
    rows.push([
      { text: "Ara Toplam", style: "totalLabel" },
      { text: formPrice(ver.priceOfferTotal.value), style: "totalValue" },
    ]);
  }
  if (ver.showDiscount && ver.priceDiscount?.value > 0) {
    rows.push([
      { text: "İndirim", style: "totalLabel", color: "#ef4444" },
      { text: `- ${formPrice(ver.priceDiscount.value)}`, style: "totalValue", color: "#ef4444" },
    ]);
  }
  if (ver.showVat && ver.priceVat?.value) {
    const rate = ver.vatRate > 1 ? ver.vatRate : Math.round(ver.vatRate * 100);
    rows.push([
      { text: `KDV${ver.vatRate ? ` (%${rate})` : ""}`, style: "totalLabel" },
      { text: formPrice(ver.priceVat.value), style: "totalValue" },
    ]);
  }

  const grandRow = ver.priceGrandTotal?.value
    ? [[
        { text: "GENEL TOPLAM", fontSize: 10, bold: true, alignment: "right", color: C.ink },
        { text: formPrice(ver.priceGrandTotal.value), fontSize: 10, bold: true, alignment: "right", color: C.ink },
      ]]
    : [];

  if (!rows.length && !grandRow.length) return [];

  const sepRow = grandRow.length && rows.length
    ? [[{ text: "", border: [false, true, false, false], borderColor: [C.border, C.border, C.border, C.border], colSpan: 2 }, {}]]
    : [];

  return [{
    columns: [
      { width: "*", text: "" },
      {
        width: "auto",
        table: { widths: [130, 100], body: [...rows, ...sepRow, ...grandRow] },
        layout: {
          hLineWidth: (i) => (i === rows.length + (sepRow.length ? 1 : 0)) ? 0.6 : 0,
          vLineWidth: () => 0,
          hLineColor: () => C.border,
          paddingTop: () => 2,
          paddingBottom: () => 2,
          paddingLeft: () => 4,
          paddingRight: () => 4,
        },
        margin: [0, 0, 0, 4],
      },
    ],
  }];
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

module.exports = { buildTotals, buildTerms };
