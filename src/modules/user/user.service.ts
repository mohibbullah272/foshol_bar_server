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
    throw new Error('email is required')
}
const user = await prisma.user.findUnique({
    where:{
        phone:payload.phone
    }
})

if(!user){
    throw new Error('user not found')
}
if(user.password != payload.password){
    throw new Error('invalid credential')
}
return user
}

export const userService ={
    createAccount,
    login
}