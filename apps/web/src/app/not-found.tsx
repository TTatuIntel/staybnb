import { LinkButton } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="text-6xl">🧭</p>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900">We can&apos;t find that page</h1>
      <p className="mt-2 text-zinc-500">The stay you are looking for may have been removed, or the link is wrong.</p>
      <LinkButton href="/" className="mt-6">Back to home</LinkButton>
    </div>
  );
}
