export type LessonStatus = "not_started" | "in_progress" | "completed";
export type AssignmentStatus =
  | "not_started"
  | "submitted"
  | "changes_requested"
  | "approved";

export type Lesson = {
  title: string;
  slug: string;
  duration: string;
  status: LessonStatus;
  summary: string;
  content: string[];
  challenge?: Challenge;
};

export type ChallengeTestRule = {
  id: string;
  message: string;
  type: "includes" | "notIncludes" | "regex";
  value: string;
};

export type Challenge = {
  title: string;
  instructions: string[];
  seedCode: string;
  tests: ChallengeTestRule[];
};

export type Assignment = {
  title: string;
  slug: string;
  status: AssignmentStatus;
  summary: string;
  criteria: string[];
};

export type CourseModule = {
  title: string;
  slug: string;
  description: string;
  status: "available" | "locked" | "completed" | "in_progress";
  progress: number;
  lessons: Lesson[];
  assignments: Assignment[];
};

export type Submission = {
  assignmentTitle: string;
  assignmentSlug?: string;
  moduleTitle: string;
  status: AssignmentStatus;
  githubUrl: string;
  deployUrl?: string;
  updatedAt: string;
  check?: AutoCheckReport;
};

export type AutoCheckResult = {
  id: string;
  label: string;
  passed: boolean;
  message: string;
};

export type AutoCheckReport = {
  status: AssignmentStatus;
  summary: string;
  results: AutoCheckResult[];
};

export type PortfolioProject = {
  title: string;
  description: string;
  githubUrl: string;
  deployUrl?: string;
  skills: string[];
};

export type Portfolio = {
  displayName: string;
  slug: string;
  bio: string;
  githubUrl?: string;
  linkedinUrl?: string;
  projects: PortfolioProject[];
};
