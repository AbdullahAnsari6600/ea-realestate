// import { createFileRoute, Link } from "@tanstack/react-router";
// import { TrendingUp } from "lucide-react";
// import tower from "@/assets/prop-tower.jpg";
// import { useI18n } from "@/i18n/I18nProvider";
// import { PageHero, Reveal, SectionHeading, btn } from "@/components/site/ui";
// import { Calculators } from "@/components/site/Calculators";
// import { EnquiryForm } from "@/components/site/Forms";
// import { seo } from "@/lib/seo";

// export const Route = createFileRoute("/investment")({
//   head: () => seo("Investment Opportunities", "Off-plan launches, branded residences, Golden Visa portfolios and income-producing Dubai property, curated by finance specialists."),
//   component: Investment,
// });

// function Investment() {
//   const { t, tl } = useI18n();
//   return (
//     <>
//       <PageHero title={t("investment.title")} subtitle={t("investment.subtitle")} image={tower} />
//       <section className="py-24">
//         <div className="container-luxe grid gap-8 md:grid-cols-2">
//           {tl<{ title: string; yield: string; body: string }>("investment.items").map((x, i) => (
//             <Reveal key={i} delay={i * 0.08} className="group border bg-card p-10 shadow-luxe transition hover:border-gold">
//               <TrendingUp className="h-8 w-8 text-gold" strokeWidth={1.3} />
//               <h3 className="mt-6 text-3xl">{x.title}</h3>
//               <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-gold">{x.yield}</p>
//               <p className="mt-4 text-muted-foreground">{x.body}</p>
//               <Link to="/contact" className="mt-6 inline-block text-xs font-semibold uppercase tracking-widest text-primary underline-offset-4 hover:underline">{t("common.enquire")} →</Link>
//             </Reveal>
//           ))}
//         </div>
//       </section>
//       <section className="bg-secondary py-24"><div className="container-luxe"><SectionHeading eyebrow={t("calc.eyebrow")} title={t("calc.title")} /><Calculators /></div></section>
//       <section className="py-24"><div className="container-luxe max-w-4xl"><SectionHeading eyebrow={t("investment.title")} title={t("investment.cta")} /><EnquiryForm /></div></section>
//       <div className="pb-8 text-center"><Link to="/why-dubai" className={btn({ variant: "outline" })}>{t("nav.whyDubai")}</Link></div>
//     </>
//   );
// }


import { createFileRoute, Link } from "@tanstack/react-router";
import { TrendingUp } from "lucide-react";

import tower from "@/assets/prop-tower.jpg";
import villa from "@/assets/prop-villa.jpg";

import { useI18n } from "@/i18n/I18nProvider";
import {
  PageHero,
  Reveal,
  SectionHeading,
  btn,
} from "@/components/site/ui";

import { WhyDubaiGrid } from "@/components/site/Sections";
import { Calculators } from "@/components/site/Calculators";
import { EnquiryForm } from "@/components/site/Forms";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/investment")({
  head: () =>
    seo(
      "Dubai Property Investment Opportunities",
      "Explore Dubai property investment opportunities, tax advantages, rental yields, Golden Visa benefits, investment calculators and expert advisory."
    ),
  component: Investment,
});

function Investment() {
  const { t, tl } = useI18n();

  return (
    <>
      {/* Investment Hero */}
      <PageHero
        title={t("investment.title")}
        subtitle={t("investment.subtitle")}
        image={tower}
      />

      {/* Investment Opportunities */}
      <section className="py-24">
        <div className="container-luxe">
          <SectionHeading
            eyebrow={t("investment.title")}
            title={t("investment.subtitle")}
          />

          <div className="grid gap-8 md:grid-cols-2">
            {tl<{ title: string; yield: string; body: string }>(
              "investment.items"
            ).map((x, i) => (
              <Reveal
                key={i}
                delay={i * 0.08}
                className="group border bg-card p-10 shadow-luxe transition hover:border-gold"
              >
                <TrendingUp
                  className="h-8 w-8 text-gold"
                  strokeWidth={1.3}
                />

                <h3 className="mt-6 text-3xl">{x.title}</h3>

                <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-gold">
                  {x.yield}
                </p>

                <p className="mt-4 text-muted-foreground">{x.body}</p>

                <Link
                  to="/contact"
                  className="mt-6 inline-block text-xs font-semibold uppercase tracking-widest text-primary underline-offset-4 hover:underline"
                >
                  {t("common.enquire")} →
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why Dubai */}
      <section className="bg-secondary py-24">
        <div className="container-luxe">
          <SectionHeading
            eyebrow={t("why.eyebrow")}
            title={t("whyPage.title")}
            body={t("whyPage.subtitle")}
          />

          <WhyDubaiGrid />
        </div>
      </section>

      {/* Dubai Investment Advantages */}
      <section className="relative overflow-hidden bg-ink py-28">
        <img
          src={villa}
          alt="Luxury Dubai real estate"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />

        <div className="container-luxe relative">
          <div className="grid grid-cols-2 gap-10 text-center md:grid-cols-4">
            {(
              [
                ["0%", "why.points.0.title"],
                ["9%", "calc.gross"],
                ["10", "why.points.2.title"],
                ["8h", "why.points.3.title"],
              ] as const
            ).map(([number, key]) => (
              <Reveal key={key}>
                <p
                  className="font-display text-5xl text-gold-gradient md:text-7xl"
                  dir="ltr"
                >
                  {number}
                </p>

                <p className="mt-3 text-xs uppercase tracking-widest text-ink-muted">
                  {t(key)}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Calculators */}
      <section className="bg-secondary py-24">
        <div className="container-luxe">
          <SectionHeading
            eyebrow={t("calc.eyebrow")}
            title={t("calc.title")}
          />

          <Calculators />
        </div>
      </section>

      {/* Investment Enquiry */}
      <section className="py-24">
        <div className="container-luxe max-w-4xl">
          <SectionHeading
            eyebrow={t("investment.title")}
            title={t("investment.cta")}
          />

          <EnquiryForm />
        </div>
      </section>

      {/* Final CTA */}
      <section className="pb-16 text-center">
        <Link to="/properties" className={btn({ variant: "dark" })}>
          {t("common.viewAll")}
        </Link>
      </section>
    </>
  );
}
