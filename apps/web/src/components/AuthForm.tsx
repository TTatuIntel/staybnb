"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast";
import { Button, Field, Input } from "./ui";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { login, register } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();
  const toast = useToast();
  const next = sp.get("next") ?? "/";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const user = mode === "login" ? await login({ email, password }) : await register({ name, email, password });
      toast.success(mode === "login" ? `Welcome back, ${user.name.split(" ")[0]}!` : `Welcome to Staybnb, ${user.name.split(" ")[0]}!`);
      router.push(next.startsWith("/") ? next : "/");
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-card sm:p-8">
        <h1 className="text-2xl font-semibold text-zinc-900">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="mt-1 text-sm text-zinc-500">{mode === "login" ? "Sign in to book stays and manage your trips." : "Book stays in seconds and review the places you visit."}</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "register" && (
            <Field label="Full name">
              <Input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} autoComplete="name" placeholder="Ada Lovelace" />
            </Field>
          )}
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="you@example.com" />
          </Field>
          <Field label="Password" hint={mode === "register" ? "At least 8 characters" : undefined}>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={mode === "register" ? 8 : 1} autoComplete={mode === "login" ? "current-password" : "new-password"} />
          </Field>
          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          <Button type="submit" className="w-full" size="lg" loading={busy}>{mode === "login" ? "Log in" : "Sign up"}</Button>
        </form>
        {mode === "login" && (
          <div className="mt-4 rounded-xl bg-zinc-50 p-3 text-xs text-zinc-600">
            <div className="font-semibold text-zinc-800">Demo accounts (password: password123)</div>
            <div className="mt-1">Guest: guest@staybnb.dev · Host: maya@staybnb.dev</div>
          </div>
        )}
        <p className="mt-6 text-center text-sm text-zinc-600">
          {mode === "login" ? (
            <>New to Staybnb? <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-semibold text-zinc-900 underline">Create an account</Link></>
          ) : (
            <>Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-zinc-900 underline">Log in</Link></>
          )}
        </p>
      </div>
    </div>
  );
}
