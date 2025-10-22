import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { projectService } from "./project.service";
import sendResponse from "../../shared/sendResponse";

const getAllProjects = catchAsync(async(req: Request, res: Response) => {
    const { searchTerm, sortby, sortOrder,limit } = req.query
    const parseLimit :number = Number(limit) || 10000000000

    const searchQuery: string = searchTerm ? String(searchTerm) : ''
    
    const projects = await projectService.getAllProject(searchQuery, sortby, sortOrder,parseLimit)

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Projects retrieved successfully",
        data: projects
    })
})


const getSingeProject = catchAsync(async(req:Request,res:Response)=>{
const project = await projectService.getSingleProject(Number(req.params.id))

sendResponse(res,{
    statusCode:200,
    success:true,
    message:"project retrieve successfully",
    data:project
})

})


const createProject =catchAsync(async(req:Request,res:Response)=>{
const result = await projectService.createProject(req.body)
sendResponse(res,{
    statusCode:201,
    success:true,
    message:"project created successfully",
    data:result
})


})

const updateProject = catchAsync(async(req:Request,res:Response)=>{
const result = await projectService.updateProject(req.body,Number(req.params.id))

sendResponse(res,{
    statusCode:201,
    success:true,
    message:"project updated successfully",
    data:result
})


})


const deleteProject =catchAsync(async(req:Request,res:Response)=>{
const result = await projectService.deleteProject(Number(req.params.id))

sendResponse(res,{
    statusCode:200,
    success:true,
    message:"project deleted successfully",
    data:result
})
})
const getProjectProgress =catchAsync(async(req:Request,res:Response)=>{
    
const result = await projectService.getProjectProgress(Number(req.query.userId))

sendResponse(res,{
    statusCode:200,
    success:true,
    message:"project progress found successfully",
    data:result
})
})


export const projectController ={
    getAllProjects,
    getSingeProject,
    createProject,
    updateProject,
    deleteProject,
    getProjectProgress
}