

import { Router } from "express";
import { projectController } from "./project.controller";




const router = Router()


router.get('/all',projectController.getAllProjects)
router.get('/details/:id',projectController.getSingeProject)
router.post('/create',projectController.createProject)
router.patch("/update/:id",projectController.updateProject)
router.delete('/delete/:id',projectController.deleteProject)


export const projectRoute = router