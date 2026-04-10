require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const internalAuth = require("./middleware/internalAuth");
const pdfRoutes = require("./routes/pdfRoutes");
const logger = require("./lib/logger");

const app = express();
app.use(bodyParser.json({ limit: "10mb" }));

// Health check — auth olmadan erişilebilir olmalı
app.get("/health", (req, res) => res.json({ status: "ok", service: "pdf-service" }));


// Tüm route'lara internal API key kontrolü
app.use(internalAuth);

app.use("/generate", pdfRoutes);
app.use("/pdfs", express.static(path.join(__dirname, "outputs")));

const PORT = process.env.PORT || 3023;
app.listen(PORT, () => logger.info({ message: `Server running on port ${PORT}` }));
