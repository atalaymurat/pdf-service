const { localeDate, capitalizeTR } = require("../../lib/helpers");
const { resolveImage } = require("../../lib/imageLoader");
const buildItemsTable = require("./buildItems");
const buildTerms = require("./buildTerms");
const buildBankAccounts = require("./buildBankAccounts");
const buildItemDetails = require("../shared/buildItemDetails");

const s = (v) => (v != null && v !== "" ? String(v) : "—");

const C = {
  ink:    "#0f172a",
  body:   "#374151",
  muted:  "#6b7280",
  accent: "#0ea5e9",
  border: "#e2e8f0",
  bg:     "#f8fafc",
  white:  "#ffffff",
};

const DOC_TITLE = {
  "Teklif":   "Fiyat Teklifi",
  "Proforma": "Proforma Fatura",
  "Fatura":   "Fatura",
  "Sipariş":  "Sipariş",
  "Sözleşme": "Sözleşme",
};

module.exports = async function (data) {
  const { versions, company } = data;
  const ver = versions[versions.length - 1];
  const docCode = ver.docCode;
  const docType = ver.docType;

  const addr = company?.addresses?.[0];
  const addrStr = [addr?.line1, addr?.line2, addr?.district, addr?.city, addr?.country]
    .filter(Boolean).join(", ");

  const logo = data.logoUrl
    ? await resolveImage(data.logoUrl).catch(() => null)
    : null;

  const itemDetails = await buildItemDetails(ver.lineItems, { accentColor: C.accent });

  return {
    pageSize: "A4",
    pageMargins: [36, 36, 36, 36],
    footer: (p, t) => ({
      columns: [
        { text: s(docCode), color: C.muted, fontSize: 7, margin: [36, 8] },
        { text: "Bu doküman POSTIVA tarafından oluşturulmuştur.", color: C.muted, fontSize: 7, alignment: "center", margin: [0, 8] },
        { text: `${p} / ${t}`, color: C.muted, fontSize: 7, alignment: "right", margin: [0, 8, 36, 0] },
      ],
    }),
    pageBreakBefore(node, following) {
      return node.headlineLevel === 1 && following.length === 0;
    },
    content: [
      buildHeader(logo, docType, docCode, ver),
      buildAccentLine(),
      buildDocTitle(docType),
      buildCompany(company, addrStr, data.contact),
      buildItemsTable(ver),
      ...buildTerms(ver.offerTerms, ver.docType || docType),
      ...(["Proforma", "Sipariş", "Sözleşme"].includes(docType)
        ? buildBankAccounts(data.bankAccounts)
        : []),
      ...(itemDetails ? [itemDetails] : []),
    ],
    styles: STYLES,
    defaultStyle: { fontSize: 9, font: "Roboto", color: C.body },
  };
};

function buildHeader(logo, docType, docCode, ver) {
  const logoCell = logo
    ? { image: logo, fit: [120, 48] }
    : {
        table: {
          widths: [120], heights: [48],
          body: [[{ text: "LOGO", alignment: "center", color: C.muted, fontSize: 9, bold: true, margin: [0, 15, 0, 0] }]],
        },
        layout: {
          hLineWidth: () => 0.6, vLineWidth: () => 0.6,
          hLineColor: () => C.border, vLineColor: () => C.border,
          fillColor: () => C.bg,
        },
      };

  return {
    columns: [
      { stack: [logoCell], width: 130 },
      { width: "*", text: "" },
      {
        width: "auto",
        table: {
          widths: [62, 150],
          body: [
            [metaLbl("TARİH"),       metaVal(localeDate(ver.docDate))],
            [metaLbl("GEÇERLİLİK"),  metaVal(localeDate(ver.validDate) || "—")],
            [metaLbl("BELGE NO"),    metaVal(s(docCode))],
            [metaLbl("VERSİYON"),    metaVal(`v${(ver.version ?? 0) + 1}`)],
          ],
        },
        layout: {
          hLineWidth: () => 0.4, vLineWidth: () => 0,
          hLineColor: () => C.border,
          paddingTop: () => 1, paddingBottom: () => 1,
          paddingLeft: () => 0, paddingRight: () => 0,
        },
      },
    ],
    margin: [0, 0, 0, 6],
  };
}

function buildAccentLine() {
  return {
    canvas: [
      { type: "line", x1: 0, y1: 0, x2: 523, y2: 0, lineWidth: 0.4, lineColor: C.border },
      { type: "line", x1: 0, y1: 3, x2: 80,  y2: 3, lineWidth: 2,   lineColor: C.accent },
    ],
    margin: [0, 0, 0, 6],
  };
}

function buildDocTitle(docType) {
  const title = DOC_TITLE[docType] || "Fiyat Teklifi";
  return {
    text: title.toLocaleUpperCase("tr-TR"),
    style: "docTitle",
    margin: [0, 0, 0, 6],
  };
}

function buildCompany(co, addrStr, contact) {
  const taxInfo     = [co?.vd, co?.vatNo].filter(Boolean).join(" / ") || "—";
  const contactStr  = [contact?.name, contact?.emails?.[0]].filter(Boolean).join("  ·  ");

  const rows = [
    [fldLbl("Firma"), { text: capitalizeTR(s(co?.vatTitle || co?.title)), style: "companyName", colSpan: 3 }, {}, {}],
  ];
  if (contactStr) rows.push([fldLbl("İlgili Kişi"), { text: contactStr, style: "fieldVal", colSpan: 3 }, {}, {}]);
  rows.push(
    [fldLbl("Adres"),       { text: capitalizeTR(s(addrStr)), style: "fieldVal", colSpan: 3 }, {}, {}],
    [fldLbl("Vergi D./No"), { text: taxInfo, style: "fieldVal" }, fldLbl("Telefon"), { text: s(co?.phones?.[0]), style: "fieldVal" }],
    [fldLbl("E-posta"),     { text: s(co?.emails?.[0]), style: "fieldVal" }, fldLbl("TC No"), { text: s(co?.tcNo), style: "fieldVal" }],
  );

  return {
    stack: [
      sectionLabel("MÜŞTERİ"),
      {
        table: { widths: [70, "*", 70, "*"], body: rows },
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
      },
    ],
    margin: [0, 0, 0, 6],
  };
}

function sectionLabel(text) {
  return {
    columns: [
      { canvas: [{ type: "rect", x: 0, y: 1, w: 2, h: 8, color: C.accent }], width: 8 },
      { text, fontSize: 7, bold: true, color: C.muted, margin: [0, 1, 0, 0] },
    ],
    margin: [0, 0, 0, 3],
  };
}

const metaLbl = (t) => ({ text: t, fontSize: 7, bold: true, color: C.muted, alignment: "right" });
const metaVal = (t) => ({ text: t, fontSize: 8, color: C.ink, bold: true, noWrap: true, margin: [6, 0, 0, 0] });
const fldLbl  = (t) => ({ text: t, style: "fieldLabel" });

const STYLES = {
  docTitle:    { fontSize: 18, bold: true, color: C.ink },
  companyName: { fontSize: 9.5, bold: true, color: C.ink },
  fieldLabel:  { fontSize: 7.5, bold: true, color: C.muted },
  fieldVal:    { fontSize: 8.5, color: C.body },
  sectionTitle:{ fontSize: 7, bold: true, color: C.muted },
  tableHeader: { fontSize: 8, bold: true, color: C.white },
  tableRow:    { fontSize: 8.5, color: C.body },
  totalLabel:  { fontSize: 8.5, alignment: "right", color: C.body },
  totalValue:  { fontSize: 8.5, alignment: "right", color: C.ink },
};
