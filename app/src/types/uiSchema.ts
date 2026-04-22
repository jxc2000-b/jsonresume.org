/**
 * Editor UI configuration: *how* to render fields, not *what* values they hold.
 * Data lives in workspace JSON; these types are hand-written per section and
 * extended as the real form controls land.
 */

/** Hints for a single scalar or line field. */
export interface FieldUi {
  /** Preferred control; map to real components in the editor layer. */
  widget?: 'text' | 'textarea' | 'url' | 'date' | 'email' | 'tel';
  placeholder?: string;
  helpText?: string;
  /** Sort order in the form (ascending). */
  order?: number;
  hidden?: boolean;
}

/** Hints for one element of a string[] (e.g. a highlight line). */
export interface StringListItemUi {
  item?: FieldUi;
  /** Add-row button / empty-state copy. */
  addLabel?: string;
}

/** Base: optional section-level chrome only. */
export interface UiSchema {
  sectionHelp?: string;
}

// ── Section subtypes (field names mirror resume JSON, including extras like `website` on basics). ─

export interface BasicsUiSchema extends UiSchema {
  name?: FieldUi;
  label?: FieldUi;
  image?: FieldUi;
  email?: FieldUi;
  phone?: FieldUi;
  url?: FieldUi;
  website?: FieldUi;
  summary?: FieldUi;
  location?: {
    address?: FieldUi;
    postalCode?: FieldUi;
    city?: FieldUi;
    countryCode?: FieldUi;
    region?: FieldUi;
  };
  /** Template for one row in `profiles[]`. */
  profiles?: {
    item?: {
      network?: FieldUi;
      username?: FieldUi;
      url?: FieldUi;
    };
    addLabel?: string;
  };
}

export interface WorkUiSchema extends UiSchema {
  name?: FieldUi;
  position?: FieldUi;
  url?: FieldUi;
  startDate?: FieldUi;
  endDate?: FieldUi;
  summary?: FieldUi;
  highlights?: StringListItemUi;
}

export interface VolunteerUiSchema extends UiSchema {
  organization?: FieldUi;
  position?: FieldUi;
  url?: FieldUi;
  startDate?: FieldUi;
  endDate?: FieldUi;
  summary?: FieldUi;
  highlights?: StringListItemUi;
}

export interface EducationUiSchema extends UiSchema {
  institution?: FieldUi;
  url?: FieldUi;
  area?: FieldUi;
  studyType?: FieldUi;
  startDate?: FieldUi;
  endDate?: FieldUi;
  score?: FieldUi;
  courses?: StringListItemUi;
}

export interface AwardsUiSchema extends UiSchema {
  title?: FieldUi;
  date?: FieldUi;
  awarder?: FieldUi;
  summary?: FieldUi;
}

export interface CertificatesUiSchema extends UiSchema {
  name?: FieldUi;
  date?: FieldUi;
  issuer?: FieldUi;
  url?: FieldUi;
}

export interface PublicationsUiSchema extends UiSchema {
  name?: FieldUi;
  publisher?: FieldUi;
  releaseDate?: FieldUi;
  url?: FieldUi;
  summary?: FieldUi;
}

export interface SkillsUiSchema extends UiSchema {
  name?: FieldUi;
  level?: FieldUi;
  keywords?: StringListItemUi;
}

export interface LanguagesUiSchema extends UiSchema {
  language?: FieldUi;
  fluency?: FieldUi;
}

export interface InterestsUiSchema extends UiSchema {
  name?: FieldUi;
  keywords?: StringListItemUi;
}

export interface ReferencesUiSchema extends UiSchema {
  name?: FieldUi;
  reference?: FieldUi;
}

export interface ProjectsUiSchema extends UiSchema {
  name?: FieldUi;
  startDate?: FieldUi;
  endDate?: FieldUi;
  description?: FieldUi;
  highlights?: StringListItemUi;
  url?: FieldUi;
}

/** Discriminated map of all section UIs (for a registry or provider). */
export type SectionId =
  | 'basics'
  | 'work'
  | 'volunteer'
  | 'education'
  | 'awards'
  | 'certificates'
  | 'publications'
  | 'skills'
  | 'languages'
  | 'interests'
  | 'references'
  | 'projects';

export type SectionUiById = {
  basics: BasicsUiSchema;
  work: WorkUiSchema;
  volunteer: VolunteerUiSchema;
  education: EducationUiSchema;
  awards: AwardsUiSchema;
  certificates: CertificatesUiSchema;
  publications: PublicationsUiSchema;
  skills: SkillsUiSchema;
  languages: LanguagesUiSchema;
  interests: InterestsUiSchema;
  references: ReferencesUiSchema;
  projects: ProjectsUiSchema;
};

/** Use where a prop accepts any one section’s UI config. */
export type AnySectionUiSchema = SectionUiById[SectionId];
