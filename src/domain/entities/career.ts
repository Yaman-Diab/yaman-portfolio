import type { ProjectSlug } from './project';

export interface ExperienceEntry {
  title: string;
  mode: string;
  duration: string;
  summary: string;
  highlights: string[];
}

export interface Education {
  school: string;
  degree: string;
  note: string;
}

/** One dated step on the timeline. Links to a case study when it has one. */
export interface Milestone {
  year: string;
  title: string;
  body: string;
  projectSlug?: ProjectSlug;
}

export interface Career {
  title: string;
  entry: ExperienceEntry;
  education: Education;
  milestones: Milestone[];
}

export interface Recognition {
  title: string;
  body: string;
  year: string;
  link?: { label: string; url: string };
}

export interface ExpertiseGroup {
  /** Stable key: architecture, networking, offline, arabic, platform, quality, product. */
  id: string;
  title: string;
  body: string;
  tools: string[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

/** Short answers to what a recruiter or client asks first. */
export interface Faq {
  title: string;
  intro: string;
  items: FaqItem[];
  /** Where to read more. */
  link: { label: string; url: string };
}
