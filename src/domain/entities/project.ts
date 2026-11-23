export const PROJECT_SLUGS = ['engleazia', 'wafir', 'maan', 'mishwar'] as const;

export type ProjectSlug = (typeof PROJECT_SLUGS)[number];

/** Where the project stands today. Shown as a pill next to the project. */
export type ProjectStatus = 'live' | 'in-development' | 'source-available' | 'paused';

/** Interactive demos a case study can embed. Each maps to one component. */
export type DemoKind = 'sync-queue' | 'verification-states';

export interface FlowNode {
  label: string;
  detail?: string;
}

/** A left-to-right (or right-to-left) chain of steps drawn as a diagram. */
export interface Flow {
  nodes: FlowNode[];
  caption?: string;
}

/** One hard problem inside a project, and how it was solved. */
export interface Challenge {
  title: string;
  body: string;
  flow?: Flow;
  demo?: DemoKind;
}

export interface ProjectLink {
  kind: 'store' | 'source';
  label: string;
  url: string;
}

export interface Project {
  slug: ProjectSlug;
  name: string;
  /** The app's name in the other script (Arabic on the English page, Latin on the Arabic one). */
  altName: string;
  year: string;
  status: ProjectStatus;
  statusLabel: string;
  /** One line under the name in the project list. */
  tagline: string;
  /** The hardest part, in one line. Revealed on hover in the list. */
  teaser: string;
  summary: string;
  role: string;
  platforms: string;
  problem: string[];
  responsibilities: string[];
  challenges: Challenge[];
  architecture: string;
  stack: string[];
  outcome: string[];
  links: ProjectLink[];
}
