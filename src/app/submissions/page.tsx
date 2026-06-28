import Link from "next/link";
import { Fragment } from "react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/Badge";
import { getSubmissions } from "@/server/course-service";

export const dynamic = "force-dynamic";

export default async function SubmissionsPage() {
  const submissions = await getSubmissions();

  return (
    <AppShell>
      <h1 className="text-3xl font-black">Мои отчёты</h1>
      <div className="glass-panel mt-6 overflow-hidden rounded-lg">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-white/[0.08] text-muted">
            <tr>
              <th className="p-4 font-medium">Задание</th>
              <th className="p-4 font-medium">Модуль</th>
              <th className="p-4 font-medium">Статус</th>
              <th className="p-4 font-medium">Ссылки</th>
              <th className="p-4 font-medium">Обновлено</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <Fragment key={`${submission.assignmentTitle}-${submission.updatedAt}`}>
                <tr className="border-t border-line">
                  <td className="p-4 font-medium">{submission.assignmentTitle}</td>
                  <td className="p-4 text-muted">{submission.moduleTitle}</td>
                  <td className="p-4">
                    <Badge status={submission.status} />
                  </td>
                  <td className="p-4">
                    <div className="flex gap-3">
                      <Link
                        className="text-brand hover:underline"
                        href={submission.githubUrl}
                      >
                          Материал
                      </Link>
                      {submission.deployUrl ? (
                        <Link
                          className="text-brand hover:underline"
                          href={submission.deployUrl}
                        >
                          Ссылка
                        </Link>
                      ) : null}
                    </div>
                  </td>
                  <td className="p-4 text-muted">{submission.updatedAt}</td>
                </tr>
                {submission.check ? (
                  <tr className="border-t border-line bg-white/[0.06]">
                    <td className="p-4 text-sm text-muted" colSpan={5}>
                      {submission.check.summary}
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
