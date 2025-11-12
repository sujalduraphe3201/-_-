import type { NextFunction, Request, Response } from "express";
import { prisma } from "../prisma/client.js";
import { compare, hashPass, signAccess } from "../auth/functions.js";

export async function signup(req: Request, res: Response, next: NextFunction) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({ message: "Email already exists" });
      return;
    }

    const hashedPassword = await hashPass(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: { id: true, name: true, email: true },
    });

    res.status(201).json({
      message: "User created successfully",
      user,
    });
    return;
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error while creating user" });
    return;
  }
}

export async function signin(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const validPassword = await compare(password, user.password);
    if (!validPassword) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = signAccess({ id: user.id, email: user.email });

    res.status(200).json({
      message: "User logged in successfully",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
    return;
  } catch (err) {
    console.error("Signin error:", err);

    res.status(500).json({ message: "Server error while logging in user" });
    return;
  }
}
