import { Prisma } from "@prisma/client";
import prisma from "../../config/db";





const createAccount = async(payload:Prisma.UserCreateInput)=>{
    const result = await prisma.user.create({
        data:payload
    })
    return result
}


const login = async(payload:{phone:string,password:string})=>{
if(!payload.phone){
    throw new Error('phone is required')
}
const user = await prisma.user.findUnique({
    where:{
        phone:payload.phone
    },
 
})

if(!user){
    throw new Error('user not found')
}
if(user.password != payload.password){
    throw new Error('invalid credential')
}
return user
}



const adminDashboardOverview = async()=>{
const stats = await prisma.$transaction(async(tnx)=>{

    const totalUser = await tnx.user.count()
    const totalVerifiedUser = await tnx.user.count({
        where:{
            status:"APPROVED"
        }
    })
    const totalProjects = await tnx.project.count()

    const totalKycPendingUser = await tnx.kYC.count({
        where:{
            status:"PENDING"
        }
    })
    return {totalUser,totalVerifiedUser,totalProjects,totalKycPendingUser}

})
const latestProject = await prisma.project.findMany({
    orderBy:{
        createdAt:"desc"
    },
    take:3
})

const latestUser = await prisma.user.findMany({
  orderBy:{
    createdAt:"desc"
  },
  take:3
})

return {stats,latestProject,latestUser}


}

const InvestorDashboardOverview = async(userId:number)=>{
    const stats = await prisma.$transaction(async(tnx)=>{
        const myProject = await tnx.payment.count({
            where:{
                userId
            }
        })
        const totalInvestment = await tnx.payment.aggregate({
            _sum:{
                amount:true
            },
            where:{
                userId
            }
        })
        const totalShareBought = await tnx.investment.aggregate({
            _sum:{
                shareBought:true
            },
            where:{
                userId
            }
        })
        const isVerified = await tnx.user.findFirst({
            where:{
                id:userId
            },
          select:{
            status:true
          }
        })


        return {myProject,totalInvestment,totalShareBought,isVerified}
    })
    const myRecentProject = await prisma.payment.findMany({
        where:{
            userId
        },
    
        include:{
            user:{
                select:{
                    name:true,
                    phone:true
                }
            },
            project:{
                select:{
                    name:true,
                    image:true
                }
            },
            
        },
        take:3
    
    })


    return {stats,myRecentProject}
}

const getUserProfileDetails = async(userId:number)=>{
const profile = await prisma.user.findFirst({
    where:{
        id:userId
    }
})
return profile
}
const updateUserProfile = async(payload:Prisma.UserUpdateInput,userId:number)=>{
    const data = await prisma.user.update({
        where:{
            id:userId
        },
        data:payload
    })
    return data
}





export const userService ={
    createAccount,
    login,
    adminDashboardOverview,
    InvestorDashboardOverview,
    getUserProfileDetails,
    updateUserProfile
}