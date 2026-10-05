import { landing } from "@/content/landing";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">{landing.brand}</div>
    </footer>
  );
}
