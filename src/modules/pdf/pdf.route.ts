import { Router } from "express";
import { generatePdfController } from "./pdf.controller";


const router = Router();

router.post("/generate", generatePdfController);

export const pdfRoute = router
