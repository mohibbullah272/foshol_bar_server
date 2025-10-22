import { Router } from "express";
import { kycController } from "./kyc.controller";


const router = Router()


router.get('/all',kycController.getAllKycRequest)
router.get('/user/:userId' ,kycController.getUserKycRequest)
router.get('/:id',kycController.getKycRequestDetails)
router.post('/create',kycController.createKycRequest)
router.patch("/update-status",kycController.responseKycRequest)

export const kycRoute = router