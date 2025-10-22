import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { userService } from "./user.service";
import sendResponse from "../../shared/sendResponse";





const createAccount = catchAsync(async(req:Request,res:Response)=>{
    const result = await userService.createAccount(req.body)
    sendResponse(res,{
        statusCode:201,
        success:true,
        message:"user created successful",
        data:result
    })
})



const login = catchAsync(async(req:Request,res:Response)=>{
    const result = await userService.login(req.body)
    sendResponse(res,{
        statusCode:201,
        success:true,
        message:"user logged in successful",
        data:result
    })
})


const adminDashboard = catchAsync(async(req:Request,res:Response)=>{
    const result = await userService.adminDashboardOverview()
    sendResponse(res,{
        statusCode:200,
        success:true,
        message:"dashboard overview retrieve successful",
        data:result
    })
})

const investorDashboard = catchAsync(async(req:Request,res:Response)=>{
    const result = await userService.InvestorDashboardOverview(Number(req.query.userId))

    sendResponse(res,{
        statusCode:200,
        success:true,
        message:"dashboard overview retrieve successful",
        data:result
    })
})

const getUserProfile = catchAsync(async(req:Request,res:Response)=>{
    const result = await userService.getUserProfileDetails(Number(req.query.userId))

    sendResponse(res,{
        statusCode:200,
        success:true,
        message:"user details retrieve successful",
        data:result
    })

})
const updateUserProfile =catchAsync(async(req:Request,res:Response)=>{
const data = req.body 
const {userId}=req.query

const result = await userService.updateUserProfile(data,Number(userId))

sendResponse(res,{
    statusCode:201,
    success:true,
    message:"user details updated successful",
    data:result
})
})
export const userController={
    createAccount,
    login,
    adminDashboard,
    investorDashboard,
    getUserProfile,
    updateUserProfile
}