import { Router } from "express";
import { paymentController } from "./payment.controller";




const router = Router()

router.get('/all',paymentController.getAllPayment)
router.get('/details/:id',paymentController.getSpecificPayment)
router.get('/users',paymentController.getUsersPayment)
router.post('/create',paymentController.createPayment)
router.patch('/update-status/:id',paymentController.updatePaymentStatus)

export const paymentRoute = router