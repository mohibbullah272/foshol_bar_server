import { Router } from "express";



const router = Router()

const moduleRoute =[
    {
        path:"/",
        route:router
    }
]

moduleRoute.forEach(route=>router.use(route.path,route.route))


export default router