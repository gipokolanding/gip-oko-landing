import { SectionHeading } from "@/components/landing/section-heading";
import { landing } from "@/content/landing";

export function ContactsSection() {
  return (
    <section
      className="section wrap contacts"
      id={landing.contacts.id}
      aria-labelledby="contacts-title"
    >
      <div className="contacts-layout">
        <div>
          <SectionHeading id="contacts-title">
            {landing.contacts.title}
          </SectionHeading>
          <p className="lede">{landing.contacts.intro}</p>
        </div>
        <address className="contacts-card">
          <dl className="contacts-list">
            {landing.contacts.items.map((item) => (
              <div className="contacts-item" key={item.label}>
                <dt>{item.label}</dt>
                <dd>
                  {"href" in item ? (
                    <a href={item.href}>{item.value}</a>
                  ) : (
                    item.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </address>
      </div>
    </section>
  );
}
