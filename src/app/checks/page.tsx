import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/Badge";
import { getSubmissions } from "@/server/course-service";

export default async function ChecksPage() {
  const submissions = await getSubmissions();

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-pixel text-[10px] uppercase text-brand">review checks</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">
            Проверки решений
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Здесь видно, какие решения зачтены, а какие нужно поправить перед
            переходом дальше.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4">
        {submissions.length > 0 ? (
          submissions.map((submission) => (
            <article
              className="glass-panel rounded-lg p-5"
              key={`${submission.assignmentTitle}-${submission.updatedAt}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted">{submission.moduleTitle}</p>
                  <h2 className="mt-1 text-xl font-semibold">
                    {submission.assignmentTitle}
                  </h2>
                </div>
                <Badge status={submission.status} />
              </div>

              {submission.check ? (
                <div className="mt-5 rounded-lg border border-line bg-white/[0.08] p-4">
                  <p className="text-sm font-medium">{submission.check.summary}</p>
                  <div className="mt-4 grid gap-3">
                    {submission.check.results.map((result) => (
                      <div
                        className="flex gap-3 rounded-md bg-black/[0.18] p-3 text-sm ring-1 ring-line"
                        key={result.id}
                      >
                        <span
                          className={
                            result.passed
                              ? "font-semibold text-brand"
                              : "font-semibold text-red-200"
                          }
                        >
                          {result.passed ? "OK" : "Fix"}
                        </span>
                        <div>
                          <p className="font-medium">{result.label}</p>
                          <p className="mt-1 text-muted">{result.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-4 rounded-md bg-white/[0.08] p-3 text-sm text-muted">
                  Для этой отправки пока нет отчёта автопроверки.
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-3 text-sm">
                <Link className="text-brand hover:underline" href={submission.githubUrl}>
                  Материал
                </Link>
                {submission.deployUrl ? (
                  <Link className="text-brand hover:underline" href={submission.deployUrl}>
                    Ссылка
                  </Link>
                ) : null}
                {submission.assignmentSlug ? (
                  <Link
                    className="text-brand hover:underline"
                    href={`/assignments/${submission.assignmentSlug}`}
                  >
                    Повторить отправку
                  </Link>
                ) : null}
              </div>
            </article>
          ))
        ) : (
          <div className="glass-panel rounded-lg p-6 text-sm text-muted">
            Пока нет отправленных решений. Открой тренажёр, пройди первые кейсы
            и отправь задание модуля.
          </div>
        )}
      </div>
    </AppShell>
  );
}
