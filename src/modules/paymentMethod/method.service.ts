import { Prisma } from "@prisma/client";
import prisma from "../../config/db";



const getAllPaymentMethod = async()=>{
    const result = await prisma.paymentMethod.findMany()
    return result
}

const getSpecificPaymentMethod = async(id:number)=>{
    const result = await prisma.paymentMethod.findUnique({
        where:{
            id
        }
    })
    return result
}


const createPaymentMethod = async(payload:Prisma.PaymentMethodCreateInput)=>{
    if(!payload){
        throw new Error('payload is required')
    }
    const result = await prisma.paymentMethod.create({
        data:payload
    })
    return result
}

const updatePaymentMethod = async(payload:Prisma.PaymentMethodUpdateInput,id:number)=>{
    const result = await prisma.paymentMethod.update({
where:{
    id
},
data:payload
    })
    return result
}



const deletePaymentMethod = async(id:number)=>{
    const result = await prisma.paymentMethod.delete({
        where:{
            id
        }
    })
    return result
}

export const paymentMethodService={
    getAllPaymentMethod,
    getSpecificPaymentMethod,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod
}