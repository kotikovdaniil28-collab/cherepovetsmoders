// Система повышения модераторов.
// Junior -> Moderator: 7 дней (ускоренно 5), Moderator -> Senior: 14 дней (ускоренно 10).
// Источник данных: таблица moderator_careers (rank, rank_started_at), которую ведёт VK-бот.

export type ModRank = "junior" | "moderator" | "senior" | "unknown";

export type PromotionTrack = {
  rank: ModRank;
  rankLabel: string;
  nextLabel: string | null;
  standardDays: number | null; // стандартный срок до повышения
  fastDays: number | null; // ускоренный срок (за отличные показатели)
  daysOnRank: number;
  progress: number; // 0..1 к стандартному сроку
  eligibleStandard: boolean;
  eligibleFast: boolean;
};

export const RANK_LABELS: Record<ModRank, string> = {
  junior: "Младший модератор",
  moderator: "Модератор",
  senior: "Старший модератор",
  unknown: "Модератор",
};

// Бот может хранить ранг в разных форматах — нормализуем
export function normalizeRank(raw: string | null | undefined): ModRank {
  const s = (raw || "").toLowerCase().trim();
  if (!s) return "unknown";
  if (s.includes("jun") || s.includes("млад")) return "junior";
  if (s.includes("senior") || s.includes("старш") || s.includes("ст.")) return "senior";
  if (s.includes("mod") || s.includes("модер")) return "moderator";
  return "unknown";
}

const TRACKS: Record<string, { next: ModRank; standard: number; fast: number }> = {
  junior: { next: "moderator", standard: 7, fast: 5 },
  moderator: { next: "senior", standard: 14, fast: 10 },
};

export function buildPromotionTrack(
  rawRank: string | null | undefined,
  rankStartedAt: string | null | undefined
): PromotionTrack {
  const rank = normalizeRank(rawRank);
  const started = rankStartedAt ? new Date(rankStartedAt).getTime() : NaN;
  const daysOnRank = Number.isFinite(started)
    ? Math.max(0, Math.floor((Date.now() - started) / 86_400_000))
    : 0;

  const track = TRACKS[rank];
  if (!track) {
    return {
      rank,
      rankLabel: RANK_LABELS[rank],
      nextLabel: null,
      standardDays: null,
      fastDays: null,
      daysOnRank,
      progress: 1,
      eligibleStandard: false,
      eligibleFast: false,
    };
  }

  return {
    rank,
    rankLabel: RANK_LABELS[rank],
    nextLabel: RANK_LABELS[track.next],
    standardDays: track.standard,
    fastDays: track.fast,
    daysOnRank,
    progress: Math.min(1, daysOnRank / track.standard),
    eligibleStandard: daysOnRank >= track.standard,
    eligibleFast: daysOnRank >= track.fast,
  };
}
