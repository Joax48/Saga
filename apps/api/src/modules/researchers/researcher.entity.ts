// Researcher entity interface — define the shape of a researcher record from the database.

// A profile is either an internal UCR member or an external co-author.
export type ProfileType = 'UCR' | 'EXTERNAL';

export interface Researcher {
  id: string;
  // Null for external profiles, which have no UCR_PROFILE row.
  idUcrProfile: string | null;
  baseUnit: string;
  name: string;
  firstSurname: string;
  secondSurname: string;
  ceaCategory: string | null;
  institution: string | null;
  country: string | null;
  orcidId: string | null;
  linkedin: string | null;
  researchGate: string | null;
  scopus: string | null;
  photoUrl: string | null;
  profileType: ProfileType;
}
