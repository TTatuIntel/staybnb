import "dotenv/config";
import { PrismaClient, type Listing, type User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { BOOKING_STATUS, addDaysIso, calculatePrice, parseIsoDate, todayIso } from "@staybnb/shared";
import { GUESTS, HOSTS, LISTINGS, type SeedListing } from "./seed-data";
import { LISTINGS_2 } from "./seed-data-2";

const prisma = new PrismaClient();
const DEMO_PASSWORD = "password123";
const avatar = (n: number) => `https://i.pravatar.cc/150?img=${n}`;

const REVIEW_TEXTS = [
  [5, "Absolutely loved it. The place looked exactly like the photos and the host replied within minutes every time."],
  [5, "Spotless, quiet and in the perfect location. We would come back in a heartbeat."],
  [4, "Great stay overall. The bed was very comfortable; only the shower pressure could be better."],
  [5, "Thoughtful touches everywhere, from the welcome snacks to the local guide left on the table."],
  [4, "Lovely home and a very kind host. Slightly further from the centre than we expected but easy by tram."],
  [3, "Nice apartment but the street was noisy at night. Earplugs recommended if you are a light sleeper."],
  [5, "Our favourite stay of the whole trip. The rooftop at sunset is something else."],
] as const;

async function main() {
  console.log("Seeding staybnb database...");
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const hosts: User[] = [];
  for (const h of HOSTS) {
    hosts.push(await prisma.user.create({ data: { email: h.email, name: h.name, passwordHash, isHost: true, avatarUrl: avatar(h.avatar), bio: h.bio } }));
  }
  const guests: User[] = [];
  for (const g of GUESTS) {
    guests.push(await prisma.user.create({ data: { email: g.email, name: g.name, passwordHash, avatarUrl: avatar(g.avatar) } }));
  }

  const all: SeedListing[] = [...LISTINGS, ...LISTINGS_2];
  const listings: Listing[] = [];
  for (const l of all) {
    listings.push(
      await prisma.listing.create({
        data: {
          hostId: hosts[l.host].id,
          title: l.title, description: l.description, propertyType: l.type, city: l.city, country: l.country, lat: l.lat, lng: l.lng,
          pricePerNight: l.price, cleaningFee: l.cleaning, currency: "USD", maxGuests: l.guests, bedrooms: l.bedrooms, beds: l.beds, bathrooms: l.baths,
          amenities: JSON.stringify(l.amenities), instantBook: l.instant ?? true, minNights: l.minNights ?? 1, maxAdvanceDays: l.maxAdvance ?? 365,
          images: { create: l.images.map((url, position) => ({ url, position })) },
        },
      }),
    );
  }

  const today = todayIso();
  let reviewIdx = 0;
  const makeBooking = async (listingIdx: number, guestIdx: number, startOffset: number, nights: number, opts: { review?: boolean; cancelled?: boolean } = {}) => {
    const listing = listings[listingIdx];
    const checkIn = addDaysIso(today, startOffset);
    const checkOut = addDaysIso(checkIn, nights);
    const price = calculatePrice({ ...listing, checkIn, checkOut });
    const past = checkOut <= today;
    const booking = await prisma.booking.create({
      data: {
        listingId: listing.id, guestId: guests[guestIdx].id,
        checkIn: parseIsoDate(checkIn), checkOut: parseIsoDate(checkOut), guests: Math.min(2, listing.maxGuests), nights,
        subtotal: price.subtotal, cleaningFee: price.cleaningFee, serviceFee: price.serviceFee, total: price.total, currency: listing.currency,
        status: opts.cancelled ? BOOKING_STATUS.CANCELLED : past ? BOOKING_STATUS.COMPLETED : BOOKING_STATUS.CONFIRMED,
        createdAt: parseIsoDate(addDaysIso(checkIn, -Math.max(3, Math.min(60, nights * 7)))),
      },
    });
    if (opts.review && past && !opts.cancelled) {
      const [rating, comment] = REVIEW_TEXTS[reviewIdx++ % REVIEW_TEXTS.length];
      await prisma.review.create({ data: { bookingId: booking.id, listingId: listing.id, authorId: guests[guestIdx].id, rating, comment, createdAt: parseIsoDate(addDaysIso(checkOut, 2)) } });
    }
  };

  // Past stays with reviews (spread across guests so every listing has a rating story)
  for (let i = 0; i < listings.length; i++) {
    await makeBooking(i, i % 3, -40 - i * 5, 3, { review: true });
    if (i % 2 === 0) await makeBooking(i, (i + 1) % 3, -120 - i * 7, 4, { review: true });
    if (i % 3 === 0) await makeBooking(i, (i + 2) % 3, -200 - i * 3, 2, { review: true });
  }
  // Upcoming stays so calendars show blocked dates, plus one cancelled trip
  await makeBooking(0, 1, 5, 4);
  await makeBooking(1, 2, 12, 7);
  await makeBooking(2, 1, 30, 3);
  await makeBooking(4, 2, 3, 2);
  await makeBooking(5, 1, 60, 5);
  await makeBooking(7, 2, 21, 4);
  await makeBooking(3, 0, 9, 3);
  await makeBooking(8, 0, 45, 2);
  await makeBooking(6, 0, 15, 3, { cancelled: true });
  await makeBooking(10, 0, -10, 3, { review: false }); // completed, awaiting review by the demo guest

  console.log(`Created ${hosts.length} hosts, ${guests.length} guests, ${listings.length} listings.`);
  console.log(`\nDemo accounts (password: ${DEMO_PASSWORD})`);
  console.log(`  guest:  ${GUESTS[0].email}`);
  console.log(`  host:   ${HOSTS[0].email}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
