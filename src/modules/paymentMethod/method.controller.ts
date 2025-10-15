import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { paymentMethodService } from "./method.service";
import sendResponse from "../../shared/sendResponse";



const getAllPaymentMethod =catchAsync(async(req:Request,res:Response)=>{
    const methods = await paymentMethodService.getAllPaymentMethod()
    sendResponse(res,{
        statusCode:200,
        success:true,
        message:"payment method retrieve success",
        data:methods
    })
})


const getSpecificMethod = catchAsync(async(req:Request,res:Response)=>{
const method = await paymentMethodService.getSpecificPaymentMethod(Number(req.params.id))
sendResponse(res,{
    statusCode:200,
    success:true,
    message:"payment method retrieve success",
    data:method
})

})

const createPaymentMethod =  catchAsync(async(req:Request,res:Response)=>{
const result = await paymentMethodService.createPaymentMethod(req.body)
sendResponse(res,{
    statusCode:200,
    success:true,
    message:"payment method created success",
    data:result
})

})



const updateMethod =  catchAsync(async(req:Request,res:Response)=>{
    const result = await paymentMethodService.updatePaymentMethod(req.body, Number(req.params.id))
  
sendResponse(res,{
    statusCode:200,
    success:true,
    message:"payment method update success",
    data:result
})
})


const deletePaymentMethod = catchAsync(async(req:Request,res:Response)=>{
const result = await paymentMethodService.deletePaymentMethod(Number(req.params.id))


sendResponse(res,{
    statusCode:200,
    success:true,
    message:"payment method deleted success",
    data:result
})

})


export const paymentMethodController ={
    getAllPaymentMethod,
    getSpecificMethod,
    updateMethod,
    deletePaymentMethod,
    createPaymentMethod
}
