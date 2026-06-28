export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-brand shadow-[0_0_18px_rgba(67,255,154,0.7)] transition-all"
        style={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
      />
    </div>
  );
}
