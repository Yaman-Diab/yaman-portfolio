import type { Career, Recognition, Faq } from '@/domain/entities/career';
import type { Profile } from '@/domain/entities/profile';
import type { Project, ProjectLink, ProjectSlug, ProjectStatus, Screen } from '@/domain/entities/project';
import type { ExpertiseId } from './facts';

/** The words for one screen. The picture is found by file name (see screens.ts). */
export type ScreenText = Omit<Screen, 'image'>;

/** The translated part of a project. Facts and screenshots are merged in by the repository. */
export type ProjectText = Omit<Project, 'slug' | 'year' | 'status' | 'statusLabel' | 'stack' | 'links' | 'screens' | 'brand'> & {
  screens: ScreenText[];
};

/** Everything one language file has to provide. */
export interface LocalizedContent {
  profile: Omit<Profile, 'contact' | 'nameLatin' | 'nameArabic'>;
  statusLabels: Record<ProjectStatus, string>;
  linkLabels: Record<ProjectLink['kind'], string>;
  projects: Record<ProjectSlug, ProjectText>;
  career: Career;
  recognitions: Recognition[];
  expertise: Record<ExpertiseId, { title: string; body: string }>;
  faq: Faq;
}
