import type {
  ClientAward,
  ClientBasics,
  ClientCertificate,
  ClientEducation,
  ClientInterest,
  ClientLanguage,
  ClientProfile,
  ClientProject,
  ClientPublication,
  ClientReference,
  ClientResume,
  ClientSkill,
  ClientVolunteer,
  ClientWork,
} from './clientResumeTypes';

function isRecord(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === 'object' && !Array.isArray(x);
}

function str(x: unknown): string | undefined {
  return typeof x === 'string' && x.length > 0 ? x : undefined;
}

function strArray(x: unknown): string[] {
  if (!Array.isArray(x)) return [];
  return x.filter((v): v is string => typeof v === 'string');
}

function recordArray(x: unknown): Record<string, unknown>[] {
  if (!Array.isArray(x)) return [];
  return x.filter(isRecord);
}

function parseBasics(raw: unknown): ClientBasics {
  if (!isRecord(raw)) return { profiles: [] };
  let location: ClientBasics['location'];
  if (isRecord(raw.location)) {
    const loc = {
      city: str(raw.location.city),
      region: str(raw.location.region),
      countryCode: str(raw.location.countryCode),
    };
    if (loc.city || loc.region || loc.countryCode) location = loc;
  }
  const profiles: ClientProfile[] = recordArray(raw.profiles).map((p) => ({
    network: str(p.network),
    username: str(p.username),
    url: str(p.url),
  }));
  return {
    name: str(raw.name),
    label: str(raw.label),
    email: str(raw.email),
    phone: str(raw.phone),
    url: str(raw.url),
    summary: str(raw.summary),
    location,
    profiles,
  };
}

function parseWork(rows: Record<string, unknown>[]): ClientWork[] {
  return rows.map((r) => ({
    name: str(r.name),
    position: str(r.position),
    url: str(r.url),
    startDate: str(r.startDate),
    endDate: str(r.endDate),
    summary: str(r.summary),
    highlights: strArray(r.highlights),
  }));
}

function parseVolunteer(rows: Record<string, unknown>[]): ClientVolunteer[] {
  return rows.map((r) => ({
    organization: str(r.organization),
    position: str(r.position),
    url: str(r.url),
    startDate: str(r.startDate),
    endDate: str(r.endDate),
    summary: str(r.summary),
    highlights: strArray(r.highlights),
  }));
}

function parseEducation(rows: Record<string, unknown>[]): ClientEducation[] {
  return rows.map((r) => ({
    institution: str(r.institution),
    area: str(r.area),
    studyType: str(r.studyType),
    startDate: str(r.startDate),
    endDate: str(r.endDate),
    score: str(r.score),
    courses: strArray(r.courses),
  }));
}

function parseSkills(rows: Record<string, unknown>[]): ClientSkill[] {
  return rows.map((r) => ({
    name: str(r.name),
    level: str(r.level),
    keywords: strArray(r.keywords),
  }));
}

function parseAwards(rows: Record<string, unknown>[]): ClientAward[] {
  return rows.map((r) => ({
    title: str(r.title),
    date: str(r.date),
    awarder: str(r.awarder),
    summary: str(r.summary),
  }));
}

function parseCerts(rows: Record<string, unknown>[]): ClientCertificate[] {
  return rows.map((r) => ({
    name: str(r.name),
    date: str(r.date),
    issuer: str(r.issuer),
    url: str(r.url),
  }));
}

function parsePubs(rows: Record<string, unknown>[]): ClientPublication[] {
  return rows.map((r) => ({
    name: str(r.name),
    publisher: str(r.publisher),
    releaseDate: str(r.releaseDate),
    url: str(r.url),
    summary: str(r.summary),
  }));
}

function parseLanguages(rows: Record<string, unknown>[]): ClientLanguage[] {
  return rows.map((r) => ({
    language: str(r.language),
    fluency: str(r.fluency),
  }));
}

function parseInterests(rows: Record<string, unknown>[]): ClientInterest[] {
  return rows.map((r) => ({
    name: str(r.name),
    keywords: strArray(r.keywords),
  }));
}

function parseReferences(rows: Record<string, unknown>[]): ClientReference[] {
  return rows.map((r) => ({
    name: str(r.name),
    reference: str(r.reference),
  }));
}

function parseProjects(rows: Record<string, unknown>[]): ClientProject[] {
  return rows.map((r) => ({
    name: str(r.name),
    description: str(r.description),
    startDate: str(r.startDate),
    endDate: str(r.endDate),
    url: str(r.url),
    highlights: strArray(r.highlights),
  }));
}

/**
 * Loose, defensive parse of workspace `master` into a predictable shape for
 * PDF layout. Anything missing or wrongly-typed is dropped; the renderer
 * never has to type-guard.
 */
export function parseMasterToClientResume(master: Record<string, unknown>): ClientResume {
  return {
    basics: parseBasics(master.basics),
    work: parseWork(recordArray(master.work)),
    volunteer: parseVolunteer(recordArray(master.volunteer)),
    education: parseEducation(recordArray(master.education)),
    awards: parseAwards(recordArray(master.awards)),
    certificates: parseCerts(recordArray(master.certificates)),
    publications: parsePubs(recordArray(master.publications)),
    skills: parseSkills(recordArray(master.skills)),
    languages: parseLanguages(recordArray(master.languages)),
    interests: parseInterests(recordArray(master.interests)),
    references: parseReferences(recordArray(master.references)),
    projects: parseProjects(recordArray(master.projects)),
  };
}
