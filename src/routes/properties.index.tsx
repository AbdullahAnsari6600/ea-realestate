import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import villa from "@/assets/prop-villa.jpg";
import { useI18n } from "@/i18n/I18nProvider";
import { LOCATIONS, type Property, type PropertyType } from "@/data/properties";
import { listProperties } from "@/services/propertyService";
import { PropertyCard } from "@/components/site/PropertyCard";
import { TYPES } from "@/components/site/PropertySearch";
import { PageHero, Reveal } from "@/components/site/ui";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

type Search = { listing?: "buy" | "rent" | undefined; location?: string | undefined; type?: string | undefined; budget?: number | undefined };

export const Route = createFileRoute("/properties/")({
  validateSearch: (s: Record<string, unknown>): Search => {
    const { listing, location, type, budget } = s;
    return {
      listing: listing === "buy" || listing === "rent" ? listing : undefined,
      location: typeof location === "string" && location !== "all" ? location : undefined,
      type: typeof type === "string" && type !== "all" ? type : undefined,
      budget: typeof budget === "number" && budget > 0 ? budget : undefined,
    };
  },
  head: () => seo("Properties & Projects", "Browse luxury apartments, villas, penthouses and townhouses for sale and rent across Dubai's prime communities."),
  component: PropertiesPage,
});

function PropertiesPage() {
  const { t } = useI18n();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/properties/" });
  const [items, setItems] = useState<Property[]>([]);
  useEffect(() => {
    listProperties({ listing: search.listing, location: search.location, type: search.type as PropertyType | undefined, maxBudget: search.budget }).then(setItems);
  }, [search.listing, search.location, search.type, search.budget]);
  const update = (patch: Partial<Search>) => navigate({ search: (prev) => ({ ...prev, ...patch }) });
  const chip = (active: boolean) => cn("px-4 py-2 text-xs font-semibold uppercase tracking-widest border transition", active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary");
  return (
    <>
      <PageHero title={t("propertiesPage.title")} subtitle={t("propertiesPage.subtitle")} image={villa} />
      <section className="py-16">
        <div className="container-luxe">
          <div className="mb-12 flex flex-wrap items-center gap-3 border-b pb-8">
            {([undefined, "buy", "rent"] as const).map((l) => <button key={l ?? "all"} onClick={() => update({ listing: l })} className={chip(search.listing === l)}>{l ? t(`search.${l}`) : t("common.all")}</button>)}
            <select value={search.location ?? ""} onChange={(e) => update({ location: e.target.value || undefined })} className="field !w-auto"><option value="">{t("search.location")}: {t("search.any")}</option>{LOCATIONS.map((l) => <option key={l}>{l}</option>)}</select>
            <select value={search.type ?? ""} onChange={(e) => update({ type: e.target.value || undefined })} className="field !w-auto"><option value="">{t("search.type")}: {t("search.any")}</option>{TYPES.map((x) => <option key={x} value={x}>{t(`types.${x}`)}</option>)}</select>
            {search.budget && <button onClick={() => update({ budget: undefined })} className={chip(true)} dir="ltr">≤ AED {search.budget.toLocaleString()} ✕</button>}
          </div>
          {items.length === 0 ? <p className="py-20 text-center text-muted-foreground">{t("common.noResults")}</p> : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">{items.map((p, i) => <Reveal key={p.id} delay={(i % 3) * 0.08}><PropertyCard property={p} /></Reveal>)}</div>
          )}
        </div>
      </section>
    </>
  );
}
