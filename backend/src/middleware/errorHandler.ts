import { NextFunction, Request, Response } from "express";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.status(500).json({ message: "Internal Server Error" });
  console.error("Server Error:", err);
}
