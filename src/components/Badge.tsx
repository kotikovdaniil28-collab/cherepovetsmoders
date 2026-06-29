import { statusLabel } from "@/lib/progress";

const toneByStatus: Record<string, string> = {
  completed: "bg-brand/[0.12] text-brand ring-brand/30",
  approved: "bg-brand/[0.12] text-brand ring-brand/30",
  in_progress: "bg-blue-400/[0.12] text-blue-200 ring-blue-300/30",
  submitted: "bg-amber-300/[0.12] text-amber-200 ring-amber-300/30",
  changes_requested: "bg-red-400/[0.12] text-red-200 ring-red-300/30",
  locked: "bg-white/[0.08] text-muted ring-line",
  available: "bg-white/[0.08] text-muted ring-line",
  not_started: "bg-white/[0.08] text-muted ring-line"
};

export function Badge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
        toneByStatus[status] ?? toneByStatus.not_started
      }`}
    >
      {statusLabel(status)}
    </span>
  );
}
