import { Router } from "express";
import { userController } from "./user.controller";



const router = Router()

router.post('/createAccount',userController.createAccount)
router.post('/login',userController.login)

export const userRoute = router