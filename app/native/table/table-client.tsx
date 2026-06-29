"use client";

import { useEffect, useMemo, useState } from "react";
import "./table.css";

type SupabaseUser = {
  id: string;
  email?: string;
};

type UserStats = {
  user_id?: string;
  nickname?: string | null;
  email?: string | null;
  shop_spent?: number | string | null;
};

type ReportRow = {
  id?: string;
  email?: string;
  link?: string;
  date?: string;
  status?: string;
  xp?: number | string | null;
};

type QueryResult<T> = {
  data?: T | null;
  error?: { message?: string } | null;
};

type QueryBuilder<T> = {
  select(fields?: string): QueryBuilder<T>;
  update(values: Record<string, unknown>): QueryBuilder<T>;
  eq(field: string, value: string): QueryBuilder<T>;
  in(field: string, values: string[]): QueryBuilder<T>;
  not(field: string, operator: string, value: string): QueryBuilder<T>;
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

type ParsedReport = {
  nick: string;
  date: string;
  work: string;
  quality: string;
  proofs: number;
};

type DayCell = {
  day: string;
  report?: ReportRow;
  status: string;
  quality: string;
  proofCount: number;
};

type MemberRow = UserStats & {
  realXp: number;
  cells: DayCell[];
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
const serviceEmails = [
  "ACCESS_KEY",
  "ADMIN_ROLE",
  "SHOP_MOD",
  "SHOP_AP",
  "ROULETTE_MOD",
  "ROULETTE_AP",
  "CUSTOM_MOD_MSG",
  "CUSTOM_AP_MSG",
  "HIDDEN_CHECK",
  "USER_ROLE",
  "USER_KIND",
  "INACTIVE_REQ",
  "SHOP_OVERRIDE",
  "GAME_XP",
  "MANUAL_XP",
  "AP_POINTS",
  "FSB_POINTS",
  "FSB_SPEND",
  "SHOP_FSB",
  "ROULETTE_FSB",
  "GOSS_USER_REPORT",
  "GOSS_REPORT_CHECK",
  "GOSS_PROFILE",
  "GOSS_REPORT_TABLE",
  "GOSS_REPORT_TABLE_V13",
  "GOSS_REPORT_TABLE_V15",
  "GOSS_REPORT_TABLE_V16",
  "GOSS_REPORT_TABLE_V19",
  "GOSS_REPORT_MEMBER_V19",
  "GOSS_REPORT_PROOF_V19",
  "GOSS_POINTS_V19",
  "GOSS_ORG_LOG",
  "GOSS_ORG_LOG_V19",
  "GOSS_ORG_LOG_V24",
  "GOSS_SHOP_ITEMS_V13",
  "GOSS_SHOP_ITEMS_V19",
  "GOSS_SHOP_ITEMS_V24",
  "GOSS_SHOP_ITEMS_V26",
  "GOSS_SHOP_PURCHASE",
  "FSB_SHOP_LOG"
];
const serviceSet = new Set(serviceEmails);
const statusOptions = ["На проверке", "Норма", "Перенорма", "Натяг", "Герой дня", "Неактив", "Нет отчета", "Не засчитано"];
const statusXp: Record<string, number> = {
  "На проверке": 0,
  "Норма": 15,
  "Перенорма": 30,
  "Натяг": 7,
  "Герой дня": 60,
  "Неактив": 0,
  "Нет отчета": 0,
  "Не засчитано": 0
};

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

function mondayOf(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  const day = copy.getDay() || 7;
  copy.setDate(copy.getDate() - day + 1);
  return copy;
}

function iso(date: Date) {
  return date.toISOString().slice(0, 10);
}

function weekDays(offset: number) {
  const start = mondayOf(new Date());
  start.setDate(start.getDate() + offset * 7);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return iso(day);
  });
}

function ruDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}.${month}`;
}

function pick(text: string, pattern: RegExp) {
  return text.match(pattern)?.[1]?.trim() || "";
}

function parseMaybeJson(text: string) {
  const jsonMatch = text.match(/JSON:\s*(\{[\s\S]*\})\s*$/i);
  const raw = jsonMatch?.[1] || (text.trim().startsWith("{") ? text.trim() : "");
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function proofCount(value: unknown) {
  return Array.isArray(value) ? value.length : value ? 1 : 0;
}

function parseReport(row: ReportRow): ParsedReport {
  const raw = String(row.date || "");
  const json = parseMaybeJson(raw);
  let proofs = proofCount(json.proofs || json.files);
  const link = String(row.link || "");
  if (link.startsWith("T73_PROOFS:")) {
    try {
      proofs = proofCount(JSON.parse(link.slice("T73_PROOFS:".length)));
    } catch {
      proofs = 0;
    }
  } else if (link) {
    proofs = Math.max(1, proofs);
  }

  return {
    nick: String(json.nick || json.nickname || pick(raw, /Ник:\s*([^|]+)/i) || row.email || "").trim(),
    date: String(json.date || json.day || pick(raw, /Дата:\s*([\d-]+)/i) || "").trim(),
    work: String(json.work || json.comment || pick(raw, /Работа:\s*([^|]+)/i) || raw).trim(),
    quality: String(json.quality || json.requestedStatus || pick(raw, /Тип\s*сдачи:\s*([^|]+)/i) || "").trim(),
    proofs
  };
}

function parseInactive(row: ReportRow) {
  const text = String(row.date || "");
  return {
    nick: pick(text, /Ник:\s*([^|]+)/i).toLowerCase(),
    from: pick(text, /С:\s*([\d-]+)/i),
    to: pick(text, /По:\s*([\d-]+)/i)
  };
}

function isInactive(inactives: ReportRow[], nick: string, day: string) {
  const cleanNick = nick.toLowerCase();
  const date = new Date(day);
  date.setHours(0, 0, 0, 0);

  return inactives.some((row) => {
    const inactive = parseInactive(row);
    if (!inactive.nick || inactive.nick !== cleanNick || !inactive.from || !inactive.to) return false;
    const from = new Date(inactive.from);
    const to = new Date(inactive.to);
    from.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);
    return date >= from && date <= to;
  });
}

function findReport(reports: ReportRow[], member: UserStats, day: string) {
  const email = String(member.email || "").toLowerCase();
  const nick = String(member.nickname || "").toLowerCase();
  const userId = String(member.user_id || "");

  return reports.find((row) => {
    const parsed = parseReport(row);
    const rowDate = parsed.date;
    if (rowDate !== day) return false;
    if (email && String(row.email || "").toLowerCase() === email) return true;
    if (nick && parsed.nick.toLowerCase() === nick) return true;
    const json = parseMaybeJson(String(row.date || ""));
    return userId && String(json.userId || "") === userId;
  });
}

function statusClass(status: string) {
  if (status === "Норма" || status === "Перенорма") return "ok";
  if (status === "Натяг" || status === "Герой дня") return "hero";
  if (status === "Неактив") return "inactive";
  if (status === "Нет отчета" || status === "Не засчитано") return "bad";
  return "wait";
}

function toNumber(value: unknown) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

export default function TableClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [client, setClient] = useState<SupabaseLike | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [rows, setRows] = useState<MemberRow[]>([]);
  const [busyId, setBusyId] = useState("");

  const days = useMemo(() => weekDays(weekOffset), [weekOffset]);

  async function load() {
    try {
      setLoading(true);
      setError("");

      const supabase = client || await createClient();
      setClient(supabase);

      const userResult = await supabase.auth.getUser();
      let authUser = userResult.data?.user || null;
      if (!authUser) {
        const sessionResult = await supabase.auth.getSession();
        authUser = sessionResult.data?.session?.user || null;
      }
      setUser(authUser);

      if (!authUser) {
        setRows([]);
        setCanEdit(false);
        return;
      }

      const [editRolesResult, modRolesResult] = await Promise.all([
        supabase
          .from<ReportRow>("reports")
          .select("email,link,status")
          .in("email", ["ADMIN_ROLE"])
          .eq("link", authUser.id)
          .limit(200),
        supabase
          .from<ReportRow>("reports")
          .select("link,status,email")
          .eq("email", "USER_ROLE")
          .eq("status", "moderator")
          .limit(1000)
      ]);

      if (editRolesResult.error) throw new Error(editRolesResult.error.message || "Ошибка прав");
      if (modRolesResult.error) throw new Error(modRolesResult.error.message || "Ошибка ролей модераторов");

      const lowerEmail = String(authUser.email || "").toLowerCase();
      const editable =
        adminEmails.has(lowerEmail) ||
        (editRolesResult.data || []).some((row) => row.status === "leadership");
      setCanEdit(editable);

      const ids = Array.from(new Set((modRolesResult.data || []).map((row) => String(row.link || "")).filter(Boolean)));
      if (!ids.length) {
        setRows([]);
        return;
      }

      const usersResult = await supabase
        .from<UserStats>("user_stats")
        .select("user_id,nickname,email,shop_spent")
        .in("user_id", ids)
        .limit(1000);

      if (usersResult.error) throw new Error(usersResult.error.message || "Ошибка профилей");

      const members = (usersResult.data || []).filter((item) => item.email);
      const emails = Array.from(new Set(members.map((item) => String(item.email || "")).filter(Boolean)));

      const [directReportsResult, manualReportsResult, inactivesResult] = await Promise.all([
        supabase
          .from<ReportRow>("reports")
          .select("id,email,link,date,status,xp")
          .in("email", emails)
          .order("id", { ascending: false })
          .limit(1800),
        supabase
          .from<ReportRow>("reports")
          .select("id,email,link,date,status,xp")
          .not("email", "in", `(${serviceEmails.map((email) => `"${email}"`).join(",")})`)
          .order("id", { ascending: false })
          .limit(1800),
        supabase
          .from<ReportRow>("reports")
          .select("id,email,link,date,status,xp")
          .eq("email", "INACTIVE_REQ")
          .eq("status", "Одобрено")
          .limit(900)
      ]);

      if (directReportsResult.error) throw new Error(directReportsResult.error.message || "Ошибка отчётов");
      if (manualReportsResult.error) throw new Error(manualReportsResult.error.message || "Ошибка ручных отметок");
      if (inactivesResult.error) throw new Error(inactivesResult.error.message || "Ошибка неактивов");

      const reportMap = new Map<string, ReportRow>();
      [...(directReportsResult.data || []), ...(manualReportsResult.data || [])]
        .filter((row) => !serviceSet.has(String(row.email || "")))
        .forEach((row) => {
          if (row.id) reportMap.set(row.id, row);
        });
      const reports = Array.from(reportMap.values());
      const inactives = inactivesResult.data || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const built = members
        .map((member) => {
          let total = 0;
          reports.forEach((report) => {
            const parsed = parseReport(report);
            const sameEmail = String(report.email || "").toLowerCase() === String(member.email || "").toLowerCase();
            const sameNick = parsed.nick.toLowerCase() === String(member.nickname || "").toLowerCase();
            if (sameEmail || sameNick) total += toNumber(report.xp);
          });

          const cells = days.map((day) => {
            const report = findReport(reports, member, day);
            const parsed = report ? parseReport(report) : null;
            let status = report ? String(report.status || "На проверке") : "none";
            if (!report && isInactive(inactives, String(member.nickname || ""), day)) status = "Неактив";
            if (!report && status === "none") {
              const date = new Date(day);
              date.setHours(0, 0, 0, 0);
              if (date < today) status = "Нет отчета";
            }
            return {
              day,
              report,
              status,
              quality: parsed?.quality || "",
              proofCount: parsed?.proofs || 0
            };
          });

          return {
            ...member,
            realXp: Math.max(0, total - toNumber(member.shop_spent)),
            cells
          };
        })
        .sort((a, b) => String(a.nickname || a.email || "").localeCompare(String(b.nickname || b.email || ""), "ru"));

      setRows(built);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset]);

  async function updateStatus(cell: DayCell, status: string) {
    if (!client || !canEdit || !cell.report?.id) return;
    try {
      setBusyId(cell.report.id);
      setError("");
      const xp = statusXp[status] ?? 0;
      const result = await client.from<ReportRow>("reports").update({ status, xp }).eq("id", cell.report.id);
      if (result.error) throw new Error(result.error.message || "Ошибка обновления");
      setRows((items) => items.map((member) => ({
        ...member,
        cells: member.cells.map((item) => item.report?.id === cell.report?.id ? { ...item, status, report: { ...item.report, status, xp } } : item)
      })));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Неизвестная ошибка");
    } finally {
      setBusyId("");
    }
  }

  return (
    <main className="table-page">
      <nav className="table-topbar">
        <a className="table-brand" href="/native/profile">
          <span>CH</span>
          <b>CHEREPOVETS</b>
        </a>
        <div className="table-links">
          <a href="/native/review">Проверка</a>
          <a href="/native/reports">Сдать отчёт</a>
          <a href="/reports-table">Legacy таблица</a>
        </div>
      </nav>

      <section className="table-hero">
        <p>Next-раздел руководства</p>
        <h1>Таблица отчётов</h1>
        <span>
          Недельная native-сетка: модераторы, отчёты, выбранный тип сдачи, вердикт, XP и
          одобренные неактивы.
        </span>
      </section>

      <section className="table-toolbar table-card">
        <button className="table-button ghost" onClick={() => setWeekOffset((value) => value - 1)} type="button">
          Прошлая
        </button>
        <div>
          <strong>{days[0]} — {days[6]}</strong>
          <span>{rows.length} модераторов · {canEdit ? "редактирование доступно" : "только просмотр"}</span>
        </div>
        <button className="table-button ghost" disabled={weekOffset === 0} onClick={() => setWeekOffset((value) => Math.min(0, value + 1))} type="button">
          Следующая
        </button>
        <button className="table-button" onClick={load} type="button">Обновить</button>
      </section>

      {loading ? (
        <section className="table-card table-state">Загрузка таблицы...</section>
      ) : !user ? (
        <section className="table-card table-state">
          <h2>Нужно войти</h2>
          <p>Сессия Supabase не найдена.</p>
          <a className="table-button" href="/">Перейти ко входу</a>
        </section>
      ) : (
        <section className="table-list">
          {error ? <div className="table-alert">{error}</div> : null}
          {rows.length ? (
            rows.map((member, index) => (
              <article className="table-card table-row" key={member.user_id || member.email || member.nickname || `member-${index}`}>
                <div className="table-user">
                  <div>
                    <h2>{member.nickname || member.email || "Без ника"}</h2>
                    <span>{member.email}</span>
                  </div>
                  <strong>{member.realXp} Real XP</strong>
                </div>
                <div className="table-days">
                  {member.cells.map((cell) => (
                    <div className={`table-day ${statusClass(cell.status)}`} key={`${member.user_id}-${cell.day}`}>
                      <div className="table-date">{ruDate(cell.day)}</div>
                      <div className="table-quality">{cell.quality ? `Выбрал: ${cell.quality}` : " "}</div>
                      <div className="table-proofs">Скринов: {cell.proofCount}</div>
                      {canEdit && cell.report ? (
                        <select
                          disabled={busyId === cell.report.id}
                          onChange={(event) => updateStatus(cell, event.target.value)}
                          value={cell.status}
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="table-status">{cell.status === "none" ? "—" : cell.status}</div>
                      )}
                    </div>
                  ))}
                </div>
              </article>
            ))
          ) : (
            <section className="table-card table-state">Модераторы не найдены.</section>
          )}
        </section>
      )}
    </main>
  );
}
