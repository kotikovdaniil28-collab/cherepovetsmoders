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
    getSession(): Promise<{ data?: { session?: { user?: SupabaseUser | null; access_token?: string } | null } }>;
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

  return window.supabase.createClient(url, key) as SupabaseLike;
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

const acceptedStatuses = new Set(["Норма", "Перенорма", "Натяг", "Герой дня"]);
const highStatuses = new Set(["Перенорма", "Герой дня"]);

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvCell(value: unknown) {
  const text = String(value ?? "").replace(/"/g, '""');
  return `"${text}"`;
}

function memberPeriodStats(member: MemberRow) {
  const accepted = member.cells.filter((cell) => acceptedStatuses.has(cell.status)).length;
  const high = member.cells.filter((cell) => highStatuses.has(cell.status)).length;
  const missed = member.cells.filter((cell) => ["Нет отчета", "Не засчитано"].includes(cell.status)).length;
  const inactive = member.cells.filter((cell) => cell.status === "Неактив").length;
  return { accepted, high, missed, inactive };
}

function statusColor(status: string) {
  if (status === "Норма") return "#4ade80";
  if (status === "Перенорма") return "#60a5fa";
  if (status === "Натяг") return "#c084fc";
  if (status === "Герой дня") return "#facc15";
  if (status === "Неактив") return "#94a3b8";
  if (status === "На проверке") return "#f59e0b";
  if (status === "Нет отчета" || status === "Не засчитано") return "#fb7185";
  return "#64748b";
}

function shortStatus(status: string) {
  return ({
    "На проверке": "Проверка",
    "Перенорма": "Перенорма",
    "Герой дня": "Герой дня",
    "Не засчитано": "Отказ",
    "Нет отчета": "Нет отчёта",
    "Неактив": "Неактив",
    "Натяг": "Натяг",
    "Норма": "Норма",
    none: "—"
  } as Record<string, string>)[status] || status || "—";
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
  const [accessToken, setAccessToken] = useState("");
  const [exporting, setExporting] = useState(false);

  const days = useMemo(() => weekDays(weekOffset), [weekOffset]);
  const periodStats = useMemo(() => {
    const cells = rows.flatMap((member) => member.cells);
    const eligible = cells.filter((cell) => new Date(`${cell.day}T23:59:59`).getTime() <= Date.now());
    const accepted = eligible.filter((cell) => acceptedStatuses.has(cell.status)).length;
    const high = eligible.filter((cell) => highStatuses.has(cell.status)).length;
    const missed = eligible.filter((cell) => ["Нет отчета", "Не засчитано"].includes(cell.status)).length;
    const inactive = eligible.filter((cell) => cell.status === "Неактив").length;
    const completion = eligible.length ? Math.round(((accepted + inactive) / eligible.length) * 100) : 0;
    return { accepted, high, missed, inactive, completion };
  }, [rows]);

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
      if (["Норма", "Перенорма", "Натяг", "Герой дня", "Не засчитано"].includes(status)) {
        if (!accessToken) throw new Error("Сессия истекла. Войди заново.");
        const response = await fetch("/api/reports/review", {
          method: "POST",
          headers: { "content-type": "application/json", authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ reportId: cell.report.id, status, reasonCode: status === "Не засчитано" ? "rules" : "" })
        });
        const result = await response.json();
        if (!response.ok || !result.ok) throw new Error(result.error || "Ошибка обновления");
      } else {
        const result = await client.from<ReportRow>("reports").update({ status, xp }).eq("id", cell.report.id);
        if (result.error) throw new Error(result.error.message || "Ошибка обновления");
      }
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

  function downloadCsv() {
    if (!rows.length) return;
    const lines = [
      ["CHEREPOVETS · Активность модерации"],
      [`Период: ${days[0]} — ${days[6]}`],
      [],
      ["№", "Модератор", ...days.map((day) => ruDate(day)), "Одобрено", "Перенорма/Герой", "Пропуски/отказы", "Неактив", "Real XP"]
    ];
    rows.forEach((member, index) => {
      const stats = memberPeriodStats(member);
      lines.push([
        String(index + 1),
        String(member.nickname || member.email || "Без ника"),
        ...member.cells.map((cell) => shortStatus(cell.status)),
        String(stats.accepted),
        String(stats.high),
        String(stats.missed),
        String(stats.inactive),
        String(member.realXp)
      ]);
    });
    const csv = `\uFEFFsep=;\r\n${lines.map((line) => line.map(csvCell).join(";")).join("\r\n")}`;
    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), `cherepovets_activity_${days[0]}_${days[6]}.csv`);
  }

  async function downloadPng() {
    if (!rows.length || exporting) return;
    setExporting(true);
    try {
      const width = 1900;
      const headerHeight = 250;
      const rowHeight = 74;
      const footerHeight = 96;
      const height = headerHeight + rows.length * rowHeight + footerHeight;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Браузер не поддерживает экспорт изображения");

      const background = ctx.createLinearGradient(0, 0, width, height);
      background.addColorStop(0, "#070a16");
      background.addColorStop(0.55, "#0c1328");
      background.addColorStop(1, "#100b1f");
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);
      const glow = ctx.createRadialGradient(1600, 20, 0, 1600, 20, 640);
      glow.addColorStop(0, "rgba(139,92,246,.28)");
      glow.addColorStop(1, "rgba(139,92,246,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, 720);

      ctx.fillStyle = "#aebcff";
      ctx.font = "900 22px Arial, sans-serif";
      ctx.fillText("CHEREPOVETS · STAFF", 60, 54);
      ctx.fillStyle = "#f8fafc";
      ctx.font = "900 52px Arial, sans-serif";
      ctx.fillText("Активность модерации", 60, 116);
      ctx.fillStyle = "#aab3d3";
      ctx.font = "600 24px Arial, sans-serif";
      ctx.fillText(`${days[0]} — ${days[6]}  ·  ${rows.length} модераторов`, 60, 158);

      const chips = [
        [`Выполнение ${periodStats.completion}%`, "#7dd3fc"],
        [`Одобрено ${periodStats.accepted}`, "#4ade80"],
        [`Перенорма / Герой ${periodStats.high}`, "#c084fc"],
        [`Пропуски / отказы ${periodStats.missed}`, "#fb7185"]
      ];
      let chipX = 60;
      ctx.font = "800 18px Arial, sans-serif";
      chips.forEach(([label, color]) => {
        const chipWidth = ctx.measureText(label).width + 34;
        ctx.fillStyle = `${color}22`;
        ctx.beginPath();
        ctx.roundRect(chipX, 184, chipWidth, 42, 18);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.fillText(label, chipX + 17, 212);
        chipX += chipWidth + 12;
      });

      const xIndex = 60;
      const xName = 120;
      const nameWidth = 350;
      const dayWidth = 166;
      const xDays = xName + nameWidth;
      const xResult = xDays + dayWidth * 7;
      ctx.fillStyle = "rgba(255,255,255,.075)";
      ctx.fillRect(48, headerHeight - 8, width - 96, 54);
      ctx.fillStyle = "#aeb8d7";
      ctx.font = "800 17px Arial, sans-serif";
      ctx.fillText("#", xIndex, headerHeight + 25);
      ctx.fillText("МОДЕРАТОР", xName, headerHeight + 25);
      days.forEach((day, index) => ctx.fillText(ruDate(day), xDays + index * dayWidth + 18, headerHeight + 25));
      ctx.fillText("ИТОГ", xResult + 14, headerHeight + 25);

      rows.forEach((member, rowIndex) => {
        const y = headerHeight + 46 + rowIndex * rowHeight;
        if (rowIndex % 2 === 0) {
          ctx.fillStyle = "rgba(255,255,255,.028)";
          ctx.fillRect(48, y, width - 96, rowHeight);
        }
        ctx.fillStyle = "#75809f";
        ctx.font = "800 18px Arial, sans-serif";
        ctx.fillText(String(rowIndex + 1), xIndex, y + 44);
        ctx.fillStyle = "#f8fafc";
        ctx.font = "800 21px Arial, sans-serif";
        const displayName = String(member.nickname || member.email || "Без ника");
        ctx.fillText(displayName.length > 25 ? `${displayName.slice(0, 24)}…` : displayName, xName, y + 34);
        ctx.fillStyle = "#8792b2";
        ctx.font = "600 15px Arial, sans-serif";
        ctx.fillText(`${member.realXp} Real XP`, xName, y + 56);

        member.cells.forEach((cell, dayIndex) => {
          const cellX = xDays + dayIndex * dayWidth + 8;
          const color = statusColor(cell.status);
          ctx.fillStyle = `${color}20`;
          ctx.beginPath();
          ctx.roundRect(cellX, y + 13, dayWidth - 16, 46, 13);
          ctx.fill();
          ctx.fillStyle = color;
          ctx.font = "800 15px Arial, sans-serif";
          const label = shortStatus(cell.status);
          ctx.fillText(label.length > 13 ? `${label.slice(0, 12)}…` : label, cellX + 12, y + 42);
        });

        const stats = memberPeriodStats(member);
        ctx.fillStyle = "#f8fafc";
        ctx.font = "900 21px Arial, sans-serif";
        ctx.fillText(`${stats.accepted}/7`, xResult + 14, y + 34);
        ctx.fillStyle = "#8d98b8";
        ctx.font = "700 14px Arial, sans-serif";
        ctx.fillText(`активность`, xResult + 14, y + 55);
      });

      const footerY = height - footerHeight;
      ctx.strokeStyle = "rgba(174,188,255,.14)";
      ctx.beginPath();
      ctx.moveTo(60, footerY + 10);
      ctx.lineTo(width - 60, footerY + 10);
      ctx.stroke();
      ctx.fillStyle = "#7f8aaa";
      ctx.font = "600 16px Arial, sans-serif";
      ctx.fillText("Статусы сформированы из решений руководства и одобренных неактивов", 60, footerY + 54);
      ctx.textAlign = "right";
      ctx.fillText(`Сформировано ${new Date().toLocaleString("ru-RU")}`, width - 60, footerY + 54);
      ctx.textAlign = "left";

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png", 1));
      if (!blob) throw new Error("Не удалось создать изображение");
      downloadBlob(blob, `cherepovets_activity_${days[0]}_${days[6]}.png`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Ошибка экспорта");
    } finally {
      setExporting(false);
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
        <p>Активность команды</p>
        <h1>Отчётность за неделю</h1>
        <span>
          Смотрите вклад каждого модератора, находите пропуски и выгружайте готовую таблицу
          для публикации в INFO.
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

      {!loading && user ? (
        <section className="table-dashboard">
          <article className="table-card table-summary primary"><span>Выполнение недели</span><strong>{periodStats.completion}%</strong><small>отчёты и одобренные неактивы</small></article>
          <article className="table-card table-summary"><span>Одобрено</span><strong>{periodStats.accepted}</strong><small>отчётов за выбранный период</small></article>
          <article className="table-card table-summary"><span>Перенорма / Герой</span><strong>{periodStats.high}</strong><small>сильных результатов</small></article>
          <article className="table-card table-summary danger"><span>Пропуски / отказы</span><strong>{periodStats.missed}</strong><small>требуют внимания</small></article>
          <article className="table-card table-export-card">
            <div><span>Выгрузка для INFO</span><strong>Готово к публикации</strong><small>Текущая выбранная неделя</small></div>
            <div className="table-export-actions">
              <button className="table-button" disabled={!rows.length || exporting} onClick={downloadPng} type="button">{exporting ? "Создаю PNG..." : "Скачать PNG"}</button>
              <button className="table-button ghost" disabled={!rows.length} onClick={downloadCsv} type="button">Скачать CSV</button>
            </div>
          </article>
        </section>
      ) : null}

      {loading ? (
        <section className="table-card table-state">Загрузка таблицы...</section>
      ) : !user ? (
        <section className="table-card table-state">
          <h2>Нужно войти</h2>
          <p>Сессия Supabase не найдена.</p>
          <a className="table-button" href="/login?legacy=1">Перейти ко входу</a>
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
