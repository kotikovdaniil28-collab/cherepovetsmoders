"use client";

import { useEffect, useMemo, useState } from "react";
import "./profile.css";

type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

type ReportRow = {
  id?: string;
  email?: string;
  link?: string;
  date?: string;
  status?: string;
  xp?: number | string | null;
};

type UserStats = { nickname?: string | null; email?: string | null };
type Career = {
  site_user_id?: string;
  email?: string | null;
  nickname?: string | null;
  vk_user_id?: string | null;
  rank?: string | null;
  appointed_at?: string | null;
  rank_started_at?: string | null;
  source?: string | null;
};
type VkLink = { vk_user_id?: string | null };
type QueryResult<T> = { data?: T | null; error?: { message?: string } | null };
type QueryBuilder<T> = {
  select(fields?: string): QueryBuilder<T>;
  eq(field: string, value: string): QueryBuilder<T>;
  in(field: string, values: string[]): QueryBuilder<T>;
  order(field: string, options?: { ascending?: boolean }): QueryBuilder<T>;
  maybeSingle(): Promise<QueryResult<T>>;
  limit(count: number): QueryBuilder<T>;
  then<TResult1 = QueryResult<T[]>, TResult2 = never>(
    onfulfilled?: ((value: QueryResult<T[]>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2>;
};
type SupabaseLike = {
  auth: {
    getUser(): Promise<{ data?: { user?: SupabaseUser | null } }>;
    getSession(): Promise<{ data?: { session?: { user?: SupabaseUser | null } | null } }>;
  };
  from<T = Record<string, unknown>>(table: string): QueryBuilder<T>;
};

declare global {
  interface Window {
    CH89_SUPABASE_URL?: string;
    CH89_SUPABASE_ANON_KEY?: string;
    supabase?: { createClient(url: string, key: string): unknown };
  }
}

const scriptUrl = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
const approvedStatuses = new Set(["Норма", "Перенорма", "Натяг", "Герой дня"]);
const highStatuses = new Set(["Перенорма", "Герой дня"]);
const rankInfo: Record<string, { title: string; short: string; next?: string }> = {
  junior_moderator: { title: "Младший модератор", short: "ММ", next: "Модератор" },
  moderator: { title: "Модератор", short: "М", next: "Старший модератор" },
  senior_moderator: { title: "Старший модератор", short: "СМ" },
  km: { title: "Куратор модерации", short: "КМ" },
  zgm: { title: "Заместитель главного модератора", short: "ЗГМ" },
  gm: { title: "Главный модератор", short: "ГМ" }
};

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "1") resolve();
      else {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("script load failed")), { once: true });
      }
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => { script.dataset.loaded = "1"; resolve(); };
    script.onerror = () => reject(new Error("script load failed"));
    document.head.appendChild(script);
  });
}

async function createClient() {
  await loadScript("/supabase.config.js");
  await loadScript(scriptUrl);
  if (!window.CH89_SUPABASE_URL || !window.CH89_SUPABASE_ANON_KEY || !window.supabase) {
    throw new Error("Supabase config не загрузился");
  }
  return window.supabase.createClient(window.CH89_SUPABASE_URL, window.CH89_SUPABASE_ANON_KEY) as SupabaseLike;
}

function cleanName(user: SupabaseUser | null, stats: UserStats | null) {
  const meta = user?.user_metadata || {};
  return String(stats?.nickname || meta.nickname || meta.name || meta.full_name || user?.email || "Пользователь").trim();
}

