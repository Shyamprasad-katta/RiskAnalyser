import { describe, expect, it } from "vitest";
import { searchPeople } from "../search.js";
import type { Person } from "../types.js";

const people: Person[] = [
  { id: "1", name: "Ava Thompson", team: "Engineering", role: "Backend Engineer", skills: ["Go", "PostgreSQL"], email: "ava@example.com", location: "Remote" },
  { id: "2", name: "Liam Chen", team: "Engineering", role: "Frontend Engineer", skills: ["TypeScript", "React"], email: "liam@example.com", location: "NYC" },
  { id: "3", name: "Emma Wilson", team: "Design", role: "Product Designer", skills: ["Figma"], email: "emma@example.com", location: "SF" },
];

describe("searchPeople", () => {
  it("returns everyone when no filters are given", () => {
    expect(searchPeople(people, {})).toHaveLength(3);
  });

  it("filters by free-text query across name, team, role, and skills", () => {
    expect(searchPeople(people, { q: "react" }).map((p) => p.id)).toEqual(["2"]);
    expect(searchPeople(people, { q: "design" }).map((p) => p.id)).toEqual(["3"]);
  });

  it("is case-insensitive and trims whitespace", () => {
    expect(searchPeople(people, { q: "  GO  " }).map((p) => p.id)).toEqual(["1"]);
  });

  it("filters by exact team", () => {
    expect(searchPeople(people, { team: "Engineering" })).toHaveLength(2);
  });

  it("filters by exact role", () => {
    expect(searchPeople(people, { role: "Product Designer" }).map((p) => p.id)).toEqual(["3"]);
  });

  it("filters by exact skill", () => {
    expect(searchPeople(people, { skill: "TypeScript" }).map((p) => p.id)).toEqual(["2"]);
  });

  it("combines filters with AND semantics", () => {
    expect(searchPeople(people, { team: "Engineering", skill: "Figma" })).toHaveLength(0);
  });

  it("returns nothing when nothing matches", () => {
    expect(searchPeople(people, { q: "nonexistent" })).toHaveLength(0);
  });
});
