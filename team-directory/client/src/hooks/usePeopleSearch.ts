import { useEffect, useState } from "react";
import { fetchPeople, type PeopleFilters } from "../api";
import type { Person } from "../types";

interface PeopleSearchState {
  people: Person[];
  isLoading: boolean;
  error: string | null;
}

export function usePeopleSearch(filters: PeopleFilters): PeopleSearchState {
  const [state, setState] = useState<PeopleSearchState>({ people: [], isLoading: true, error: null });

  useEffect(() => {
    const controller = new AbortController();

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    fetchPeople(filters, controller.signal)
      .then((people) => setState({ people, isLoading: false, error: null }))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message = err instanceof Error ? err.message : "Something went wrong.";
        setState({ people: [], isLoading: false, error: message });
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q, filters.team, filters.role, filters.skill]);

  return state;
}
