
import { Prisma } from "@prisma/client";
import prisma from "../../config/db";
import calculateROI from "../../config/CalculateRoi";




const getAllProject = async(
    searchTerm: string, 
    sortBy: any, 
    sortOrder: any,
    limit: number,
    filters?: {
      category?: string;
      minSharePrice?: number;
      maxSharePrice?: number;
      durationFilter?: string;
      location?: string;
    }
  ) => {
   
    const sortbyOption: string = sortBy || "createdAt";
    const sortOrderOption: string = sortOrder || "desc";
  
    const andCondition: Prisma.ProjectWhereInput[] = [];
    
    // Search across multiple fields
    if(searchTerm?.trim() !== ''){
      andCondition.push({
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { description: { contains: searchTerm, mode: "insensitive" } },
          { location: { contains: searchTerm, mode: "insensitive" } },
          { keywords: { hasSome: [searchTerm] } }
        ]
      });
    }
  
    // Category filter
    if(filters?.category && filters.category !== 'ALL'){
      andCondition.push({
        category: filters.category as any
      });
    }
  
    // Share price range filter - FIXED for String type
    if(filters?.minSharePrice !== undefined || filters?.maxSharePrice !== undefined){
      const priceConditions: any = {};
      
      if(filters?.minSharePrice !== undefined) {
        // Convert number to string for String field comparison
        priceConditions.gte = filters.minSharePrice.toString();
      }
      if(filters?.maxSharePrice !== undefined) {
        // Convert number to string for String field comparison
        priceConditions.lte = filters.maxSharePrice.toString();
      }
      
      andCondition.push({
        sharePrice: priceConditions
      });
    }
  
    // Duration filter
    if(filters?.durationFilter){
      const now = new Date();
      let durationCondition: any = {};
      
      switch(filters.durationFilter) {
        case 'SHORT_TERM':
          // Projects ending within 3 months
          durationCondition.lte = new Date(now.setMonth(now.getMonth() + 3));
          break;
        case 'MEDIUM_TERM':
          // Projects ending in 3-12 months
          const threeMonths = new Date(now.setMonth(now.getMonth() + 3));
          const oneYear = new Date(now.setMonth(now.getMonth() + 9));
          durationCondition = {
            gte: threeMonths,
            lte: oneYear
          };
          break;
        case 'LONG_TERM':
          // Projects ending after 1 year
          durationCondition.gte = new Date(now.setFullYear(now.getFullYear() + 1));
          break;
      }
      
      andCondition.push({
        expireDate: durationCondition
      });
    }
  
    // Location filter
    if(filters?.location){
      andCondition.push({
        location: {
          contains: filters.location,
          mode: "insensitive"
        }
      });
    }
  
    const whereInput: Prisma.ProjectWhereInput = andCondition.length > 0 ? { AND: andCondition } : {};
  
    const projects = await prisma.project.findMany({
      where: whereInput,
      take: limit,
      orderBy: {
        [sortbyOption]: sortOrderOption
      },
      include: {
        Investment: true,
        payment: true
      }
    });
  
    return projects;
  }

const getSingleProject = async(id:number)=>{
    const result = await prisma.project.findUnique({
        where:{
            id
        },
        include:{
            payment:{
                select:{
                    userId:true
                }
            }
        }
    })
    if(!result){
        throw new Error("project not found")
    }
   
    return result
}



const createProject = async (payload: Prisma.ProjectCreateInput) => {
    if (!payload) {
        throw new Error('Payload is missing');
    }

    // Auto ROI calculation for create
    if (payload.sharePrice && payload.profitPerShare) {
        const sharePrice = Number(payload.sharePrice);
        const profitPerShare = Number(payload.profitPerShare);
        
        const roiData = calculateROI(sharePrice, profitPerShare);
        payload.estimatedROI = roiData.estimatedROI;
        payload.roiCalculation = roiData.roiCalculation;
    }

    return await prisma.project.create({
        data: payload
    });
}

const updateProject = async (payload: Prisma.ProjectUpdateInput, id: number) => {
    
    if (payload.sharePrice || payload.profitPerShare) {
      
        const currentProject = await prisma.project.findUnique({
            where: { id },
            select: { sharePrice: true, profitPerShare: true }
        });

        if (currentProject) {
            const sharePrice = payload.sharePrice !== undefined 
                ? Number(payload.sharePrice) 
                : Number(currentProject.sharePrice);

            const profitPerShare = payload.profitPerShare !== undefined 
                ? Number(payload.profitPerShare) 
                : Number(currentProject.profitPerShare);

            const roiData = calculateROI(sharePrice, profitPerShare);
            payload.estimatedROI = roiData.estimatedROI;
            payload.roiCalculation = roiData.roiCalculation;
        }
    }

    return await prisma.project.update({
        where: { id },
        data: payload
    });
}

const deleteProject = async(id:number)=>{
    const project = await prisma.project.delete({
        where:{
            id
        }
    })
    return project
}

const getProjectProgress = async(userId:number)=>{

    const result = await prisma.payment.findMany({
        where:{
            userId
        },
        include:{
            project:{
                select:{
                    name:true,
                    progressUpdate:true,
                    progressUpdateImage:true,
                    progressUpdateDate:true
                }
            }
        }
    })
    return result 
}



export const projectService = {
getAllProject,
getSingleProject,
createProject,
updateProject,
deleteProject,
getProjectProgress
}