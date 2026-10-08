import { FooterGlobe } from "@/components/landing/footer-globe";
import { SectionHeading } from "@/components/landing/section-heading";
import { landing } from "@/content/landing";

function EnvelopeIcon() {
  return (
    <svg
      className="footer-requisite-icon"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      aria-hidden="true"
    >
      <path
        d="M2.5 4.25h11v7.5h-11zM2.5 4.25l5.5 4 5.5-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
      />
    </svg>
  );
}

function HandsetIcon() {
  return (
    <svg
      className="footer-requisite-icon"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      aria-hidden="true"
    >
      <path
        d="M5 2.75h2.25l.75 2.25-1.5 1.25a7 7 0 0 0 3.25 3.25l1.25-1.5 2.25.75V13a1 1 0 0 1-1 1A8.25 8.25 0 0 1 2 4.75a1 1 0 0 1 1-1H5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function firstHref(
  lines: (typeof landing.contacts.items)[number]["lines"],
) {
  const linked = lines.find((line) => "href" in line);
  return linked && "href" in linked ? linked.href : undefined;
}

function RequisiteIcon({ href }: { href?: string }) {
  if (href?.startsWith("mailto:")) {
    return <EnvelopeIcon />;
  }
  if (href?.startsWith("tel:")) {
    return <HandsetIcon />;
  }
  return null;
}

export function SiteFooter() {
  return (
    <footer
      className="wrap site-footer"
      id={landing.contacts.id}
      aria-labelledby="contacts-title"
    >
      <div className="footer-layout">
        <div className="footer-copy">
          <SectionHeading id="contacts-title">
            {landing.contacts.title}
          </SectionHeading>
          <p className="lede">{landing.contacts.intro}</p>
        </div>
        <address className="footer-requisites">
          <dl className="footer-requisites-list">
            {landing.contacts.items.map((item) => {
              const href = firstHref(item.lines);
              return (
                <div className="footer-requisite" key={item.label}>
                  <RequisiteIcon href={href} />
                  <div>
                    <dt>{item.label}</dt>
                    {item.lines.map((line) => (
                      <dd className="footer-requisite-line" key={line.value}>
                        {"href" in line ? (
                          <a href={line.href}>{line.value}</a>
                        ) : (
                          line.value
                        )}
                        {"note" in line ? (
                          <span className="footer-requisite-note">
                            ({line.note})
                          </span>
                        ) : null}
                      </dd>
                    ))}
                  </div>
                </div>
              );
            })}
          </dl>
        </address>
      </div>
      <FooterGlobe />
    </footer>
  );
}
