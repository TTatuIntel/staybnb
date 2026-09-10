import { prisma } from "../lib/prisma";
import type { RatingStats } from "../lib/serialize";

/** Average rating + count per listing in one query. */
export async function ratingStatsFor(listingIds: string[]): Promise<Map<string, RatingStats>> {
  const map = new Map<string, RatingStats>();
  if (listingIds.length === 0) return map;
  const groups = await prisma.review.groupBy({
    by: ["listingId"],
    where: { listingId: { in: listingIds } },
    _avg: { rating: true },
    _count: { _all: true },
  });
  for (const g of groups) {
    map.set(g.listingId, {
      rating: g._avg.rating === null ? null : Math.round(g._avg.rating * 100) / 100,
      reviewCount: g._count._all,
    });
  }
  return map;
}

export const EMPTY_STATS: RatingStats = { rating: null, reviewCount: 0 };
