import type { DemoConfig } from "@/lib/demo-url";
import { HeaderBar } from "@/components/landing/header-bar";

type SiteHeaderProps = {
  demo: DemoConfig;
};

export function SiteHeader({ demo }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <HeaderBar demo={demo} />
    </header>
  );
}
