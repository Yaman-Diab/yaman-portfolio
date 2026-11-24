import type { Career, ExpertiseGroup, Recognition, Faq } from '@/domain/entities/career';
import type { Locale } from '@/domain/entities/locale';
import type { Profile } from '@/domain/entities/profile';
import type { Project, ProjectSlug } from '@/domain/entities/project';
import type { PortfolioRepository } from '@/domain/repositories/portfolio-repository';
import { ar } from '../content/ar';
import { en } from '../content/en';
import { EXPERTISE_IDS, EXPERTISE_TOOLS, LINKS, NAMES, PROJECT_FACTS } from '../content/facts';
import { brandLogo, screenImage } from '../content/screens';
import type { LocalizedContent } from '../content/types';
import { assertSameShape, validateContent } from '../validation/content-schema';

/**
 * Serves the portfolio from the TypeScript files in ../content.
 *
 * Content is validated once, when this module loads. A missing field or a
 * translation that is out of step stops the build with a readable message.
 */
export class StaticPortfolioRepository implements PortfolioRepository {
  private readonly content: Record<Locale, LocalizedContent>;

  constructor() {
    this.content = {
      en: validateContent('en', en),
      ar: validateContent('ar', ar),
    };
    assertSameShape(['en', this.content.en], ['ar', this.content.ar]);
  }

  getProfile(locale: Locale): Profile {
    return {
      ...this.content[locale].profile,
      nameLatin: NAMES.latin,
      nameArabic: NAMES.arabic,
      contact: {
        email: LINKS.email,
        phone: LINKS.phone,
        phoneDisplay: LINKS.phoneDisplay,
        github: LINKS.github,
        linkedin: LINKS.linkedin,
        siteRepository: LINKS.siteRepository,
      },
    };
  }

  getProjects(locale: Locale): Project[] {
    const { projects, statusLabels, linkLabels } = this.content[locale];
    return PROJECT_FACTS.map((facts) => ({
      ...projects[facts.slug],
      screens: projects[facts.slug].screens.map((screen, index) => ({
        ...screen,
        image: screenImage(facts.slug, index + 1),
      })),
      slug: facts.slug,
      year: facts.year,
      status: facts.status,
      statusLabel: statusLabels[facts.status],
      stack: facts.stack,
      links: facts.links.map((link) => ({ ...link, label: linkLabels[link.kind] })),
      brand: { ...facts.brand, logo: brandLogo(facts.slug) },
    }));
  }

  findProject(locale: Locale, slug: ProjectSlug): Project | undefined {
    return this.getProjects(locale).find((project) => project.slug === slug);
  }

  getCareer(locale: Locale): Career {
    return this.content[locale].career;
  }

  getRecognitions(locale: Locale): Recognition[] {
    return this.content[locale].recognitions;
  }

  getExpertise(locale: Locale): ExpertiseGroup[] {
    const { expertise } = this.content[locale];
    return EXPERTISE_IDS.map((id) => ({ id, ...expertise[id], tools: EXPERTISE_TOOLS[id] }));
  }

  getFaq(locale: Locale): Faq {
    return this.content[locale].faq;
  }
}
