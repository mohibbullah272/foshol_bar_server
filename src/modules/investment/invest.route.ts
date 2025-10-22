import { Router } from "express";
import { investmentController } from "./invest.controller";





const router = Router()
router.get('/all',investmentController.getAllInvestment)
router.get('/all-user',investmentController.getUserAllInvestment)
router.get('/:id',investmentController.getInvestmentDetails)
router.patch('/update/:id',investmentController.updatePaymentStatus)
export const investmentRoute = router