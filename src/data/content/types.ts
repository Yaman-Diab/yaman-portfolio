import type { Career, Recognition, Writing } from '@/domain/entities/career';
import type { Profile } from '@/domain/entities/profile';
import type { Project, ProjectLink, ProjectSlug, ProjectStatus } from '@/domain/entities/project';
import type { ExpertiseId } from './facts';

/** The translated part of a project. Facts are merged in by the mapper. */
export type ProjectText = Omit<Project, 'slug' | 'year' | 'status' | 'statusLabel' | 'stack' | 'links'>;

/** Everything one language file has to provide. */
export interface LocalizedContent {
  profile: Omit<Profile, 'contact' | 'nameLatin' | 'nameArabic'>;
  statusLabels: Record<ProjectStatus, string>;
  linkLabels: Record<ProjectLink['kind'], string>;
  projects: Record<ProjectSlug, ProjectText>;
  career: Career;
  recognitions: Recognition[];
  expertise: Record<ExpertiseId, { title: string; body: string }>;
  writing: Writing;
}
