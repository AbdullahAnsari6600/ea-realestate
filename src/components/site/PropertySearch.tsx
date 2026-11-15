import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { LOCATIONS } from "@/data/properties";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

export const TYPES = ["apartment", "villa", "penthouse", "townhouse"] as const;

export function PropertySearch() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [listing, setListing] = useState<"buy" | "rent">("buy");
  const [location, setLocation] = useState("all");
  const [type, setType] = useState("all");
  const [budget, setBudget] = useState("");
  const sel = "w-full bg-transparent py-1 text-sm text-ink-foreground outline-none [&>option]:text-foreground";
  return (
    <form onSubmit={(e) => { e.preventDefault(); navigate({ to: "/properties", search: { listing, location, type, budget: Number(budget) || undefined } }); }}
      className="w-full max-w-4xl border border-ink-line bg-ink/60 p-2 backdrop-blur-md">
      <div className="flex gap-1 p-2">
        {(["buy", "rent"] as const).map((l) => (
          <button type="button" key={l} onClick={() => setListing(l)} className={cn("px-5 py-1.5 text-xs font-semibold uppercase tracking-widest", listing === l ? "bg-gold-gradient text-accent-foreground" : "text-ink-foreground/70")}>{t(`search.${l}`)}</button>
        ))}
      </div>
      <div className="grid gap-px md:grid-cols-[1fr_1fr_1fr_auto]">
        <label className="px-4 py-3"><span className="eyebrow block text-[0.6rem]">{t("search.location")}</span>
          <select value={location} onChange={(e) => setLocation(e.target.value)} className={sel}><option value="all">{t("search.any")}</option>{LOCATIONS.map((l) => <option key={l}>{l}</option>)}</select></label>
        <label className="px-4 py-3 md:border-s md:border-ink-line"><span className="eyebrow block text-[0.6rem]">{t("search.type")}</span>
          <select value={type} onChange={(e) => setType(e.target.value)} className={sel}><option value="all">{t("search.any")}</option>{TYPES.map((x) => <option key={x} value={x}>{t(`types.${x}`)}</option>)}</select></label>
        <label className="px-4 py-3 md:border-s md:border-ink-line"><span className="eyebrow block text-[0.6rem]">{t("search.budget")}</span>
          <input inputMode="numeric" value={budget} onChange={(e) => setBudget(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="5,000,000" className={cn(sel, "placeholder:text-ink-muted")} /></label>
        <button className="m-1 flex items-center justify-center gap-2 bg-gold-gradient px-8 py-4 text-xs font-semibold uppercase tracking-widest text-accent-foreground"><Search className="h-4 w-4" />{t("search.button")}</button>
      </div>
    </form>
  );
}
