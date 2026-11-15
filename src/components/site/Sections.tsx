import { Building2, Landmark, LineChart, KeyRound, Hammer, ShieldCheck, Quote, BadgeCheck, Award, Banknote, Plane, Percent, Home, Globe2, Lock, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { PARTNERS } from "@/data/site";
import { Reveal, SectionHeading } from "./ui";
import { cn } from "@/lib/utils";

type TB = { title: string; body: string };
const SERVICE_ICONS = [Building2, Landmark, LineChart, KeyRound, Hammer, ShieldCheck];
const WHY_ICONS = [Percent, LineChart, Award, Plane, ShieldCheck, Home];


export function ServicesGrid() {
  const { tl } = useI18n();

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {tl<TB>("services.items").map((s, i) => {
        const Icon = SERVICE_ICONS[i % 6] ?? Building2;

        return (
          <Reveal key={i} delay={i * 0.06}>
            <motion.div
              initial="rest"
              whileHover="hover"
              animate="rest"
              variants={{
                rest: { y: 0 },
                hover: { y: -8 },
              }}
              transition={{
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative h-full overflow-hidden border border-border bg-background p-10 shadow-sm transition-shadow duration-500 hover:border-gold/60 hover:shadow-xl"
            >
              {/* Animated gold accent */}
              <motion.div
                variants={{
                  rest: { scaleX: 0, opacity: 0 },
                  hover: { scaleX: 1, opacity: 1 },
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute left-0 top-0 h-[2px] w-full origin-left bg-gold"
              />

              {/* Subtle background glow */}
              <motion.div
                variants={{
                  rest: { opacity: 0 },
                  hover: { opacity: 1 },
                }}
                transition={{ duration: 0.4 }}
                className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gold/5 blur-3xl"
              />

              {/* Icon */}
              <motion.div
                variants={{
                  rest: { scale: 1, rotate: 0 },
                  hover: { scale: 1.12, rotate: -5 },
                }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 15,
                }}
                className="relative"
              >
                <Icon
                  className="h-9 w-9 text-gold"
                  strokeWidth={1.2}
                />
              </motion.div>

              {/* Content */}
              <motion.div
                variants={{
                  rest: { x: 0 },
                  hover: { x: 4 },
                }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <h3 className="mt-7 text-2xl transition-colors duration-300 group-hover:text-gold">
                  {s.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </motion.div>

              {/* Bottom accent */}
              <motion.div
                variants={{
                  rest: { width: "0%" },
                  hover: { width: "35%" },
                }}
                transition={{ duration: 0.4 }}
                className="absolute bottom-0 left-0 h-[2px] bg-gold"
              />
            </motion.div>
          </Reveal>
        );
      })}
    </div>
  );
}



export function Team() {
  const { t, tl } = useI18n();

  return (
    <section className="py-28">
      <div className="container-luxe">
        <SectionHeading
          eyebrow={t("team.eyebrow")}
          title={t("team.title")}
        />

<div className="grid grid-cols-2 gap-6 md:grid-cols-2 lg:grid-cols-4">
  {tl<{
    name: string;
    role: string;
    image?: string;
  }>("team.members")
    .slice(0, 4)
    .map((m, i) => (
      <Reveal
        key={i}
        delay={i * 0.08}
        className="group text-center"
      >
        <div className="relative mx-auto aspect-[3/4] w-full overflow-hidden bg-ink">
          {m.image ? (
            <img
              src={m.image}
              alt={m.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-display text-5xl text-gold-gradient">
                {m.name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />
        </div>

        <h3 className="mt-5 text-xl transition-colors group-hover:text-gold">
          {m.name}
        </h3>

        <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
          {m.role}
        </p>
      </Reveal>
    ))}
</div>
      </div>
    </section>
  );
}


export function PartnerCarousel() {
  const { t } = useI18n();
  const items = [...PARTNERS, ...PARTNERS];
  return (
    <section className="border-y bg-secondary py-16">
      <p className="eyebrow mb-8 text-center">{t("partners.title")}</p>
      <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]" dir="ltr">
        <div className="animate-marquee flex w-max gap-20">
          {items.map((p, i) => <span key={i} className="whitespace-nowrap font-display text-3xl tracking-[0.2em] text-primary/60">{p}</span>)}
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  const { t, tl } = useI18n();
  return (
    <section className="bg-ink py-28">
      <div className="container-luxe">
        <SectionHeading light eyebrow={t("testimonials.eyebrow")} title={t("testimonials.title")} />
        <div className="grid gap-8 md:grid-cols-3">
          {tl<{ quote: string; name: string; origin: string }>("testimonials.items").map((x, i) => (
            <Reveal key={i} delay={i * 0.1} className="border border-ink-line p-8">
              <Quote className="h-8 w-8 text-gold" />
              <p className="mt-6 font-display text-xl leading-relaxed text-ink-foreground">"{x.quote}"</p>
              <p className="mt-6 text-sm font-semibold text-gold">{x.name}</p>
              <p className="text-xs text-ink-muted">{x.origin}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TrustBadges() {
  const { t } = useI18n();
  const items = [[BadgeCheck, "rera"], [Landmark, "dld"], [Banknote, "banks"], [Award, "golden"], [Lock, "secure"]] as const;
  return (
    <section className="py-14">
      <div className="container-luxe grid grid-cols-2 gap-6 md:grid-cols-5">
        {items.map(([Icon, k]) => (
          <div key={k} className="flex flex-col items-center gap-3 text-center"><Icon className="h-8 w-8 text-gold" strokeWidth={1.2} /><span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t(`trust.${k}`)}</span></div>
        ))}
      </div>
    </section>
  );
}

export function WhyDubaiGrid({ dark }: { dark?: boolean }) {
  const { tl } = useI18n();
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {tl<TB>("why.points").map((p, i) => {
        const Icon = WHY_ICONS[i % 6] ?? Globe2;
        return (
          <Reveal key={i} delay={i * 0.06} className={cn("border-t pt-6", dark ? "border-ink-line" : "border-gold/40")}>
            <Icon className="h-7 w-7 text-gold" strokeWidth={1.3} />
            <h3 className={cn("mt-4 text-2xl", dark && "text-ink-foreground")}>{p.title}</h3>
            <p className={cn("mt-2 text-sm", dark ? "text-ink-muted" : "text-muted-foreground")}>{p.body}</p>
          </Reveal>
        );
      })}
    </div>
  );
}

export function FAQList() {
  const { tl } = useI18n();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-3xl divide-y border-y">
      {tl<{ q: string; a: string }>("faq.items").map((f, i) => (
        <div key={i}>
          <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-6 py-6 text-start">
            <span className="font-display text-xl md:text-2xl">{f.q}</span>
            <Plus className={cn("h-5 w-5 shrink-0 text-gold transition", open === i && "rotate-45")} />
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pb-6 leading-relaxed text-muted-foreground">{f.a}</motion.p>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
