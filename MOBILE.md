# Taking Staybnb to iOS and Android

The web app is built so the mobile apps are an additional client, not a second
codebase. This is the plan and what has already been done to enable it.

## What is already in place

**The API is client-agnostic.** Every screen in the web app is powered by plain
REST endpoints that return JSON. There is no web-specific rendering on the
server, so a native app calls exactly the same endpoints.

**Authentication already supports native clients.** The API issues a JWT on
login and register. Browsers get it as an httpOnly cookie, which is the safe
choice on the web. Native apps instead read the `token` field from the same
response body and send it as an `Authorization: Bearer` header. Both paths are
implemented and tested. A mobile app stores that token in the device keychain.

**CORS already allows native apps.** Native clients send no `Origin` header, and
the server accepts those requests while still restricting browser origins to the
configured allowlist.

**The realtime layer is transport-agnostic.** Socket.IO has a maintained React
Native client. The handshake accepts a bearer token as well as a cookie, so the
same rooms, the same events and the same server code serve both.

**The business logic is already shared.** `packages/shared` holds the pricing
maths, the date and availability helpers, the zod validation schemas and every
API type. It has no dependency on React, on the DOM or on Node. A React Native
app adds it as a workspace dependency and gets identical prices, identical date
handling and identical validation messages, which is what keeps the two clients
from drifting apart.

## Recommended approach

Use **React Native with Expo**, in a new `apps/mobile` workspace alongside the
existing ones. One codebase produces both the iOS and Android app.

This is the right call here mainly because of what it reuses. The team already
knows React and TypeScript. The shared package drops in unchanged. Expo handles
the native build toolchain, over-the-air updates and push notifications, which
are the parts that otherwise consume the most time.

The alternative worth naming is fully native, Swift for iOS and Kotlin for
Android. It gives the best possible performance and platform fidelity, but it
means writing and maintaining every screen twice, and the booking logic three
times counting the web. For a booking app, whose screens are lists, forms and a
calendar, that cost buys very little.

## Build order

1. **Set up the workspace.** Create the Expo app, add `@staybnb/shared`, and
   configure the API base URL per environment.
2. **Auth.** Login and register screens, token stored in the device keychain, an
   API wrapper that attaches the bearer header. This unlocks everything else.
3. **Search and listing detail.** The two screens that carry the product. Reuse
   the pricing and availability helpers directly.
4. **Booking with the realtime calendar.** Connect the socket, join the listing
   room, and apply the same rule the web widget uses: if a pushed calendar
   conflicts with the guest's selection, clear it and explain why.
5. **Trips and reviews.** Then the host screens, which are lower traffic and can
   ship in a later release.
6. **Push notifications.** This is the one genuinely new capability. The server
   already emits booking events to a per-user room, so the hook is to also send
   a push when the target user has no live socket. Hosts want a booking alert
   and guests want a check-in reminder.

## What the API needs added for mobile

Little, but not nothing.

**Token refresh.** Tokens currently last thirty days and then require a fresh
login. That is acceptable on the web, where logging in again is cheap. On mobile
it is worth adding a refresh token so a returning user is never signed out.

**Device registration** for push, a small endpoint storing a push token per user
per device.

**A minimum supported version check**, so a future breaking API change can tell
an old app to update rather than failing in a confusing way.

**Image uploads** matter more on mobile than on the web, because hosts will
expect to publish a listing from the camera roll. This is the same object
storage work the web app needs.

## One thing to decide early

Whether the mobile apps share a release cadence with the web app. Because app
store review adds days, an API change that breaks an old client is far more
painful once phones are in the wild. The safe habit, worth adopting before the
first mobile release rather than after, is to make API changes additive: add
fields, do not remove or repurpose them, and version an endpoint when a real
break is unavoidable.
