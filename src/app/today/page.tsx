import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { getTodayPlan } from "@/server/learning-plan";

export default async function TodayPage() {
  const plan = await getTodayPlan();

  return (
    <AppShell>
      <div>
        <p className="font-pixel text-[10px] uppercase text-brand">daily route</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">
          Что делать сегодня
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          План собирается из прогресса: следующий кейс, итоговое задание и
          исправления после проверки.
        </p>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_360px]">
        <section className="space-y-5">
          {plan.nextLesson ? (
            <article className="glass-panel rounded-lg p-6">
              <p className="text-sm font-medium text-brand">1. Продолжить курс</p>
              <h2 className="mt-2 text-2xl font-semibold">
                {plan.nextLesson.lesson.title}
              </h2>
              <p className="mt-2 text-sm text-muted">
                {plan.nextLesson.moduleTitle}
              </p>
              <p className="mt-3 text-sm leading-6 text-muted">
                {plan.nextLesson.lesson.summary}
              </p>
              <Link
                className="mt-5 inline-flex rounded-md bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-black"
                href={`/learn/${plan.nextLesson.moduleSlug}/${plan.nextLesson.lesson.slug}`}
              >
                  Открыть кейс
              </Link>
            </article>
          ) : (
            <article className="glass-panel rounded-lg p-6">
              <h2 className="text-xl font-semibold">Все уроки пройдены</h2>
              <p className="mt-2 text-sm text-muted">
                Можно переходить к проектам или расширять курс новыми модулями.
              </p>
            </article>
          )}

          {plan.nextAssignment ? (
            <article className="glass-panel rounded-lg p-6">
              <p className="text-sm font-medium text-brand">2. Проект модуля</p>
              <h2 className="mt-2 text-xl font-semibold">
                {plan.nextAssignment.assignment.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                {plan.nextAssignment.assignment.summary}
              </p>
              <Link
                className="mt-5 inline-flex rounded-md border border-line px-4 py-2 text-sm font-medium transition hover:bg-white/10"
                href={`/assignments/${plan.nextAssignment.assignment.slug}`}
              >
                Открыть проект
              </Link>
            </article>
          ) : null}
        </section>

        <aside className="space-y-5">
          <div className="glass-panel rounded-lg p-5">
            <h2 className="font-semibold">Исправления</h2>
            <div className="mt-4 space-y-3">
              {plan.fixes.length > 0 ? (
                plan.fixes.map((fix) => (
                  <Link
                    className="block rounded-md bg-white/[0.08] p-3 text-sm transition hover:bg-white/[0.12]"
                    href={fix.slug ? `/assignments/${fix.slug}` : "/checks"}
                    key={fix.title}
                  >
                    <span className="font-medium">{fix.title}</span>
                    {fix.summary ? (
                      <span className="mt-1 block text-muted">{fix.summary}</span>
                    ) : null}
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted">Нет активных исправлений.</p>
              )}
            </div>
          </div>

          <div className="glass-panel rounded-lg p-5">
            <h2 className="font-semibold">Уже зачтено</h2>
            <div className="mt-4 space-y-2">
              {plan.completedToday.length > 0 ? (
                plan.completedToday.map((item) => (
                  <p className="rounded-md bg-brand/10 p-3 text-sm text-brand" key={item}>
                    {item}
                  </p>
                ))
              ) : (
                <p className="text-sm text-muted">Пока нет зачтённых проектов.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
