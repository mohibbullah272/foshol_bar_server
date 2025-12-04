// utils/catchAsyncWrapper.ts
import { NextFunction, RequestHandler, Response } from "express";
import { AuthRequest } from "../middlewares/validation.middleware";


export const catchAsyncAuth = (
  handler: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>
): RequestHandler => {
  return async (req, res, next) => {
    try {
      await handler(req as AuthRequest, res, next);
    } catch (error) {
      next(error);
    }
  };
};