import type { Review } from "@staybnb/shared";
import { fmtDate } from "@/lib/format";
import { Avatar } from "./Avatar";
import { Star } from "./Rating";

export function ReviewList({ reviews, rating, count }: { reviews: Review[]; rating: number | null; count: number }) {
  return (
    <section id="reviews">
      <h2 className="flex items-center gap-2 text-xl font-semibold text-zinc-900">
        <Star className="h-5 w-5" />
        {rating !== null ? `${rating.toFixed(1)} · ${count} review${count === 1 ? "" : "s"}` : "No reviews yet"}
      </h2>
      {reviews.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">Be the first to stay here and share how it went.</p>
      ) : (
        <ul className="mt-6 grid gap-8 sm:grid-cols-2">
          {reviews.map((r) => (
            <li key={r.id}>
              <div className="flex items-center gap-3">
                <Avatar name={r.author.name} url={r.author.avatarUrl} size={40} />
                <div>
                  <div className="font-semibold text-zinc-900">{r.author.name}</div>
                  <div className="text-xs text-zinc-500">{fmtDate(r.createdAt, "MMMM yyyy")}</div>
                </div>
              </div>
              <div className="mt-2 flex gap-0.5 text-amber-500" aria-label={`${r.rating} out of 5`}>
                {Array.from({ length: 5 }, (_, i) => <Star key={i} className={`h-3 w-3 ${i < r.rating ? "" : "text-zinc-200"}`} />)}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-zinc-700">{r.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
