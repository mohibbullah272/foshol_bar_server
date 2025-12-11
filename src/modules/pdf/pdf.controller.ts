import { Request, Response } from "express";
import { generatePdfService } from "./pdf.service";

// UPDATE your pdf.controller.ts
export const generatePdfController = async (req: Request, res: Response) => {
    try {
      const { type, data, logo } = req.body;
  
      if (!type || !data) {
        return res.status(400).json({ message: "Type and data are required" });
      }
  
      const buffer = await generatePdfService(type, data, logo);
  
      // Important: Set proper headers
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=${type}-${Date.now()}.pdf`);
      res.setHeader("Content-Length", buffer.length);
      
      // Send the buffer directly
      res.end(buffer);
    } catch (error:any) {
      console.error("PDF Generation Error:", error);
      res.status(500).json({ message: "PDF generation failed", error: error.message });
    }
  };