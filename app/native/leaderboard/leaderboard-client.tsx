"use client";

import { useEffect, useMemo, useState } from "react";
import "./leaderboard.css";

type SupabaseUser = {
  id: string;
  email?: string;
};

type UserStats = {
  user_id?: string;
  nickname?: string | null;
  email?: string | null;
  shop_spent?: number | string | null;
  sup_correct?: number | string | null;
  ap_spent?: number | string | null;
};

type ReportRow = {
  email?: string;
  link?: string;
  status?: string;
  xp?: number | string | null;
};

type QueryResult<T> = {
  data?: T | null;
  error?: { message?: string } | null;
};

type QueryBuilder<T> = {
  select(fields?: string): QueryBuilder<T>;
  eq(field: string, value: string): QueryBuilder<T>;
  in(field: string, values: string[]): QueryBuilder<T>;
  gt(field: string, value: number): QueryBuilder<T>;
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

type LeaderRow = {
  userId: string;
  name: string;
  email: string;
  realXp: number;
  apScore: number;
};

declare global {
  interface Window {
    CH89_SUPABASE_URL?: string;
    CH89_SUPABASE_ANON_KEY?: string;
    supabase?: {
      createClient(url: string, key: string): unknown;
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

  return window.supabase.createClient(url, key) as SupabaseLike;
}

function toNumber(value: unknown) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function medal(index: number) {
  if (index === 0) return "1";
  if (index === 1) return "2";
  if (index === 2) return "3";
  return String(index + 1);
}

export default function LeaderboardClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"mod" | "ap">("mod");
  const [modRows, setModRows] = useState<LeaderRow[]>([]);
  const [apRows, setApRows] = useState<LeaderRow[]>([]);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const rows = useMemo(() => (tab === "mod" ? modRows : apRows), [tab, modRows, apRows]);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const client = await createClient();
      const userResult = await client.auth.getUser();
      let authUser = userResult.data?.user || null;
      if (!authUser) {
        const sessionResult = await client.auth.getSession();
        authUser = sessionResult.data?.session?.user || null;
      }
      setUser(authUser);

      const [reportsResult, usersResult, rolesResult] = await Promise.all([
        client.from<ReportRow>("reports").select("email,xp").gt("xp", 0).limit(5000),
        client.from<UserStats>("user_stats").select("user_id,nickname,email,shop_spent,sup_correct,ap_spent").limit(2000),
        client.from<ReportRow>("reports").select("email,link,status").eq("email", "USER_ROLE").limit(3000)
      ]);
      if (reportsResult.error) throw new Error(reportsResult.error.message || "Ошибка XP");
      if (usersResult.error) throw new Error(usersResult.error.message || "Ошибка пользователей");
      if (rolesResult.error) throw new Error(rolesResult.error.message || "Ошибка ролей");

      const modIds = new Set(
        (rolesResult.data || [])
          .filter((row) => String(row.status || "").toLowerCase() === "moderator")
          .map((row) => String(row.link || ""))
          .filter(Boolean)
      );
      const apIds = new Set(
        (rolesResult.data || [])
          .filter((row) => String(row.status || "").toLowerCase() === "ap")
          .map((row) => String(row.link || ""))
          .filter(Boolean)
      );

      const xpByEmail = new Map<string, number>();
      (reportsResult.data || []).forEach((row) => {
        const email = String(row.email || "").toLowerCase();
        if (!email) return;
        xpByEmail.set(email, (xpByEmail.get(email) || 0) + toNumber(row.xp));
      });

      const allRows = (usersResult.data || []).map((profile) => {
        const email = String(profile.email || "").toLowerCase();
        const realXp = Math.max(0, (xpByEmail.get(email) || 0) - toNumber(profile.shop_spent));
        return {
          userId: String(profile.user_id || ""),
          name: String(profile.nickname || profile.email || "Без ника"),
          email: String(profile.email || ""),
          realXp,
          apScore: Math.max(0, Math.floor(toNumber(profile.sup_correct) / 10) * 15 - toNumber(profile.ap_spent))
        };
      });

      const isLeader = (row: LeaderRow) => adminEmails.has(row.email.toLowerCase()) || row.email.toLowerCase() === creatorEmail;
      setModRows(
        allRows
          .filter((row) => (modIds.has(row.userId) || row.realXp > 0) && !isLeader(row) && row.realXp > 0)
          .sort((a, b) => b.realXp - a.realXp)
          .slice(0, 30)
      );
      setApRows(
        allRows
          .filter((row) => apIds.has(row.userId) && !isLeader(row) && row.apScore > 0)
          .sort((a, b) => b.apScore - a.apScore)
          .slice(0, 30)
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="leader-page">
      <section className="leader-hero">
        <p>Native рейтинг</p>
        <h1>Лидерборд</h1>
        <span>Рейтинг считается напрямую из Supabase: роли `USER_ROLE`, отчётный XP и списания магазина.</span>
      </section>

      <section className="leader-toolbar">
        <div>
          <strong>{user ? "Сессия активна" : "Просмотр без сессии"}</strong>
          <span>{tab === "mod" ? `${modRows.length} модераторов` : `${apRows.length} АП`}</span>
        </div>
        <div className="leader-tabs">
          <button className={tab === "mod" ? "active" : ""} onClick={() => setTab("mod")} type="button">Модерация</button>
          <button className={tab === "ap" ? "active" : ""} onClick={() => setTab("ap")} type="button">АП</button>
          <button onClick={load} type="button">Обновить</button>
        </div>
      </section>

      {loading ? (
        <section className="leader-state">Загрузка рейтинга...</section>
      ) : error ? (
        <section className="leader-state bad">{error}</section>
      ) : rows.length ? (
        <section className="leader-list">
          {rows.map((row, index) => (
            <article className="leader-row" key={`${row.userId || row.email}-${tab}`}>
              <div className={`leader-place place-${index + 1}`}>{medal(index)}</div>
              <div className="leader-person">
                <strong>{row.name}</strong>
                <span>{row.email || row.userId}</span>
              </div>
              <b>{tab === "mod" ? `${row.realXp} Real XP` : `${row.apScore} баллов`}</b>
            </article>
          ))}
        </section>
      ) : (
        <section className="leader-state">Рейтинг пуст. Для модерации нужен Real XP, для АП нужны баллы.</section>
      )}
    </main>
  );
}
