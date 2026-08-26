import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import { people } from "./data/people.js";
import { searchPeople } from "./search.js";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

app.use(cors());
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  const requestId = randomUUID();
  const start = Date.now();
  res.setHeader("X-Request-Id", requestId);
  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(`[${requestId}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`);
  });
  next();
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.get("/api/people", (req: Request, res: Response) => {
  const { q, team, role, skill } = req.query;

  for (const [key, value] of Object.entries({ q, team, role, skill })) {
    if (value !== undefined && typeof value !== "string") {
      res.status(400).json({ error: `Query parameter "${key}" must be a single string value.` });
      return;
    }
  }

  const results = searchPeople(people, {
    q: q as string | undefined,
    team: team as string | undefined,
    role: role as string | undefined,
    skill: skill as string | undefined,
  });

  res.json({ results, total: results.length });
});

app.get("/api/people/:id", (req: Request, res: Response) => {
  const person = people.find((p) => p.id === req.params.id);
  if (!person) {
    res.status(404).json({ error: `No person found with id "${req.params.id}".` });
    return;
  }
  res.json(person);
});

app.get("/api/facets", (_req: Request, res: Response) => {
  const teams = [...new Set(people.map((p) => p.team))].sort();
  const roles = [...new Set(people.map((p) => p.role))].sort();
  const skills = [...new Set(people.flatMap((p) => p.skills))].sort();
  res.json({ teams, roles, skills });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Team directory API listening on http://localhost:${PORT}`);
});
