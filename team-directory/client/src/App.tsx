import { useEffect, useMemo, useState } from "react";
import { fetchFacets } from "./api";
import { FilterSelect } from "./components/FilterSelect";
import { PersonCard } from "./components/PersonCard";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import { usePeopleSearch } from "./hooks/usePeopleSearch";
import type { Facets } from "./types";
import "./App.css";

const EMPTY_FACETS: Facets = { teams: [], roles: [], skills: [] };

export default function App() {
  const [query, setQuery] = useState("");
  const [team, setTeam] = useState("");
  const [role, setRole] = useState("");
  const [skill, setSkill] = useState("");
  const [facets, setFacets] = useState<Facets>(EMPTY_FACETS);
  const [facetsError, setFacetsError] = useState<string | null>(null);

  const debouncedQuery = useDebouncedValue(query, 250);
  const filters = useMemo(
    () => ({ q: debouncedQuery, team, role, skill }),
    [debouncedQuery, team, role, skill],
  );
  const { people, isLoading, error } = usePeopleSearch(filters);

  useEffect(() => {
    const controller = new AbortController();
    fetchFacets(controller.signal)
      .then(setFacets)
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setFacetsError(err instanceof Error ? err.message : "Could not load filters.");
      });
    return () => controller.abort();
  }, []);

  const hasActiveFilters = Boolean(query || team || role || skill);

  function clearFilters() {
    setQuery("");
    setTeam("");
    setRole("");
    setSkill("");
  }

  return (
    <div className="page">
      <header className="page__header">
        <h1>Team Directory</h1>
        <p>Search and browse everyone across the company.</p>
      </header>

      <div className="controls">
        <input
          type="search"
          className="search-input"
          placeholder="Search by name, team, role, or skill…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search the team directory"
        />
        <div className="filters">
          <FilterSelect label="Team" value={team} options={facets.teams} onChange={setTeam} />
          <FilterSelect label="Role" value={role} options={facets.roles} onChange={setRole} />
          <FilterSelect label="Skill" value={skill} options={facets.skills} onChange={setSkill} />
          {hasActiveFilters && (
            <button type="button" className="clear-button" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      </div>

      {facetsError && <p className="banner banner--error">{facetsError}</p>}

      <main>
        {isLoading && <p className="status">Loading…</p>}
        {error && <p className="status status--error">{error}</p>}
        {!isLoading && !error && people.length === 0 && (
          <p className="status">No one matches your search. Try different filters.</p>
        )}
        {!isLoading && !error && people.length > 0 && (
          <>
            <p className="results-count">
              {people.length} {people.length === 1 ? "person" : "people"}
            </p>
            <div className="person-grid">
              {people.map((person) => (
                <PersonCard key={person.id} person={person} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
