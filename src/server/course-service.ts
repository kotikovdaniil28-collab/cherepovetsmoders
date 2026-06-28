import { prisma } from "@/lib/db";
import type {
  AssignmentStatus,
  AutoCheckResult,
  ChallengeTestRule,
  CourseModule,
  LessonStatus,
  Portfolio,
  Submission
} from "@/lib/types";
import {
  courseModules as mockModules,
  getAssignment as getMockAssignment,
  getLesson as getMockLesson,
  getNextLesson as getMockNextLesson,
  submissions as mockSubmissions
} from "@/content/course";
import { getCurrentUser } from "@/server/current-user";

type PrismaCourseModule = {
  title: string;
  slug: string;
  description: string;
  status: string;
  lessons: Array<{
    title: string;
    slug: string;
    summary: string;
    contentJson: unknown;
    estimatedMinutes: number;
    challenge: {
      title: string;
      instructionsJson: unknown;
      seedCode: string;
      testRulesJson: unknown;
    } | null;
    lessonProgress: Array<{
      status: string;
    }>;
  }>;
  assignments: Array<{
    title: string;
    slug: string;
    summary: string;
    acceptanceCriteriaJson: unknown;
    submissions: Array<{
      status: string;
    }>;
  }>;
  moduleProgress: Array<{
    status: string;
    percent: number;
  }>;
};

function shouldUseMockData() {
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true" || !process.env.DATABASE_URL;
}

function mapLessonStatus(status?: string): LessonStatus {
  if (status === "COMPLETED") {
    return "completed";
  }

  if (status === "IN_PROGRESS") {
    return "in_progress";
  }

  return "not_started";
}

function mapAssignmentStatus(status?: string): AssignmentStatus {
  if (status === "APPROVED") {
    return "approved";
  }

  if (status === "SUBMITTED") {
    return "submitted";
  }

  if (status === "CHANGES_REQUESTED") {
    return "changes_requested";
  }

  return "not_started";
}

function mapModuleStatus(status?: string): CourseModule["status"] {
  if (status === "COMPLETED") {
    return "completed";
  }

  if (status === "IN_PROGRESS") {
    return "in_progress";
  }

  if (status === "LOCKED") {
    return "locked";
  }

  return "available";
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : [];
}

function testRules(value: unknown): ChallengeTestRule[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is ChallengeTestRule => {
    if (!item || typeof item !== "object") {
      return false;
    }

    const rule = item as Partial<ChallengeTestRule>;

    return (
      typeof rule.id === "string" &&
      typeof rule.message === "string" &&
      typeof rule.value === "string" &&
      (rule.type === "includes" ||
        rule.type === "notIncludes" ||
        rule.type === "regex")
    );
  });
}

function checkResults(value: unknown): AutoCheckResult[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is AutoCheckResult => {
    if (!item || typeof item !== "object") {
      return false;
    }

    const check = item as Partial<AutoCheckResult>;

    return (
      typeof check.id === "string" &&
      typeof check.label === "string" &&
      typeof check.passed === "boolean" &&
      typeof check.message === "string"
    );
  });
}

function mapModule(courseModule: PrismaCourseModule): CourseModule {
  const progress = courseModule.moduleProgress[0];

  return {
    title: courseModule.title,
    slug: courseModule.slug,
    description: courseModule.description,
    status: mapModuleStatus(progress?.status ?? courseModule.status),
    progress: progress?.percent ?? 0,
    lessons: courseModule.lessons.map((lesson) => ({
      title: lesson.title,
      slug: lesson.slug,
      duration: `${lesson.estimatedMinutes} мин`,
      status: mapLessonStatus(lesson.lessonProgress[0]?.status),
      summary: lesson.summary,
      content: stringArray(lesson.contentJson),
      challenge: lesson.challenge
        ? {
            title: lesson.challenge.title,
            instructions: stringArray(lesson.challenge.instructionsJson),
            seedCode: lesson.challenge.seedCode,
            tests: testRules(lesson.challenge.testRulesJson)
          }
        : undefined
    })),
    assignments: courseModule.assignments.map((assignment) => ({
      title: assignment.title,
      slug: assignment.slug,
      status: mapAssignmentStatus(assignment.submissions[0]?.status),
      summary: assignment.summary,
      criteria: stringArray(assignment.acceptanceCriteriaJson)
    }))
  };
}

async function tryDb<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  if (shouldUseMockData()) {
    return fallback;
  }

  try {
    return await query();
  } catch (error) {
    console.warn("Falling back to mock data:", error);
    return fallback;
  }
}

