import PDFDocument from "pdfkit";
import { investmentTemplate } from "./templates/investmet.tamplate";

export const generatePdfService = async (
    type: string,
    data: any,
    logo?: string
  ): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          margin: 40,
          size: 'A4',
          bufferPages: true // This helps with buffer handling
        });
  
        const buffers: Buffer[] = []; // Change to Buffer[]
        doc.on('data', (chunk: Buffer) => {
          buffers.push(chunk);
        });
        
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
  
        doc.on('error', (error) => {
          reject(error);
        });
  
        // 🔥 Choose template
        switch (type) {
          case "investment":
            investmentTemplate(doc, data, logo);
            break;
          default:
            doc.fontSize(20).text("Unknown PDF Type", { align: "center" });
        }
  
        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  };