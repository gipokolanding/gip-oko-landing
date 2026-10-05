import type { DemoConfig } from "@/lib/demo-url";
import { landing } from "@/content/landing";

type DemoLinkProps = {
  demo: DemoConfig;
  className?: string;
};

export function DemoLink({ demo, className }: DemoLinkProps) {
  const label = landing.cta.label;

  if (demo.status === "ready") {
    return (
      <a className={className ?? "demo-link"} href={demo.href}>
        {label}
      </a>
    );
  }

  return (
    <span className={className ?? "demo-link is-disabled"} aria-disabled="true">
      {label}
    </span>
  );
}
