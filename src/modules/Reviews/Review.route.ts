import { Router } from "express";
import { reviewController } from "./Review.controller";



const router = Router()


router.get('/:projectId', reviewController.getAllReview )
router.post('/',reviewController.createReview)
router.delete('/delete',reviewController.deleteSingleReview)

export const ReviewRoute = router