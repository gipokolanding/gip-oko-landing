import { DemoLink } from "@/components/landing/demo-link";
import { SectionHeading } from "@/components/landing/section-heading";
import { landing } from "@/content/landing";
import type { DemoConfig } from "@/lib/demo-url";

type FinalCtaSectionProps = {
  demo: DemoConfig;
};

export function FinalCtaSection({ demo }: FinalCtaSectionProps) {
  return (
    <section className="section wrap final-cta" aria-labelledby="final-cta-title">
      <SectionHeading id="final-cta-title">{landing.finalCta.title}</SectionHeading>
      <p className="lede">{landing.finalCta.body}</p>
      <DemoLink demo={demo} />
    </section>
  );
}
