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
          {Array.from({ length: 8 }, (_, i) => (
            <line
              key={`rv${i}`}
              x1={10 + i * 18}
              y1="6"
              x2={10 + i * 18}
              y2="94"
              stroke="currentColor"
              strokeOpacity="0.16"
              strokeWidth="0.4"
            />
          ))}
          {Array.from({ length: 5 }, (_, i) => (
            <line
              key={`rh${i}`}
              x1="8"
              y1={12 + i * 18}
              x2="152"
              y2={12 + i * 18}
              stroke="currentColor"
              strokeOpacity="0.16"
              strokeWidth="0.4"
            />
          ))}
          <rect
            x="22"
            y="18"
            width="72"
            height="52"
            fill={accent}
            fillOpacity="0.14"
            stroke={accent}
            strokeWidth="1.1"
          />
          <rect
            x="58"
            y="32"
            width="72"
            height="48"
            fill={accent}
            fillOpacity="0.08"
            stroke="currentColor"
            strokeOpacity="0.45"
            strokeWidth="1"
          />
          <rect x="34" y="28" width="14" height="10" fill={accent} fillOpacity="0.35" />
          <rect x="70" y="46" width="18" height="12" fill={accent} fillOpacity="0.28" />
        </>
      ) : null}
      {motif === "vector" ? (
        <>
          <path
            d="M18 70 L36 28 L62 38 L84 18 L118 34 L148 24"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.4"
            strokeWidth="0.9"
          />
          <path
            d="M24 78 L48 44 L78 52 L70 82 Z"
            fill={accent}
            fillOpacity="0.16"
            stroke={accent}
            strokeWidth="1.1"
          />
          <path
            d="M86 70 L112 48 L142 62 L128 86 L96 84 Z"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.7"
            strokeWidth="1.1"
          />
          <circle cx="36" cy="28" r="2.6" fill={accent} />
          <circle cx="84" cy="18" r="2.6" fill={accent} />
          <circle cx="118" cy="34" r="2.6" fill="currentColor" fillOpacity="0.7" />
        </>
      ) : null}
      {motif === "relief" ? (
        <>
          <path d="M8 78 Q40 70 80 78 T152 74 L152 94 L8 94 Z" fill={accent} fillOpacity="0.1" />
          <path
            d="M14 70 C38 58 58 66 80 60 C104 54 126 62 146 52"
            fill="none"
            stroke={accent}
            strokeWidth="1.1"
          />
          <path
            d="M18 58 C42 48 62 54 82 46 C106 38 124 46 142 40"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.45"
            strokeWidth="0.9"
          />
          <path
            d="M26 46 C48 38 66 42 84 34 C104 26 120 34 136 30"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.32"
            strokeWidth="0.8"
          />
          <path
            d="M12 86 L28 64 L46 72 L70 44 L92 60 L114 36 L148 54"
            fill="none"
            stroke={accent}
            strokeWidth="1.15"
          />
        </>
      ) : null}
      {motif === "volume" ? (
        <>
          <path
            d="M28 62 L52 50 L76 62 L52 74 Z"
            fill={accent}
            fillOpacity="0.12"
            stroke={accent}
            strokeWidth="1.1"
          />
          <path d="M52 50 L52 28 L76 40 L76 62" fill="none" stroke={accent} strokeWidth="1.1" />
          <path d="M52 28 L28 40 L28 62" fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="0.9" />
          <path
            d="M86 70 L118 54 L146 66 L114 82 Z"
            fill={accent}
            fillOpacity="0.18"
            stroke={accent}
            strokeWidth="1.15"
          />
          <path d="M118 54 L118 30 L146 42 L146 66" fill="none" stroke={accent} strokeWidth="1.15" />
          <path
            d="M118 30 L86 46 L86 70"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.5"
            strokeWidth="0.95"
          />
          <path d="M70 84 L92 74 L110 82" fill="none" stroke="currentColor" strokeOpacity="0.28" strokeWidth="0.8" />
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
              <CardMotif motif={card.motif} accent={card.accent} />
              <div className="spatial-hover-card-wash" />
              <div className="spatial-hover-card-copy">
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
