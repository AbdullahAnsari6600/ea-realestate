
import { Link } from "@tanstack/react-router";
import { BedDouble, Bath, Maximize, MapPin } from "lucide-react";
import type { Property } from "@/data/properties";
import { useI18n } from "@/i18n/I18nProvider";

export const priceRange = (p: Property) => {
  const f = (v: number) =>
    v >= 1e6
      ? `${(v / 1e6).toFixed(v % 1e6 ? 1 : 0)}M`
      : `${Math.round(v / 1e3)}K`;

  return `AED ${f(p.priceMin)} – ${f(p.priceMax)}${p.listing === "rent" ? " / yr" : ""}`;
};

export function PropertyCard({ property: p }: { property: Property }) {
  const { t } = useI18n();

  return (
    <Link
      to="/properties/$slug"
      params={{ slug: p.slug }}
      className="group block overflow-hidden bg-card shadow-luxe"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={p.images[0]}
          alt={p.name}
          loading="lazy"
          width={1280}
          height={896}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/80 to-transparent" />

        <span className="absolute start-4 top-4 bg-ink/80 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold">
          {t(`types.${p.type}`)} · {t(`search.${p.listing}`)}
        </span>

        <p
          className="absolute bottom-4 start-4 font-display text-2xl text-ink-foreground"
          dir="ltr"
        >
          {priceRange(p)}
        </p>
      </div>

      <div className="p-6">
        <h3 className="text-2xl text-foreground">{p.name}</h3>

        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-gold" />
          {p.location}
        </p>

        <div className="mt-5 flex gap-5 border-t pt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BedDouble className="h-4 w-4" />
            {p.beds} {t("common.beds")}
          </span>

          <span className="flex items-center gap-1.5">
            <Bath className="h-4 w-4" />
            {p.baths} {t("common.baths")}
          </span>

          <span className="flex items-center gap-1.5">
            <Maximize className="h-4 w-4" />
            {p.area.toLocaleString()} {t("common.sqft")}
          </span>
        </div>
      </div>
    </Link>
  );
}
