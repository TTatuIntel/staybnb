export function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-zinc-500 sm:flex-row sm:px-6">
        <p>© {new Date().getFullYear()} Staybnb. Book stays in real time, or months ahead.</p>
        <p className="flex gap-4">
          <span>Web</span>
          <span className="text-zinc-300">·</span>
          <span>iOS &amp; Android coming soon</span>
        </p>
      </div>
    </footer>
  );
}
