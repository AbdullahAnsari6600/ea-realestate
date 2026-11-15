import { createFileRoute, Link } from "@tanstack/react-router";
import office from "@/assets/office.jpg";
import tower from "@/assets/prop-tower.jpg";
import { useI18n } from "@/i18n/I18nProvider";
import { PageHero, Reveal, SectionHeading, btn } from "@/components/site/ui";
import { PartnerCarousel, Team, TrustBadges } from "@/components/site/Sections";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => seo("About Us", "Since 2009, Early Approve Real Estate Group has combined Dubai market expertise with in-house property finance for international clients."),
  component: About,
});

function About() {
  const { t, tl } = useI18n();
  return (
    <>
      <PageHero title={t("about.title")} subtitle={t("about.subtitle")} image={tower} />
      <section className="py-24">
        <div className="container-luxe grid items-center gap-16 lg:grid-cols-2">
          <div><SectionHeading center={false} eyebrow="Early Approve™" title={t("about.storyTitle")} body={t("about.story")} /><Link to="/contact" className={btn({ variant: "dark" })}>{t("common.enquire")}</Link></div>
          <Reveal><img src={office} alt="" loading="lazy" width={1280} height={896} className="w-full object-cover shadow-luxe" /></Reveal>
        </div>
      </section>
      <section className="bg-ink py-24">
        <div className="container-luxe">
          <SectionHeading light eyebrow="Early Approve™" title={t("about.valuesTitle")} />
          <div className="grid gap-8 md:grid-cols-3">
            {tl<{ title: string; body: string }>("about.values").map((v, i) => (
              <Reveal key={i} delay={i * 0.1} className="border border-ink-line p-10 text-center"><p className="font-display text-6xl text-gold-gradient">0{i + 1}</p><h3 className="mt-4 text-3xl text-ink-foreground">{v.title}</h3><p className="mt-3 text-sm text-ink-muted">{v.body}</p></Reveal>
            ))}
          </div>
        </div>
      </section>
      <Team />
      <PartnerCarousel />
      <TrustBadges />
    </>
  );
}
