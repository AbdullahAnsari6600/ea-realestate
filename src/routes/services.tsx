import { createFileRoute, Link } from "@tanstack/react-router";
import bedroom from "@/assets/prop-bedroom.jpg";
import { useI18n } from "@/i18n/I18nProvider";
import { PageHero, SectionHeading, btn } from "@/components/site/ui";
import { ServicesGrid } from "@/components/site/Sections";
import { Calculators } from "@/components/site/Calculators";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/services")({
  head: () => seo("Our Services", "Property sales, mortgage advisory, investment strategy, leasing, off-plan access and property management in Dubai."),
  component: Services,
});

function Services() {
  const { t } = useI18n();
  return (
    <>
      <PageHero title={t("servicesPage.title")} subtitle={t("servicesPage.subtitle")} image={bedroom} />
      <section className="py-24"><div className="container-luxe"><SectionHeading eyebrow={t("services.eyebrow")} title={t("services.title")} /><ServicesGrid />
        <div className="mt-14 flex flex-wrap justify-center gap-4"><Link to="/contact" className={btn()}>{t("common.enquire")}</Link><Link to="/book-viewing" className={btn({ variant: "outline" })}>{t("nav.book")}</Link></div></div></section>
      <section className="bg-secondary py-24"><div className="container-luxe"><SectionHeading eyebrow={t("calc.eyebrow")} title={t("calc.title")} /><Calculators /></div></section>
    </>
  );
}
