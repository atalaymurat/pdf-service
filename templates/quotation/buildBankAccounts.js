const C = {
  ink:    "#0f172a",
  body:   "#374151",
  muted:  "#6b7280",
  accent: "#0ea5e9",
  border: "#e2e8f0",
  bg:     "#f8fafc",
  white:  "#ffffff",
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

const hdr = (t) => ({ text: t, fontSize: 7.5, bold: true, color: C.white, fillColor: C.accent });

/**
 * @param {Array} bankAccounts - org.bankAccounts array
 */
function buildBankAccounts(bankAccounts) {
  if (!Array.isArray(bankAccounts) || !bankAccounts.length) return [];

  const active = bankAccounts.filter((a) => a.isActive !== false);
  if (!active.length) return [];

  const hasHolder = active.some((a) => a.accountHolder && a.accountHolder.trim());

  const headerRow = [
    hdr("BANKA"),
    hdr("PARA BİRİMİ"),
    hdr("IBAN"),
    hdr("SWIFT"),
    ...(hasHolder ? [hdr("HESAP SAHİBİ")] : []),
  ];

  const dataRows = active.map((a, i) => {
    const fill = i % 2 === 0 ? C.bg : null;
    const cell = (t) => ({ text: t || "—", fontSize: 8, color: C.body, fillColor: fill });
    return [
      cell(a.bankName),
      cell(a.currency),
      cell(a.iban),
      cell(a.swiftCode),
      ...(hasHolder ? [cell(a.accountHolder)] : []),
    ];
  });

  const colWidths = hasHolder
    ? [100, 55, "*", 70, 90]
    : [110, 55, "*", 80];

  return [
    {
      canvas: [{ type: "line", x1: 0, y1: 0, x2: 523, y2: 0, lineWidth: 0.4, lineColor: C.border }],
      margin: [0, 4, 0, 4],
    },
    sectionLabel("BANKA HESAPLARI"),
    {
      table: { widths: colWidths, body: [headerRow, ...dataRows] },
      layout: {
        hLineWidth: (i, n) => (i === 0 || i === 1 || i === n.table.body.length) ? 0.6 : 0.4,
        vLineWidth: () => 0,
        hLineColor: () => C.border,
        paddingTop: () => 3,
        paddingBottom: () => 3,
        paddingLeft: () => 5,
        paddingRight: () => 5,
      },
      margin: [0, 0, 0, 4],
    },
  ];
}

module.exports = buildBankAccounts;
