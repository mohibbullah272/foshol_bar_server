
import { Prisma } from "@prisma/client";
import prisma from "../../config/db"



const getAllPayment = async (searchTerm?: string) => {
    const result = await prisma.payment.findMany({
      where: {
        ...(searchTerm
          ? {
              OR: [
                {
                  user: {
                    phone: {
                      contains: searchTerm,
                      mode: 'insensitive', 
                    },
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        user: true,
      },
      orderBy: {
        id: 'desc', 
      },
    });
  
    return result;
  };
  

const getSpecificPayment = async(id:number)=>{
const result = await prisma.payment.findUnique({
    where:{
        id
    }
})
return result
}
const makePayment = async(payload:Prisma.paymentCreateInput)=>{
    const result = await prisma.payment.create({
        data:payload
    })
    return result
}
const getUsersPayment = async(userId:number)=>{
    const result = await prisma.payment.findMany({
        where:{
            userId
        }
    })
    return result
}

const updatePaymentStatus = async(id:number,status:any)=>{
const result = await prisma.payment.update({
    where:{
        id
    },
    data:{
        status
    }
})
return result
}



export const paymentService ={
    getAllPayment,
    getSpecificPayment,
    getUsersPayment,
    updatePaymentStatus,
    makePayment
}