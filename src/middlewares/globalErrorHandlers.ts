import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status"

const globalErrorHandler =async(err:any,req:Request,res:Response,next:NextFunction)=>{

    let statusCode = httpStatus.INTERNAL_SERVER_ERROR
    let success = false 
    let message = err.message || "something went wrong"
    let error = err 

    res.status(statusCode).json({
        success,
        message,
        error
    })


}


export default globalErrorHandler