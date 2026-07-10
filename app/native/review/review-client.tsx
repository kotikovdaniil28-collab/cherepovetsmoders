"use client";

import { useEffect, useMemo, useState } from "react";
import "./review.css";

type SupabaseUser = {
  id: string;
  email?: string;
};

type ReportRow = {
  id: string;
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
    getSession(): Promise<{ data?: { session?: { user?: SupabaseUser | null; access_token?: string } | null } }>;
  };
  from<T = Record<string, unknown>>(table: string): QueryBuilder<T>;
};

type ParsedReport = {
  nick: string;
  date: string;
  work: string;
  quality: string;
  proofs: Array<{ url: string; name?: string; kind?: string }>;
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
const actions = [
  { status: "Норма", xp: 15 },
  { status: "Перенорма", xp: 30 },
  { status: "Натяг", xp: 7 },
  { status: "Герой дня", xp: 60 },
  { status: "Не засчитано", xp: 0 }
];
const rejectReasons = [
  { code: "none", title: "Просто отказать" },
  { code: "no_proof", title: "Нет доказательств" },
  { code: "not_enough_work", title: "Недостаточно работы" },
  { code: "wrong_date", title: "Неверная дата" },
  { code: "duplicate", title: "Дубликат" },
  { code: "rules", title: "Не по требованиям" }
];

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

function normalizeProofs(value: unknown) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return list
    .map((item, index) => {
      if (typeof item === "string") return { url: item, name: `Доказательство ${index + 1}`, kind: "link" };
      if (item && typeof item === "object" && "url" in item) {
        const proof = item as { url?: unknown; name?: unknown; kind?: unknown };
        return {
          url: String(proof.url || ""),
          name: String(proof.name || `Доказательство ${index + 1}`),
          kind: String(proof.kind || "link")
        };
      }
      return { url: "", name: "", kind: "" };
    })
    .filter((proof) => proof.url);
}

function parseReport(row: ReportRow): ParsedReport {
  const raw = String(row.date || "");
  const json = parseMaybeJson(raw);
  let proofs = normalizeProofs(json.proofs || json.files);

  const link = String(row.link || "");
  if (link.startsWith("T73_PROOFS:")) {
    try {
      proofs = normalizeProofs(JSON.parse(link.slice("T73_PROOFS:".length)));
    } catch {
      proofs = [];
    }
  } else if (link && !proofs.some((proof) => proof.url === link)) {
    proofs.unshift({ url: link, name: "Доказательство", kind: link.startsWith("data:image") ? "file" : "link" });
  }

  return {
    nick: String(json.nick || json.nickname || pick(raw, /Ник:\s*([^|]+)/i) || row.email || "Модератор"),
    date: String(json.date || json.day || pick(raw, /Дата:\s*([\d-]+)/i) || ""),
    work: String(json.work || json.comment || pick(raw, /Работа:\s*([^|]+)/i) || raw),
    quality: String(json.quality || json.requestedStatus || pick(raw, /Тип\s*сдачи:\s*([^|]+)/i) || "не выбрано"),
    proofs
  };
}

function pending(status: string | undefined) {
  const normalized = String(status || "");
  return normalized === "На проверке" || normalized.includes("Ожидает") || normalized === "У Руководства";
}

function statusClass(status: string | undefined) {
  const normalized = String(status || "");
  if (normalized === "Норма" || normalized === "Перенорма") return "ok";
  if (normalized === "Натяг" || normalized === "Герой дня") return "hero";
  if (normalized === "Не засчитано" || normalized === "Отказ") return "bad";
  return "wait";
}

