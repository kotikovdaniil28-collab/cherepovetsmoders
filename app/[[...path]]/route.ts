import { readFile } from "node:fs/promises";
import path from "node:path";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HTML_HEADERS = {
  "content-type": "text/html; charset=utf-8",
  "cache-control": "no-store"
};

type LegacyRoute = {
  mode: string;
  buttonId?: string;
  title: string;
};

const LEGACY_ROUTES: Record<string, LegacyRoute> = {
  "/": { mode: "profile", buttonId: "profileTabBtn", title: "Профиль" },
  "/profile": { mode: "profile", buttonId: "profileTabBtn", title: "Профиль" },
  "/reports": { mode: "report", buttonId: "reportTabBtn", title: "Сдача отчёта" },
  "/inactives": { mode: "inactives", buttonId: "inactiveTabBtn", title: "Неактивы" },
  "/reports-table": { mode: "reports_table", buttonId: "reportsTableBtn", title: "Таблица отчётов" },
  "/shop": { mode: "shop", buttonId: "shopTabBtn", title: "Магазин" },
  "/leaderboard": { mode: "leaderboard", buttonId: "leaderboardTabBtn", title: "Лидерборд" },
  "/leadership": { mode: "leadership", buttonId: "leadershipTabBtn", title: "Руководство" },
  "/creator": { mode: "creator", buttonId: "creatorTabBtn", title: "Панель создателя" },
  "/guide": { mode: "guide", buttonId: "guideTabBtn", title: "Инструкция" },
  "/general": { mode: "about", buttonId: "aboutTabBtn", title: "Общее" }
};

const PRIMARY_NATIVE_ROUTES: Record<string, string> = {
  "/profile": "/native/profile",
  "/reports": "/native/reports",
  "/inactives": "/native/inactives",
  "/reports-table": "/native/table",
  "/leaderboard": "/native/leaderboard",
  "/dashboard": "/native",
  "/activity": "/native/table"
};

async function readLegacyHtml(fileName: "index.html" | "404.html") {
  return readFile(path.join(process.cwd(), "legacy", fileName), "utf8");
}

function normalizePath(request: NextRequest) {
  const url = new URL(request.url);
  const rawPath = url.pathname.replace(/\/+$/, "") || "/";
  return rawPath.toLowerCase();
}

function routeBootScript(route: LegacyRoute) {
  const payload = JSON.stringify(route);
  return `<script id="ch89-next-route-bridge">
  window.__CH89_NEXT_ROUTE__ = ${payload};
  (function(){
    var route = window.__CH89_NEXT_ROUTE__;
    function byId(id){ return id ? document.getElementById(id) : null; }
    function openRoute(){
      if (!route || !route.mode) return false;
      var btn = byId(route.buttonId) || document.querySelector('[data-mode="' + route.mode + '"]');
      if (typeof window.switchMode === 'function') {
        window.switchMode(route.mode, btn || undefined);
        document.body.setAttribute('data-next-route-mode', route.mode);
        return true;
      }
      return false;
    }
    var attempts = 0;
    var timer = window.setInterval(function(){
      attempts += 1;
      if (openRoute() || attempts > 80) window.clearInterval(timer);
    }, 100);
    window.addEventListener('load', function(){ window.setTimeout(openRoute, 150); });
  })();
</script>`;
}

function injectRoute(html: string, route: LegacyRoute) {
  const script = routeBootScript(route);
  const nativeLauncher = `<style id="ch89-native-launcher-style">
  #ch89NativeLauncher{position:fixed;right:18px;bottom:18px;z-index:10020;display:flex;align-items:center;gap:10px;min-height:52px;padding:0 18px;border:1px solid rgba(174,188,255,.48);border-radius:18px;background:linear-gradient(135deg,#6d8cff,#a855f7);color:#fff;text-decoration:none;font:900 14px/1 system-ui;letter-spacing:.01em;box-shadow:0 18px 52px rgba(52,69,148,.46);transition:transform .18s ease,box-shadow .18s ease}#ch89NativeLauncher:hover{transform:translateY(-3px);box-shadow:0 24px 68px rgba(74,89,190,.58)}#ch89NativeLauncher span{display:grid;width:30px;height:30px;place-items:center;border-radius:10px;background:rgba(255,255,255,.16);font-size:18px}@media(max-width:620px){#ch89NativeLauncher{right:10px;bottom:10px;left:10px;justify-content:center;border-radius:15px}}
  </style><a id="ch89NativeLauncher" href="/native"><span>✦</span>Открыть новый дашборд</a>`;
  const title = `CHEREPOVETS | ${route.title}`;
  const withTitle = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  if (withTitle.includes("</body>")) return withTitle.replace("</body>", `${nativeLauncher}${script}</body>`);
  return withTitle + nativeLauncher + script;
}

export async function GET(request: NextRequest) {
  try {
    const normalizedPath = normalizePath(request);
    const target = PRIMARY_NATIVE_ROUTES[normalizedPath];
    if (target && request.nextUrl.searchParams.get("legacy") !== "1") {
      return NextResponse.redirect(new URL(target, request.url));
    }
    const route = LEGACY_ROUTES[normalizedPath] || LEGACY_ROUTES["/"];
    const html = await readLegacyHtml("index.html");
    return new NextResponse(injectRoute(html, route), { status: 200, headers: HTML_HEADERS });
  } catch {
    const html = await readLegacyHtml("404.html");
    return new NextResponse(html, { status: 500, headers: HTML_HEADERS });
  }
}
