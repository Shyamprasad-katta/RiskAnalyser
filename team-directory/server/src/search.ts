import type { Person } from "./types.js";

export interface PersonQuery {
  q?: string;
  team?: string;
  role?: string;
  skill?: string;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function searchPeople(people: Person[], query: PersonQuery): Person[] {
  const q = query.q ? normalize(query.q) : "";
  const team = query.team ? normalize(query.team) : "";
  const role = query.role ? normalize(query.role) : "";
  const skill = query.skill ? normalize(query.skill) : "";

  return people.filter((person) => {
    if (team && normalize(person.team) !== team) return false;
    if (role && normalize(person.role) !== role) return false;
    if (skill && !person.skills.some((s) => normalize(s) === skill)) return false;

    if (q) {
      const haystack = [person.name, person.team, person.role, ...person.skills]
        .map(normalize)
        .join(" ");
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}
