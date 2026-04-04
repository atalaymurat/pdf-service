// Teklif alt bölümü: hazırlayan, müşteri yetkilisi, imza alanı
// contact ve user alanları şu an dummy — gerçek data ile değiştirilecek

const DIVIDER = {
  canvas: [{ type: "line", x1: 0, y1: 0, x2: 523, y2: 0, lineWidth: 0.4, lineColor: "#e5e7eb" }],
  margin: [0, 8, 0, 8],
};

function signatureBox(label) {
  return {
    stack: [
      { text: label, style: "sectionTitle", margin: [0, 0, 0, 4] },
      { text: "Ad Soyad: ____________________________", fontSize: 8.5, color: "#374151", margin: [0, 0, 0, 6] },
      { text: "Tarih:       ____________________________", fontSize: 8.5, color: "#374151", margin: [0, 0, 0, 6] },
      { text: "İmza / Kaşe:", fontSize: 8.5, color: "#374151", margin: [0, 0, 0, 20] },
      {
        canvas: [{ type: "rect", x: 0, y: 0, w: 160, h: 50, r: 2, lineColor: "#d1d5db", lineWidth: 0.6 }],
      },
    ],
  };
}

module.exports = function buildFooter(data) {
  const { contact, user } = data;

  // TODO: contact ve user populate edildikten sonra gerçek veriler gösterilecek
  const contactName  = contact?.name  || "—";
  const contactTitle = contact?.title || "";
  const userName     = user?.name     || "—";
  const userTitle    = user?.title    || "";

  return [
    DIVIDER,
    {
      columns: [
        {
          stack: [
            { text: "MÜŞTERİ YETKİLİSİ", style: "sectionTitle", margin: [0, 0, 0, 3] },
            { text: contactName,  fontSize: 8.5, bold: true,  color: "#111827" },
            { text: contactTitle, fontSize: 8,   color: "#6b7280" },
          ],
          width: "*",
        },
        {
          stack: [
            { text: "HAZIRLAYAN", style: "sectionTitle", margin: [0, 0, 0, 3] },
            { text: userName,  fontSize: 8.5, bold: true,  color: "#111827" },
            { text: userTitle, fontSize: 8,   color: "#6b7280" },
          ],
          width: "*",
        },
      ],
      margin: [0, 0, 0, 16],
      headlineLevel: 1,
    },
    {
      columns: [
        signatureBox("MÜŞTERİ İMZA / KAŞE"),
        { width: 20, text: "" },
        signatureBox("YETKİLİ İMZA / KAŞE"),
      ],
    },
  ];
};
