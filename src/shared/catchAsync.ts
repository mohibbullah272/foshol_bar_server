import { NextFunction, Request, RequestHandler, Response } from "express";

// This will now work because Express.Request has been extended globally
const catchAsync = (fn: RequestHandler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

export default catchAsync;