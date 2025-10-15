import { Router } from "express";
import { userRoute } from "../modules/user/user.route";



const router = Router()

const moduleRoute =[
    {
        path:"/user",
        route:userRoute
    }
]

moduleRoute.forEach(route=>router.use(route.path,route.route))


export default router