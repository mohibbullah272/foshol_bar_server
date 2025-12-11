import { Prisma, Role } from "@prisma/client";
import prisma from "../../config/db";





const createReview =async (payload:Prisma.RivewCreateInput)=>{
const result = await prisma.rivew.create(
    {
        data:payload
    }
)

return result

}

const getAllReview = async(projectId:number)=>{
    const result = await prisma.rivew.findMany({
        where:{
            projectId
        },
     include:{
       user:{
        select:{
            name:true,
            photo:true
        }
       }
     }
    })
    return result
}

const deleteReview = async(reviewId:string,userId:number)=>{
    let role:Role = "INVESTOR"
const result = await prisma.$transaction(async(tnx)=>{
    const findOutReview = await tnx.rivew.findUnique({
        where:{
            id:reviewId
        }

    })
    const checkUserRole = await tnx.user.findUnique({
        where:{
            id:userId
        }
    })
    if(checkUserRole?.role ==="ADMIN"){

        role = "ADMIN"
    }
    


    if(findOutReview?.userId === userId){
        const deleteReviewByUser = await tnx.rivew.delete({
            where:{
                id:reviewId
            }
            
        })
        return deleteReviewByUser
    }else if(findOutReview?.userId !== userId){
        throw new Error("your not author of this review")
    }else if(role === "ADMIN"){
        const deleteReviewByAdmin = await tnx.rivew.delete({
            where:{
                id:reviewId
            }
        })
        return deleteReviewByAdmin
    }else {
        throw new Error("action not permitted")
    }

 

})
return result

}

export const reviewService ={
    createReview,
    getAllReview,
    deleteReview
}