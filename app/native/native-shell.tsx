"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { href: "/native/profile", label: "Дашборд" },
  { href: "/native/reports", label: "Отчёт" },
  { href: "/native/inactives", label: "Неактив" },
  { href: "/native/table", label: "Активность" },
  { href: "/native/review", label: "Проверка" },
  { href: "/native/leaderboard", label: "Лидерборд" }
];

function isActive(pathname: string, href: string) {
  if (href === "/native") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function NativeShell({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const pathname = usePathname() || "/native";

  return (
    <div className="ch-native-shell">
      <header className="ch-shell-header">
        <a className="ch-shell-brand" href="/native">
          <span>CH</span>
          <b>CHEREPOVETS</b>
        </a>
        <nav className="ch-shell-nav" aria-label="Native navigation">
          {navItems.map((item) => (
            <a
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              className={isActive(pathname, item.href) ? "active" : ""}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <a className="ch-shell-legacy" href="/general">Старый сайт</a>
      </header>
      {children}
    </div>
  );
}
