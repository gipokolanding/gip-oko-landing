import { SectionHeading } from "@/components/landing/section-heading";
import { landing } from "@/content/landing";

const MOTIFS = ["raster", "vector", "relief", "volume"] as const;
const ACCENTS = ["#58e8f4", "#7aa8e8", "#7466c9", "#8df2fa"] as const;

type Motif = (typeof MOTIFS)[number];

const cards = landing.spatial.groups.map((group, index) => ({
  title: group.title,
  body: group.body,
  accent: ACCENTS[index] ?? ACCENTS[0],
  motif: MOTIFS[index] ?? MOTIFS[0],
}));

function CardMotif({ motif, accent }: { motif: Motif; accent: string }) {
  return (
    <svg
      className="spatial-hover-card-motif"
      viewBox="0 0 160 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {motif === "raster" ? (
        <>
          {Array.from({ length: 14 }, (_, i) => (
            <line
              key={`rv${i}`}
              x1={6 + i * 11}
              y1="4"
              x2={6 + i * 11}
              y2="96"
              stroke="currentColor"
              strokeOpacity="0.14"
              strokeWidth="0.35"
            />
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <line
              key={`rh${i}`}
              x1="4"
              y1={8 + i * 10}
              x2="156"
              y2={8 + i * 10}
              stroke="currentColor"
              strokeOpacity="0.14"
              strokeWidth="0.35"
            />
          ))}
          <rect
            x="18"
            y="16"
            width="78"
            height="54"
            fill={accent}
            fillOpacity="0.12"
            stroke={accent}
            strokeWidth="1.1"
          />
          <rect x="24" y="22" width="10" height="8" fill={accent} fillOpacity="0.42" />
          <rect x="36" y="22" width="10" height="8" fill={accent} fillOpacity="0.22" />
          <rect x="48" y="32" width="10" height="8" fill={accent} fillOpacity="0.34" />
          <rect x="60" y="42" width="10" height="8" fill={accent} fillOpacity="0.2" />
          <rect x="36" y="42" width="10" height="8" fill={accent} fillOpacity="0.5" />
          <rect
            x="64"
            y="30"
            width="78"
            height="50"
            fill={accent}
            fillOpacity="0.06"
            stroke="currentColor"
            strokeOpacity="0.5"
            strokeWidth="1"
          />
          <rect x="88" y="44" width="14" height="10" fill={accent} fillOpacity="0.28" />
          <rect x="104" y="54" width="14" height="10" fill={accent} fillOpacity="0.18" />
          <line
            x1="18"
            y1="48"
            x2="96"
            y2="48"
            stroke={accent}
            strokeWidth="0.7"
            strokeOpacity="0.7"
          />
        </>
      ) : null}
      {motif === "vector" ? (
        <>
          <path
            d="M14 76 L30 42 L52 50 L74 22 L102 38 L128 28 L150 44"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.35"
            strokeWidth="0.85"
            strokeDasharray="2.4 1.8"
          />
          <path
            d="M22 82 L44 48 L72 56 L64 86 Z"
            fill={accent}
            fillOpacity="0.18"
            stroke={accent}
            strokeWidth="1.15"
          />
          <path
            d="M84 72 L114 46 L146 60 L132 86 L96 84 Z"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.75"
            strokeWidth="1.1"
          />
          <circle cx="30" cy="42" r="2.4" fill={accent} />
          <circle cx="74" cy="22" r="2.4" fill={accent} />
          <circle cx="102" cy="38" r="2.2" fill="currentColor" fillOpacity="0.7" />
          <circle cx="128" cy="28" r="2.2" fill="currentColor" fillOpacity="0.55" />
          <circle cx="44" cy="48" r="1.8" fill={accent} />
          <circle cx="114" cy="46" r="1.8" fill="currentColor" fillOpacity="0.7" />
        </>
      ) : null}
      {motif === "relief" ? (
        <>
          <path d="M6 82 Q40 74 80 82 T154 78 L154 96 L6 96 Z" fill={accent} fillOpacity="0.16" />
          <path d="M8 70 Q42 60 82 68 T152 62 L152 82 Q80 86 8 82 Z" fill={accent} fillOpacity="0.08" />
          <path
            d="M12 78 C38 70 58 76 80 72 C108 66 128 72 148 66"
            fill="none"
            stroke={accent}
            strokeWidth="1.05"
          />
          <path
            d="M16 66 C40 56 62 64 82 58 C108 50 128 58 146 50"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.5"
            strokeWidth="0.9"
          />
          <path
            d="M22 54 C44 46 64 52 84 44 C106 36 124 44 140 38"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.35"
            strokeWidth="0.8"
          />
          <path
            d="M30 44 C50 36 68 40 86 32 C104 24 120 32 134 28"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.22"
            strokeWidth="0.7"
          />
          <path
            d="M10 88 L26 68 L44 76 L68 46 L90 62 L112 34 L148 52"
            fill="none"
            stroke={accent}
            strokeWidth="1.15"
          />
        </>
      ) : null}
      {motif === "volume" ? (
        <>
          <path d="M8 86 L152 86" stroke="currentColor" strokeOpacity="0.18" strokeWidth="0.7" />
          <path
            d="M24 66 L48 54 L72 66 L48 78 Z"
            fill={accent}
            fillOpacity="0.12"
            stroke={accent}
            strokeWidth="1.05"
          />
          <path d="M48 54 L48 30 L72 42 L72 66" fill="none" stroke={accent} strokeWidth="1.05" />
          <path
            d="M48 30 L24 42 L24 66"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.45"
            strokeWidth="0.9"
          />
          <path
            d="M86 72 L118 56 L148 68 L116 84 Z"
            fill={accent}
            fillOpacity="0.18"
            stroke={accent}
            strokeWidth="1.15"
          />
          <path d="M118 56 L118 28 L148 40 L148 68" fill="none" stroke={accent} strokeWidth="1.15" />
          <path
            d="M118 28 L86 44 L86 72"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.5"
            strokeWidth="0.95"
          />
          <path
            d="M70 70 A16 10 0 0 1 102 70 L102 78 A16 10 0 0 1 70 78 Z"
            fill={accent}
            fillOpacity="0.1"
            stroke={accent}
            strokeWidth="0.95"
          />
          <path d="M70 70 A16 10 0 0 1 102 70" fill="none" stroke="currentColor" strokeOpacity="0.35" />
        </>
      ) : null}
    </svg>
  );
}

export function SpatialContextSection() {
  return (
    <section className="section wrap" id={landing.spatial.id} aria-labelledby="spatial-title">
      <div className="spatial-layout">
        <div>
          <SectionHeading id="spatial-title">{landing.spatial.title}</SectionHeading>
          <p className="lede">{landing.spatial.intro}</p>
          <p className="copy">{landing.spatial.closing}</p>
        </div>
        <div className="spatial-hover-cards" role="list">
          {cards.map((card) => (
            <article
              key={card.title}
              role="listitem"
              tabIndex={0}
              className="spatial-hover-card"
            >
              <div className="spatial-hover-card-core">
                <CardMotif motif={card.motif} accent={card.accent} />
                <div className="spatial-hover-card-wash" />
                <div className="spatial-hover-card-copy">
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
