"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { evaluateSubmission } from "@/server/auto-review";
import { getCurrentUser } from "@/server/current-user";

export type ActionState = {
  ok: boolean;
  message: string;
};

export async function completeLessonAction(
  moduleSlug: string,
  lessonSlug: string
): Promise<ActionState> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        ok: false,
        message: "Нужен пользователь. Запусти seed или войди в аккаунт."
      };
    }

    const lesson = await prisma.lesson.findFirst({
      where: {
        slug: lessonSlug,
        module: {
          slug: moduleSlug
        }
      },
      include: {
        module: {
          include: {
            lessons: true
          }
        }
      }
    });

    if (!lesson) {
      return {
        ok: false,
        message: "Урок не найден."
      };
    }

    await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: lesson.id
        }
      },
      update: {
        status: "COMPLETED",
        completedAt: new Date()
      },
      create: {
        userId: user.id,
        lessonId: lesson.id,
        status: "COMPLETED",
        completedAt: new Date()
      }
    });

    const completedCount = await prisma.lessonProgress.count({
      where: {
        userId: user.id,
        status: "COMPLETED",
        lesson: {
          moduleId: lesson.moduleId
        }
      }
    });

    const percent = Math.round(
      (completedCount / Math.max(lesson.module.lessons.length, 1)) * 100
    );

    await prisma.moduleProgress.upsert({
      where: {
        userId_moduleId: {
          userId: user.id,
          moduleId: lesson.moduleId
        }
      },
      update: {
        percent,
        status: percent === 100 ? "COMPLETED" : "IN_PROGRESS",
        completedAt: percent === 100 ? new Date() : null
      },
      create: {
        userId: user.id,
        moduleId: lesson.moduleId,
        percent,
        status: percent === 100 ? "COMPLETED" : "IN_PROGRESS",
        completedAt: percent === 100 ? new Date() : null
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/roadmap");
    revalidatePath(`/learn/${moduleSlug}/${lessonSlug}`);

    return {
      ok: true,
      message: "Урок завершен. Прогресс обновлен."
    };
  } catch {
    return {
      ok: false,
      message:
        "Не удалось сохранить прогресс в БД. В режиме без БД прогресс сохранится локально в браузере."
    };
  }
}

export async function submitAssignmentAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        ok: false,
        message: "Нужен пользователь. Запусти seed или войди в аккаунт."
      };
    }

    const assignmentSlug = String(formData.get("assignmentSlug") ?? "");
    const githubUrl = String(formData.get("githubUrl") ?? "");
    const deployUrl = String(formData.get("deployUrl") ?? "");
    const comment = String(formData.get("comment") ?? "");

    if (!assignmentSlug || !githubUrl.startsWith("https://")) {
      return {
        ok: false,
        message: "Укажи корректную https-ссылку на материал."
      };
    }

    const assignment = await prisma.assignment.findUnique({
      where: {
        slug: assignmentSlug
      }
    });

    if (!assignment) {
      return {
        ok: false,
        message: "Задание не найдено."
      };
    }

    const report = evaluateSubmission({
      assignment,
      githubUrl,
      deployUrl,
      comment
    });

    const attempts = await prisma.submission.count({
      where: {
        userId: user.id,
        assignmentId: assignment.id
      }
    });

    const submission = await prisma.submission.create({
      data: {
        userId: user.id,
        assignmentId: assignment.id,
        githubUrl,
        deployUrl: deployUrl || null,
        comment: comment || null,
        status:
          report.status === "approved" ? "APPROVED" : "CHANGES_REQUESTED",
        attemptNumber: attempts + 1
      }
    });

    await prisma.submissionCheck.create({
      data: {
        submissionId: submission.id,
        status:
          report.status === "approved" ? "APPROVED" : "CHANGES_REQUESTED",
        summary: report.summary,
        resultsJson: report.results
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/submissions");
    revalidatePath("/checks");
    revalidatePath(`/assignments/${assignmentSlug}`);

    return {
      ok: report.status === "approved",
      message: report.summary
    };
  } catch {
    return {
      ok: false,
      message: "Не удалось отправить решение. Проверь, что база данных запущена."
    };
  }
}
