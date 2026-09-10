"use client";

import { useState, type FormEvent } from "react";
import type { Review } from "@staybnb/shared";
import { api, errorMessage } from "@/lib/api";
import { useToast } from "@/lib/toast";
import { StarPicker } from "./Rating";
import { Button, Textarea } from "./ui";

export function ReviewForm({ bookingId, onDone, onCancel }: { bookingId: string; onDone: (r: Review) => void; onCancel?: () => void }) {
  const toast = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { review } = await api<{ review: Review }>("/reviews", { method: "POST", body: { bookingId, rating, comment } });
      toast.success("Thanks for your review!");
      onDone(review);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-3 space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
      <div>
        <div className="mb-1 text-sm font-medium text-zinc-800">How was your stay?</div>
        <StarPicker value={rating} onChange={setRating} />
      </div>
      <Textarea placeholder="What did you like? What could be better?" value={comment} onChange={(e) => setComment(e.target.value)} required minLength={10} maxLength={2000} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" loading={busy} size="sm">Post review</Button>
        {onCancel && <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  );
}
