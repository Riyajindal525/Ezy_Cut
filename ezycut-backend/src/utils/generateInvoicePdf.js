const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const TEAL = "#0d9488";
const DARK = "#022525";
const GRAY = "#5b6b68";
const LIGHT_BG = "#f0fdfa";

/**
 * Generates a PDF invoice and saves it to /uploads/invoices/{invoiceNumber}.pdf
 * Returns the relative path (to store in invoice.pdfUrl)
 */
const generateInvoicePdf = (invoice) => {
  return new Promise((resolve, reject) => {
    try {
      const uploadsDir = path.join(__dirname, "..", "uploads", "invoices");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileName = `${invoice.invoiceNumber}.pdf`;
      const filePath = path.join(uploadsDir, fileName);

      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      /* ---------- Header band ---------- */
      doc.rect(0, 0, doc.page.width, 90).fill(LIGHT_BG);
      doc
        .fillColor(DARK)
        .fontSize(20)
        .font("Helvetica-Bold")
        .text(invoice.salon?.name || "Salon", 50, 30);
      doc
        .fillColor(GRAY)
        .fontSize(9)
        .font("Helvetica")
        .text(
          `${invoice.salon?.address || ""}${invoice.salon?.city ? ", " + invoice.salon.city : ""}`,
          50,
          55
        );
      if (invoice.salon?.phone) {
        doc.text(`Phone: ${invoice.salon.phone}`, 50, 68);
      }

      // Invoice number + date (top right)
      doc
        .fillColor(DARK)
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(invoice.invoiceNumber || "", 350, 30, { width: 195, align: "right" });
      doc
        .fillColor(GRAY)
        .fontSize(9)
        .font("Helvetica")
        .text(
          new Date(invoice.raisedAt || invoice.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          350,
          48,
          { width: 195, align: "right" }
        );

      doc.moveDown(4);

      /* ---------- Billed To ---------- */
      let y = 120;
      doc
        .fillColor(GRAY)
        .fontSize(8)
        .font("Helvetica-Bold")
        .text("BILLED TO", 50, y);
      doc
        .fillColor(DARK)
        .fontSize(11)
        .font("Helvetica-Bold")
        .text(invoice.customer?.name || "", 50, y + 14);
      doc
        .fillColor(GRAY)
        .fontSize(9)
        .font("Helvetica")
        .text(invoice.customer?.phone || "", 50, y + 30);

      /* ---------- Line items table ---------- */
      y = 180;
      doc.rect(50, y, 495, 22).fill(LIGHT_BG);
      doc
        .fillColor(GRAY)
        .fontSize(8)
        .font("Helvetica-Bold")
        .text("DESCRIPTION", 60, y + 7)
        .text("QTY", 320, y + 7, { width: 40, align: "center" })
        .text("RATE", 370, y + 7, { width: 80, align: "right" })
        .text("AMOUNT", 460, y + 7, { width: 75, align: "right" });

      y += 30;
      invoice.lineItems.forEach((item) => {
        doc
          .fillColor(DARK)
          .fontSize(10)
          .font("Helvetica")
          .text(item.name, 60, y, { width: 250 })
          .text(String(item.qty), 320, y, { width: 40, align: "center" })
          .text(`Rs. ${item.price.toLocaleString("en-IN")}`, 370, y, { width: 80, align: "right" })
          .text(`Rs. ${(item.qty * item.price).toLocaleString("en-IN")}`, 460, y, {
            width: 75,
            align: "right",
          });
        y += 22;
      });

      doc.moveTo(50, y + 5).lineTo(545, y + 5).strokeColor("#e5e7eb").stroke();
      y += 20;

      /* ---------- Totals ---------- */
      const totalsX = 350;
      const totalsW = 195;

      const addTotalRow = (label, value, opts = {}) => {
        doc
          .fillColor(opts.color || GRAY)
          .fontSize(opts.size || 10)
          .font(opts.bold ? "Helvetica-Bold" : "Helvetica")
          .text(label, totalsX, y, { width: totalsW - 90 })
          .text(value, totalsX + totalsW - 90, y, { width: 90, align: "right" });
        y += opts.size ? opts.size + 10 : 18;
      };

      addTotalRow("Subtotal", `Rs. ${invoice.subtotal.toLocaleString("en-IN")}`);
      if (invoice.discountAmount > 0) {
        addTotalRow("Discount", `- Rs. ${invoice.discountAmount.toLocaleString("en-IN")}`, {
          color: "#dc2626",
        });
      }
      addTotalRow(`GST (${invoice.gstRate}%)`, `Rs. ${invoice.gstAmount.toLocaleString("en-IN")}`);

      doc.moveTo(totalsX, y).lineTo(545, y).strokeColor("#e5e7eb").stroke();
      y += 12;

      addTotalRow("Total", `Rs. ${invoice.totalAmount.toLocaleString("en-IN")}`, {
        color: TEAL,
        size: 14,
        bold: true,
      });

      /* ---------- Footer ---------- */
      doc
        .fillColor("#9ca3af")
        .fontSize(8)
        .font("Helvetica")
        .text(
          "This is a computer-generated invoice issued via EzyCut Solutions Private Limited.",
          50,
          760,
          { width: 495, align: "center" }
        );

      doc.end();

      stream.on("finish", () => {
        resolve(`/uploads/invoices/${fileName}`);
      });
      stream.on("error", reject);
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = generateInvoicePdf;