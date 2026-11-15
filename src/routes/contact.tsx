import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone, MessageCircle } from "lucide-react";
import penthouse from "@/assets/prop-penthouse.jpg";
import { useI18n } from "@/i18n/I18nProvider";
import { CONTACT } from "@/data/site";
import { PageHero } from "@/components/site/ui";
import { EnquiryForm } from "@/components/site/Forms";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () => seo("Contact Us", "Speak with a senior Early Approve advisor in English, Arabic or French. Office in Business Bay, Dubai."),
  component: Contact,
});

function Contact() {
  const { t } = useI18n();
  const rows = [
    [MapPin, t("footer.address"), undefined],
    [Phone, CONTACT.phone, `tel:${CONTACT.phone.replace(/\s/g, "")}`],
    [MessageCircle, t("common.whatsapp"), `https://wa.me/${CONTACT.whatsapp}`],
    [Mail, CONTACT.email, `mailto:${CONTACT.email}`],
    [Clock, t("contact.hours"), undefined],
  ] as const;
  return (
    <>
      <PageHero title={t("contact.title")} subtitle={t("contact.subtitle")} image={penthouse} />
      <section className="py-24">
        <div className="container-luxe grid gap-12 lg:grid-cols-[360px_1fr]">
          <div className="bg-ink p-10">
            <h2 className="text-3xl text-ink-foreground">{t("contact.office")}</h2>
            <ul className="mt-8 space-y-6 text-ink-muted">
              {rows.map(([Icon, label, href], i) => (
                <li key={i} className="flex gap-4"><Icon className="h-5 w-5 shrink-0 text-gold" />{href ? <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="hover:text-gold" dir="ltr">{label}</a> : <span>{label}</span>}</li>
              ))}
            </ul>
          </div>
          <div className="bg-card p-8 shadow-luxe md:p-12"><h2 className="mb-8 text-4xl">{t("contact.formTitle")}</h2><EnquiryForm /></div>
        </div>
      </section>
    </>
  );
}
