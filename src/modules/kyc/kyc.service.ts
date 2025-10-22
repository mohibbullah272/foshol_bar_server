import { Prisma } from "@prisma/client";
import prisma from "../../config/db";



// for admin
const getAllKycRequest = async(searchTerm:string)=>{
    const result = await prisma.kYC.findMany({
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
        include:{
          user:true
        },
        orderBy: {
          id: 'desc', 
        },
      });

      return result
}
// for admin
const getKycRequestDetails = async(id:number)=>{
const result = await prisma.kYC.findUnique({
    where:{
        id
    },
    include:{
        user:true
    }
    
})

return result

}
const responseKyc = async(payload:any)=>{
  const result = await prisma.$transaction(async(tx)=>{
      const kycUpdate = await prisma.kYC.update({
          where:{
              id:payload.id
          },
          data:{
              status:payload.kycStatus
          }
      })
      const userUpdate = await prisma.user.update({
          where:{
           id:payload.userId
          },
          data:{
              status:payload.UserStatus
          }
      })
      return {kycUpdate,userUpdate}
  })
  return result
}

const getUserKycRequest = async(userId:number)=>{
  const result = await prisma.kYC.findUnique({
    where:{
      userId
    },
    include:{
      user:true
    }
  })
  return result
}
const makeKycRequest = async(payload:Prisma.KYCCreateInput)=>{
    const result = await prisma.kYC.create({
        data:payload
    })
    return result
}


// for admin

export const kycService = {

    getAllKycRequest,
    getKycRequestDetails,
    makeKycRequest,
    responseKyc,
    getUserKycRequest
}