import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { paymentService } from "./payment.service";
import sendResponse from "../../shared/sendResponse";




const getAllPayment = catchAsync(async(req:Request,res:Response)=>{
    const {searchTerm}= req.query
    const result = await paymentService.getAllPayment(searchTerm as string)
    sendResponse(res,{
        statusCode:200,
        success:true,
        message:"payment retrieve successful",
        data:result
    })
})

const getUsersPayment =  catchAsync(async(req:Request,res:Response)=>{
const {userId}=req.query
const result = await paymentService.getUsersPayment(Number(userId))


sendResponse(res,{
    statusCode:200,
    success:true,
    message:"payment retrieve successful",
    data:result
})
})

const getSpecificPayment =  catchAsync(async(req:Request,res:Response)=>{
const result = await paymentService.getSpecificPayment(Number(req.params.id))


sendResponse(res,{
    statusCode:200,
    success:true,
    message:"payment retrieve successful",
    data:result
})


})

const createPayment = catchAsync(async(req:Request,res:Response)=>{

const result = await paymentService.makePayment(req.body)


sendResponse(res,{
    statusCode:200,
    success:true,
    message:"payment  successful",
    data:result
})
})


const updatePaymentStatus = catchAsync(async(req:Request,res:Response)=>{
const result = await paymentService.updatePaymentStatus(Number(req.params.id),req.body)

sendResponse(res,{
    statusCode:200,
    success:true,
    message:"payment status updated",
    data:result
})

})


export const paymentController ={
    getAllPayment,
    getUsersPayment,
    getSpecificPayment,
    createPayment,
    updatePaymentStatus
}