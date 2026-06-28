import Link from "next/link";
import type { ReactNode } from "react";
import { auth, signOut } from "@/auth";

const navItems = [
  { href: "/today", label: "Сегодня" },
  { href: "/dashboard", label: "Панель" },
  { href: "/roadmap", label: "Тренажёр" },
  { href: "/submissions", label: "Отчёты" },
  { href: "/checks", label: "Проверки" },
  { href: "/admin", label: "Штаб" }
];

export async function AppShell({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <div className="pixel-grid min-h-screen text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-[#07110d]/82 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link className="flex items-center gap-3 font-semibold" href="/">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-brand text-sm font-black text-[#06110c] shadow-[0_0_26px_rgba(67,255,154,0.34)]">
              C
            </span>
            <span className="font-pixel hidden text-[10px] uppercase text-brand sm:inline">
              CHEREPOVETS
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm text-muted">
            {navItems.map((item) => (
              <Link
                className="rounded-md px-3 py-2 transition hover:bg-white/10 hover:text-ink"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
            {session?.user ? (
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  className="rounded-md border border-line px-3 py-2 text-sm transition hover:bg-white/10 hover:text-ink"
                  type="submit"
                >
                  Выйти
                </button>
              </form>
            ) : (
              <>
                <Link
                  className="rounded-md px-3 py-2 transition hover:bg-white/10 hover:text-ink"
                  href="/sign-in"
                >
                  Войти
                </Link>
                <Link
                  className="rounded-md bg-brand px-3 py-2 font-semibold text-[#06110c] transition hover:bg-[#70ffb2]"
                  href="/sign-up"
                >
                  Старт
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:py-10">
        {children}
      </main>
    </div>
  );
}
