import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import hero from "@/assets/hero-dubai.jpg";
import heroVideo from "@/assets/dubai-luxury-estate.mp4";
import office from "@/assets/office.jpg";
import { useI18n } from "@/i18n/I18nProvider";
import { properties } from "@/data/properties";
import { PropertyCard } from "@/components/site/PropertyCard";
import { PropertySearch } from "@/components/site/PropertySearch";
import { Calculators } from "@/components/site/Calculators";
import { FAQList, PartnerCarousel, ServicesGrid, Team, Testimonials, TrustBadges, WhyDubaiGrid } from "@/components/site/Sections";
import { btn, Reveal, SectionHeading } from "@/components/site/ui";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => seo(
    "Early Approve Real Estate Group™ | Dubai Real Estate",
    "Early Approve Real Estate Group™ offers luxury property sales, rentals, investment opportunities and professional real estate advisory in Dubai."
  ),
  component: Home,
});

function Home() {
  const { t } = useI18n();
  const featured = properties.filter((p) => p.featured).slice(0, 3);
  return (
    <>
      <section className="relative flex min-h-screen items-center overflow-hidden bg-ink">
      <video
  className="absolute inset-0 h-full w-full object-cover"
  src={heroVideo}
  autoPlay
  muted
  loop
  playsInline
  preload="auto"
/>
        <div className="absolute inset-0 bg-veil" />
        <div className="container-luxe relative flex flex-col items-start gap-8 pb-16 pt-36">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="eyebrow">{t("hero.eyebrow")}</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3 }} className="max-w-4xl text-5xl leading-[1.05] text-ink-foreground md:text-7xl lg:text-8xl">{t("hero.title")}</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }} className="max-w-2xl text-lg text-ink-muted">{t("hero.subtitle")}</motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="flex flex-wrap gap-4">
            <Link to="/properties" className={btn()}>{t("hero.cta1")}</Link>
            <Link to="/book-viewing" className={btn({ variant: "outlineLight" })}>{t("hero.cta2")}</Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.9 }} className="mt-6 w-full"><PropertySearch /></motion.div>
        </div>
      </section>

      <TrustBadges />

      <section className="py-24">
        <div className="container-luxe grid items-center gap-16 lg:grid-cols-2">
          <Reveal><img src={office} alt="Early Approve private client office" loading="lazy" width={1280} height={896} className="aspect-[6/5] w-full object-cover shadow-luxe" /></Reveal>
          <div>
            <SectionHeading center={false} eyebrow={t("intro.eyebrow")} title={t("intro.title")} body={t("intro.body")} />
            <div className="grid grid-cols-2 gap-8">
              {[["15+", "stat1"], ["100+", "stat2"], ["60+", "stat3"], ["40+", "stat4"]].map(([n, k]) => (
                <Reveal key={k}><p className="font-display text-5xl text-gold-gradient" dir="ltr">{n}</p><p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{t(`intro.${k}`)}</p></Reveal>
              ))}
            </div>
            <Link to="/about" className={`${btn({ variant: "outline" })} mt-10`}>{t("common.learnMore")} <ArrowRight className="h-4 w-4 rtl:rotate-180" /></Link>
          </div>
        </div>
      </section>

      <section className="bg-secondary py-28">
        <div className="container-luxe">
          <SectionHeading eyebrow={t("featured.eyebrow")} title={t("featured.title")} />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">{featured.map((p, i) => <Reveal key={p.id} delay={i * 0.1}><PropertyCard property={p} /></Reveal>)}</div>
          <div className="mt-14 text-center"><Link to="/properties" className={btn({ variant: "dark" })}>{t("common.viewAll")}</Link></div>
        </div>
      </section>

      <section className="py-28"><div className="container-luxe"><SectionHeading eyebrow={t("services.eyebrow")} title={t("services.title")} /><ServicesGrid /></div></section>

      <PartnerCarousel />
      <Team />
      <Testimonials />

      <section className="relative overflow-hidden py-28">
        <div className="container-luxe">
          <SectionHeading eyebrow={t("why.eyebrow")} title={t("why.title")} body={t("why.body")} />
          <WhyDubaiGrid />
          <div className="mt-14 text-center"><Link to="/why-dubai" className={btn({ variant: "outline" })}>{t("common.learnMore")}</Link></div>
        </div>
      </section>

      <section className="bg-secondary py-28"><div className="container-luxe"><SectionHeading eyebrow={t("calc.eyebrow")} title={t("calc.title")} /><Calculators /></div></section>

      <section className="py-28"><div className="container-luxe"><SectionHeading eyebrow={t("faq.eyebrow")} title={t("faq.title")} /><FAQList /></div></section>
    </>
  );
}
