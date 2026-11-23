export interface ContactDetails {
  email: string;
  /** E.164 form, used in tel: links. */
  phone: string;
  /** Human-readable form of the same number. */
  phoneDisplay: string;
  github: string;
  linkedin: string;
  /** Source repository of this site. */
  siteRepository: string;
}

export interface Principle {
  title: string;
  body: string;
}

export interface Profile {
  /** Name in the page's language. */
  name: string;
  nameLatin: string;
  nameArabic: string;
  role: string;
  location: string;
  /** The hero sentence: who he is and what he builds. */
  positioning: string;
  /** Short, factual lines shown beside the hero sentence. */
  facts: string[];
  aboutTitle: string;
  about: string[];
  principles: Principle[];
  contactTitle: string;
  contactBody: string;
  contact: ContactDetails;
  /** Used for the page description and social previews. */
  metaDescription: string;
}
