import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const pages = [
  { path: "/native/profile", title: "Native профиль", mode: "native_profile", group: "next" },
  { path: "/native/inactives", title: "Native неактивы", mode: "native_inactives", group: "next" },
  { path: "/native/reports", title: "Native отчёты", mode: "native_reports", group: "next" },
  { path: "/native/review", title: "Native проверка отчётов", mode: "native_review", group: "staff" },
  { path: "/native/table", title: "Native таблица отчётов", mode: "native_table", group: "staff" },
  { path: "/profile", title: "Профиль", mode: "profile", group: "account" },
  { path: "/reports", title: "Сдача отчёта", mode: "report", group: "moderation" },
  { path: "/inactives", title: "Неактивы", mode: "inactives", group: "moderation" },
  { path: "/reports-table", title: "Таблица отчётов", mode: "reports_table", group: "moderation" },
  { path: "/shop", title: "Магазин", mode: "shop", group: "general" },
  { path: "/leaderboard", title: "Лидерборд", mode: "leaderboard", group: "general" },
  { path: "/leadership", title: "Руководство", mode: "leadership", group: "staff" },
  { path: "/creator", title: "Панель создателя", mode: "creator", group: "owner" },
  { path: "/guide", title: "Инструкция", mode: "guide", group: "general" },
  { path: "/general", title: "Общее", mode: "about", group: "general" }
];

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "cherepovets-moderation-next",
    version: "48.0.0",
    pages
  });
}
