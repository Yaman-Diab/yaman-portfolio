import type { Project } from '@/domain/entities/project';

/**
 * What the curtain needs to open a case study the way the app itself opens:
 * its splash colour and its logo. Serialised onto links to the project so
 * the curtain can turn into the app's splash before the page has loaded.
 */
export interface SplashData {
  name: string;
  primary: string;
  deep: string;
  accent: string;
  on: string;
  kind: 'wordmark' | 'icon' | 'none';
  logo?: string;
}

export function splashOf(project: Project): SplashData {
  const { brand } = project;
  return {
    name: project.name,
    primary: brand.primary,
    deep: brand.deep,
    accent: brand.accent,
    on: brand.onPrimary,
    kind: brand.logo ? brand.logoKind : 'none',
    logo: brand.logo?.src,
  };
}

/** CSS custom properties that paint a block in the project's colours. */
export function brandStyle(project: Project): string {
  const { brand } = project;
  return [
    `--brand:${brand.primary}`,
    `--brand-deep:${brand.deep}`,
    `--brand-accent:${brand.accent}`,
    `--on-brand:${brand.onPrimary}`,
    // Ink: the colour used for small accents on light grounds. The deep shade always reads on paper.
    `--brand-ink:${brand.deep}`,
  ].join(';');
}
