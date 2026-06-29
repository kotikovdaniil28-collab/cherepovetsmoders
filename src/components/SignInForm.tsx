"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";
import { signIn } from "next-auth/react";

export function SignInForm() {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        setMessage("Не удалось войти. Проверь email и пароль.");
        return;
      }

      window.location.href = "/dashboard";
    });
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
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
          placeholder="Пароль"
          required
          type="password"
        />
      </label>
      <button
        className="w-full rounded-md bg-brand px-4 py-2 text-sm font-bold text-[#06110c] transition hover:bg-[#70ffb2] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Входим..." : "Войти"}
      </button>
      {message ? (
        <p className="rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {message}
        </p>
      ) : null}
      <Link
        className="block rounded-md border border-line px-4 py-2 text-center text-sm font-semibold text-brand transition hover:bg-white/10"
        href="/dashboard"
      >
        Открыть демо-тренажёр
      </Link>
      <p className="text-sm text-muted">
        Нет аккаунта?{" "}
        <Link className="font-medium text-brand hover:underline" href="/sign-up">
          Зарегистрироваться
        </Link>
      </p>
    </form>
  );
}
