"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import "./reports.css";

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
  xp?: number | string | null;
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

type Proof = {
  url: string;
  name: string;
  kind: "link" | "file";
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
const serviceEmails = new Set([
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
  "FSB_SPEND"
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

function readName(user: SupabaseUser | null, stats: UserStats | null) {
  const meta = user?.user_metadata || {};
  return String(stats?.nickname || meta.nickname || meta.name || meta.full_name || "").trim();
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function makeId() {
  return `rep_native_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function parseReport(row: ReportRow) {
  const raw = String(row.date || "");
  let payload: Record<string, unknown> = {};
  const jsonMatch = raw.match(/JSON:\s*(\{[\s\S]*\})\s*$/i);
  if (jsonMatch) {
    try {
      payload = JSON.parse(jsonMatch[1]);
    } catch {
      payload = {};
    }
  } else if (raw.trim().startsWith("{")) {
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = {};
    }
  }

  return {
    nick: String(payload.nick || raw.match(/Ник:\s*([^|]+)/i)?.[1] || "").trim(),
    date: String(payload.date || payload.day || raw.match(/Дата:\s*([\d-]+)/i)?.[1] || "").trim(),
    work: String(payload.work || raw.match(/Работа:\s*([^|]+)/i)?.[1] || "").trim(),
    quality: String(payload.quality || payload.requestedStatus || raw.match(/Тип\s*сдачи:\s*([^|]+)/i)?.[1] || "").trim()
  };
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Не удалось прочитать файл"));
    reader.readAsDataURL(file);
  });
}

async function compressImage(file: File) {
  if (!file.type.startsWith("image/")) return readFileAsDataUrl(file);

  const dataUrl = await readFileAsDataUrl(file);
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Не удалось обработать изображение"));
    img.src = dataUrl;
  });

  const maxSide = 1400;
  const ratio = Math.min(1, maxSide / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * ratio));
  canvas.height = Math.max(1, Math.round(image.height * ratio));
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return dataUrl;

  ctx.fillStyle = "#111827";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  let quality = 0.72;
  let output = canvas.toDataURL("image/jpeg", quality);
  while (output.length > 520000 && quality > 0.42) {
    quality -= 0.07;
    output = canvas.toDataURL("image/jpeg", quality);
  }
  return output;
}

export default function ReportsClient() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [client, setClient] = useState<SupabaseLike | null>(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const [nick, setNick] = useState("");
  const [date, setDate] = useState(today());
  const [quality, setQuality] = useState("Норма");
  const [work, setWork] = useState("");
  const [links, setLinks] = useState("");
  const [file, setFile] = useState<File | null>(null);
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

        const [statsResult, rolesResult, recentResult] = await Promise.all([
          supabase
            .from<UserStats>("user_stats")
            .select("nickname,email")
            .eq("user_id", authUser.id)
            .maybeSingle(),
          supabase
            .from<ReportRow>("reports")
            .select("email,link,status")
            .in("email", ["USER_ROLE", "ADMIN_ROLE"])
            .eq("link", authUser.id)
            .limit(200),
          supabase
            .from<ReportRow>("reports")
            .select("id,email,link,date,status,xp")
            .eq("email", authUser.email || "")
            .order("id", { ascending: false })
            .limit(30)
        ]);

        if (statsResult.error) throw new Error(statsResult.error.message || "Ошибка user_stats");
        if (rolesResult.error) throw new Error(rolesResult.error.message || "Ошибка прав");
        if (recentResult.error) throw new Error(recentResult.error.message || "Ошибка отчётов");

        const currentStats = statsResult.data || null;
        const defaultNick = readName(authUser, currentStats);
        const lowerEmail = String(authUser.email || "").toLowerCase();

        if (!alive) return;
        setStats(currentStats);
        setNick(defaultNick);
        setCanSubmit(
          adminEmails.has(lowerEmail) ||
            (rolesResult.data || []).some((row) => row.email === "USER_ROLE" && row.status === "moderator") ||
            (rolesResult.data || []).some((row) => row.email === "ADMIN_ROLE" && row.status === "leadership")
        );
        setRecent((recentResult.data || []).filter((row) => !serviceEmails.has(String(row.email || ""))).slice(0, 5));
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

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] || null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!client || !user) {
      setError("Сначала войди в аккаунт.");
      return;
    }

    if (!canSubmit) {
      setError("Отчёты доступны только модераторам и руководству.");
      return;
    }

    const finalNick = nick.trim();
    const finalWork = work.trim();
    const finalLinks = links
      .split(/\n+/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (!finalNick || !date || !finalWork) {
      setError("Заполни ник, дату и проделанную работу.");
      return;
    }

    if (!finalLinks.length && !file) {
      setError("Добавь ссылку на доказательства или загрузи скриншот.");
      return;
    }

    try {
      setSubmitting(true);

      const proofs: Proof[] = finalLinks.map((url, index) => ({
        url,
        name: `Ссылка ${index + 1}`,
        kind: "link"
      }));

      if (file) {
        const url = await compressImage(file);
        proofs.push({
          url,
          name: file.name || "Скриншот",
          kind: "file"
        });
      }

      const payload = {
        version: "native-v46",
        nick: finalNick,
        work: finalWork,
        date,
        day: date,
        quality,
        requestedStatus: quality,
        proofs,
        userId: user.id,
        email: user.email || "",
        createdAt: new Date().toISOString()
      };

      const combined = `Ник: ${finalNick} | Дата: ${date} | Работа: ${finalWork} | Тип сдачи: ${quality} | Доказательства: ${proofs.length} | JSON: ${JSON.stringify(payload)}`;
      const result = await client.from<ReportRow>("reports").insert([
        {
          id: makeId(),
          email: user.email || "",
          link: proofs[0]?.url || "",
          date: combined,
          status: "На проверке",
          xp: 0
        }
      ]);

      if (result.error) throw new Error(result.error.message || "Ошибка отправки");

      const row = {
        id: makeId(),
        email: user.email || "",
        link: proofs[0]?.url || "",
        date: combined,
        status: "На проверке",
        xp: 0
      };

      setSuccess(`Отчёт отправлен. Доказательств: ${proofs.length}.`);
      setWork("");
      setLinks("");
      setFile(null);
      setRecent((items) => [row, ...items].slice(0, 5));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Неизвестная ошибка");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="reports-page">
      <nav className="reports-topbar">
        <a className="reports-brand" href="/native/profile">
          <span>CH</span>
          <b>CHEREPOVETS</b>
        </a>
        <div className="reports-links">
          <a href="/native/profile">Native профиль</a>
          <a href="/native/inactives">Неактивы</a>
          <a href="/reports">Старые отчёты</a>
          <a href="/reports-table">Таблица</a>
        </div>
      </nav>

      <section className="reports-hero">
        <p>Next-раздел</p>
        <h1>Сдача отчёта</h1>
        <span>
          Форма сохраняет отчёт в старую таблицу reports так, чтобы legacy-таблица отчётов и
          руководство продолжили видеть заявку.
        </span>
      </section>

      {loading ? (
        <section className="reports-card reports-state">Загрузка...</section>
      ) : !user ? (
        <section className="reports-card reports-state">
          <h2>Нужно войти</h2>
          <p>Сессия Supabase не найдена. Войди через старую авторизацию, затем вернись сюда.</p>
          <a className="reports-button" href="/">Перейти ко входу</a>
        </section>
      ) : (
        <section className="reports-layout">
          <form className="reports-card reports-form" onSubmit={submit}>
            <div>
              <p className="reports-kicker">Отправитель</p>
              <h2>{displayName}</h2>
              <small>{user.email}</small>
            </div>

            {!canSubmit ? (
              <div className="reports-alert reports-error">
                У аккаунта нет роли модератора. Старый сайт тоже не даст отправить отчёт без доступа.
              </div>
            ) : null}

            <div className="reports-grid">
              <label>
                Никнейм
                <input value={nick} onChange={(event) => setNick(event.target.value)} placeholder="Nick_Name" />
              </label>
              <label>
                Дата
                <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
              </label>
            </div>

            <label>
              Тип сдачи
              <select value={quality} onChange={(event) => setQuality(event.target.value)}>
                <option>Норма</option>
                <option>Перенорма</option>
                <option>Натяг</option>
                <option>Герой дня</option>
              </select>
            </label>

            <label>
              Проделанная работа
              <textarea
                value={work}
                onChange={(event) => setWork(event.target.value)}
                placeholder="Кратко опиши, что было сделано за день"
                rows={5}
              />
            </label>

            <label>
              Ссылки на доказательства
              <textarea
                value={links}
                onChange={(event) => setLinks(event.target.value)}
                placeholder="Одна ссылка на строку: Imgur, Yapx, форум, VK..."
                rows={3}
              />
            </label>

            <label>
              Скриншот
              <input accept="image/*" type="file" onChange={onFileChange} />
            </label>

            {file ? <div className="reports-muted">Файл: {file.name}</div> : null}
            {error ? <div className="reports-alert reports-error">{error}</div> : null}
            {success ? <div className="reports-alert reports-success">{success}</div> : null}

            <button className="reports-button" disabled={submitting || !canSubmit} type="submit">
              {submitting ? "Отправка..." : "Отправить отчёт"}
            </button>
          </form>

          <aside className="reports-card reports-side">
            <p className="reports-kicker">История</p>
            <h2>Последние отчёты</h2>
            <div className="reports-list">
              {recent.length ? (
                recent.map((row) => {
                  const parsed = parseReport(row);
                  return (
                    <article key={row.id || row.date} className="reports-item">
                      <strong>{row.status || "Без статуса"} · {row.xp || 0} XP</strong>
                      <span>{parsed.date || "—"} · {parsed.quality || "Тип не указан"}</span>
                      <small>{parsed.work || "Описание не найдено"}</small>
                    </article>
                  );
                })
              ) : (
                <p className="reports-muted">Твои отчёты пока не найдены.</p>
              )}
            </div>
          </aside>
        </section>
      )}
    </main>
  );
}
