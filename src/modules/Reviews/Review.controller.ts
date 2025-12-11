import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { reviewService } from "./Review.service";
import sendResponse from "../../shared/sendResponse";



const createReview =catchAsync(async(req:Request,res:Response)=>{
const result = await reviewService.createReview(req.body)
sendResponse(res,{
    statusCode:201,
    success:true,
    message:"review created",
    data:result
})

})

const getAllReview = catchAsync(async(req:Request,res:Response)=>{
const projectId = parseInt(req.params.projectId)
const result = await reviewService.getAllReview(projectId)
sendResponse(res,{
    statusCode:200,
    success:true,
    message:"review retrieved successfully ",
    data:result
})

})


const deleteSingleReview = catchAsync(async(req:Request,res:Response)=>{
const reviewId = (req.query.reviewId  as string)
const userId = parseInt(req.query.userId as string)
const result = await reviewService.deleteReview(reviewId,userId)

sendResponse(res,{
    statusCode:201,
    success:true,
    message:"review deleted successfully",
    data:result
})


})



export const reviewController = {
    createReview,
    getAllReview,
    deleteSingleReview
}