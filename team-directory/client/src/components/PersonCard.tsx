import type { Person } from "../types";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function PersonCard({ person }: { person: Person }) {
  return (
    <article className="person-card">
      <div className="person-card__avatar" aria-hidden="true">
        {initials(person.name)}
      </div>
      <div className="person-card__body">
        <h3 className="person-card__name">{person.name}</h3>
        <p className="person-card__role">
          {person.role} · {person.team}
        </p>
        <p className="person-card__meta">
          <a href={`mailto:${person.email}`}>{person.email}</a> · {person.location}
        </p>
        <ul className="person-card__skills" aria-label={`Skills for ${person.name}`}>
          {person.skills.map((skill) => (
            <li key={skill} className="skill-tag">
              {skill}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
