const { formPrice, currencySymbol, capitalizeTR } = require("../../lib/helpers");

const HDR_BG = "#0ea5e9";
const C = { accent: "#0ea5e9", muted: "#6b7280" };
const s = (v) => (v != null ? String(v) : "-");

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
    stack: options.map((opt) => ({
      text: `· ${capitalizeTR(s(opt.label || opt.title))}`,
      fontSize: 7.5,
      color: "#9ca3af",
      margin: [0, 1, 0, 0],
    })),
  };
}

module.exports = function buildItemsTable(ver) {
  const sym = currencySymbol(ver.lineItems?.[0]?.currency);

  const headerRow = [
    { text: "#",                        style: "tableHeader", fillColor: HDR_BG, alignment: "center" },
    { text: "ÜRÜN / HİZMET AÇIKLAMASI", style: "tableHeader", fillColor: HDR_BG },
    { text: "MİKTAR",                   style: "tableHeader", fillColor: HDR_BG, alignment: "center" },
    { text: `BİRİM FİYAT (${sym})`,     style: "tableHeader", fillColor: HDR_BG, alignment: "right" },
    { text: `TOPLAM (${sym})`,          style: "tableHeader", fillColor: HDR_BG, alignment: "right" },
  ];

  const dataRows = ver.lineItems.flatMap((item, i) => {
    const opts = buildOptions(item.selectedOptions);
    const descStack = [
      { text: s(item.title).toLocaleUpperCase("tr-TR"), style: "tableRow", bold: true },
      item.caption
        ? { text: capitalizeTR(s(item.caption)), fontSize: 8, color: "#374151", margin: [0, 1, 0, 0] }
        : null,
      item.notes
        ? { text: capitalizeTR(s(item.notes)), fontSize: 7.5, color: "#9ca3af", italics: true, margin: [0, 1, 0, 0] }
        : null,
      opts,
    ].filter(Boolean);

    return [[
      { text: String(i + 1).padStart(2, "0"), alignment: "center", style: "tableRow" },
      { stack: descStack },
      { text: String(item.quantity ?? 1), alignment: "center", style: "tableRow" },
      { text: formPrice(item.priceOffer),             alignment: "right", style: "tableRow" },
      { text: formPrice(item.priceOfferTotal?.value), alignment: "right", style: "tableRow" },
    ]];
  });

  return {
    stack: [
      sectionLabel("ÜRÜNLER / HİZMETLER"),
      {
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
        margin: [0, 0, 0, 4],
        headlineLevel: 1,
      },
    ],
    headlineLevel: 1,
  };
};
