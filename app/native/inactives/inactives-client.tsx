"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import "./inactives.css";

type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

type UserStats = {
  nickname?: string | null;
  email?: string | null;
};

type ReportRow = {
  id?: string;
  email?: string;
  link?: string;
  date?: string;
  status?: string;
  xp?: number;
};

type QueryResult<T> = {
  data?: T | null;
  error?: { message?: string } | null;
};

type QueryBuilder<T> = {
  select(fields?: string): QueryBuilder<T>;
  insert(values: Record<string, unknown>[]): Promise<QueryResult<T[]>>;
  eq(field: string, value: string): QueryBuilder<T>;
  in(field: string, values: string[]): QueryBuilder<T>;
  maybeSingle(): Promise<QueryResult<T>>;
  order(field: string, options?: { ascending?: boolean }): QueryBuilder<T>;
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
const creatorEmail = "daniiltimosin72@gmail.com";
const adminEmails = new Set([
  creatorEmail,
  "leha.br222@gmail.com",
  "isayevrufat37@gmail.com",
  "maksimladnyj4@gmail.com"
]);

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

function readName(user: SupabaseUser | null, stats: UserStats | null) {
  const meta = user?.user_metadata || {};
  return String(stats?.nickname || meta.nickname || meta.name || meta.full_name || "").trim();
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function makeId() {
  return `ina_native_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function parseInactive(row: ReportRow) {
  const text = String(row.date || "");
  const nick = text.match(/Ник:\s*([^|]+)/i)?.[1]?.trim() || "";
  const from = text.match(/С:\s*([\d-]+)/i)?.[1]?.trim() || "";
  const to = text.match(/По:\s*([\d-]+)/i)?.[1]?.trim() || "";
  const reason = text.match(/Причина:\s*([\s\S]+)/i)?.[1]?.trim() || "";
  return { nick, from, to, reason };
}

export default function InactivesClient() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [client, setClient] = useState<SupabaseLike | null>(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const [nick, setNick] = useState("");
  const [dateFrom, setDateFrom] = useState(today());
  const [dateTo, setDateTo] = useState(today());
  const [reason, setReason] = useState("");
  const [recent, setRecent] = useState<ReportRow[]>([]);

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
        setClient(supabase);
        setUser(authUser);

        if (!authUser) {
          setLoading(false);
          return;
        }

        const statsResult = await supabase
          .from<UserStats>("user_stats")
          .select("nickname,email")
          .eq("user_id", authUser.id)
          .maybeSingle();

        if (statsResult.error) throw new Error(statsResult.error.message || "Ошибка user_stats");

        const currentStats = statsResult.data || null;
        const defaultNick = readName(authUser, currentStats);

        const [recentResult, rolesResult] = await Promise.all([
          supabase
            .from<ReportRow>("reports")
            .select("id,email,link,date,status,xp")
            .eq("email", "INACTIVE_REQ")
            .order("id", { ascending: false })
            .limit(60),
          supabase
            .from<ReportRow>("reports")
            .select("email,link,status")
            .in("email", ["USER_ROLE", "ADMIN_ROLE"])
            .eq("link", authUser.id)
            .limit(200)
        ]);

        if (recentResult.error) throw new Error(recentResult.error.message || "Ошибка загрузки неактивов");
        if (rolesResult.error) throw new Error(rolesResult.error.message || "Ошибка загрузки прав");

        if (!alive) return;
        setStats(currentStats);
        setNick(defaultNick);
        setCanSubmit(
          adminEmails.has(String(authUser.email || "").toLowerCase()) ||
            (rolesResult.data || []).some((row) => row.email === "USER_ROLE" && row.status === "moderator") ||
            (rolesResult.data || []).some((row) => row.email === "ADMIN_ROLE" && row.status === "leadership")
        );
        setRecent((recentResult.data || []).filter((row) => row.link === authUser.email).slice(0, 5));
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

  const displayName = useMemo(() => readName(user, stats) || user?.email || "Пользователь", [user, stats]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!client || !user) {
      setError("Сначала войди в аккаунт.");
      return;
    }

    if (!canSubmit) {
      setError("Неактив доступен только модераторам и руководству.");
      return;
    }

    const finalNick = nick.trim();
    const finalReason = reason.trim();

    if (!finalNick || !dateFrom || !dateTo || !finalReason) {
      setError("Заполни ник, даты и причину.");
      return;
    }

    if (new Date(dateFrom) > new Date(dateTo)) {
      setError("Дата начала не может быть позже даты окончания.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = `Ник: ${finalNick} | С: ${dateFrom} | По: ${dateTo} | Причина: ${finalReason}`;
      const result = await client.from<ReportRow>("reports").insert([
        {
          id: makeId(),
          email: "INACTIVE_REQ",
          link: user.email || "",
          date: payload,
          status: "Ожидает одобрения",
          xp: 0
        }
      ]);

      if (result.error) throw new Error(result.error.message || "Ошибка отправки");

      setSuccess("Заявка на неактив отправлена руководству.");
      setReason("");
      setRecent((items) => [
        {
          id: makeId(),
          email: "INACTIVE_REQ",
          link: user.email || "",
          date: payload,
          status: "Ожидает одобрения",
          xp: 0
        },
        ...items
      ].slice(0, 5));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Неизвестная ошибка");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="inactive-page">
      <nav className="inactive-topbar">
        <a className="inactive-brand" href="/native/profile">
          <span>CH</span>
          <b>CHEREPOVETS</b>
        </a>
        <div className="inactive-links">
          <a href="/native/profile">Native профиль</a>
          <a href="/inactives">Старые неактивы</a>
          <a href="/reports">Отчёты</a>
        </div>
      </nav>

      <section className="inactive-hero">
        <p>Next-раздел</p>
        <h1>Заявка на неактив</h1>
        <span>
          Эта форма пишет заявку в тот же reports / INACTIVE_REQ, который использует старый сайт.
          Старый раздел `/inactives` оставлен резервом.
        </span>
      </section>

      {loading ? (
        <section className="inactive-card inactive-state">Загрузка...</section>
      ) : !user ? (
        <section className="inactive-card inactive-state">
          <h2>Нужно войти</h2>
          <p>Сессия Supabase не найдена. Войди через старую авторизацию, затем вернись сюда.</p>
          <a className="inactive-button" href="/">Перейти ко входу</a>
        </section>
      ) : (
        <section className="inactive-layout">
          <form className="inactive-card inactive-form" onSubmit={submit}>
            <div>
              <p className="inactive-kicker">Отправитель</p>
              <h2>{displayName}</h2>
              <small>{user.email}</small>
            </div>

            {!canSubmit ? (
              <div className="inactive-alert inactive-error">
                У аккаунта нет роли модератора. Старый сайт тоже не даст отправить неактив без доступа.
              </div>
            ) : null}

            <label>
              Никнейм
              <input value={nick} onChange={(event) => setNick(event.target.value)} placeholder="Nick_Name" />
            </label>

            <div className="inactive-dates">
              <label>
                С
                <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
              </label>
              <label>
                По
                <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
              </label>
            </div>

            <label>
              Причина
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Например: семейные обстоятельства, учёба, поездка..."
                rows={5}
              />
            </label>

            {error ? <div className="inactive-alert inactive-error">{error}</div> : null}
            {success ? <div className="inactive-alert inactive-success">{success}</div> : null}

            <button className="inactive-button" disabled={submitting || !canSubmit} type="submit">
              {submitting ? "Отправка..." : "Отправить заявку"}
            </button>
          </form>

          <aside className="inactive-card inactive-side">
            <p className="inactive-kicker">Последние заявки</p>
            <h2>Твои неактивы</h2>
            <div className="inactive-list">
              {recent.length ? (
                recent.map((row) => {
                  const parsed = parseInactive(row);
                  return (
                    <article key={row.id || row.date} className="inactive-item">
                      <strong>{row.status || "Без статуса"}</strong>
                      <span>{parsed.from || "—"} — {parsed.to || "—"}</span>
                      <small>{parsed.reason || "Причина не указана"}</small>
                    </article>
                  );
                })
              ) : (
                <p className="inactive-muted">Твоих заявок пока не найдено.</p>
              )}
            </div>
          </aside>
        </section>
      )}
    </main>
  );
}
