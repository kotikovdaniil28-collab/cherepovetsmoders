import { AppShell } from "@/components/AppShell";
import { ModuleCard } from "@/features/courses/ModuleCard";
import { getCourseModules } from "@/server/course-service";

export default async function RoadmapPage() {
  const courseModules = await getCourseModules();

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-pixel text-[10px] uppercase text-brand">training map</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">
            Тренажёр модерации CHEREPOVETS
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Кейсы, решения, задания и прогресс модератора. Программа держит
            фокус на доказательствах, правилах и аккуратных действиях.
          </p>
        </div>
      </div>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {courseModules.map((courseModule) => (
          <ModuleCard key={courseModule.slug} module={courseModule} />
        ))}
      </div>
    </AppShell>
  );
}
