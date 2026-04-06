const C = {
  ink:    "#0f172a",
  body:   "#374151",
  muted:  "#6b7280",
  accent: "#0ea5e9",
  border: "#e2e8f0",
  bg:     "#f8fafc",
};

// Maps Turkish docType enum values → visibleIn keys used in termSchema
const DOCTYPE_MAP = {
  "Teklif":   "offer",
  "Proforma": "proforma",
  "Fatura":   "invoice",
  "Sipariş":  "order",
  "Sözleşme": "contract",
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

function formatValue(term) {
  const { value, fieldType } = term;
  if (value == null || value === "") return null;
  if (fieldType === "multiselect" && Array.isArray(value)) {
    return value.length ? value.join(", ") : null;
  }
  return String(value);
}

/**
 * @param {Array} offerTerms - array of termSchema objects
 * @param {string} docType   - e.g. "Teklif", "Proforma", "Sözleşme"
 */
function buildTerms(offerTerms, docType) {
  if (!Array.isArray(offerTerms) || !offerTerms.length) return [];

  const key = DOCTYPE_MAP[docType] || (docType || "").toLowerCase();

  const visible = offerTerms.filter((t) => {
    if (!t.isVisible) return false;
    if (!Array.isArray(t.visibleIn) || !t.visibleIn.includes(key)) return false;
    return formatValue(t) !== null;
  });

  if (!visible.length) return [];

  const rows = visible.map((t) => [
    { text: t.label, fontSize: 7.5, bold: true, color: C.muted },
    { text: formatValue(t), fontSize: 8.5, color: C.body, lineHeight: 1.3 },
  ]);

  return [
    {
      canvas: [{ type: "line", x1: 0, y1: 0, x2: 523, y2: 0, lineWidth: 0.4, lineColor: C.border }],
      margin: [0, 4, 0, 4],
    },
    sectionLabel("SATIŞ KOŞULLARI"),
    {
      table: { widths: [110, "*"], body: rows },
      layout: {
        hLineWidth: (i, n) => (i === 0 || i === n.table.body.length) ? 0.6 : 0.4,
        vLineWidth: () => 0,
        hLineColor: () => C.border,
        fillColor: (i) => i % 2 === 0 ? C.bg : null,
        paddingTop: () => 3,
        paddingBottom: () => 3,
        paddingLeft: () => 5,
        paddingRight: () => 5,
      },
      headlineLevel: 1,
    },
  ];
}

module.exports = buildTerms;
