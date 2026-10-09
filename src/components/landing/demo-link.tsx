import type { DemoConfig } from "@/lib/demo-url";
import { landing } from "@/content/landing";

type DemoLinkProps = {
  demo: DemoConfig;
  className?: string;
  tipId: string;
};

export function DemoLink({ demo, className, tipId }: DemoLinkProps) {
  const label = landing.cta.label;

  if (demo.status === "ready") {
    return (
      <a className={className ?? "demo-link"} href={demo.href}>
        {label}
      </a>
    );
  }

  return (
    <span
      className={className ?? "demo-link is-pending"}
      aria-disabled="true"
      aria-describedby={tipId}
    >
      {label}
      <span id={tipId} className="demo-link-tip" role="tooltip">
        {landing.cta.soon}
      </span>
    </span>
  );
}
