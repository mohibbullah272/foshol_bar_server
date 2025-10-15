import { Router } from "express";
import { userRoute } from "../modules/user/user.route";
import { projectRoute } from "../modules/projects/project.route";
import { paymentMethodRoute } from "../modules/paymentMethod/method.route";
import { paymentRoute } from "../modules/payment/payment.route";



const router = Router()

const moduleRoute =[
    {
        path:"/user",
        route:userRoute
    },
    {
        path:"/project",
        route:projectRoute
    },
    {
        path:"/payment-method",
        route:paymentMethodRoute
    },
    {
        path:"/payments",
        route:paymentRoute
    }
]

moduleRoute.forEach(route=>router.use(route.path,route.route))


export default router