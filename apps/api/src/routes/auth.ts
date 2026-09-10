import { Router } from "express";
import { loginSchema, registerSchema, updateProfileSchema } from "@staybnb/shared";
import { clearAuthCookie, hashPassword, setAuthCookie, signToken, verifyPassword } from "../lib/auth";
import { asyncHandler, conflict, unauthorized, validate } from "../lib/errors";
import { prisma } from "../lib/prisma";
import { toAuthUser } from "../lib/serialize";
import { requireAuth } from "../middleware/auth";

export const authRouter = Router();

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const input = validate(registerSchema, req.body);
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw conflict("An account with that email already exists");
    const user = await prisma.user.create({
      data: { email: input.email, name: input.name, passwordHash: await hashPassword(input.password) },
    });
    const token = signToken(user.id);
    setAuthCookie(res, token);
    res.status(201).json({ user: toAuthUser(user), token });
  }),
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const input = validate(loginSchema, req.body);
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      throw unauthorized("Incorrect email or password");
    }
    const token = signToken(user.id);
    setAuthCookie(res, token);
    res.json({ user: toAuthUser(user), token });
  }),
);

authRouter.post("/logout", (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

authRouter.get("/me", requireAuth, (req, res) => {
  res.json({ user: toAuthUser(req.user!) });
});

authRouter.patch(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = validate(updateProfileSchema, req.body);
    const user = await prisma.user.update({ where: { id: req.user!.id }, data: input });
    res.json({ user: toAuthUser(user) });
  }),
);

/** Any guest can become a host with one click. */
authRouter.post(
  "/become-host",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.update({ where: { id: req.user!.id }, data: { isHost: true } });
    res.json({ user: toAuthUser(user) });
  }),
);
