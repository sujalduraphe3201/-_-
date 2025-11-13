// src/middleware/authMiddleware.ts
import type { NextFunction, Request, Response } from "express";
import { verifyUser } from "../auth/functions.js";
import type { JwtPayload } from "jsonwebtoken";

declare module "express-serve-static-core" {
  interface Request {
    userId?: number;
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: "Authorization header missing" });
    return
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Token missing or malformed" });
    return
  }

  try {
    const decoded = verifyUser(token) as JwtPayload & { id?: number };

    if (!decoded?.id) {
      res.status(403).json({ message: "Invalid or expired token" });
      return 
    }

    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
    return
  }
}
