import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const btn = cva(
  "inline-flex items-center justify-center gap-2 px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 rounded-sm disabled:opacity-60",
  {
    variants: {
      variant: {
        gold: "bg-gold-gradient text-accent-foreground hover:brightness-110 shadow-luxe",
        outlineLight: "border border-ink-foreground/50 text-ink-foreground hover:bg-ink-foreground hover:text-ink",
        dark: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-primary text-primary hover:bg-primary hover:text-primary-foreground",
      },
    },
    defaultVariants: { variant: "gold" },
  },
);
export type BtnVariant = VariantProps<typeof btn>["variant"];

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

export function SectionHeading({ eyebrow, title, body, light, center = true }: { eyebrow: string; title: string; body?: string; light?: boolean; center?: boolean }) {
  return (
    <Reveal className={cn("mb-14 max-w-2xl", center && "mx-auto text-center")}>
      <p className="eyebrow mb-4">{eyebrow}</p>
      <h2 className={cn("text-4xl leading-tight md:text-5xl", light ? "text-ink-foreground" : "text-foreground")}>{title}</h2>
      <div className={cn("mt-6 h-px w-16 bg-gold", center && "mx-auto")} />
      {body && <p className={cn("mt-6 leading-relaxed", light ? "text-ink-muted" : "text-muted-foreground")}>{body}</p>}
    </Reveal>
  );
}

export function PageHero({ title, subtitle, image }: { title: string; subtitle: string; image: string }) {
  return (
    <section className="relative flex min-h-[56vh] items-end overflow-hidden bg-ink pb-16 pt-40">
      <motion.img src={image} alt="" initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 2.4 }} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-veil" />
      <div className="container-luxe relative">
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }} className="text-5xl text-ink-foreground md:text-7xl">{title}</motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 }} className="mt-5 max-w-xl text-lg text-ink-muted">{subtitle}</motion.p>
      </div>
    </section>
  );
}
