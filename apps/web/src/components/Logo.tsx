import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 ${className}`} aria-label="Staybnb home">
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden>
        <path d="M16 3 4 13.5V27a2 2 0 0 0 2 2h7v-8h6v8h7a2 2 0 0 0 2-2V13.5L16 3Z" fill="#e11d48" />
        <path d="M16 3 4 13.5h24L16 3Z" fill="#fb7185" />
      </svg>
      <span className="text-xl font-bold tracking-tight text-brand-600">staybnb</span>
    </Link>
  );
}
