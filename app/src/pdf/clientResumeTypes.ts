/**
 * Normalized slices of JSON Resume used by the client-side PDF renderer.
 *
 * These types are a *layout-facing* view of the workspace `master`. They are
 * intentionally narrower than the JSON Resume schema (no extras, all strings),
 * and arrays are always present so the renderer can iterate without guards.
 */

export interface ClientBasicsLocation {
  city?: string;
  region?: string;
  countryCode?: string;
}

export interface ClientProfile {
  network?: string;
  username?: string;
  url?: string;
}

export interface ClientBasics {
  name?: string;
  label?: string;
  email?: string;
  phone?: string;
  url?: string;
  summary?: string;
  location?: ClientBasicsLocation;
  profiles: ClientProfile[];
}

export interface ClientWork {
  name?: string;
  position?: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  summary?: string;
  highlights: string[];
}

export interface ClientVolunteer {
  organization?: string;
  position?: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  summary?: string;
  highlights: string[];
}

export interface ClientEducation {
  institution?: string;
  area?: string;
  studyType?: string;
  startDate?: string;
  endDate?: string;
  score?: string;
  courses: string[];
}

export interface ClientSkill {
  name?: string;
  level?: string;
  keywords: string[];
}

export interface ClientAward {
  title?: string;
  date?: string;
  awarder?: string;
  summary?: string;
}

export interface ClientCertificate {
  name?: string;
  date?: string;
  issuer?: string;
  url?: string;
}

export interface ClientPublication {
  name?: string;
  publisher?: string;
  releaseDate?: string;
  url?: string;
  summary?: string;
}

export interface ClientLanguage {
  language?: string;
  fluency?: string;
}

export interface ClientInterest {
  name?: string;
  keywords: string[];
}

export interface ClientReference {
  name?: string;
  reference?: string;
}

export interface ClientProject {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  url?: string;
  highlights: string[];
}

/** Structured resume after parsing `workspace.master`. */
export interface ClientResume {
  basics: ClientBasics;
  work: ClientWork[];
  volunteer: ClientVolunteer[];
  education: ClientEducation[];
  awards: ClientAward[];
  certificates: ClientCertificate[];
  publications: ClientPublication[];
  skills: ClientSkill[];
  languages: ClientLanguage[];
  interests: ClientInterest[];
  references: ClientReference[];
  projects: ClientProject[];
}
