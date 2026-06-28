import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/Badge";
import { ChallengeWorkspace } from "@/components/ChallengeWorkspace";
import { getLesson, getLessonNavigation } from "@/server/course-service";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    moduleSlug: string;
    lessonSlug: string;
  }>;
};

export default async function LessonPage({ params }: PageProps) {
  const { moduleSlug, lessonSlug } = await params;
  const { module: courseModule, lesson } = await getLesson(moduleSlug, lessonSlug);
  const navigation = await getLessonNavigation(moduleSlug, lessonSlug);

  if (!courseModule || !lesson) {
    notFound();
  }

  return (
    <AppShell>
      <div className="max-w-3xl">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
          <Link className="text-brand hover:underline" href="/roadmap">
            Тренажёр
          </Link>
          <span>/</span>
          <span>{courseModule.title}</span>
        </div>
        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-brand">{lesson.duration}</p>
            <h1 className="mt-2 text-3xl font-bold">{lesson.title}</h1>
            <p className="mt-3 text-muted">{lesson.summary}</p>
          </div>
          <Badge status={lesson.status} />
        </div>
        <article className="glass-panel mt-8 rounded-lg p-6">
          <div className="space-y-5 text-base leading-8 text-ink">
            {lesson.content.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-8 rounded-lg border border-line bg-white/[0.08] p-4">
            <h2 className="font-semibold">Практика</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Сформулируй решение коротко: факт, правило, доказательство,
              действие. Если ситуация спорная, укажи эскалацию старшему составу.
            </p>
          </div>
        </article>
        {lesson.challenge ? (
          <ChallengeWorkspace
            challenge={lesson.challenge}
            lessonSlug={lesson.slug}
            moduleSlug={courseModule.slug}
          />
        ) : null}
        {courseModule.assignments[0] ? (
          <div className="glass-panel mt-6 rounded-lg p-5">
            <p className="text-sm text-muted">
              Когда закончишь кейсы модуля, переходи к итоговому заданию.
            </p>
            <Link
              className="mt-4 inline-flex rounded-md border border-line px-4 py-2 text-sm font-medium transition hover:bg-white/10"
              href={`/assignments/${courseModule.assignments[0].slug}`}
            >
              Открыть задание модуля
            </Link>
          </div>
        ) : null}
        <nav className="mt-6 grid gap-3 sm:grid-cols-2">
          {navigation.previous ? (
            <Link
              className="rounded-lg border border-line bg-white/[0.08] p-4 text-sm transition hover:bg-white/[0.12]"
              href={`/learn/${navigation.previous.moduleSlug}/${navigation.previous.lessonSlug}`}
            >
              <span className="text-muted">Предыдущий шаг</span>
              <span className="mt-1 block font-medium">
                {navigation.previous.lessonTitle}
              </span>
            </Link>
          ) : (
            <div />
          )}
          {navigation.next ? (
            <Link
              className="rounded-lg border border-line bg-white/[0.08] p-4 text-right text-sm transition hover:bg-white/[0.12]"
              href={`/learn/${navigation.next.moduleSlug}/${navigation.next.lessonSlug}`}
            >
              <span className="text-muted">Следующий шаг</span>
              <span className="mt-1 block font-medium">
                {navigation.next.lessonTitle}
              </span>
            </Link>
          ) : null}
        </nav>
      </div>
    </AppShell>
  );
}
