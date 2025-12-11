import { Router } from "express";
import { userRoute } from "../modules/user/user.route";
import { projectRoute } from "../modules/projects/project.route";
import { paymentMethodRoute } from "../modules/paymentMethod/method.route";
import { paymentRoute } from "../modules/payment/payment.route";
import { investmentRoute } from "../modules/investment/invest.route";
import { kycRoute } from "../modules/kyc/kyc.route";
import { chatRoute } from "../Conversation/chat.route";
import { NotificationRouter } from "../modules/Notification/Notification.route";
import { ReviewRoute } from "../modules/Reviews/Review.route";
import { chatbotRoute } from "../modules/chatbot/chat.route";
import { pdfRoute } from "../modules/pdf/pdf.route";




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
    },
    {
        path:"/investment",
        route:investmentRoute
    },
    {
        path:"/kyc",
        route:kycRoute
    },
   {
    path:"/chat",
    route:chatRoute
   },
   {
    path:"/notifications",
    route:NotificationRouter
   },
   {
    path:"/review",
    route:ReviewRoute
   },
   {
    path:"/ai",
    route:chatbotRoute
   },
   {
    path:"/download/pdf",
    route:pdfRoute
   }

      
    
 
]

moduleRoute.forEach(route=>router.use(route.path,route.route))


export default router