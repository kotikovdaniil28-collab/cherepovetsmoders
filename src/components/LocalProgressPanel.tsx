"use client";

import { useEffect, useState } from "react";

export function LocalProgressPanel() {
  const [completed, setCompleted] = useState(0);
  const [drafts, setDrafts] = useState(0);

  useEffect(() => {
    const keys = Array.from({ length: window.localStorage.length }, (_, index) =>
      window.localStorage.key(index)
    ).filter(Boolean) as string[];

    setCompleted(
      keys.filter(
        (key) => key.startsWith("challenge:") && key.endsWith(":completed")
      ).length
    );
    setDrafts(
      keys.filter(
        (key) => key.startsWith("challenge:") && !key.endsWith(":completed")
      ).length
    );
  }, []);

  return (
    <div className="glass-panel rounded-lg p-5">
      <h2 className="font-bold">Демо-прогресс</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-md border border-line bg-black/[0.18] p-3">
          <p className="font-pixel text-lg text-brand">{completed}</p>
          <p className="mt-1 text-xs text-muted">кейсов закрыто</p>
        </div>
        <div className="rounded-md border border-line bg-black/[0.18] p-3">
          <p className="font-pixel text-lg text-brand">{drafts}</p>
          <p className="mt-1 text-xs text-muted">черновиков</p>
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-muted">
        Сохраняется в браузере. Для общего прогресса состава нужна база.
      </p>
    </div>
  );
}
