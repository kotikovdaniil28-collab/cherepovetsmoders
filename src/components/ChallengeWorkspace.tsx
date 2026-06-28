"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type { Challenge, ChallengeTestRule } from "@/lib/types";
import { completeLessonAction } from "@/server/course-actions";

type TestResult = {
  rule: ChallengeTestRule;
  passed: boolean;
};

function evaluateRule(code: string, rule: ChallengeTestRule) {
  if (rule.type === "includes") {
    return code.includes(rule.value);
  }

  if (rule.type === "notIncludes") {
    return !code.includes(rule.value);
  }

  try {
    return new RegExp(rule.value, "i").test(code);
  } catch {
    return false;
  }
}

export function ChallengeWorkspace({
  challenge,
  moduleSlug,
  lessonSlug
}: {
  challenge: Challenge;
  moduleSlug: string;
  lessonSlug: string;
}) {
  const storageKey = `challenge:${moduleSlug}:${lessonSlug}`;
  const [code, setCode] = useState(challenge.seedCode);
  const [results, setResults] = useState<TestResult[]>([]);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);

    if (saved) {
      setCode(saved);
    }
  }, [storageKey]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, code);
  }, [code, storageKey]);

  const allPassed = useMemo(
    () => results.length > 0 && results.every((result) => result.passed),
    [results]
  );

  function runTests() {
    const nextResults = challenge.tests.map((rule) => ({
      rule,
      passed: evaluateRule(code, rule)
    }));

    setResults(nextResults);

    if (nextResults.every((result) => result.passed)) {
      setMessage("Решение выглядит корректно. Можно завершать кейс.");
    } else {
      setMessage("Почти. Дополни решение и проверь ещё раз.");
    }
  }

  function completeLesson() {
    startTransition(async () => {
      const result = await completeLessonAction(moduleSlug, lessonSlug);

      if (!result.ok) {
        window.localStorage.setItem(`${storageKey}:completed`, "true");
      }

      setMessage(result.message);
    });
  }

  return (
    <section className="glass-panel mt-8 overflow-hidden rounded-lg">
      <div className="border-b border-line bg-brand/10 px-5 py-4">
        <p className="font-pixel text-[10px] uppercase text-brand">case trainer</p>
        <h2 className="mt-2 text-xl font-black">{challenge.title}</h2>
      </div>
      <div className="grid lg:grid-cols-[360px_1fr]">
        <aside className="border-b border-line bg-black/[0.16] p-5 lg:border-b-0 lg:border-r">
          <h3 className="font-semibold">Что нужно сделать</h3>
          <ol className="mt-4 space-y-3">
            {challenge.instructions.map((instruction, index) => (
              <li className="flex gap-3 text-sm leading-6 text-muted" key={instruction}>
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-xs font-semibold text-ink ring-1 ring-line">
                  {index + 1}
                </span>
                <span>{instruction}</span>
              </li>
            ))}
          </ol>
          <div className="mt-6 rounded-md bg-white/[0.08] p-4 ring-1 ring-line">
            <h3 className="text-sm font-semibold">Проверка ответа</h3>
            <div className="mt-3 space-y-2">
              {challenge.tests.map((rule) => {
                const result = results.find((item) => item.rule.id === rule.id);

                return (
                  <div className="flex gap-2 text-sm" key={rule.id}>
                    <span
                      className={
                        result?.passed
                          ? "text-green-600"
                          : result
                            ? "text-red-600"
                            : "text-muted"
                      }
                    >
                      {result?.passed ? "OK" : result ? "!" : "-"}
                    </span>
                    <span className="text-muted">{rule.message}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
        <div className="grid min-h-[520px] lg:grid-rows-[1fr_220px]">
          <label className="flex min-h-[300px] flex-col">
            <span className="border-b border-line px-4 py-2 text-sm font-medium">
              Решение модератора
            </span>
            <textarea
              className="h-full min-h-[300px] flex-1 resize-none bg-[#07110d] p-4 font-mono text-sm leading-6 text-ink outline-none"
              spellCheck={false}
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
          </label>
          <div className="border-t border-line bg-black/[0.18]">
            <div className="flex items-center justify-between border-b border-line px-4 py-2">
              <span className="text-sm font-medium">Черновик</span>
              <div className="flex gap-2">
                <button
                  className="rounded-md border border-line px-3 py-1.5 text-sm font-medium transition hover:bg-white/10"
                  onClick={() => {
                    setCode(challenge.seedCode);
                    setResults([]);
                    setMessage("");
                  }}
                  type="button"
                >
                  Сброс
                </button>
                <button
                  className="rounded-md bg-brand px-3 py-1.5 text-sm font-bold text-[#06110c] transition hover:bg-[#70ffb2]"
                  onClick={runTests}
                  type="button"
                >
                  Проверить
                </button>
                <button
                  className="rounded-md bg-white/[0.12] px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-white/[0.18] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!allPassed || isPending}
                  onClick={completeLesson}
                  type="button"
                >
                  Завершить
                </button>
              </div>
            </div>
            <iframe
              className="h-[170px] w-full bg-white"
              sandbox="allow-same-origin"
              srcDoc={code}
              title="Challenge preview"
            />
          </div>
        </div>
      </div>
      {message ? (
        <p className="border-t border-line bg-black/[0.16] px-5 py-3 text-sm text-muted">
          {message}
        </p>
      ) : null}
    </section>
  );
}
