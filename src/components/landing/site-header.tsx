import { landing } from "@/content/landing";
import type { DemoConfig } from "@/lib/demo-url";
import { DemoLink } from "@/components/landing/demo-link";

type SiteHeaderProps = {
  demo: DemoConfig;
};

export function SiteHeader({ demo }: SiteHeaderProps) {
  return (
    <header className="site-header wrap">
      <a className="brand" href="#top">
        {landing.brand}
      </a>
      <nav className="site-nav" aria-label="Разделы страницы">
        {landing.nav.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
      <DemoLink demo={demo} />
    </header>
  );
}
