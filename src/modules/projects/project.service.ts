import { Prisma } from "@prisma/client";
import prisma from "../../config/db";




const getAllProject = async(searchTerm:string,sortBy:any,sortOrder:any)=>{

const sortbyOption:string= sortBy ||"createdAt"
const sortOrderOption :string = sortOrder || "desc"

    const andCondition: Prisma.ProjectWhereInput[] = []
    if(searchTerm){
        andCondition.push({
            OR:["name"].map(field=>({
                [field]:{
                    contains:searchTerm,
                    mode:"insensitive"
                }
            }))
        })
    }
const whereInput:Prisma.ProjectWhereInput = andCondition.length>0?{
    AND:andCondition
}:{}

    const project = await prisma.project.findMany({
    where:whereInput,
    orderBy:{
        [sortbyOption]:sortOrderOption
    }
    
})

return project

}


const getSingleProject = async(id:number)=>{
    const result = await prisma.project.findUnique({
        where:{
            id
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


export const projectService = {
getAllProject,
getSingleProject,
createProject,
updateProject,
deleteProject
}