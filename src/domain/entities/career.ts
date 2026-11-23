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
  title: string;
  body: string;
  tools: string[];
}

export interface WritingTopic {
  title: string;
  body: string;
}

export interface Writing {
  title: string;
  intro: string;
  topics: WritingTopic[];
  link: { label: string; url: string };
}
