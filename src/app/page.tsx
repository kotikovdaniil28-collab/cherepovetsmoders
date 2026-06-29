import Link from "next/link";

const stats = [
  ["7", "кейсов"],
  ["4", "модуля"],
  ["1", "штаб"]
];

const modules = [
  "разбор нарушений",
  "наказания без перегиба",
  "отчёты и доказательства",
  "заявки кандидатов",
  "апелляции"
];

const queue = [
  ["Оскорбление в общем чате", "мут / контекст"],
  ["Реклама проекта", "удалить / бан"],
  ["Отчёт без доказательств", "исправление"],
  ["Неполная заявка", "уточнить / отказ"]
];

export default function HomePage() {
  return (
    <main className="pixel-grid min-h-screen text-ink">
      <section className="relative mx-auto grid min-h-screen max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-16">
        <div className="fade-up relative z-10">
          <Link
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.08] px-3 py-2 text-xs font-semibold uppercase text-brand backdrop-blur transition hover:bg-white/[0.12]"
            href="/dashboard"
          >
            <span className="h-2 w-2 rounded-full bg-brand shadow-[0_0_18px_rgba(67,255,154,0.9)]" />
            CHEREPOVETS moderation
          </Link>

          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Тренажёр модератора, который выглядит как часть штаба.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-muted sm:text-lg">
            Отрабатывай решения по Discord-кейсам: факт, правило, доказательства,
            наказание и отчёт. Без сухой учебки, с нормальной панелью и быстрым
            переходом к практике.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="shine-line rounded-md bg-brand px-5 py-3 text-sm font-bold text-[#06110c] shadow-[0_18px_42px_rgba(67,255,154,0.22)] transition hover:-translate-y-0.5 hover:bg-[#70ffb2]"
              href="/dashboard"
            >
              Начать тренировку
            </Link>
            <Link
              className="rounded-md border border-line bg-white/[0.08] px-5 py-3 text-sm font-semibold text-ink backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/[0.12]"
              href="/sign-in"
            >
              Войти в кабинет
            </Link>
            <Link
              className="rounded-md border border-line px-5 py-3 text-sm font-semibold text-muted transition hover:text-ink"
              href="/roadmap"
            >
              Посмотреть программу
            </Link>
          </div>

          <div className="mt-9 grid max-w-xl grid-cols-3 gap-3">
            {stats.map(([value, label]) => (
              <div className="glass-panel rounded-lg p-4" key={label}>
                <p className="font-pixel text-xl text-brand">{value}</p>
                <p className="mt-2 text-xs uppercase text-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="soft-orbit absolute -right-4 top-2 h-32 w-32 rounded-full bg-brand/20 blur-3xl" />
          <div className="float-card glass-panel relative rounded-lg p-5">
            <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
              <div>
                <p className="font-pixel text-[10px] uppercase text-brand">
                  live trainer
                </p>
                <h2 className="mt-3 text-2xl font-black">Пульт смены</h2>
              </div>
              <span className="rounded-md bg-brand px-3 py-1 text-xs font-bold text-[#06110c]">
                42%
              </span>
            </div>

            <div className="mt-5 grid gap-3">
              {queue.map(([title, action], index) => (
                <div
                  className="rounded-lg border border-line bg-black/[0.18] p-4 transition hover:-translate-y-0.5 hover:bg-white/10"
                  key={title}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-md bg-white/10 text-sm font-bold text-brand">
                      {index + 1}
                    </span>
                    <span className="rounded-full bg-white/[0.08] px-3 py-1 text-xs text-muted">
                      {action}
                    </span>
                  </div>
                  <p className="mt-3 font-semibold">{title}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-lg border border-line bg-[#06110c]/70 p-4">
              <p className="font-pixel text-[10px] uppercase text-brand">
                modules
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {modules.map((item) => (
                  <span
                    className="rounded-full border border-line bg-white/[0.08] px-3 py-1 text-xs text-muted"
                    key={item}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
