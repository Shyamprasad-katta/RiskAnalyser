# Team Directory

A small, searchable directory of people: name, team, role, skills, email, and
location. Built with TypeScript end to end — an Express API and a React
(Vite) frontend.

## Running it

Two dev servers, in two terminals:

```bash
# Terminal 1 — API on http://localhost:3001
cd team-directory/server
npm install
npm run dev

# Terminal 2 — UI on http://localhost:5173
cd team-directory/client
npm install
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api/*` to the
Express server, so no CORS setup is needed locally (`cors` is still enabled
server-side for completeness).

To build for production:

```bash
cd team-directory/server && npm run build && npm start   # serves the API on :3001
cd team-directory/client && npm run build                # emits static files to dist/
```

The client build is static and can be served by any static host / CDN and
pointed at the API via a reverse proxy.

## API

| Method | Path               | Description                                              |
| ------ | ------------------ | --------------------------------------------------------- |
| GET    | `/api/people`       | List/search people. Query params: `q`, `team`, `role`, `skill` (all optional, combined with AND). |
| GET    | `/api/people/:id`    | Fetch a single person.                                    |
| GET    | `/api/facets`        | Distinct teams/roles/skills, used to populate filter dropdowns. |
| GET    | `/api/health`        | Liveness check.                                            |

`q` does a case-insensitive substring match across name, team, role, and
skills. `team`/`role`/`skill` are exact (case-insensitive) matches, useful as
dropdown filters. All requests get an `X-Request-Id` header and a structured
access log line for basic observability.

## Data

People are held in an in-memory seed array (`server/src/data/people.ts`) —
18 people across 6 teams — instead of a database, since the task is a small
directory, not a persistence exercise. Swapping in a real store later just
means replacing that module behind the same `searchPeople` function.

## Testing

```bash
cd team-directory/server
npm test
```

Covers the search/filter logic (`search.test.ts`): free-text matching,
case/whitespace normalization, exact filters, combined filters (AND
semantics), and the empty-result case.

## Assumptions

- "Searchable and browsable" means: a free-text box plus exact filters for
  team/role/skill, all combinable — no auth, editing, or pagination needed
  for a directory this size.
- Data can be mocked/seeded rather than backed by a real database.
- No org chart / manager relationships were asked for, so the model stays
  flat.

## Tradeoffs

- **In-memory data, no persistence.** Fastest to build and matches the
  brief's list of fields; a real deployment would back this with a database
  and an admin flow for edits, neither of which was in scope here.
- **No pagination.** With 18 seed people, rendering everything is simpler
  and faster than adding paging/virtualization; would revisit past a few
  hundred records.
- **Exact-match filters, fuzzy free text.** Dropdowns for team/role/skill
  stay predictable (they're populated from real values), while the search
  box tolerates typos/partial words via substring matching.
- **No React Router.** A single view doesn't need routing yet; if
  person-detail pages were added, that'd be the first thing to introduce.

## What I'd improve with more time

- Highlight matching text in results, and support multi-select filters
  (e.g. more than one skill at once).
- Paginate/virtualize the list once the directory grows.
- Add `/api/people/:id` detail view in the UI with more profile info.
- Persist data in a real database and add basic write endpoints
  (create/update a person) with validation.
- Add frontend component tests (e.g. Testing Library) alongside the
  existing backend search tests.
