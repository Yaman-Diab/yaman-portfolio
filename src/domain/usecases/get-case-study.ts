import type { Locale } from '../entities/locale';
import type { Project, ProjectSlug } from '../entities/project';
import type { PortfolioRepository } from '../repositories/portfolio-repository';

export interface CaseStudy {
  project: Project;
  /** The project to read next. Wraps around to the first one. */
  next: Project;
}

export class ProjectNotFoundError extends Error {
  constructor(slug: string) {
    super(`No project with the slug "${slug}". Check src/data/content/facts.ts.`);
    this.name = 'ProjectNotFoundError';
  }
}

/** Resolves one case study and the project that follows it in the list. */
export function getCaseStudy(
  repository: PortfolioRepository,
  locale: Locale,
  slug: ProjectSlug,
): CaseStudy {
  const projects = repository.getProjects(locale);
  const index = projects.findIndex((project) => project.slug === slug);
  const project = projects[index];
  if (!project) throw new ProjectNotFoundError(slug);

  const next = projects[(index + 1) % projects.length] ?? project;
  return { project, next };
}
