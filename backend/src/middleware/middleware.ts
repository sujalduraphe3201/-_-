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
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token missing or malformed" });
  }

  try {
    const decoded = verifyUser(token) as JwtPayload & { id?: number };

    if (!decoded?.id) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
