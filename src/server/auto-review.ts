import type { AssignmentStatus, AutoCheckReport } from "@/lib/types";

type AssignmentForAutoReview = {
  requiredDeployUrl: boolean;
};

function result(
  id: string,
  label: string,
  passed: boolean,
  message: string
) {
  return {
    id,
    label,
    passed,
    message
  };
}

export function evaluateSubmission({
  assignment,
  githubUrl,
  deployUrl,
  comment
}: {
  assignment: AssignmentForAutoReview;
  githubUrl: string;
  deployUrl: string;
  comment: string;
}): AutoCheckReport {
  const results = [
    result(
      "github-url",
      "Ссылка на материал",
      githubUrl.startsWith("https://") && githubUrl.length >= 12,
      "Ссылка должна начинаться с https:// и вести на материал проверки."
    ),
    result(
      "deploy-url",
      "Дополнительная ссылка",
      !assignment.requiredDeployUrl || deployUrl.startsWith("https://"),
      assignment.requiredDeployUrl
        ? "Для этого задания нужна дополнительная https-ссылка."
        : "Дополнительная ссылка необязательна."
    ),
    result(
      "self-review",
      "Комментарий к решению",
      comment.trim().length >= 20,
      "Добавь комментарий минимум на 20 символов: что решил, что проверил, где спорный момент."
    )
  ];

  const passed = results.every((item) => item.passed);
  const status: AssignmentStatus = passed ? "approved" : "changes_requested";

  return {
    status,
    summary: passed
      ? "Автопроверка пройдена. Работа засчитана, можно двигаться дальше."
      : "Автопроверка нашла, что нужно исправить перед зачётом.",
    results
  };
}
