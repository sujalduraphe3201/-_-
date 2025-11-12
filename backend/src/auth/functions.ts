import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
const SECRET = ENV.JWT_SECRET as jwt.Secret;

export async function hashPass(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function compare(plain: string, hash: string) {
  return await bcrypt.compare(plain, hash);
}

export function signAccess(user: { id: number; email?: string }) {
  return jwt.sign({ id: user.id, email: user.email }, SECRET, {
    expiresIn: "30m",
  });
}

export function signRefresh(user: { id: number; email?: string }) {
  return jwt.sign({ id: user.id, email: user.email }, SECRET, {
    expiresIn: "7d",
  });
}

export function verifyUser(token: string) {
  try {
    return jwt.verify(token, SECRET);
  } catch (err: any) {
    throw new Error("Invalid or expired token");
  }
}
