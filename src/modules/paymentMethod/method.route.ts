
import { Router } from "express";
import { paymentMethodController } from "./method.controller";




const router = Router()

router.get('/all',paymentMethodController.getAllPaymentMethod)
router.get('/:id',paymentMethodController.getSpecificMethod)
router.post('/create',paymentMethodController.createPaymentMethod)
router.patch('/update/:id',paymentMethodController.updateMethod)
router.delete('/delete/:id',paymentMethodController.deletePaymentMethod)


export const paymentMethodRoute = router