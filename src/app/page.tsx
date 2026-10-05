import { AnalysisToolsSection } from "@/components/landing/analysis-tools-section";
import { CompatibilitySection } from "@/components/landing/compatibility-section";
import { DemoScenarioSection } from "@/components/landing/demo-scenario-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";
import { HeroSection } from "@/components/landing/hero-section";
import { LayerComparisonSection } from "@/components/landing/layer-comparison-section";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { SpatialContextSection } from "@/components/landing/spatial-context-section";
import { WorkflowSection } from "@/components/landing/workflow-section";
import { landing } from "@/content/landing";
import { resolveDemoUrl } from "@/lib/demo-url";

export default function Home() {
  const demo = resolveDemoUrl(
    process.env.NEXT_PUBLIC_DEMO_URL,
    process.env.NODE_ENV,
  );

  return (
    <div className="page-shell" id="top">
      <div className="star-layer" aria-hidden="true" />
      <a className="skip-link" href="#main-content">
        {landing.skip}
      </a>
      <SiteHeader demo={demo} />
      <main id="main-content">
        <HeroSection demo={demo} />
        <SpatialContextSection />
        <WorkflowSection />
        <LayerComparisonSection />
        <AnalysisToolsSection />
        <CompatibilitySection />
        <DemoScenarioSection />
        <FinalCtaSection demo={demo} />
      </main>
      <SiteFooter />
    </div>
  );
}
