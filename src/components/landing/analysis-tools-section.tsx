import { SectionHeading } from "@/components/landing/section-heading";
import { landing } from "@/content/landing";

export function AnalysisToolsSection() {
  return (
    <section className="section wrap" id={landing.tools.id} aria-labelledby="tools-title">
      <SectionHeading id="tools-title">{landing.tools.title}</SectionHeading>
      <p className="lede">{landing.tools.intro}</p>
      <div className="tools-layout">
        {landing.tools.groups.map((group) => (
          <article className="tool-group" key={group.title}>
            <h3>{group.title}</h3>
            <ul>
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
