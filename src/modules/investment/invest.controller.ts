import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { investmentService } from "./invest.service";
import sendResponse from "../../shared/sendResponse";



const getUserAllInvestment = catchAsync(async(req:Request,res:Response)=>{
    const { userId } = req.query;  
 
const result = await investmentService.getUserAllInvestment(Number(userId))


sendResponse(res,{
    statusCode:200,
    success:true,
    message:"investment find success",
    data:result
})

})
const getAllInvestment = catchAsync(async(req:Request,res:Response)=>{
const result = await investmentService.getAllInvestment(req.query.searchTerm as string)


sendResponse(res,{
    statusCode:200,
    success:true,
    message:"investment find success",
    data:result
})

})


const updatePaymentStatus = catchAsync(async(req:Request,res:Response)=>{
    const result = await investmentService.updatePaymentStatus(Number(req.params.id),req.body)
    
    sendResponse(res,{
        statusCode:200,
        success:true,
        message:"payment status updated",
        data:result
    })
    
    })

const getInvestmentDetails = catchAsync(async(req:Request,res:Response)=>{
        
const result = await investmentService.getInvestmentDetails(Number(req.params.id))

sendResponse(res,{
    statusCode:200,
    success:true,
    message:"investment find success",
    data:result
})
})

export const investmentController ={
    getUserAllInvestment,
    getInvestmentDetails,
    getAllInvestment,
    updatePaymentStatus
}