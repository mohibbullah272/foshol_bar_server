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
const makePayment = async (payload: {
    userId: number;
    projectId: number;
    method: any;
    amount: number;
    shareBought: number;
    totalAmount: number;
  }) => {
  
    const result = await prisma.$transaction(async (tx) => {
   
      const payment = await tx.payment.create({
        data: {
          method: payload.method,
          amount: payload.amount,
          status:"PENDING",
          user: { connect: { id: payload.userId } },
          project: { connect: { id: payload.projectId } },
        },
      });
  
      
      const investment = await tx.investment.create({
        data: {
          user: { connect: { id: payload.userId } },
          project: { connect: { id: payload.projectId } },
          shareBought: payload.shareBought,
          totalAmount: payload.totalAmount,
          method:payload.method
        },
      });
  
      return { payment, investment };
    });
  
    return result;
  };
  
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