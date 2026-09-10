"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast";
import { Avatar } from "./Avatar";
import { Logo } from "./Logo";

export function Header() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the menu when the route changes, during render rather than in an effect.
  if (pathname !== menuPath) {
    setMenuPath(pathname);
    setOpen(false);
  }
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const onLogout = async () => {
    await logout();
    toast.info("Signed out");
    router.push("/");
    router.refresh();
  };

  const navLink = (href: string, label: string) => (
    <Link href={href} className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 ${pathname.startsWith(href) ? "text-zinc-900" : "text-zinc-600"}`}>
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-1">
          {pathname !== "/" && pathname !== "/search" && (
            <Link href="/search" className="hidden rounded-full px-3.5 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 sm:inline-flex">
              Explore stays
            </Link>
          )}
          {user && navLink("/trips", "Trips")}
          {user?.isHost ? navLink("/host", "Host dashboard") : <Link href="/host" className="hidden rounded-full px-3.5 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 sm:inline-flex">Become a host</Link>}
          {loading ? (
            <span className="ml-2 h-9 w-24 animate-pulse rounded-full bg-zinc-100" />
          ) : user ? (
            <div className="relative ml-2" ref={menuRef}>
              <button
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full border border-zinc-300 py-1 pl-3 pr-1 hover:shadow-card"
                aria-haspopup="menu"
                aria-expanded={open}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M4 7h16M4 12h16M4 17h16" /></svg>
                <Avatar name={user.name} url={user.avatarUrl} size={30} />
              </button>
              {open && (
                <div role="menu" className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-zinc-200 bg-white py-2 shadow-float">
                  <div className="px-4 py-2 text-sm">
                    <div className="font-semibold text-zinc-900">{user.name}</div>
                    <div className="truncate text-zinc-500">{user.email}</div>
                  </div>
                  <hr className="my-1 border-zinc-100" />
                  <MenuItem href="/trips">My trips</MenuItem>
                  <MenuItem href="/host">{user.isHost ? "Host dashboard" : "Become a host"}</MenuItem>
                  <hr className="my-1 border-zinc-100" />
                  <button role="menuitem" onClick={onLogout} className="block w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50">
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-1">
              <Link href="/login" className="rounded-full px-3.5 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100">Log in</Link>
              <Link href="/register" className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800">Sign up</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

function MenuItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link role="menuitem" href={href} className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50">
      {children}
    </Link>
  );
}
