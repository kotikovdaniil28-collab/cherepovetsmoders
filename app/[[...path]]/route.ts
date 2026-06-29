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
  const title = `CHEREPOVETS | ${route.title}`;
  const withTitle = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  if (withTitle.includes("</body>")) return withTitle.replace("</body>", `${script}</body>`);
  return withTitle + script;
}

export async function GET(request: NextRequest) {
  try {
    const route = LEGACY_ROUTES[normalizePath(request)] || LEGACY_ROUTES["/"];
    const html = await readLegacyHtml("index.html");
    return new NextResponse(injectRoute(html, route), { status: 200, headers: HTML_HEADERS });
  } catch {
    const html = await readLegacyHtml("404.html");
    return new NextResponse(html, { status: 500, headers: HTML_HEADERS });
  }
}
