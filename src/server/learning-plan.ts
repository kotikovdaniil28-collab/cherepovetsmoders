import type { Assignment, Lesson } from "@/lib/types";
import { getCourseModules, getSubmissions } from "@/server/course-service";

export type TodayPlan = {
  nextLesson?: {
    moduleSlug: string;
    moduleTitle: string;
    lesson: Lesson;
  };
  nextAssignment?: {
    moduleTitle: string;
    assignment: Assignment;
  };
  fixes: Array<{
    title: string;
    slug?: string;
    summary?: string;
  }>;
  completedToday: string[];
};

export async function getTodayPlan(): Promise<TodayPlan> {
  const [modules, submissions] = await Promise.all([
    getCourseModules(),
    getSubmissions()
  ]);

  const nextLesson = modules
    .flatMap((module) =>
      module.lessons.map((lesson) => ({
        moduleSlug: module.slug,
        moduleTitle: module.title,
        lesson
      }))
    )
    .find((item) => item.lesson.status !== "completed");

  const nextAssignment = modules
    .flatMap((module) =>
      module.assignments.map((assignment) => ({
        moduleTitle: module.title,
        assignment
      }))
    )
    .find((item) => item.assignment.status !== "approved");

  const fixes = submissions
    .filter((submission) => submission.status === "changes_requested")
    .map((submission) => ({
      title: submission.assignmentTitle,
      slug: submission.assignmentSlug,
      summary: submission.check?.summary
    }));

  const completedToday = submissions
    .filter((submission) => submission.status === "approved")
    .slice(0, 3)
    .map((submission) => submission.assignmentTitle);

  return {
    nextLesson,
    nextAssignment,
    fixes,
    completedToday
  };
}

