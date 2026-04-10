const PdfPrinter = require("pdfmake");
const path = require("path");
const fs = require("fs");
const logger = require("../lib/logger");

function resolveFontPath(noto, roboto) {
  const notoPath   = path.join(__dirname, "../assets/fonts", noto);
  const robotoPath = path.join(__dirname, "../assets/fonts", roboto);
  if (fs.existsSync(notoPath)) return notoPath;
  logger.warn({ message: "Font not found, falling back to Roboto", font: noto });
  return robotoPath;
}

const fonts = {
  Roboto: {
    normal:      resolveFontPath("NotoSans-Regular.ttf", "Roboto-Regular.ttf"),
    bold:        resolveFontPath("NotoSans-Bold.ttf",    "Roboto-Bold.ttf"),
    italics:     resolveFontPath("NotoSans-Regular.ttf", "Roboto-Regular.ttf"),
    bolditalics: resolveFontPath("NotoSans-Bold.ttf",    "Roboto-Bold.ttf"),
  },
};

const printer = new PdfPrinter(fonts);

module.exports = async function generatePdf(body, res) {
  const template = body.template || "quotation";
  const data = body.data || body;

  let buildDocDefinition;
  try {
    buildDocDefinition = require(`../templates/${template}/index`);
  } catch {
    return res.status(400).json({ error: `Unknown template: ${template}` });
  }

  const docDefinition = await buildDocDefinition(data);

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  const chunks = [];
  pdfDoc.on("data", (c) => chunks.push(c));
  pdfDoc.on("end", () => {
    const buf = Buffer.concat(chunks);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${template}-${Date.now()}.pdf"`);
    res.send(buf);
  });
  pdfDoc.end();
};
