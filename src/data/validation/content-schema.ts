import { z } from 'astro/zod';
import { EXPERTISE_IDS } from '../content/facts';
import type { LocalizedContent } from '../content/types';
import { PROJECT_SLUGS } from '@/domain/entities/project';

const text = z.string().trim().min(1);
const url = z.string().url().startsWith('https://');

const flow = z.object({
  nodes: z.array(z.object({ label: text, detail: text.optional() })).min(2),
  caption: text.optional(),
});

const challenge = z.object({
  title: text,
  body: text,
  flow: flow.optional(),
  demo: z.enum(['sync-queue', 'verification-states']).optional(),
});

const projectText = z.object({
  name: text,
  altName: text,
  tagline: text,
  teaser: text,
  summary: text,
  screens: z.array(z.object({ title: text, alt: text })).length(3),
  role: text,
  platforms: text,
  problem: z.array(text).min(1),
  responsibilities: z.array(text).min(1),
  challenges: z.array(challenge).min(1),
  architecture: text,
  outcome: z.array(text).min(1),
});

const link = z.object({ label: text, url });

const record = <K extends string, V extends z.ZodTypeAny>(keys: readonly K[], value: V) =>
  z.object(Object.fromEntries(keys.map((key) => [key, value])) as Record<K, V>).strict();

const localizedContent = z.object({
  profile: z.object({
    name: text,
    role: text,
    location: text,
    positioning: text,
    facts: z.array(text).min(1),
    aboutTitle: text,
    about: z.array(text).min(1),
    principles: z.array(z.object({ title: text, body: text })).min(1),
    contactTitle: text,
    contactBody: text,
    metaDescription: text.max(170),
  }),
  statusLabels: record(['live', 'in-development', 'source-available', 'paused'] as const, text),
  linkLabels: record(['store', 'source'] as const, text),
  projects: record(PROJECT_SLUGS, projectText),
  career: z.object({
    title: text,
    entry: z.object({
      title: text,
      mode: text,
      duration: text,
      summary: text,
      highlights: z.array(text).min(1),
    }),
    education: z.object({ school: text, degree: text, note: text }),
    milestones: z
      .array(
        z.object({
          year: text,
          title: text,
          body: text,
          projectSlug: z.enum(PROJECT_SLUGS).optional(),
        }),
      )
      .min(1),
  }),
  recognitions: z.array(z.object({ title: text, body: text, year: text, link: link.optional() })).min(1),
  expertise: record(EXPERTISE_IDS, z.object({ title: text, body: text })),
  writing: z.object({
    title: text,
    intro: text,
    topics: z.array(z.object({ title: text, body: text })).min(1),
    link,
  }),
});

export class ContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContentError';
  }
}

/** Checks one language file. Throws a readable error naming the bad field. */
export function validateContent(locale: string, content: LocalizedContent): LocalizedContent {
  const result = localizedContent.safeParse(content);
  if (result.success) return content;

  const problems = result.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new ContentError(`Content for "${locale}" is invalid:\n${problems}`);
}

/**
 * Checks that two language files describe the same things: the same number
 * of challenges, diagrams and demos per project, and the same list lengths.
 * A translation that falls behind fails the build instead of shipping.
 */
export function assertSameShape(
  [localeA, a]: [string, LocalizedContent],
  [localeB, b]: [string, LocalizedContent],
): void {
  const problems: string[] = [];
  const same = (what: string, x: unknown, y: unknown) => {
    if (x !== y) problems.push(`  - ${what}: ${localeA} has ${String(x)}, ${localeB} has ${String(y)}`);
  };

  for (const slug of PROJECT_SLUGS) {
    const pa = a.projects[slug];
    const pb = b.projects[slug];
    same(`${slug}.challenges`, pa.challenges.length, pb.challenges.length);
    pa.challenges.forEach((challengeA, index) => {
      const challengeB = pb.challenges[index];
      same(`${slug}.challenges[${index}].demo`, challengeA.demo, challengeB?.demo);
      same(`${slug}.challenges[${index}].flow`, challengeA.flow?.nodes.length, challengeB?.flow?.nodes.length);
    });
    same(`${slug}.screens`, pa.screens.length, pb.screens.length);
    same(`${slug}.outcome`, pa.outcome.length, pb.outcome.length);
    same(`${slug}.responsibilities`, pa.responsibilities.length, pb.responsibilities.length);
  }
  same('career.milestones', a.career.milestones.length, b.career.milestones.length);
  same('recognitions', a.recognitions.length, b.recognitions.length);
  same('writing.topics', a.writing.topics.length, b.writing.topics.length);
  same('profile.facts', a.profile.facts.length, b.profile.facts.length);
  same('profile.principles', a.profile.principles.length, b.profile.principles.length);

  if (problems.length > 0) {
    throw new ContentError(`The language files are out of step:\n${problems.join('\n')}`);
  }
}
