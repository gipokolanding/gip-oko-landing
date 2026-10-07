import { ContactsSection } from "@/components/landing/contacts-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";
import { HeroSection } from "@/components/landing/hero-section";
import { SiteHeader } from "@/components/landing/site-header";
import { SpatialContextSection } from "@/components/landing/spatial-context-section";
import { StarField } from "@/components/landing/star-field";
import { ToolsElegantCarousel } from "@/components/landing/tools-elegant-carousel";
import { landing } from "@/content/landing";
import { resolveDemoUrl } from "@/lib/demo-url";

export default function Home() {
  const demo = resolveDemoUrl(
    process.env.NEXT_PUBLIC_DEMO_URL,
    process.env.NODE_ENV,
  );

  return (
    <div className="page-shell" id="top">
      <div className="star-layer" aria-hidden="true">
        <StarField />
      </div>
      <a className="skip-link" href="#main-content">
        {landing.skip}
      </a>
      <SiteHeader demo={demo} />
      <main id="main-content">
        <HeroSection demo={demo} />
        <SpatialContextSection />
        <ToolsElegantCarousel />
        <FinalCtaSection demo={demo} />
        <ContactsSection />
      </main>
    </div>
  );
}
