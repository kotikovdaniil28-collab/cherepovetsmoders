import Link from "next/link";
import { SignUpForm } from "@/components/SignUpForm";

export default function SignUpPage() {
  return (
    <main className="pixel-grid grid min-h-screen place-items-center px-4 py-10 text-ink">
      <section className="glass-panel w-full max-w-md rounded-lg p-6">
        <Link className="font-pixel text-[10px] font-semibold uppercase text-brand" href="/">
          CHEREPOVETS
        </Link>
        <h1 className="mt-4 text-3xl font-black tracking-tight">Регистрация</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Создай профиль модератора, чтобы сохранять прогресс, решения по
          кейсам и результаты проверок.
        </p>
        <div className="mt-6">
          <SignUpForm />
        </div>
      </section>
    </main>
  );
}
