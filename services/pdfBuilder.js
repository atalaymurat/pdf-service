const PdfPrinter = require("pdfmake");
const fs = require("fs");
const path = require("path");
const logoBase64 = require("../assets/logoBase64");
const { localeDate, formPrice } = require("../lib/helpers");

const fonts = {
  Roboto: {
    normal: path.join(__dirname, "../assets/fonts/Roboto-Regular.ttf"),
    bold: path.join(__dirname, "../assets/fonts/Roboto-Bold.ttf"),
  },
};

const printer = new PdfPrinter(fonts);

module.exports = async function generateQuotationPdf(data, res) {
  const { docCode, docType, versions, company, version = 0 } = data;

  const reqVer = versions[version];
  const fullAdress =
    company?.addresses?.[0].line1 +
    " " +
    company?.addresses?.[0].line2 +
    " " +
    company?.addresses?.[0].district +
    " " +
    company?.addresses?.[0].city +
    " " +
    company?.addresses?.[0].country;

  const content = [
    {
      columns: [
        { image: logoBase64, fit: [120, 60] },
        {
          text: docType || "Fiyat Teklifi",
          style: "header",
          alignment: "left",
          width: "*",
        },
        {
          table: {
            widths: ["auto", "*"],
            body: [
              [
                { text: "Tarih", style: "labelCell" },
                { text: localeDate(reqVer.docDate) || "-", style: "valueCell" },
              ],
              [
                { text: "Geçerli", style: "labelCell" },
                {
                  text: localeDate(reqVer.validDate) || "-",
                  style: "valueCell",
                },
              ],
              [
                { text: "Belge No", style: "labelCell" },
                { text: docCode || "-", style: "valueCell" },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0,
            vLineWidth: () => 0,
            paddingTop: () => 1,
            paddingBottom: () => 1,
            paddingLeft: () => 2,
            paddingRight: () => 2,
          },
          alignment: "left",
          width: "auto",
        },
      ],
      margin: [0, 0, 0, 5],
    },

    {
      table: {
        widths: ["auto", "*", "auto", "*"],
        body: [
          [
            { text: "Firma ", style: "labelCell" },
            {
              text: company.vatTitle || company?.title,
              style: "valueCell",
              colSpan: 3,
            },
            {},
            {},
          ],
          [
            { text: "Adres ", style: "labelCell" },
            {
              text: fullAdress,
              style: "valueCell",
              colSpan: 3,
            },
            {},
            {},
          ],
        ],
      },
      layout: {
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingTop: () => 1,
        paddingBottom: () => 1,
        paddingLeft: () => 2,
        paddingRight: () => 2,
      },
      margin: [0, 0, 0, 0],
    },
    {
      table: {
        widths: ["auto", "*", "auto", "*"],
        body: [
          [
            { text: "Telefon ", style: "labelCell" },
            { text: company.phones[0] || "-", style: "valueCell" },
            { text: "Eposta ", style: "labelCell" },
            { text: company.emails[0] || "-", style: "valueCell" },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingTop: () => 1,
        paddingBottom: () => 1,
        paddingLeft: () => 2,
        paddingRight: () => 2,
      },
      margin: [0, 0, 0, 10],
    },

    {
      table: {
        headerRows: 1,
        widths: ["5%", "50%", "10%", "15%", "20%"],
        body: [
          ["No", "Açıklama", "Ad.", "Birim Fiyat", "Toplam Fiyat"],
          ...reqVer.lineItems.map((item, i) => [
            `${(i + 1).toString().padStart(2, "0")}`,
            item.title || "",
            item.quantity || "",
            formPrice(item.priceNet) || "",
            formPrice(item.priceNetTotal.value) || "",
          ]),
        ],
      },
      layout: "lightHorizontalLines",
      margin: [0, 0, 0, 20],
    },
    { text: "TESLİM ŞARTLARI", style: "subheader" },
    { text: reqVer.deliveryTerms || "", margin: [0, 0, 0, 10] },
    { text: "GARANTİ", style: "subheader" },
    { text: reqVer.warranty || "", margin: [0, 0, 0, 10] },
    { text: "ÖDEME ŞEKLİ", style: "subheader" },
    { text: reqVer.paymentTerms || "", margin: [0, 0, 0, 10] },
    { text: "AÇIKLAMALAR", style: "subheader" },
    { text: reqVer.paymentTerms || "" },
  ];

  const docDefinition = {
    pageSize: "A4",
    pageMargins: [20, 30, 20, 30],
    header: {
      text: "Postiva",
      alignment: "center",
      bold: true,
      margin: [0, 5, 0, 5],
    },
    footer: (currentPage, pageCount) => ({
      text: `Sayfa ${currentPage} / ${pageCount}`,
      alignment: "center",
      fontSize: 9,
      margin: [0, 10],
    }),
    content,
    styles: {
      header: { fontSize: 16, bold: true, margin: [0, 0, 0, 10] },
      subheader: { fontSize: 13, bold: true, margin: [0, 10, 0, 4] },
      labelCell: { fontSize: 10, bold: true, color: "#444" },
      valueCell: { fontSize: 10 },
    },
    defaultStyle: {
      fontSize: 11,
      lineHeight: 1.0,
    },
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);

  const chunks = [];
  pdfDoc.on("data", (chunk) => chunks.push(chunk));
  pdfDoc.on("end", () => {
    const pdfBuffer = Buffer.concat(chunks);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="TEK-${Date.now()}.pdf"`
    );
    res.send(pdfBuffer);
  });
  pdfDoc.end();
};
