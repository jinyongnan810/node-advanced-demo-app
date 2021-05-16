import { NextFunction, Request, Response } from "express";
import { clearCache } from "../models/cache";
export const clearCacheMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await next();
  // execute clearCache after all the next is done
  clearCache(req.currentUser!.id);
};