export default function ReviewClient() {
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [client, setClient] = useState<SupabaseLike | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [onlyPending, setOnlyPending] = useState(true);
  const [accessToken, setAccessToken] = useState("");
  const [decision, setDecision] = useState<{ row: ReportRow; mode: "approve" | "reject" } | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError("");

      const supabase = client || await createClient();
      setClient(supabase);

      const sessionResult = await supabase.auth.getSession();
      const userResult = await supabase.auth.getUser();
      let authUser = userResult.data?.user || sessionResult.data?.session?.user || null;
      setAccessToken(String(sessionResult.data?.session?.access_token || ""));

      setUser(authUser);

      if (!authUser) {
        setRows([]);
        setCanReview(false);
        return;
      }

      const [rolesResult, reportsResult] = await Promise.all([
        supabase
          .from<ReportRow>("reports")
          .select("email,link,status")
          .in("email", ["ADMIN_ROLE"])
          .eq("link", authUser.id)
          .limit(200),
        supabase
          .from<ReportRow>("reports")
          .select("id,email,link,date,status,xp")
          .not("email", "in", `(${serviceEmails.map((email) => `"${email}"`).join(",")})`)
          .order("id", { ascending: false })
          .limit(120)
      ]);

      if (rolesResult.error) throw new Error(rolesResult.error.message || "Ошибка прав");
      if (reportsResult.error) throw new Error(reportsResult.error.message || "Ошибка отчётов");

      const lowerEmail = String(authUser.email || "").toLowerCase();
      const allowed =
        adminEmails.has(lowerEmail) ||
        (rolesResult.data || []).some((row) => row.status === "leadership");

      setCanReview(allowed);
      setRows((reportsResult.data || []).filter((row) => !serviceSet.has(String(row.email || ""))));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleRows = useMemo(() => {
    return onlyPending ? rows.filter((row) => pending(row.status)) : rows;
  }, [onlyPending, rows]);

  async function review(row: ReportRow, status: string, reasonCode = "") {
    if (!client || !canReview || !accessToken) return;
    try {
      setBusyId(row.id);
      setError("");
      const response = await fetch("/api/reports/review", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ reportId: row.id, status, reasonCode })
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "Ошибка обновления");
      const xp = Number(result.xp || 0);
      setRows((items) => items.map((item) => item.id === row.id ? { ...item, status, xp } : item));
      setDecision(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Неизвестная ошибка");
    } finally {
      setBusyId("");
    }
  }

  return (
    <main className="review-page">
      <nav className="review-topbar">
        <a className="review-brand" href="/native/profile">
          <span>CH</span>
          <b>CHEREPOVETS</b>
        </a>
        <div className="review-links">
          <a href="/native/reports">Сдать отчёт</a>
          <a href="/native/inactives">Неактивы</a>
          <a href="/reports-table">Legacy таблица</a>
        </div>
      </nav>

      <section className="review-hero">
        <p>Next-раздел руководства</p>
          <h1>Центр решений</h1>
          <span>
          Один экран для доказательств, итогового типа и вердикта. После решения бот сам напишет
          модератору в VK и обновит карточку в группе отчётности.
        </span>
      </section>

      <section className="review-toolbar review-card">
        <div>
          <strong>{visibleRows.length}</strong>
          <span>{onlyPending ? "на проверке" : "всего загружено"}</span>
        </div>
        <label>
          <input checked={onlyPending} onChange={(event) => setOnlyPending(event.target.checked)} type="checkbox" />
          Только ожидающие
        </label>
        <button className="review-button ghost" onClick={load} type="button">Обновить</button>
      </section>

      {loading ? (
        <section className="review-card review-state">Загрузка отчётов...</section>
      ) : !user ? (
        <section className="review-card review-state">
          <h2>Нужно войти</h2>
          <p>Сессия Supabase не найдена. Войди через старую авторизацию.</p>
          <a className="review-button" href="/login?legacy=1">Перейти ко входу</a>
        </section>
      ) : !canReview ? (
        <section className="review-card review-state">
          <h2>Нет доступа</h2>
          <p>Проверка отчётов доступна только руководству и создателю.</p>
        </section>
      ) : (
        <section className="review-list">
          {error ? <div className="review-alert">{error}</div> : null}
          {visibleRows.length ? (
            visibleRows.map((row) => {
              const parsed = parseReport(row);
              return (
                <article className="review-card review-item" key={row.id}>
                  <div className="review-item-head">
                    <div>
                      <p className="review-kicker">{parsed.date || "Дата не указана"}</p>
                      <h2>{parsed.nick}</h2>
                      <span>{row.email}</span>
                    </div>
                    <div className={`review-status ${statusClass(row.status)}`}>
                      {row.status || "На проверке"} · {row.xp || 0} XP
                    </div>
                  </div>

                  <div className="review-meta">
                    <span>Выбрал: {parsed.quality}</span>
                    <span>Доказательств: {parsed.proofs.length}</span>
                  </div>

                  <p className="review-work">{parsed.work}</p>

                  {parsed.proofs.length ? (
                    <div className="review-proofs">
                      {parsed.proofs.map((proof, index) => (
                        proof.url.startsWith("data:image") ? (
                          <a className="review-proof image" href={proof.url} key={`${proof.url}-${index}`} target="_blank">
                            <img alt={proof.name || "Скриншот"} src={proof.url} />
                          </a>
                        ) : (
                          <a className="review-proof" href={proof.url} key={`${proof.url}-${index}`} rel="noreferrer" target="_blank">
                            {proof.name || `Доказательство ${index + 1}`}
                          </a>
                        )
                      ))}
                    </div>
                  ) : (
                    <div className="review-empty-proof">Доказательства не найдены</div>
                  )}

                  <div className="review-actions">
                    <button
                      className="review-button"
                      disabled={busyId === row.id}
                      onClick={() => setDecision({ row, mode: "approve" })}
                      type="button"
                    >
                      Одобрить и выбрать тип
                    </button>
                    <button
                      className="review-button danger"
                      disabled={busyId === row.id}
                      onClick={() => setDecision({ row, mode: "reject" })}
                      type="button"
                    >
                      Отказать
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <section className="review-card review-state">Отчётов для проверки нет.</section>
          )}
        </section>
      )}

      {decision ? (
        <div className="review-modal-backdrop" role="presentation" onMouseDown={() => setDecision(null)}>
          <section
            aria-labelledby="reviewDecisionTitle"
            aria-modal="true"
            className="review-modal review-card"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
          >
            <button aria-label="Закрыть" className="review-modal-close" onClick={() => setDecision(null)} type="button">×</button>
            <p className="review-kicker">{decision.mode === "approve" ? "Итоговый тип" : "Причина отказа"}</p>
            <h2 id="reviewDecisionTitle">{parseReport(decision.row).nick}</h2>
            <p className="review-modal-copy">
              {decision.mode === "approve"
                ? "Выберите фактический результат. Заявленный модератором тип можно изменить."
                : "Выберите готовую причину — бот аккуратно передаст её модератору в личные сообщения."}
            </p>
            <div className="review-decision-grid">
              {decision.mode === "approve" ? actions.filter((item) => item.status !== "Не засчитано").map((action) => (
                <button
                  className="review-decision-option"
                  disabled={busyId === decision.row.id}
                  key={action.status}
                  onClick={() => review(decision.row, action.status)}
                  type="button"
                >
                  <strong>{action.status}</strong>
                  <span>{action.xp} XP</span>
                </button>
              )) : rejectReasons.map((reason) => (
                <button
                  className="review-decision-option danger"
                  disabled={busyId === decision.row.id}
                  key={reason.code}
                  onClick={() => review(decision.row, "Не засчитано", reason.code)}
                  type="button"
                >
                  <strong>{reason.title}</strong>
                  <span>0 XP</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
