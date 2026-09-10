export function Star({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L10 14.9l-5.3 2.8 1.1-5.9L1.5 7.7l5.9-.8L10 1.5z" />
    </svg>
  );
}

export function Rating({ value, count, showCount = true, className = "" }: { value: number | null; count?: number; showCount?: boolean; className?: string }) {
  if (value === null || value === undefined) {
    return <span className={`text-sm text-zinc-500 ${className}`}>New</span>;
  }
  return (
    <span className={`inline-flex items-center gap-1 text-sm text-zinc-900 ${className}`}>
      <Star />
      <span className="font-medium">{value.toFixed(1)}</span>
      {showCount && count !== undefined && <span className="text-zinc-500">({count})</span>}
    </span>
  );
}

export function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onClick={() => onChange(n)}
          className={`rounded p-0.5 transition-colors ${n <= value ? "text-amber-500" : "text-zinc-300 hover:text-amber-300"}`}
        >
          <Star className="h-7 w-7" />
        </button>
      ))}
    </div>
  );
}
