const express = require("express");
const bodyParser = require("body-parser");
const pdfRoutes = require("./routes/pdfRoutes");
const path = require("path");

const app = express();
app.use(bodyParser.json({ limit: "10mb" }));

app.use("/generate", pdfRoutes);
app.use("/pdfs", express.static(path.join(__dirname, "outputs"))); // optional: expose PDFs via URL

const PORT = process.env.PORT || 3023;
app.listen(PORT, () => console.log(`Postiva PDF service running on port ${PORT}`));