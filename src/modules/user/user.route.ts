import { Router } from "express";
import { userController } from "./user.controller";
import { requireAdmin, verifySession } from "../../middlewares/auth";



const router = Router()


router.get('/admin/dashboard-overview',userController.adminDashboard)
router.get('/details',userController.getUserProfile)
router.patch('/update',userController.updateUserProfile)
router.get('/investor/dashboard-overview',userController.investorDashboard)
router.post('/createAccount',userController.createAccount)
router.post('/login',userController.login)

export const userRoute = router