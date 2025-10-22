import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { kycService } from "./kyc.service";
import sendResponse from "../../shared/sendResponse";


const getAllKycRequest = catchAsync(async(req:Request,res:Response)=>{
    const {searchTerm}= req.query
    const result = await kycService.getAllKycRequest(searchTerm as string)
    sendResponse(res,{
        statusCode:201,
        success:true,
        message:"kyc requests retrieve successfully",
        data:result
    })
})

const getKycRequestDetails = catchAsync(async(req:Request,res:Response)=>{
const id = req.params.id;
const result = await kycService.getKycRequestDetails(Number(id))

sendResponse(res,{
    statusCode:201,
    success:true,
    message:"kyc request retrieve successfully",
    data:result
})

})

const createKycRequest = catchAsync(async(req:Request,res:Response)=>{

const result = await kycService.makeKycRequest(req.body)
    sendResponse(res,{
        statusCode:201,
        success:true,
        message:"kyc request retrieve successfully",
        data:result
    })

})

const responseKycRequest = catchAsync(async(req:Request,res:Response)=>{
    const result = await kycService.responseKyc(req.body)

    sendResponse(res,{
        statusCode:201,
        success:true,
        message:"Data updated  successfully",
        data:result
    })
})
const getUserKycRequest = catchAsync(async(req:Request,res:Response)=>{
    const result = await kycService.getUserKycRequest(Number(req.params.userId))

    sendResponse(res,{
        statusCode:201,
        success:true,
        message:"data found   successfully",
        data:result
    })
})


export const kycController ={
    getAllKycRequest,
    getKycRequestDetails,
    createKycRequest,
    responseKycRequest,
    getUserKycRequest
}