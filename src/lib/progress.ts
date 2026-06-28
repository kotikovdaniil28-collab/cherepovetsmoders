import type { CourseModule } from "@/lib/types";

export function calculateOverallProgress(modules: CourseModule[]) {
  const lessons = modules.flatMap((courseModule) => courseModule.lessons);

  if (lessons.length === 0) {
    return 0;
  }

  const completed = lessons.filter((lesson) => lesson.status === "completed");

  return Math.round((completed.length / lessons.length) * 100);
}

export function statusLabel(status: string) {
  const labels: Record<string, string> = {
    not_started: "Не начато",
    in_progress: "В процессе",
    completed: "Завершено",
    submitted: "На проверке",
    changes_requested: "Нужны правки",
    approved: "Принято",
    available: "Доступно",
    locked: "Закрыто"
  };

  return labels[status] ?? status;
}
