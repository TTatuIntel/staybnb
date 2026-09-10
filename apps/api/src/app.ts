import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { env } from "./lib/env";
import { errorMiddleware } from "./lib/errors";
import { optionalAuth } from "./middleware/auth";
import { authRouter } from "./routes/auth";
import { bookingsRouter } from "./routes/bookings";
import { reviewsRouter } from "./routes/reviews";
import { hostRouter } from "./routes/host";
import { listingsRouter } from "./routes/listings";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(
    cors({
      // Browsers send an Origin header; native mobile apps do not, so `!origin` lets them through.
      origin: (origin, cb) => cb(null, !origin || env.CORS_ORIGINS.includes(origin)),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(optionalAuth);

  app.get("/health", (_req, res) => res.json({ ok: true, service: "staybnb-api", time: new Date().toISOString() }));
  app.use("/auth", authRouter);
  app.use("/listings", listingsRouter);
  app.use("/bookings", bookingsRouter);
  app.use("/reviews", reviewsRouter);
  app.use("/host", hostRouter);

  app.use((_req, res) => res.status(404).json({ error: "Route not found" }));
  app.use(errorMiddleware);
  return app;
}
