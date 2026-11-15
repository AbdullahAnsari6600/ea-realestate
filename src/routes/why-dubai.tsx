import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero-dubai.jpg";
import villa from "@/assets/prop-villa.jpg";
import { useI18n } from "@/i18n/I18nProvider";
import { PageHero, Reveal, SectionHeading, btn } from "@/components/site/ui";
import { WhyDubaiGrid } from "@/components/site/Sections";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/why-dubai")({
  head: () => seo("Why Dubai?", "Zero income tax, 6–9% rental yields, Golden Visa residency and world-class lifestyle: why investors choose Dubai property."),
  component: WhyDubai,
});

function WhyDubai() {
  const { t } = useI18n();
  return (
    <>
      <PageHero title={t("whyPage.title")} subtitle={t("whyPage.subtitle")} image={hero} />
      <section className="py-24"><div className="container-luxe"><SectionHeading eyebrow={t("why.eyebrow")} title={t("why.title")} body={t("why.body")} /><WhyDubaiGrid /></div></section>
      <section className="relative overflow-hidden bg-ink py-28">
        <img src={villa} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="container-luxe relative grid gap-10 text-center md:grid-cols-4">
          {([["0%", "why.points.0.title"], ["9%", "calc.gross"], ["10", "why.points.2.title"], ["8h", "why.points.3.title"]] as const).map(([n, k]) => (
            <Reveal key={k}><p className="font-display text-7xl text-gold-gradient" dir="ltr">{n}</p><p className="mt-2 text-xs uppercase tracking-widest text-ink-muted">{t(k)}</p></Reveal>
          ))}
        </div>
      </section>
      <div className="py-20 text-center"><Link to="/investment" className={btn({ variant: "dark" })}>{t("nav.investment")}</Link></div>
    </>
  );
}
