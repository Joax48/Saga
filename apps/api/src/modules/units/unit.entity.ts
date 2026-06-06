export interface Unit {
  id: number;
  isPartOf: number | null;
  name: string;
  description: string;
  email: string;
  pageUrl: string;
  logoSvgContent: string | null;
  logoUnitAcronym: string | null;
  phoneNumber: string;
}
