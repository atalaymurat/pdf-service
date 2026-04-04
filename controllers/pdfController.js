const generateQuotationPdf = require("../services/pdfBuilder");
const path = require("path");

exports.generatePdf = async (req, res) => {
  try {
    await generateQuotationPdf(req.body, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate PDF", detail: err.message, stack: err.stack });
  }
};