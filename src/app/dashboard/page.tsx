import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/Badge";
import { LocalProgressPanel } from "@/components/LocalProgressPanel";
import { ProgressBar } from "@/components/ProgressBar";
import { calculateOverallProgress } from "@/lib/progress";
import {
  getCourseModules,
  getNextLesson,
  getSubmissions
} from "@/server/course-service";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const courseModules = await getCourseModules();
  const progress = calculateOverallProgress(courseModules);
  const next = await getNextLesson();
  const submissions = await getSubmissions();
  const needsFixes = submissions.filter(
    (submission) => submission.status === "changes_requested"
  );
  const approvedSubmissions = submissions.filter(
    (submission) => submission.status === "approved"
  );
  const lessons = courseModules.flatMap((courseModule) => courseModule.lessons);
  const completedLessons = lessons.filter(
    (lesson) => lesson.status === "completed"
  );

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="space-y-6">
          <div className="glass-panel fade-up rounded-lg p-6">
            <p className="font-pixel text-[10px] uppercase text-brand">
              moderator cockpit
            </p>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  Панель тренировки
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
                  Отрабатывай решения как на смене: кейс, доказательства, пункт,
                  действие. Всё коротко, проверяемо и без лишнего шума.
                </p>
              </div>
              <Link
                className="shine-line rounded-md bg-brand px-4 py-2 text-sm font-bold text-[#06110c] transition hover:-translate-y-0.5"
                href="/today"
              >
                План на сегодня
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              [`${completedLessons.length}/${lessons.length}`, "кейсов закрыто"],
              [`${progress}%`, "готовность"],
              [`${approvedSubmissions.length}`, "работ зачтено"]
            ].map(([value, label]) => (
              <div className="glass-panel rounded-lg p-5" key={label}>
                <p className="font-pixel text-xl text-brand">{value}</p>
                <p className="mt-2 text-sm text-muted">{label}</p>
              </div>
            ))}
          </div>

          <div className="glass-panel rounded-lg p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted">Общий прогресс</p>
                <p className="mt-1 text-3xl font-black">{progress}%</p>
              </div>
              <Link
                className="rounded-md border border-line px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
                href="/roadmap"
              >
                Весь тренажёр
              </Link>
            </div>
            <div className="mt-5">
              <ProgressBar value={progress} />
            </div>
          </div>

          {next ? (
            <div className="overflow-hidden rounded-lg border border-line bg-white/[0.08] shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur">
              <div className="border-b border-line bg-brand/10 px-6 py-4">
                <p className="font-pixel text-[10px] uppercase text-brand">
                  next case
                </p>
              </div>
              <div className="p-6">
                <p className="text-sm text-muted">Следующий кейс</p>
                <h2 className="mt-2 text-2xl font-black">
                  {next.lesson.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {next.lesson.summary}
                </p>
                <Link
                  className="mt-5 inline-flex rounded-md bg-brand px-4 py-2 text-sm font-bold text-[#06110c] transition hover:-translate-y-0.5"
                  href={`/learn/${next.module.slug}/${next.lesson.slug}`}
                >
                  Открыть кейс
                </Link>
              </div>
            </div>
          ) : null}
        </section>

        <aside className="space-y-6">
          <LocalProgressPanel />

          <div className="glass-panel rounded-lg p-5">
            <h2 className="font-bold">Нужно исправить</h2>
            <div className="mt-4 space-y-3">
              {needsFixes.length > 0 ? (
                needsFixes.map((submission) => (
                  <div
                    className="rounded-md border border-line bg-black/[0.18] p-3"
                    key={submission.assignmentTitle}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">
                        {submission.assignmentTitle}
                      </p>
                      <Badge status={submission.status} />
                    </div>
                    <p className="mt-1 text-xs text-muted">{submission.updatedAt}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted">
                  Сейчас нет работ, требующих исправлений.
                </p>
              )}
            </div>
          </div>

          <div className="glass-panel rounded-lg p-5">
            <h2 className="font-bold">Быстрые действия</h2>
            <div className="mt-4 grid gap-2 text-sm">
              <Link className="rounded-md bg-white/[0.08] px-3 py-2 text-brand transition hover:bg-white/[0.12]" href="/submissions">
                Мои отчёты
              </Link>
              <Link className="rounded-md bg-white/[0.08] px-3 py-2 text-brand transition hover:bg-white/[0.12]" href="/checks">
                Проверки
              </Link>
              <Link className="rounded-md bg-white/[0.08] px-3 py-2 text-brand transition hover:bg-white/[0.12]" href="/roadmap">
                Все кейсы
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
