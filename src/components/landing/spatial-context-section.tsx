import { SectionHeading } from "@/components/landing/section-heading";
import { landing } from "@/content/landing";

export function SpatialContextSection() {
  return (
    <section className="section wrap" id={landing.spatial.id} aria-labelledby="spatial-title">
      <div className="spatial-layout">
        <div>
          <SectionHeading id="spatial-title">{landing.spatial.title}</SectionHeading>
          <p className="lede">{landing.spatial.intro}</p>
          <p className="copy">{landing.spatial.closing}</p>
        </div>
        <div className="spatial-groups">
          {landing.spatial.groups.map((group) => (
            <article key={group.title}>
              <h3>{group.title}</h3>
              <p>{group.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
