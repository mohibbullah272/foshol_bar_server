import { Prisma } from "@prisma/client";
import prisma from "../../config/db";




const getAllProject = async(searchTerm: string, sortBy: any, sortOrder: any,limit:number) => {
    const sortbyOption: string = sortBy || "createdAt"
    const sortOrderOption: string = sortOrder || "desc"

    const andCondition: Prisma.ProjectWhereInput[] = []
    
    // Fix: Check if searchTerm is not empty string
    if(searchTerm && searchTerm.trim() !== ''){
        andCondition.push({
            OR: ["name"].map(field => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
        })
    }

    // Fix: Better handling of empty conditions
    const whereInput: Prisma.ProjectWhereInput = andCondition.length > 0 ? { AND: andCondition } : {}

    const project = await prisma.project.findMany({
        where: whereInput,
        take:limit,
        orderBy: {
            [sortbyOption]: sortOrderOption
        },
        
    })

    return project
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



const createProject = async(payload:Prisma.ProjectCreateInput)=>{
    if(!payload){
        throw new Error('payload is missing')
    }
    const result = await prisma.project.create({
        data:payload
    })
    return result
}

const updateProject = async(payload:Prisma.ProjectUpdateInput,id:number)=>{
    const project = await prisma.project.update({
        where:{
            id
        },
        data:payload
    })
    return project
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
                    progressUpdateImage:true
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