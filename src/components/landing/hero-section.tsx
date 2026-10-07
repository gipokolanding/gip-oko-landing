import { DemoLink } from "@/components/landing/demo-link";
import { HeroModel } from "@/components/landing/hero-model";
import { landing } from "@/content/landing";
import type { DemoConfig } from "@/lib/demo-url";

type HeroSectionProps = {
  demo: DemoConfig;
};

export function HeroSection({ demo }: HeroSectionProps) {
  return (
    <section className="hero wrap" aria-labelledby="hero-title">
      <div className="hero-copy">
        <h1 id="hero-title">{landing.hero.title}</h1>
        <p className="hero-definition">{landing.hero.definition}</p>
        <p className="hero-result">{landing.hero.result}</p>
        <div className="hero-actions">
          <DemoLink demo={demo} />
        </div>
      </div>
      <div className="hero-visual" aria-hidden="true">
        <HeroModel />
      </div>
    </section>
  );
}
