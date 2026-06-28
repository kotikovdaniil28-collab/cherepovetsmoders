import Link from "next/link";
import { Badge } from "@/components/Badge";
import { ProgressBar } from "@/components/ProgressBar";
import type { CourseModule } from "@/lib/types";

export function ModuleCard({ module }: { module: CourseModule }) {
  const firstLesson = module.lessons[0];

  return (
    <article className="group glass-panel rounded-lg p-5 transition hover:-translate-y-1">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{module.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            {module.description}
          </p>
        </div>
        <Badge status={module.status} />
      </div>
      <div className="mt-5 flex gap-2 text-xs text-muted">
        <span className="rounded-full bg-white/[0.08] px-3 py-1">
          {module.lessons.length} кейсов
        </span>
        <span className="rounded-full bg-white/[0.08] px-3 py-1">
          {module.assignments.length} заданий
        </span>
      </div>
      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Прогресс</span>
          <span className="font-medium">{module.progress}%</span>
        </div>
        <ProgressBar value={module.progress} />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {firstLesson ? (
          <Link
            className="rounded-md bg-brand px-4 py-2 text-sm font-bold text-[#06110c] transition hover:bg-[#70ffb2]"
            href={`/learn/${module.slug}/${firstLesson.slug}`}
          >
            Открыть кейсы
          </Link>
        ) : null}
        {module.assignments[0] ? (
          <Link
            className="rounded-md border border-line px-4 py-2 text-sm font-medium transition hover:bg-white/10"
            href={`/assignments/${module.assignments[0].slug}`}
          >
            Задание
          </Link>
        ) : null}
      </div>
    </article>
  );
}
