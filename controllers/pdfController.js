const generateQuotationPdf = require("../services/pdfBuilder");
const logger = require("../lib/logger");

exports.generatePdf = async (req, res) => {
  const template = req.body?.template || "quotation";
  const start = Date.now();

  logger.info({ message: "PDF generate start", template, offerId: req.body?.data?._id });

  try {
    await generateQuotationPdf(req.body, res);
    logger.info({ message: "PDF generated", template, duration: Date.now() - start });
  } catch (err) {
    logger.error({ message: "PDF generate failed", template, error: err.message });
    res.status(500).json({ error: "Failed to generate PDF", detail: err.message });
  }
};
