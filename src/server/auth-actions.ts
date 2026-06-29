"use server";

import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";

export type AuthActionState = {
  ok: boolean;
  message: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createAccountAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!process.env.DATABASE_URL) {
    return {
      ok: true,
      message: "Сайт открыт в демо-режиме. Тренажёр можно смотреть без аккаунта."
    };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");

  if (name.length < 2) {
    return {
      ok: false,
      message: "Укажи имя минимум из 2 символов."
    };
  }

  if (!email.includes("@")) {
    return {
      ok: false,
      message: "Укажи корректный email."
    };
  }

  if (password.length < 8) {
    return {
      ok: false,
      message: "Пароль должен быть минимум 8 символов."
    };
  }

  const existing = await prisma.user.findUnique({
    where: { email }
  });

  if (existing) {
    return {
      ok: false,
      message: "Пользователь с таким email уже существует."
    };
  }

  const baseSlug = slugify(name) || email.split("@")[0] || "student";
  let portfolioSlug = baseSlug;
  let suffix = 1;

  while (
    await prisma.profile.findUnique({
      where: { portfolioSlug }
    })
  ) {
    suffix += 1;
    portfolioSlug = `${baseSlug}-${suffix}`;
  }

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashPassword(password),
      role: "STUDENT",
      profile: {
        create: {
          displayName: name,
          portfolioSlug,
          isPublic: false,
          experienceLevel: "beginner"
        }
      }
    }
  });

  return {
    ok: true,
    message: "Аккаунт создан. Теперь можно войти."
  };
}
