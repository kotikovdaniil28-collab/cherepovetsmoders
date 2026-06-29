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
  status?: string;
  xp?: number | string | null;
};

type UserStats = {
  nickname?: string | null;
  email?: string | null;
};

type QueryResult<T> = {
  data?: T | null;
  error?: { message?: string } | null;
};

type QueryBuilder<T> = {
  select(fields?: string): QueryBuilder<T>;
  eq(field: string, value: string): QueryBuilder<T>;
  in(field: string, values: string[]): QueryBuilder<T>;
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
    supabase?: {
      createClient(url: string, key: string): SupabaseLike;
    };
  }
}

const scriptUrl = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "1") resolve();
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("script load failed")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = "1";
      resolve();
    };
    script.onerror = () => reject(new Error("script load failed"));
    document.head.appendChild(script);
  });
}

async function createClient() {
  await loadScript("/supabase.config.js");
  await loadScript(scriptUrl);

  const url = window.CH89_SUPABASE_URL;
  const key = window.CH89_SUPABASE_ANON_KEY;
  if (!url || !key || !window.supabase) throw new Error("Supabase config не загрузился");

  return window.supabase.createClient(url, key);
}

function cleanName(user: SupabaseUser | null, stats: UserStats | null) {
  const meta = user?.user_metadata || {};
  const raw = String(
    stats?.nickname ||
      meta.nickname ||
      meta.name ||
      meta.full_name ||
      user?.email ||
      "Неизвестный пользователь"
  );
  return raw.trim();
}

function initials(name: string) {
  return name
    .split(/[#_\s]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "CH";
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

export default function ProfileClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [realXp, setRealXp] = useState(0);
  const [gameXp, setGameXp] = useState(0);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        setLoading(true);
        setError("");

        const supabase = await createClient();
        const userResult = await supabase.auth.getUser();
        let authUser = userResult.data?.user || null;

        if (!authUser) {
          const sessionResult = await supabase.auth.getSession();
          authUser = sessionResult.data?.session?.user || null;
        }

        if (!alive) return;
        setUser(authUser);

        if (!authUser) {
          setLoading(false);
          return;
        }

        const [statsResult, reportRowsResult, gameRowsResult, roleRowsResult] = await Promise.all([
          supabase
            .from<UserStats>("user_stats")
            .select("nickname,email")
            .eq("user_id", authUser.id)
            .maybeSingle(),
          supabase
            .from<ReportRow>("reports")
            .select("id,email,link,status,xp")
            .eq("email", authUser.email || "")
            .limit(1000),
          supabase
            .from<ReportRow>("reports")
            .select("id,email,link,status,xp")
            .in("email", ["GAME_XP", "MANUAL_XP"])
            .eq("link", authUser.id)
            .limit(1000),
          supabase
            .from<ReportRow>("reports")
            .select("status")
            .in("email", ["USER_ROLE", "ADMIN_ROLE"])
            .eq("link", authUser.id)
            .limit(1000)
        ]);

        if (!alive) return;

        if (statsResult.error) throw new Error(statsResult.error.message || "Ошибка user_stats");
        if (reportRowsResult.error) throw new Error(reportRowsResult.error.message || "Ошибка reports");
        if (gameRowsResult.error) throw new Error(gameRowsResult.error.message || "Ошибка GAME_XP");
        if (roleRowsResult.error) throw new Error(roleRowsResult.error.message || "Ошибка ролей");

        setStats(statsResult.data || null);
        setRealXp(positiveXp(reportRowsResult.data || []));
        setGameXp(signedXp(gameRowsResult.data || []));
        setRoles((roleRowsResult.data || []).map((row) => String(row.status || "")).filter(Boolean));
      } catch (caught) {
        if (alive) setError(caught instanceof Error ? caught.message : "Неизвестная ошибка");
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, []);

  const name = useMemo(() => cleanName(user, stats), [user, stats]);
  const totalXp = Math.max(0, realXp + gameXp);
  const primaryRole = roles.includes("moderator")
    ? "Модератор"
    : roles.includes("goss_admin_all") || roles.some((role) => role.startsWith("goss_"))
      ? "Руководство"
      : roles.length
        ? roles[0]
        : "Без роли";

  return (
    <main className="native-page">
      <nav className="native-topbar">
        <a className="native-brand" href="/profile">
          <span className="native-logo">CH</span>
          <span>
            <b>CHEREPOVETS</b>
            <small>native profile preview</small>
          </span>
        </a>
        <div className="native-links">
          <a href="/profile">Старый профиль</a>
          <a href="/reports">Отчёты</a>
          <a href="/reports-table">Таблица</a>
        </div>
      </nav>

      <section className="native-hero">
        <div>
          <p className="native-kicker">Next-раздел</p>
          <h1>Профиль модератора</h1>
          <p>
            Первый раздел, вынесенный из монолита в отдельную Next-страницу. Старый профиль
            остаётся доступен, пока этот вариант доводится до полного функционала.
          </p>
        </div>
        <a className="native-button" href="/profile">Открыть рабочий профиль</a>
      </section>

      {loading ? (
        <section className="native-card native-state">Загрузка профиля...</section>
      ) : error ? (
        <section className="native-card native-state native-error">{error}</section>
      ) : !user ? (
        <section className="native-card native-state">
          <h2>Нужно войти</h2>
          <p>Сессия Supabase не найдена. Войди через старую страницу авторизации, затем вернись сюда.</p>
          <a className="native-button" href="/">Перейти к входу</a>
        </section>
      ) : (
        <section className="native-grid">
          <article className="native-card native-profile-card">
            <div className="native-avatar">{initials(name)}</div>
            <div>
              <p className="native-kicker">Аккаунт</p>
              <h2>{name}</h2>
              <p>{user.email}</p>
            </div>
          </article>

          <article className="native-card">
            <span className="native-label">Всего XP</span>
            <strong className="native-value">{totalXp}</strong>
            <p>Сумма реального и игрового XP.</p>
          </article>

          <article className="native-card">
            <span className="native-label">Реальный XP</span>
            <strong className="native-value">{realXp}</strong>
            <p>Начисления из отчётов и ручных записей пользователя.</p>
          </article>

          <article className="native-card">
            <span className="native-label">Игровой XP</span>
            <strong className="native-value">{gameXp}</strong>
            <p>Записи GAME_XP и MANUAL_XP по ID пользователя.</p>
          </article>

          <article className="native-card">
            <span className="native-label">Роль</span>
            <strong className="native-value native-role">{primaryRole}</strong>
            <p>{roles.length ? roles.join(", ") : "Роли в reports пока не найдены."}</p>
          </article>

          <article className="native-card native-wide">
            <span className="native-label">Следующий перенос</span>
            <h2>Отчёты и неактивы</h2>
            <p>
              После проверки этой страницы можно переносить формы `/reports` и `/inactives` в
              настоящие компоненты, а старый интерфейс оставить резервом.
            </p>
          </article>
        </section>
      )}
    </main>
  );
}
