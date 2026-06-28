import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { AssignmentSubmissionForm } from "@/components/AssignmentSubmissionForm";
import { Badge } from "@/components/Badge";
import { getAssignment } from "@/server/course-service";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    assignmentSlug: string;
  }>;
};

export default async function AssignmentPage({ params }: PageProps) {
  const { assignmentSlug } = await params;
  const { module: courseModule, assignment } = await getAssignment(assignmentSlug);

  if (!courseModule || !assignment) {
    notFound();
  }

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="glass-panel rounded-lg p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-brand">{courseModule.title}</p>
              <h1 className="mt-2 text-3xl font-black">{assignment.title}</h1>
              <p className="mt-3 text-muted">{assignment.summary}</p>
            </div>
            <Badge status={assignment.status} />
          </div>
          <h2 className="mt-8 font-semibold">Критерии проверки</h2>
          <ul className="mt-4 space-y-3">
            {assignment.criteria.map((item) => (
              <li className="flex gap-3 text-sm leading-6 text-muted" key={item}>
                <span className="mt-2 h-2 w-2 rounded-full bg-brand" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
        <aside className="glass-panel rounded-lg p-6">
          <h2 className="font-semibold">Отправка решения</h2>
          <AssignmentSubmissionForm assignmentSlug={assignment.slug} />
        </aside>
      </div>
    </AppShell>
  );
}
