"use client";

import { useActionState } from "react";
import {
  submitAssignmentAction,
  type ActionState
} from "@/server/course-actions";

const initialState: ActionState = {
  ok: false,
  message: ""
};

export function AssignmentSubmissionForm({
  assignmentSlug
}: {
  assignmentSlug: string;
}) {
  const [state, formAction, isPending] = useActionState(
    submitAssignmentAction,
    initialState
  );

  return (
    <form action={formAction} className="mt-5 space-y-4">
      <input name="assignmentSlug" type="hidden" value={assignmentSlug} />
      <label className="block">
        <span className="text-sm font-medium">Ссылка на материал</span>
        <input
          className="mt-2 w-full rounded-md border border-line bg-black/20 px-3 py-2 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand"
          name="githubUrl"
          placeholder="https://..."
          required
          type="url"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Дополнительная ссылка</span>
        <input
          className="mt-2 w-full rounded-md border border-line bg-black/20 px-3 py-2 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand"
          name="deployUrl"
          placeholder="https://..."
          type="url"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Комментарий</span>
        <textarea
          className="mt-2 min-h-28 w-full rounded-md border border-line bg-black/20 px-3 py-2 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand"
          name="comment"
          placeholder="Что получилось, где нужна помощь?"
        />
      </label>
      <button
        className="w-full rounded-md bg-brand px-4 py-2 text-sm font-bold text-[#06110c] transition hover:bg-[#70ffb2] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Проверяем..." : "Запустить автопроверку"}
      </button>
      {state.message ? (
        <p
          className={`rounded-md px-3 py-2 text-sm ${
            state.ok
              ? "border border-brand/30 bg-brand/10 text-green-100"
              : "border border-red-400/30 bg-red-500/10 text-red-200"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
