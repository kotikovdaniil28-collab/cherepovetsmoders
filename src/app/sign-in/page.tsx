import Link from "next/link";
import { SignInForm } from "@/components/SignInForm";

export default function SignInPage() {
  return (
    <main className="pixel-grid grid min-h-screen place-items-center px-4 py-10 text-ink">
      <section className="glass-panel w-full max-w-md rounded-lg p-6">
        <Link className="font-pixel text-[10px] font-semibold uppercase text-brand" href="/">
          CHEREPOVETS
        </Link>
        <h1 className="mt-4 text-3xl font-black tracking-tight">Вход в штаб</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Войди, чтобы продолжить тренажёр, проверить кейсы и сохранить
          прогресс модератора.
        </p>
        <div className="mt-6">
          <SignInForm />
        </div>
      </section>
    </main>
  );
}
