import PDFDocument from "pdfkit";

export const investmentTemplate = (
  doc:typeof PDFDocument,
  data: any,
  logo?: string
) => {
  // -------- PAGE SETUP --------
  const pageWidth = doc.page.width;
  const margin = 40;
  
  // -------- HEADER SECTION (as before) --------
  if (logo) {
    try {
      doc.image(logo, margin, 40, { width: 60 });
    } catch {}
  }

  doc
    .fontSize(22)
    .font("Helvetica-Bold")
    .fillColor("#166534") // Green color
    .text("FOSHOL BARI", 120, 45);

  doc
    .fontSize(10)
    .font("Helvetica")
    .fillColor("#475569") // Slate gray
    .text("Address: 25/7/1 Zigatola, Dhaka", 120, 75)
    .text("Email: fosholbariagro@gmail.com", 120, 90)
    .text("Phone: 01912-953218", 120, 105);

  // -------- HEADER DIVIDER --------
  doc.moveTo(margin, 130)
     .lineTo(pageWidth - margin, 130)
     .stroke("#dcfce7") // Light green
     .lineWidth(1);

  // -------- DOCUMENT TITLE --------
  doc.moveDown(3);
  
  doc.fontSize(24)
     .font("Helvetica-Bold")
     .fillColor("#1e293b") // Dark slate
     .text("INVESTMENT CERTIFICATE", { align: "center" });

  doc.fontSize(12)
     .font("Helvetica-Oblique")
     .fillColor("#64748b") // Slate 500
     .text(`Certificate ID: ${data.investmentId || `INV-${Date.now().toString().slice(-8)}`}`, 
           { align: "center" });

  // -------- INVESTMENT DETAILS SECTION --------
  doc.moveDown(2);

  // Section Header
  doc.fontSize(16)
     .font("Helvetica-Bold")
     .fillColor("#0f766e") // Teal 700
     .text("Investment Details", margin);

  // Divider under section header
  doc.moveTo(margin, doc.y + 5)
     .lineTo(margin + 150, doc.y + 5)
     .stroke("#0f766e")
     .lineWidth(2);

  doc.moveDown(1);

  // -------- DETAILS TABLE --------
  const startY = doc.y + 10;
  const column1X = margin;
  const column2X = pageWidth / 2;
  const rowHeight = 25;

  // Table rows with your data
  const details = [
    { label: "Investor Name", value: data.userName || "N/A" },
    { label: "Investor Phone", value: data.userPhone || "N/A" },
    { label: "Project Name", value: data.projectName || "N/A" },
    { label: "Project Location", value: data.projectLocation || "N/A" },
    { label: "Project Duration", value: data.projectDuration || "N/A" },
    { label: "Total Shares Bought", value: data.totalShareBought || "0" },
    { label: "Total Investment Amount", value: `BDT ${Number(data.totalAmount || 0).toLocaleString()}` },
    { label: "Payment Method", value: data.paymentMethod || "N/A" },
    { label: "Estimated ROI", value: `${data.ROI || "N/A"}%` },
    { label: "Investment Date", value: new Date(data.investmentDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) },
    { label: "Investment Status", value: data.investmentStatus || "Pending" },
  ];

  // Draw table rows with alternating background
  details.forEach((item, index) => {
    const yPos = startY + (index * rowHeight);
    
    // Alternate row background
    if (index % 2 === 0) {
      doc.rect(column1X, yPos - 5, pageWidth - 2 * margin, rowHeight)
         .fill("#f8fafc"); // Slate 50
    }

    // Label (Left column)
    doc.fontSize(11)
       .font("Helvetica-Bold")
       .fillColor("#334155") // Slate 700
       .text(`${item.label}:`, column1X + 10, yPos);

    // Value (Right column)
    doc.fontSize(11)
       .font("Helvetica")
       .fillColor("#1e293b") // Slate 900
       .text(item.value, column2X, yPos);
  });

  // Table border
  const tableHeight = details.length * rowHeight;
  doc.rect(column1X, startY - 5, pageWidth - 2 * margin, tableHeight)
     .stroke("#cbd5e1") // Slate 300
     .lineWidth(1);

  // -------- SUMMARY BOX --------
  const summaryY = startY + tableHeight + 30;
  
  doc.rect(margin, summaryY, pageWidth - 2 * margin, 60)
     .fill("#f0fdf4") // Green 50
     .stroke("#86efac") // Green 300
  
     .lineWidth(1);

  // Summary Title
  doc.fontSize(14)
     .font("Helvetica-Bold")
     .fillColor("#166534") // Green 800
     .text("Investment Summary", margin + 15, summaryY + 15);

  // Calculate projected returns
  const totalAmount = Number(data.totalAmount || 0);
  const roi = Number(data.ROI || 0);
  const projectedReturn = totalAmount * (roi / 100);
  const totalReturn = totalAmount + projectedReturn;

  // Summary details
  const summaryText = [
    `Investment Amount: BDT ${totalAmount.toLocaleString()}`,
    `Projected ROI: ${roi}% (BDT ${projectedReturn.toLocaleString()})`,
    `Total Expected Return: BDT ${totalReturn.toLocaleString()}`
  ];

  doc.fontSize(10)
     .font("Helvetica")
     .fillColor("#475569")
     .text(summaryText.join(" • "), margin + 15, summaryY + 40, {
       width: pageWidth - 2 * margin - 30
     });

  // -------- TERMS & CONDITIONS --------
  const termsY = summaryY + 80;
  
  doc.fontSize(12)
     .font("Helvetica-Bold")
     .fillColor("#0f766e")
     .text("Terms & Conditions", margin, termsY);

  doc.moveTo(margin, termsY + 20)
     .lineTo(margin + 150, termsY + 20)
     .stroke("#0f766e")
     .lineWidth(2);

  doc.moveDown(0.5);

  const terms = [
    "1. This certificate represents ownership of shares in the specified agricultural project.",
    "2. Returns are estimated based on projected yields and market conditions.",
    "3. Foshol Bari Agro Ltd. will provide quarterly progress reports.",
    "4. Investment period is as per the project duration specified above.",
    "5. For any queries, contact: fosholbariagro@gmail.com"
  ];

  doc.fontSize(9)
     .font("Helvetica")
     .fillColor("#64748b")
     .list(terms, {
       bulletRadius: 2,
       textIndent: 10,
       lineGap: 5,
       width: pageWidth - 2 * margin
     });

  // -------- SIGNATURE SECTION --------
  const signatureY = termsY + 120;
  
  doc.moveTo(pageWidth - margin - 200, signatureY)
     .lineTo(pageWidth - margin, signatureY)
     .stroke("#94a3b8")
     .lineWidth(1);

  doc.fontSize(10)
     .font("Helvetica-Oblique")
     .fillColor("#475569")
     .text("Authorized Signature", pageWidth - margin - 200, signatureY + 10, {
       width: 200,
       align: "center"
     });

  doc.fontSize(9)
     .fillColor("#64748b")
     .text("Foshol Bari Agro Ltd.", pageWidth - margin - 200, signatureY + 25, {
       width: 200,
       align: "center"
     });

  // -------- FOOTER --------
  const footerY = doc.page.height - 40;
  
  doc.fontSize(9)
     .font("Helvetica")
     .fillColor("#94a3b8")
     .text(`Document generated on: ${new Date().toLocaleString('en-US', {
       year: 'numeric',
       month: 'long',
       day: 'numeric',
       hour: '2-digit',
       minute: '2-digit'
     })}`, margin, footerY, {
       align: "center",
       width: pageWidth - 2 * margin
     });

  // Page number
  doc.text("Page 1 of 1", margin, footerY, { align: "right" });

  // -------- WATERMARK (Subtle) --------
  doc.opacity(0.03)
     .fontSize(100)
     .font("Helvetica-Bold")
     .fillColor("#16a34a")
     .text("FOSHOL BARI", margin, doc.page.height / 2, {
       align: "center",
       width: pageWidth - 2 * margin
     })
     .opacity(1);
};