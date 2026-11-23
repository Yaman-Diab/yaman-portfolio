import type { Career, ExpertiseGroup, Recognition, Writing } from '../entities/career';
import type { Locale } from '../entities/locale';
import type { Profile } from '../entities/profile';
import type { Project, ProjectSlug } from '../entities/project';

/**
 * Everything the site shows about Yaman, per language.
 *
 * Presentation code depends on this contract only. Where the content lives
 * (static files today, a CMS or an API later) is the data layer's business.
 */
export interface PortfolioRepository {
  getProfile(locale: Locale): Profile;
  getProjects(locale: Locale): Project[];
  findProject(locale: Locale, slug: ProjectSlug): Project | undefined;
  getCareer(locale: Locale): Career;
  getRecognitions(locale: Locale): Recognition[];
  getExpertise(locale: Locale): ExpertiseGroup[];
  getWriting(locale: Locale): Writing;
}