function initials(name: string) {
  return name.split(/[#_\s]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "CH";
}

function toNumber(value: unknown) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function positiveXp(rows: ReportRow[]) {
  return rows.reduce((sum, row) => sum + Math.max(0, toNumber(row.xp)), 0);
}

function signedXp(rows: ReportRow[]) {
  return rows.reduce((sum, row) => sum + toNumber(row.xp), 0);
}

function reportPayload(row: ReportRow) {
  const raw = String(row.date || "");
  const match = raw.match(/JSON:\s*(\{[\s\S]*\})\s*$/i);
  let json: Record<string, unknown> = {};
  try { json = JSON.parse(match?.[1] || (raw.trim().startsWith("{") ? raw : "{}")); } catch { json = {}; }
  return {
    day: String(json.date || json.day || raw.match(/Дата:\s*([\d-]+)/i)?.[1] || ""),
    work: String(json.work || json.comment || raw.match(/Работа:\s*([^|]+)/i)?.[1] || "Отчёт")
  };
}

function dateMs(value: string | null | undefined) {
  const parsed = new Date(value || "").getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function reportDateMs(row: ReportRow) {
  const day = reportPayload(row).day;
  return dateMs(/^20\d{2}-\d{2}-\d{2}$/.test(day) ? `${day}T12:00:00+03:00` : day);
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export default function ProfileClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [gameXp, setGameXp] = useState(0);
  const [career, setCareer] = useState<Career | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [vkLink, setVkLink] = useState<VkLink | null>(null);

  useEffect(() => {
    let alive = true;
    async function run() {
      try {
        const supabase = await createClient();
        const userResult = await supabase.auth.getUser();
        let authUser = userResult.data?.user || null;
        if (!authUser) authUser = (await supabase.auth.getSession()).data?.session?.user || null;
        if (!alive) return;
        setUser(authUser);
        if (!authUser) return;

        const [statsResult, reportsResult, gameResult, rolesResult, careerResult, vkResult] = await Promise.all([
          supabase.from<UserStats>("user_stats").select("nickname,email").eq("user_id", authUser.id).maybeSingle(),
          supabase.from<ReportRow>("reports").select("id,email,link,date,status,xp").eq("email", authUser.email || "").order("id", { ascending: false }).limit(1500),
          supabase.from<ReportRow>("reports").select("id,email,link,status,xp").in("email", ["GAME_XP", "MANUAL_XP"]).eq("link", authUser.id).limit(1000),
          supabase.from<ReportRow>("reports").select("status").in("email", ["USER_ROLE", "ADMIN_ROLE"]).eq("link", authUser.id).limit(1000),
          supabase.from<Career>("moderator_careers").select("*").eq("site_user_id", authUser.id).maybeSingle(),
          supabase.from<VkLink>("vk_links").select("vk_user_id").eq("site_user_id", authUser.id).maybeSingle()
        ]);
        if (!alive) return;
        if (statsResult.error) throw new Error(statsResult.error.message || "Ошибка профиля");
        if (reportsResult.error) throw new Error(reportsResult.error.message || "Ошибка отчётов");
        if (gameResult.error) throw new Error(gameResult.error.message || "Ошибка XP");
        if (rolesResult.error) throw new Error(rolesResult.error.message || "Ошибка ролей");
        setStats(statsResult.data || null);
        setReports(reportsResult.data || []);
        setGameXp(signedXp(gameResult.data || []));
        setRoles((rolesResult.data || []).map((row) => String(row.status || "")).filter(Boolean));
        setCareer(careerResult.error ? null : (careerResult.data || null));
        setVkLink(vkResult.error ? null : (vkResult.data || null));
      } catch (caught) {
        if (alive) setError(caught instanceof Error ? caught.message : "Неизвестная ошибка");
      } finally {
        if (alive) setLoading(false);
      }
    }
    run();
    return () => { alive = false; };
  }, []);

  const name = useMemo(() => cleanName(user, stats), [user, stats]);
  const realXp = positiveXp(reports);
  const totalXp = Math.max(0, realXp + gameXp);
  const effectiveRank = career?.rank || (roles.includes("moderator") ? "junior_moderator" : "");
  const rank = rankInfo[effectiveRank] || { title: roles.includes("leadership") ? "Руководство" : "Без должности", short: "—" };
  const rankStarted = dateMs(career?.rank_started_at || career?.appointed_at);
  const daysOnRank = rankStarted ? Math.max(0, Math.floor((Date.now() - rankStarted) / 86400000)) : 0;
  const rankReports = reports.filter((row) => approvedStatuses.has(String(row.status || "")) && (!rankStarted || reportDateMs(row) >= rankStarted));
  const highReports = rankReports.filter((row) => highStatuses.has(String(row.status || "")));
  const rejected = reports.filter((row) => String(row.status || "") === "Не засчитано").length;
  const pending = reports.filter((row) => ["На проверке", "У Руководства"].includes(String(row.status || ""))).length;
  const regularTarget = effectiveRank === "junior_moderator" ? { days: 7, reports: 7 } : effectiveRank === "moderator" ? { days: 14, reports: 14 } : null;
  const earlyTarget = effectiveRank === "junior_moderator" ? { days: 5, high: 5 } : effectiveRank === "moderator" ? { days: 10, high: 10 } : null;
  const regularProgress = regularTarget ? Math.min(daysOnRank / regularTarget.days, rankReports.length / regularTarget.reports) * 100 : 100;
  const earlyProgress = earlyTarget ? Math.min(daysOnRank / earlyTarget.days, highReports.length / earlyTarget.high) * 100 : 100;

  return (
    <main className="native-page career-page">
      {loading ? (
        <section className="native-card native-state">Собираем личный дашборд...</section>
      ) : error ? (
        <section className="native-card native-state native-error">{error}</section>
      ) : !user ? (
        <section className="native-card native-state">
          <h2>Нужно войти</h2>
          <p>Войди через основную страницу, чтобы открыть рабочий профиль.</p>
          <a className="native-button" href="/">Перейти ко входу</a>
        </section>
      ) : (
        <>
          <section className="career-hero native-card">
            <div className="career-person">
              <div className="native-avatar">{initials(name)}</div>
              <div>
                <p className="native-kicker">Личный кабинет</p>
                <h1>{name}</h1>
                <p>{user.email}</p>
              </div>
            </div>
            <div className="career-rank-badge">
              <span>{rank.short}</span>
              <div>
                <small>Текущая должность</small>
                <strong>{rank.title}</strong>
              </div>
            </div>
          </section>

          <section className="career-metrics">
            <article className="native-card career-metric"><span>Одобрено отчётов</span><strong>{reports.filter((row) => approvedStatuses.has(String(row.status || ""))).length}</strong><small>{pending} сейчас на проверке</small></article>
            <article className="native-card career-metric"><span>Real XP</span><strong>{realXp}</strong><small>По решениям руководства</small></article>
            <article className="native-card career-metric"><span>Общий баланс</span><strong>{totalXp}</strong><small>Real XP + игровой XP</small></article>
            <article className="native-card career-metric"><span>На должности</span><strong>{daysOnRank}</strong><small>дней · отказов: {rejected}</small></article>
          </section>

          <section className="career-layout">
            <article className="native-card career-promotion">
              <div className="career-section-head">
                <div><p className="native-kicker">Карьерный путь</p><h2>{rank.next ? `До должности «${rank.next}»` : "Текущая ступень"}</h2></div>
                <span className={`career-link-state ${vkLink?.vk_user_id ? "ok" : ""}`}>{vkLink?.vk_user_id ? "VK привязан" : "VK не привязан"}</span>
              </div>
              {regularTarget && earlyTarget ? (
                <div className="career-routes">
                  <div className="career-route">
                    <div className="career-route-title"><strong>Обычный путь</strong><span>{clampPercent(regularProgress)}%</span></div>
                    <div className="career-progress"><i style={{ width: `${clampPercent(regularProgress)}%` }} /></div>
                    <div className="career-requirements"><span className={daysOnRank >= regularTarget.days ? "done" : ""}>{daysOnRank}/{regularTarget.days} дней</span><span className={rankReports.length >= regularTarget.reports ? "done" : ""}>{rankReports.length}/{regularTarget.reports} отчётов</span></div>
                  </div>
                  <div className="career-route early">
                    <div className="career-route-title"><strong>Досрочный путь</strong><span>{clampPercent(earlyProgress)}%</span></div>
                    <div className="career-progress"><i style={{ width: `${clampPercent(earlyProgress)}%` }} /></div>
                    <div className="career-requirements"><span className={daysOnRank >= earlyTarget.days ? "done" : ""}>{daysOnRank}/{earlyTarget.days} дней</span><span className={highReports.length >= earlyTarget.high ? "done" : ""}>{highReports.length}/{earlyTarget.high} перенорм / героев дня</span></div>
                  </div>
                  <p className="career-note">Когда один из путей будет выполнен, бот сообщит об этом в STAFF. Повышение подтвердит руководство.</p>
                </div>
              ) : (
                <div className="career-complete"><span>✦</span><div><strong>{["km", "zgm", "gm"].includes(effectiveRank) ? "Уровень руководства синхронизирован" : "Карьерная ступень достигнута"}</strong><p>Должность получена из действующего листа Discord-состава.</p></div></div>
              )}
            </article>

            <article className="native-card career-recent">
              <div className="career-section-head"><div><p className="native-kicker">Последние решения</p><h2>История отчётов</h2></div><a href="/native/reports">Сдать отчёт</a></div>
              <div className="career-report-list">
                {reports.slice(0, 6).map((row) => {
                  const parsed = reportPayload(row);
                  return <div className="career-report-row" key={row.id || `${parsed.day}-${row.status}`}><span className={`career-status-dot ${row.status === "Не засчитано" ? "bad" : pending > 0 && row.status === "На проверке" ? "wait" : ""}`} /><div><strong>{row.status || "На проверке"}</strong><small>{parsed.day || "Дата не указана"} · {parsed.work}</small></div><b>{toNumber(row.xp)} XP</b></div>;
                })}
                {!reports.length ? <p className="career-empty">Отчётов пока нет. После первой сдачи здесь появится история.</p> : null}
              </div>
            </article>
          </section>
        </>
      )}
    </main>
  );
}
