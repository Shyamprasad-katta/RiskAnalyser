import type { Facets, Person } from "./types";

export interface PeopleFilters {
  q?: string;
  team?: string;
  role?: string;
  skill?: string;
}

async function parseJsonOrThrow(res: Response): Promise<unknown> {
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message = (body as { error?: string } | null)?.error ?? res.statusText;
    throw new Error(message);
  }
  return body;
}

export async function fetchPeople(filters: PeopleFilters, signal?: AbortSignal): Promise<Person[]> {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.team) params.set("team", filters.team);
  if (filters.role) params.set("role", filters.role);
  if (filters.skill) params.set("skill", filters.skill);

  const res = await fetch(`/api/people?${params.toString()}`, { signal });
  const body = (await parseJsonOrThrow(res)) as { results: Person[] };
  return body.results;
}

export async function fetchFacets(signal?: AbortSignal): Promise<Facets> {
  const res = await fetch("/api/facets", { signal });
  return (await parseJsonOrThrow(res)) as Facets;
}
