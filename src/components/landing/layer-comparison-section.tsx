import { SectionHeading } from "@/components/landing/section-heading";
import { landing } from "@/content/landing";

export function LayerComparisonSection() {
  return (
    <section className="section wrap" aria-labelledby="comparison-title">
      <div className="comparison-layout">
        <div>
          <SectionHeading id="comparison-title">
            {landing.comparison.title}
          </SectionHeading>
          <p className="lede">{landing.comparison.body}</p>
          <ul className="comparison-points">
            {landing.comparison.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
        <figure>
          <div className="comparison-evidence" aria-hidden="true">
            <div className="comparison-pane">
              <span>{landing.comparison.materialA}</span>
            </div>
            <div className="comparison-pane">
              <span>{landing.comparison.materialB}</span>
            </div>
          </div>
          <figcaption className="comparison-caption">
            {landing.comparison.synthetic}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
