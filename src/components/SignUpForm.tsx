"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  createAccountAction,
  type AuthActionState
} from "@/server/auth-actions";

const initialState: AuthActionState = {
  ok: false,
  message: ""
};

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState(
    createAccountAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium">Имя</span>
        <input
          className="mt-2 w-full rounded-md border border-line bg-black/20 px-3 py-2 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand focus:bg-black/30"
          name="name"
          placeholder="Nick_Name"
          required
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Email</span>
        <input
          className="mt-2 w-full rounded-md border border-line bg-black/20 px-3 py-2 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand focus:bg-black/30"
          name="email"
          placeholder="moderator@example.com"
          required
          type="email"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Пароль</span>
        <input
          className="mt-2 w-full rounded-md border border-line bg-black/20 px-3 py-2 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand focus:bg-black/30"
          name="password"
          placeholder="Минимум 8 символов"
          required
          type="password"
        />
      </label>
      <button
        className="w-full rounded-md bg-brand px-4 py-2 text-sm font-bold text-[#06110c] transition hover:bg-[#70ffb2] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Создаем..." : "Создать аккаунт"}
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
      <Link
        className="block rounded-md border border-line px-4 py-2 text-center text-sm font-semibold text-brand transition hover:bg-white/10"
        href="/dashboard"
      >
        Открыть демо-тренажёр
      </Link>
      <p className="text-sm text-muted">
        Уже есть аккаунт?{" "}
        <Link className="font-medium text-brand hover:underline" href="/sign-in">
          Войти
        </Link>
      </p>
    </form>
  );
}
