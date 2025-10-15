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


export const userController={
    createAccount,
    login
}