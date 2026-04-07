const { capitalizeTR, formPrice, currencySymbol } = require("../../lib/helpers");
const { resolveImage } = require("../../lib/imageLoader");

const MUTED   = "#6b7280";
const DIVIDER = "#e5e7eb";
const HDR_BG  = "#f8fafc";
const SPEC_BG = "#f1f5f9";
const ALT_BG  = "#f9fafb";
const BODY    = "#374151";

const s = (v) => (v != null && v !== "" ? String(v) : "");

/* ---------- helpers ---------- */

function sectionLabel(text, accentColor) {
  return {
    columns: [
      { canvas: [{ type: "rect", x: 0, y: 1, w: 2, h: 8, color: accentColor }], width: 8 },
      { text, fontSize: 7, bold: true, color: MUTED, margin: [0, 1, 0, 0] },
    ],
    margin: [0, 0, 0, 3],
  };
}

function placeholder() {
  return {
    stack: [
      { canvas: [{ type: "rect", x: 0, y: 0, w: 110, h: 80, color: "#f3f4f6", r: 2 }] },
    ],
    width: 110,
  };
}

/* ---------- card header ---------- */

function buildCardHeader(image, item, accentColor) {
  const imgCell = image
    ? { image, fit: [110, 80] }
    : placeholder();

  const infoStack = [
    { text: s(item.title).toLocaleUpperCase("tr-TR"), fontSize: 9.5, bold: true, color: "#0f172a" },
    s(item.caption)
      ? { text: capitalizeTR(s(item.caption)), fontSize: 8, color: BODY, margin: [0, 2, 0, 0] }
      : null,
    s(item.productDesc)
      ? { text: s(item.productDesc), fontSize: 7.5, color: MUTED, margin: [0, 3, 0, 0] }
      : null,
    s(item.variantDesc)
      ? { text: s(item.variantDesc), fontSize: 7.5, color: MUTED, italics: true, margin: [0, 1, 0, 0] }
      : null,
    s(item.condition)
      ? { text: s(item.condition), fontSize: 7, color: accentColor, margin: [0, 3, 0, 0] }
      : null,
  ].filter(Boolean);

  // Fix 1: unbreakable + dontBreakRows keeps image and title on same page
  const headerTable = {
    table: {
      widths: [3, 118, "*"],
      heights: [80],
      dontBreakRows: true,
      body: [[
        { canvas: [{ type: "rect", x: 0, y: 0, w: 3, h: 80, color: accentColor }], border: [false, false, false, false] },
        { stack: [imgCell], fillColor: "#ffffff", border: [false, false, false, false], margin: [4, 4, 4, 4] },
        { stack: infoStack, fillColor: "#ffffff", border: [false, false, false, false], margin: [8, 8, 0, 8] },
      ]],
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
      paddingTop: () => 0,
      paddingBottom: () => 0,
      paddingLeft: () => 0,
      paddingRight: () => 0,
    },
  };
  return { stack: [headerTable], unbreakable: true };
}

/* ---------- tech spec section ---------- */

async function buildTechSpecs(options, accentColor) {
  const withDesc = options.filter((o) => s(o.desc));
  if (!withDesc.length) return null;

  const specRows = await Promise.all(
    withDesc.map(async (opt) => {
      const img = await resolveImage(opt.image).catch(() => null);

      const imgCell = img
        ? { image: img, fit: [40, 40], margin: [0, 0, 6, 0], border: [false, false, false, false] }
        : {
            canvas: [{ type: "rect", x: 0, y: 0, w: 40, h: 40, color: "#e5e7eb", r: 2 }],
            width: 40,
            margin: [0, 0, 6, 0],
            border: [false, false, false, false],
          };

      // Fix 4: white background for option rows
      const labelCell = {
        stack: [
          { text: capitalizeTR(s(opt.label || opt.title)), fontSize: 8, bold: true, color: BODY },
          { text: s(opt.desc), fontSize: 7.5, color: MUTED, margin: [8, 2, 0, 0] },
        ],
        border: [false, false, false, false],
        fillColor: "#ffffff",
      };

      return [imgCell, labelCell];
    })
  );

  return {
    stack: [
      { canvas: [{ type: "line", x1: 0, y1: 0, x2: 523, y2: 0, lineWidth: 0.4, lineColor: DIVIDER }], margin: [0, 4, 0, 4] },
      sectionLabel("TEKNİK ÖZELLİKLER", accentColor),
      {
        // Fix 2 + 3: dontBreakRows prevents mid-row splits; keepWithHeaderRows
        // keeps sectionLabel attached to first data row
        table: {
          widths: [46, "*"],
          dontBreakRows: true,
          keepWithHeaderRows: 1,
          body: specRows,
        },
        layout: {
          hLineWidth: (i) => (i === 0 ? 0 : 0.4),
          vLineWidth: () => 0,
          hLineColor: () => DIVIDER,
          fillColor: () => "#ffffff",
          paddingTop: () => 5,
          paddingBottom: () => 5,
          paddingLeft: (j) => j === 0 ? 4 : 0,
          paddingRight: () => 4,
        },
      },
    ],
    margin: [8, 0, 0, 0],
  };
}

/* ---------- card wrapper ---------- */

async function buildCard(item, opts) {
  const { accentColor } = opts;
  const image = await resolveImage(item.image).catch(() => null);

  const header   = buildCardHeader(image, item, accentColor);
  const techSpecs = await buildTechSpecs(item.selectedOptions || [], accentColor);

  const cardContent = {
    stack: [header, techSpecs].filter(Boolean),
  };

  return {
    table: {
      widths: ["*"],
      body: [[cardContent]],
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => DIVIDER,
      vLineColor: () => DIVIDER,
      paddingTop: () => 0,
      paddingBottom: () => 8,
      paddingLeft: () => 0,
      paddingRight: () => 8,
    },
    margin: [0, 0, 0, 16],
  };
}

/* ---------- main export ---------- */

/**
 * Tüm lineItem'ları kart olarak render eder.
 * @param {Array}  lineItems
 * @param {Object} options  - { accentColor, showPrices, language }
 * @returns {Object|null}   pdfmake content block
 */
module.exports = async function buildItemDetails(lineItems, options = {}) {
  if (!lineItems?.length) return null;

  const opts = {
    accentColor: options.accentColor || "#0ea5e9",
    showPrices:  options.showPrices  || false,
    language:    options.language    || "tr",
  };

  const cards = await Promise.all(lineItems.map((item) => buildCard(item, opts)));

  return {
    stack: [
      sectionLabel("ÜRÜN DETAYLARI", opts.accentColor),
      ...cards,
    ],
    margin: [0, 8, 0, 0],
  };
};
