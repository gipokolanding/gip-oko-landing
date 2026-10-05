import { SectionHeading } from "@/components/landing/section-heading";
import { landing } from "@/content/landing";

export function CompatibilitySection() {
  return (
    <section className="section wrap" aria-labelledby="compat-title">
      <SectionHeading id="compat-title">{landing.compatibility.title}</SectionHeading>
      <p className="lede">{landing.compatibility.intro}</p>
      <ul className="compat-list">
        {landing.compatibility.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
