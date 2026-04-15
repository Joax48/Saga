// Unit Detail View Model — represents the data that will be sent to the client when they request a unit detail page.

export interface UnitDetailViewModel {
  id: number;
  name: string;
  description: string;
  email: string;
  pageUrl: string;
  phoneNumber: string;
}
