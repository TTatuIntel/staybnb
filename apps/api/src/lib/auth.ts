import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { CookieOptions, Response } from "express";
import { env, isProd } from "./env";

export const AUTH_COOKIE = "staybnb_token";
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export interface TokenPayload {
  sub: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId } satisfies TokenPayload, env.JWT_SECRET, { expiresIn: TOKEN_TTL_SECONDS });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (typeof decoded === "object" && decoded && typeof decoded.sub === "string") return { sub: decoded.sub };
    return null;
  } catch {
    return null;
  }
}

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: env.COOKIE_SECURE || isProd,
  path: "/",
  maxAge: TOKEN_TTL_SECONDS * 1000,
};

/** Web clients get an httpOnly cookie; mobile clients use the token from the JSON body as a Bearer header. */
export function setAuthCookie(res: Response, token: string) {
  res.cookie(AUTH_COOKIE, token, cookieOptions);
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(AUTH_COOKIE, { ...cookieOptions, maxAge: undefined });
}
