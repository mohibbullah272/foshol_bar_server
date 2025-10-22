import prisma from "../../config/db"






const getAllInvestment = async (searchTerm?: string) => {
    const result = await prisma.investment.findMany({
      where: {
        ...(searchTerm
          ? {
              OR: [
                {
                  project: {
                    name: {
                      contains: searchTerm,
                      mode: "insensitive",
                    },
                  },
                },
                {
                  user: {
                    phone: {
                      contains: searchTerm,
                      mode: "insensitive",
                    },
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        user: {
          select: {
            name: true,
            phone: true,
          },
        },
        project: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });
  
    return result;
  };
  


  
  
  const getInvestmentDetails = async(id:number)=>{
    const result = await prisma.investment.findUnique({
        where:{
            id
        },
        include: {
            user: {
              select: {
                name: true,
                phone: true,
              },
            },
            project: true
          },
    })

    return result
}

const getUserAllInvestment = async(userId:number)=>{
    const result = await prisma.investment.findMany({
        where:{
            userId
        },
        orderBy:{
            createdAt:"desc"
        }
    })
    return result
}
const updatePaymentStatus = async(id:number,statusParam:any)=>{
const {status} = statusParam

  const result = await prisma.investment.update({
      where:{
          id
      },
      data:{
        status:status
      }
  })
  return result
  }
  
  


export const investmentService ={
    getUserAllInvestment,
    getInvestmentDetails,
    getAllInvestment,
    updatePaymentStatus
}