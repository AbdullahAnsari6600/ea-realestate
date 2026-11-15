
import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { CONTACT } from "@/data/site";
import { Logo, NAV } from "./Header";

export function Footer() {
  const { t } = useI18n();

  const footerLinks = [
    ...NAV,
    { to: "/book-viewing", key: "book" },
  ] as const;

  return (
    <footer className="bg-ink text-ink-muted">

      {/* Main Footer */}
      <div className="container-luxe grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr] lg:gap-16 lg:py-20">

        {/* Brand */}
        <div className="max-w-sm">
          <Logo />

          <p className="mt-6 text-sm leading-7 text-ink-muted/80">
            {t("footer.tagline")}
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="eyebrow mb-7 font-sans text-gold">
            {t("footer.explore")}
          </h4>

          <ul className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            {footerLinks.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="inline-block transition-colors duration-300 hover:text-gold"
                >
                  {t(`nav.${item.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="eyebrow mb-7 font-sans text-gold">
            {t("footer.contact")}
          </h4>

          <ul className="space-y-5 text-sm">

            <li className="flex items-start gap-4">
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-gold" />
              <span className="leading-6">
                {t("footer.address")}
              </span>
            </li>

            <li>
              <a
                href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-4 transition-colors hover:text-gold"
              >
                <Phone className="h-4 w-4 shrink-0 text-gold" />
                <span dir="ltr">{CONTACT.phone}</span>
              </a>
            </li>

            <li>
              <a
                href={`mailto:${CONTACT.email}`}
                className="flex items-center gap-4 transition-colors hover:text-gold"
              >
                <Mail className="h-4 w-4 shrink-0 text-gold" />
                <span className="break-all">{CONTACT.email}</span>
              </a>
            </li>

          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-ink-line">
        <div className="container-luxe flex flex-col items-center justify-between gap-3 py-6 text-center text-xs text-ink-muted/70 sm:flex-row sm:text-start">

          <p>
            © {new Date().getFullYear()} Early Approve Real Estate Group™.
            {" "}{t("footer.rights")}
          </p>

          <p className="tracking-wider uppercase">
            Dubai, United Arab Emirates
          </p>

        </div>
      </div>

    </footer>
  );
}

export function WhatsAppButton() {
  const { t } = useI18n();

  return (
    <a
      href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(
        "Hello Early Approve, I'd like to enquire about a property."
      )}`}
      target="_blank"
      rel="noreferrer"
      aria-label={t("common.whatsapp")}
      className="fixed bottom-6 end-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-primary-foreground shadow-luxe transition hover:scale-110"
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current">
        <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z" />
      </svg>
    </a>
  );
}
