import {
  AssignmentStatus,
  ModuleStatus,
  PrismaClient,
  ProgressStatus,
  PublishStatus,
  Role
} from "@prisma/client";
import { hashPassword } from "../src/lib/password";
import { courseModules } from "../src/content/course";

const prisma = new PrismaClient();

function moduleStatus(status: string) {
  if (status === "completed") return ModuleStatus.COMPLETED;
  if (status === "in_progress") return ModuleStatus.IN_PROGRESS;
  if (status === "locked") return ModuleStatus.LOCKED;
  return ModuleStatus.AVAILABLE;
}

function progressStatus(status: string) {
  if (status === "completed") return ProgressStatus.COMPLETED;
  if (status === "in_progress") return ProgressStatus.IN_PROGRESS;
  return ProgressStatus.NOT_STARTED;
}

async function main() {
  await prisma.submissionCheck.deleteMany();
  await prisma.project.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.moduleProgress.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.course.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const demoPasswordHash = hashPassword("password123");

  const student = await prisma.user.create({
    data: {
      name: "Demo Moderator",
      email: "student@example.com",
      passwordHash: demoPasswordHash,
      role: Role.STUDENT,
      profile: {
        create: {
          displayName: "Demo Moderator",
          portfolioSlug: "demo-moderator",
          isPublic: true,
          bio: "Тренирую разбор Discord-кейсов: факт, правило, доказательства и мера.",
          githubUrl: "https://vk.com/cherepovets89",
          weeklyGoalHours: 8,
          experienceLevel: "moderator"
        }
      }
    }
  });

  await prisma.user.create({
    data: {
      name: "Demo Admin",
      email: "admin@example.com",
      passwordHash: demoPasswordHash,
      role: Role.ADMIN
    }
  });

  const course = await prisma.course.create({
    data: {
      title: "CHEREPOVETS Discord Moderation",
      slug: "frontend-developer",
      description: "Тренажёр решений для Discord-модерации: правила, доказательства, наказания и отчёты.",
      level: "moderator",
      status: PublishStatus.PUBLISHED
    }
  });

  for (const [moduleIndex, moduleData] of courseModules.entries()) {
    const createdModule = await prisma.module.create({
      data: {
        courseId: course.id,
        title: moduleData.title,
        slug: moduleData.slug,
        description: moduleData.description,
        order: moduleIndex + 1,
        status: moduleStatus(moduleData.status),
        estimatedHours: Math.max(2, moduleData.lessons.length * 2)
      }
    });

    const createdLessons = [];

    for (const [lessonIndex, lesson] of moduleData.lessons.entries()) {
      const createdLesson = await prisma.lesson.create({
        data: {
          moduleId: createdModule.id,
          title: lesson.title,
          slug: lesson.slug,
          summary: lesson.summary,
          estimatedMinutes: Number.parseInt(lesson.duration, 10) || 15,
          contentJson: lesson.content,
          order: lessonIndex + 1,
          status: PublishStatus.PUBLISHED,
          challenge: lesson.challenge
            ? {
                create: {
                  title: lesson.challenge.title,
                  instructionsJson: lesson.challenge.instructions,
                  seedCode: lesson.challenge.seedCode,
                  testRulesJson: lesson.challenge.tests
                }
              }
            : undefined
        }
      });

      createdLessons.push(createdLesson);
    }

    for (const [assignmentIndex, assignment] of moduleData.assignments.entries()) {
      await prisma.assignment.create({
        data: {
          moduleId: createdModule.id,
          lessonId: createdLessons[createdLessons.length - 1]?.id,
          title: assignment.title,
          slug: assignment.slug,
          summary: assignment.summary,
          descriptionMarkdown: assignment.summary,
          acceptanceCriteriaJson: assignment.criteria,
          order: assignmentIndex + 1,
          requiredGithubUrl: true,
          requiredDeployUrl: false,
          autoChecksJson: [
            {
              id: "material-url",
              label: "Ссылка на материал",
              description: "Ссылка должна вести на доказательства или таблицу решения."
            },
            {
              id: "comment",
              label: "Комментарий",
              description: "Опиши факт, правило и действие."
            }
          ],
          status: PublishStatus.PUBLISHED
        }
      });
    }
  }

  const seededModules = await prisma.module.findMany({
    include: {
      assignments: true,
      lessons: true
    },
    orderBy: {
      order: "asc"
    }
  });

  for (const module of seededModules) {
    const source = courseModules.find((item) => item.slug === module.slug);
    const percent = source?.progress ?? 0;
    const status = moduleStatus(source?.status ?? "available");

    await prisma.moduleProgress.create({
      data: {
        userId: student.id,
        moduleId: module.id,
        status,
        percent,
        completedAt: status === ModuleStatus.COMPLETED ? new Date() : null
      }
    });

    for (const lesson of module.lessons) {
      const sourceLesson = source?.lessons.find((item) => item.slug === lesson.slug);
      const status = progressStatus(sourceLesson?.status ?? "not_started");

      await prisma.lessonProgress.create({
        data: {
          userId: student.id,
          lessonId: lesson.id,
          status,
          completedAt: status === ProgressStatus.COMPLETED ? new Date() : null
        }
      });
    }
  }

  const approvedAssignment = await prisma.assignment.findUniqueOrThrow({
    where: { slug: "review-three-cases" }
  });
  const fixAssignment = await prisma.assignment.findUniqueOrThrow({
    where: { slug: "punishment-log" }
  });

  const approvedSubmission = await prisma.submission.create({
    data: {
      userId: student.id,
      assignmentId: approvedAssignment.id,
      githubUrl: "https://vk.com/cherepovets89",
      deployUrl: "https://docs.google.com/spreadsheets/",
      status: AssignmentStatus.APPROVED,
      attemptNumber: 1,
      comment: "Разобрал три спорных ситуации: факт, правило, доказательство, действие."
    }
  });

  await prisma.submissionCheck.create({
    data: {
      submissionId: approvedSubmission.id,
      status: AssignmentStatus.APPROVED,
      summary: "Проверка пройдена: решения оформлены аккуратно.",
      resultsJson: [
        {
          id: "case-format",
          label: "Формат решений",
          passed: true,
          message: "Есть факт, пункт и действие."
        }
      ]
    }
  });

  const fixSubmission = await prisma.submission.create({
    data: {
      userId: student.id,
      assignmentId: fixAssignment.id,
      githubUrl: "https://vk.com/cherepovets89",
      deployUrl: "https://docs.google.com/spreadsheets/",
      status: AssignmentStatus.CHANGES_REQUESTED,
      attemptNumber: 1,
      comment: "Нужно проверить доказательства по двум строкам журнала."
    }
  });

  await prisma.submissionCheck.create({
    data: {
      submissionId: fixSubmission.id,
      status: AssignmentStatus.CHANGES_REQUESTED,
      summary: "Нужно уточнить доказательства в двух решениях.",
      resultsJson: [
        {
          id: "proofs",
          label: "Доказательства",
          passed: false,
          message: "В двух строках нет ссылки на доказательство."
        },
        {
          id: "measure",
          label: "Мера наказания",
          passed: true,
          message: "Меры соответствуют тяжести кейсов."
        }
      ]
    }
  });

  await prisma.project.create({
    data: {
      userId: student.id,
      assignmentId: approvedAssignment.id,
      title: "Разбор спорных ситуаций",
      description: "Три кейса Discord-модерации с доказательствами и решением.",
      githubUrl: approvedSubmission.githubUrl,
      deployUrl: approvedSubmission.deployUrl,
      skillsJson: ["Discord", "Rules", "Evidence", "Reports"],
      isPublic: true,
      order: 1
    }
  });

  console.log("Seed completed: CHEREPOVETS moderation trainer created.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
