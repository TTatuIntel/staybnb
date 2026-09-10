import type { NextFunction, Request, Response } from "express";
import type { User } from "@prisma/client";
import { AUTH_COOKIE, verifyToken } from "../lib/auth";
import { forbidden, unauthorized } from "../lib/errors";
import { prisma } from "../lib/prisma";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7).trim();
  const cookie = req.cookies?.[AUTH_COOKIE];
  return typeof cookie === "string" && cookie ? cookie : null;
}

/** Attaches req.user when a valid token is present; never fails. */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        const user = await prisma.user.findUnique({ where: { id: payload.sub } });
        if (user) req.user = user;
      }
    }
    next();
  } catch (err) {
    next(err);
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(unauthorized());
  next();
}

export function requireHost(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(unauthorized());
  if (!req.user.isHost) return next(forbidden("Become a host to manage listings"));
  next();
}
