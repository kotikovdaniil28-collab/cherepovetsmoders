import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export const demoStudentEmail = "student@example.com";

export async function getCurrentUser() {
  const session = await auth();
  const email = session?.user?.email;

  if (email) {
    return prisma.user.findUnique({
      where: {
        email
      },
      select: {
        id: true,
        email: true,
        role: true
      }
    });
  }

  if (process.env.DEMO_USER_FALLBACK === "false") {
    return null;
  }

  return prisma.user.findUnique({
    where: {
      email: demoStudentEmail
    },
    select: {
      id: true,
      email: true,
      role: true
    }
  });
}
