import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getPortfolio } from "@/server/course-service";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    portfolioSlug: string;
  }>;
};

export default async function PortfolioPage({ params }: PageProps) {
  const { portfolioSlug } = await params;
  const portfolio = await getPortfolio(portfolioSlug);

  if (!portfolio) {
    notFound();
  }

  return (
    <AppShell>
      <section className="glass-panel rounded-lg p-6">
        <p className="text-sm font-medium text-brand">@{portfolio.slug}</p>
        <h1 className="mt-2 text-3xl font-black">{portfolio.displayName}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          {portfolio.bio}
        </p>
        {portfolio.githubUrl ? (
          <Link
            className="mt-4 inline-flex text-sm font-medium text-brand hover:underline"
            href={portfolio.githubUrl}
          >
            Профиль
          </Link>
        ) : null}
      </section>
      <section className="mt-6">
        <h2 className="text-xl font-semibold">Решения</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {portfolio.projects.map((project) => (
            <article
              className="glass-panel rounded-lg p-5"
              key={project.title}
            >
              <h3 className="font-semibold">{project.title}</h3>
              <p className="mt-2 text-sm text-muted">{project.description}</p>
              <div className="mt-4 flex gap-3 text-sm">
                <Link className="text-brand hover:underline" href={project.githubUrl}>
                  Материал
                </Link>
                {project.deployUrl ? (
                  <Link className="text-brand hover:underline" href={project.deployUrl}>
                    Ссылка
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
