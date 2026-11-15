import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { formatAED, mortgage, rentalYield } from "@/lib/finance";
import { cn } from "@/lib/utils";

function Slider({ label, value, set, min, max, step, fmt }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step: number; fmt?: (n: number) => string }) {
  return (
    <label className="block">
      <div className="mb-2 flex justify-between text-sm"><span className="text-muted-foreground">{label}</span><span className="font-semibold" dir="ltr">{fmt ? fmt(value) : value}</span></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(Number(e.target.value))} className="w-full accent-[var(--gold)]" />
    </label>
  );
}
function Result({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return <div><p className="text-xs uppercase tracking-widest text-ink-muted">{label}</p><p className={cn("font-display text-ink-foreground", big ? "text-5xl text-gold-gradient" : "text-2xl")} dir="ltr">{value}</p></div>;
}

export function Calculators() {
  const { t } = useI18n();
  const [tab, setTab] = useState<"m" | "r">("m");
  const [price, setPrice] = useState(3000000);
  const [down, setDown] = useState(25);
  const [rate, setRate] = useState(4.5);
  const [years, setYears] = useState(25);
  const [rent, setRent] = useState(210000);
  const [charges, setCharges] = useState(30000);
  const [other, setOther] = useState(10000);
  const m = mortgage(price, down, rate, years);
  const r = rentalYield(price, rent, charges, other);
  return (
    <div className="mx-auto max-w-5xl overflow-hidden bg-card shadow-luxe">
      <div className="grid grid-cols-2 border-b">
        {(["m", "r"] as const).map((k) => (
          <button key={k} onClick={() => setTab(k)} className={cn("py-5 text-xs font-semibold uppercase tracking-[0.2em] transition", tab === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>{t(k === "m" ? "calc.mortgage" : "calc.rental")}</button>
        ))}
      </div>
      <div className="grid md:grid-cols-2">
        <div className="space-y-7 p-8 md:p-10">
          <Slider label={t("calc.price")} value={price} set={setPrice} min={500000} max={30000000} step={50000} fmt={formatAED} />
          {tab === "m" ? <>
            <Slider label={t("calc.down")} value={down} set={setDown} min={20} max={80} step={1} fmt={(v) => `${v}%`} />
            <Slider label={t("calc.rate")} value={rate} set={setRate} min={1} max={10} step={0.05} fmt={(v) => `${v.toFixed(2)}%`} />
            <Slider label={t("calc.years")} value={years} set={setYears} min={5} max={25} step={1} />
          </> : <>
            <Slider label={t("calc.rent")} value={rent} set={setRent} min={20000} max={3000000} step={5000} fmt={formatAED} />
            <Slider label={t("calc.charges")} value={charges} set={setCharges} min={0} max={300000} step={1000} fmt={formatAED} />
            <Slider label={t("calc.other")} value={other} set={setOther} min={0} max={200000} step={1000} fmt={formatAED} />
          </>}
        </div>
        <div className="flex flex-col justify-center gap-7 bg-ink p-8 md:p-10">
          {tab === "m" ? <>
            <Result big label={t("calc.monthly")} value={formatAED(m.monthly)} />
            <Result label={t("calc.loan")} value={formatAED(m.loan)} />
            <Result label={t("calc.totalInterest")} value={formatAED(m.totalInterest)} />
          </> : <>
            <Result big label={t("calc.net")} value={`${r.net.toFixed(2)}%`} />
            <Result label={t("calc.gross")} value={`${r.gross.toFixed(2)}%`} />
            <Result label={t("calc.netIncome")} value={formatAED(r.netIncome)} />
            <Result label={t("calc.payback")} value={r.payback ? `${r.payback.toFixed(1)} ${t("calc.yrs")}` : "—"} />
          </>}
          <p className="text-xs text-ink-muted">{t("calc.disclaimer")}</p>
        </div>
      </div>
    </div>
  );
}
