const PdfPrinter = require("pdfmake");
const path = require("path");

const fonts = {
  Roboto: {
    normal: path.join(__dirname, "../assets/fonts/NotoSans-Regular.ttf"),
    bold: path.join(__dirname, "../assets/fonts/NotoSans-Bold.ttf"),
    italics: path.join(__dirname, "../assets/fonts/NotoSans-Regular.ttf"),
    bolditalics: path.join(__dirname, "../assets/fonts/NotoSans-Bold.ttf"),
  },
};

const printer = new PdfPrinter(fonts);

/**
 * Ana PDF üretici.
 * @param {Object} body - { template?: string, data: Object }
 * @param {Response} res - Express response
 *
 * Backward compat: eğer body.data yoksa tüm body = data, template = "quotation"
 */
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
