import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchBar } from "@/components/SearchBar";
import { SearchResults } from "./SearchResults";

export const metadata: Metadata = { title: "Search stays" };

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <Suspense>
        <SearchBar compact />
      </Suspense>
      <Suspense fallback={<p className="mt-8 text-sm text-zinc-500">Loading stays…</p>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
