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

/**
 * A processed screenshot. The data layer hands over the image object its
 * build tool produced, unchanged, so the presentation layer can optimise it.
 */
export interface ScreenImage {
  src: string;
  width: number;
  height: number;
}

/** One of the app's main screens. `image` is empty until a screenshot is added. */
export interface Screen {
  title: string;
  alt: string;
  /** Credit for someone else's material that appears in the screenshot, such as a test video. */
  credit?: string;
  image?: ScreenImage;
}

/**
 * The app's own colours and logo. A case study opens in them, the way the
 * app opens on a phone.
 */
export interface ProjectBrand {
  /** The splash colour. */
  primary: string;
  /** A darker shade of the splash colour, for depth. */
  deep: string;
  /** The app's second colour: buttons, highlights. */
  accent: string;
  /** Text and logo colour on the splash. */
  onPrimary: string;
  /** "wordmark" sits large across the splash; "icon" sits in a rounded tile. */
  logoKind: 'wordmark' | 'icon' | 'none';
  /** Empty until a logo file is added (see screens.ts). */
  logo?: ScreenImage;
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
  /** Three main screens, in the order they are shown. */
  screens: Screen[];
  role: string;
  platforms: string;
  problem: string[];
  responsibilities: string[];
  challenges: Challenge[];
  architecture: string;
  stack: string[];
  outcome: string[];
  links: ProjectLink[];
  brand: ProjectBrand;
}
