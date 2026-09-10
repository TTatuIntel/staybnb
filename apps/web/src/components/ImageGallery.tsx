"use client";

import Image from "next/image";
import { useState } from "react";
import type { ListingImage } from "@staybnb/shared";

export function ImageGallery({ images, title }: { images: ListingImage[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [main, ...rest] = images;
  if (!main) return <div className="aspect-[2/1] rounded-2xl bg-zinc-100" />;

  return (
    <>
      <div className="grid grid-cols-1 gap-2 overflow-hidden rounded-2xl sm:grid-cols-4 sm:grid-rows-2 sm:aspect-[2/1]">
        <button onClick={() => setOpen(0)} className="relative aspect-[4/3] sm:col-span-2 sm:row-span-2 sm:aspect-auto">
          <Image src={main.url} alt={title} fill priority sizes="(max-width: 640px) 100vw, 50vw" className="object-cover transition-opacity hover:opacity-90" />
        </button>
        {rest.slice(0, 4).map((img, i) => (
          <button key={img.id} onClick={() => setOpen(i + 1)} className="relative hidden sm:block">
            <Image src={img.url} alt={`${title} photo ${i + 2}`} fill sizes="25vw" className="object-cover transition-opacity hover:opacity-90" />
          </button>
        ))}
        {images.length > 1 && (
          <button onClick={() => setOpen(0)} className="absolute bottom-6 right-6 hidden rounded-lg border border-zinc-900 bg-white px-3 py-1.5 text-sm font-medium sm:block" style={{ position: "absolute" }}>
            Show all {images.length} photos
          </button>
        )}
      </div>
      {open !== null && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95" role="dialog" aria-modal>
          <div className="flex items-center justify-between p-4 text-white">
            <span className="text-sm">{open + 1} / {images.length}</span>
            <button onClick={() => setOpen(null)} className="rounded-full px-3 py-1 text-sm hover:bg-white/10">Close ✕</button>
          </div>
          <div className="relative flex-1">
            <Image src={images[open].url} alt={`${title} photo ${open + 1}`} fill sizes="100vw" className="object-contain" />
          </div>
          <div className="flex justify-between p-4">
            <button onClick={() => setOpen((o) => ((o ?? 0) - 1 + images.length) % images.length)} className="rounded-full bg-white/10 px-4 py-2 text-white hover:bg-white/20">‹ Prev</button>
            <button onClick={() => setOpen((o) => ((o ?? 0) + 1) % images.length)} className="rounded-full bg-white/10 px-4 py-2 text-white hover:bg-white/20">Next ›</button>
          </div>
        </div>
      )}
    </>
  );
}
