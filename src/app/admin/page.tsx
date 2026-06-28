import { AppShell } from "@/components/AppShell";
import { getCourseModules } from "@/server/course-service";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const courseModules = await getCourseModules();
  const lessonsCount = courseModules.reduce(
    (total, courseModule) => total + courseModule.lessons.length,
    0
  );
  const assignmentsCount = courseModules.reduce(
    (total, courseModule) => total + courseModule.assignments.length,
    0
  );

  return (
    <AppShell>
      <h1 className="text-3xl font-black">Штаб</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
        Сводка по модулям тренажёра, кейсам и итоговым заданиям.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="glass-panel rounded-lg p-5">
          <p className="text-sm text-muted">Модули</p>
          <p className="mt-2 text-3xl font-semibold">{courseModules.length}</p>
        </div>
        <div className="glass-panel rounded-lg p-5">
          <p className="text-sm text-muted">Кейсы</p>
          <p className="mt-2 text-3xl font-semibold">{lessonsCount}</p>
        </div>
        <div className="glass-panel rounded-lg p-5">
          <p className="text-sm text-muted">Задания</p>
          <p className="mt-2 text-3xl font-semibold">{assignmentsCount}</p>
        </div>
      </div>
    </AppShell>
  );
}
