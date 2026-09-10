# Staybnb

Book stays in real time, or reserve months ahead. A full-stack booking platform
where guests search, book instantly and review, and hosts manage listings from a
live dashboard.

The shared business logic is deliberately isolated in `packages/shared` so the
planned iOS and Android apps can reuse it without a rewrite. See
[MOBILE.md](MOBILE.md) for that plan.

## Quick start

```bash
npm install
npm run db:setup     # creates the SQLite database and loads demo content
npm run dev          # API on :4000, web on :3000
```

Open http://localhost:3000.

Demo accounts, all with the password `password123`:

| Role  | Email               |
| ----- | ------------------- |
| Guest | guest@staybnb.dev   |
| Host  | maya@staybnb.dev    |

## What it does

**Guests** search by destination, dates and guest count, with results filtered
to places that are actually free for those nights. Listing pages show photos,
amenities, house rules and reviews. Booking is instant and the confirmation page
appears immediately.

**Real time** is the core of the product. Everyone viewing a listing joins a
room over a websocket. When anyone books, the server pushes a fresh calendar to
every other viewer, so blocked dates grey out without a refresh. The page also
shows how many people are looking at the same place right now. If someone books
the nights you had selected while you were deciding, your selection clears and
you are told why, instead of failing at the last step.

**Booking ahead** is capped per listing. A host sets how far out their calendar
opens, up to two years, and the picker enforces it along with the minimum-night
rule.

**Hosts** publish listings, set pricing and rules, and watch reservations land
on the dashboard as they happen. Guest reviews are gated: only the guest on a
completed stay can review it, exactly once.

## Layout

```
apps/api        Express + Socket.IO + Prisma. REST endpoints and the realtime layer.
apps/web        Next.js App Router frontend.
packages/shared Types, zod schemas, pricing and date logic used by every client.
```

Money is stored and computed in minor units (cents) as integers, so no float
rounding ever reaches a total. Dates are plain `YYYY-MM-DD` strings, which keeps
a stay on the same nights regardless of the traveller's timezone.

Availability uses half-open ranges: a stay covers `[checkIn, checkOut)`. That is
what lets a guest check in on the day another guest checks out, while still
rejecting any real overlap.

## Commands

| Command              | Does                                            |
| -------------------- | ----------------------------------------------- |
| `npm run dev`        | Runs the API and web app together               |
| `npm run build`      | Production build of both                        |
| `npm run db:setup`   | Applies the schema and seeds demo data          |
| `npm run db:reset`   | Wipes and reseeds                               |
| `npm run db:studio`  | Opens Prisma Studio to browse the data          |
| `npm run typecheck`  | Typechecks every workspace                      |
| `npm run lint`       | Lints the web app                               |

## Configuration

`apps/api/.env` holds the database URL, the JWT signing secret, the port and the
allowed CORS origins. `apps/web/.env.local` holds `NEXT_PUBLIC_API_URL`. Both
ship with working local defaults, copied from the `.example` files.

## Going to production

SQLite is the local default so the project runs with no setup. To move to
Postgres, change `provider` to `postgresql` in `apps/api/prisma/schema.prisma`,
point `DATABASE_URL` at the database and run `npm run db:push`. Nothing in the
application code needs to change.

Before taking real money or real guests, three things need adding: a payment
processor, since bookings currently record a total without charging a card;
email or push notifications for confirmations; and photo uploads to object
storage, since listings currently reference image URLs.

Set a long random `JWT_SECRET`, set `COOKIE_SECURE=true` behind HTTPS, and list
your real web origin in `CORS_ORIGINS`.
