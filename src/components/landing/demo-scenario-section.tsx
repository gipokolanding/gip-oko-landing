import { SectionHeading } from "@/components/landing/section-heading";
import { landing } from "@/content/landing";

export function DemoScenarioSection() {
  return (
    <section className="section wrap" aria-labelledby="demo-scenario-title">
      <div className="demo-layout">
        <SectionHeading id="demo-scenario-title">
          {landing.demoScenario.title}
        </SectionHeading>
        <div>
          <p className="lede">{landing.demoScenario.intro}</p>
          <ul className="demo-list">
            {landing.demoScenario.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