export async function getCourseModules(): Promise<CourseModule[]> {
  return tryDb(async () => {
    const student = await getCurrentUser();
    const studentId = student?.id ?? "__missing_user__";

    const modules = await prisma.module.findMany({
      where: {
        course: {
          slug: "frontend-developer"
        }
      },
      include: {
        lessons: {
          include: {
            challenge: true,
            lessonProgress: {
              where: {
                userId: studentId
              }
            }
          },
          orderBy: {
            order: "asc"
          }
        },
        assignments: {
          include: {
            submissions: {
              where: {
                userId: studentId
              },
              orderBy: {
                createdAt: "desc"
              },
              take: 1
            }
          },
          orderBy: {
            order: "asc"
          }
        },
        moduleProgress: {
          where: {
            userId: studentId
          }
        }
      },
      orderBy: {
        order: "asc"
      }
    });

    return modules.map((courseModule) => mapModule(courseModule));
  }, mockModules);
}

export async function getLesson(moduleSlug: string, lessonSlug: string) {
  const modules = await getCourseModules();
  const courseModule = modules.find((item) => item.slug === moduleSlug);
  const lesson = courseModule?.lessons.find((item) => item.slug === lessonSlug);

  if (courseModule && lesson) {
    return { module: courseModule, lesson };
  }

  return getMockLesson(moduleSlug, lessonSlug);
}

export async function getAssignment(slug: string) {
  const modules = await getCourseModules();

  for (const courseModule of modules) {
    const assignment = courseModule.assignments.find((item) => item.slug === slug);

    if (assignment) {
      return { module: courseModule, assignment };
    }
  }

  return getMockAssignment(slug);
}

export async function getNextLesson() {
  const modules = await getCourseModules();
  const next = modules
    .flatMap((courseModule) =>
      courseModule.lessons.map((lesson) => ({
        module: courseModule,
        lesson
      }))
    )
    .find(({ lesson }) => lesson.status !== "completed");

  return next ?? getMockNextLesson();
}

export async function getLessonNavigation(moduleSlug: string, lessonSlug: string) {
  const modules = await getCourseModules();
  const flatLessons = modules.flatMap((courseModule) =>
    courseModule.lessons.map((lesson) => ({
      moduleSlug: courseModule.slug,
      moduleTitle: courseModule.title,
      lessonSlug: lesson.slug,
      lessonTitle: lesson.title
    }))
  );
  const currentIndex = flatLessons.findIndex(
    (item) => item.moduleSlug === moduleSlug && item.lessonSlug === lessonSlug
  );

  return {
    previous: currentIndex > 0 ? flatLessons[currentIndex - 1] : undefined,
    next:
      currentIndex >= 0 && currentIndex < flatLessons.length - 1
        ? flatLessons[currentIndex + 1]
        : undefined
  };
}

export async function getSubmissions(): Promise<Submission[]> {
  return tryDb(async () => {
    const user = await getCurrentUser();

    if (!user) {
      return [];
    }

    const submissions = await prisma.submission.findMany({
      where: {
        userId: user.id
      },
      include: {
        checks: {
          orderBy: {
            createdAt: "desc"
          },
          take: 1
        },
        assignment: {
          include: {
            module: true
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      }
    });

    return submissions.map((submission) => ({
      assignmentTitle: submission.assignment.title,
      assignmentSlug: submission.assignment.slug,
      moduleTitle: submission.assignment.module.title,
      status: mapAssignmentStatus(submission.status),
      githubUrl: submission.githubUrl,
      deployUrl: submission.deployUrl ?? undefined,
      updatedAt: new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "short"
      }).format(submission.updatedAt),
      check: submission.checks[0]
        ? {
            status: mapAssignmentStatus(submission.checks[0].status),
            summary: submission.checks[0].summary,
            results: checkResults(submission.checks[0].resultsJson)
          }
        : undefined
    }));
  }, mockSubmissions);
}

export async function getPortfolio(slug: string): Promise<Portfolio | undefined> {
  return tryDb(async () => {
    const profile = await prisma.profile.findUnique({
      where: {
        portfolioSlug: slug
      },
      include: {
        user: {
          include: {
            projects: {
              where: {
                isPublic: true
              },
              orderBy: {
                order: "asc"
              }
            }
          }
        }
      }
    });

    if (!profile || !profile.isPublic) {
      return undefined;
    }

    return {
      displayName: profile.displayName,
      slug: profile.portfolioSlug,
      bio: profile.bio ?? "",
      githubUrl: profile.githubUrl ?? undefined,
      linkedinUrl: profile.linkedinUrl ?? undefined,
      projects: profile.user.projects.map((project) => ({
        title: project.title,
        description: project.description,
        githubUrl: project.githubUrl,
        deployUrl: project.deployUrl ?? undefined,
        skills: stringArray(project.skillsJson)
      }))
    };
  }, {
    displayName: "Demo Moderator",
    slug,
    bio: "Тренирую Discord-модерацию: доказательства, правила, наказания и отчёты.",
    githubUrl: "https://vk.com/cherepovets89",
    projects: mockSubmissions
      .filter((submission) => submission.status === "approved")
      .map((submission) => ({
        title: submission.assignmentTitle,
        description: submission.moduleTitle,
        githubUrl: submission.githubUrl,
        deployUrl: submission.deployUrl,
        skills: ["Discord", "Rules", "Evidence"]
      }))
  });
}
