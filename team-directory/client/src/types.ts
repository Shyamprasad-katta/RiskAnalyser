export interface Person {
  id: string;
  name: string;
  team: string;
  role: string;
  skills: string[];
  email: string;
  location: string;
}

export interface Facets {
  teams: string[];
  roles: string[];
  skills: string[];
}
