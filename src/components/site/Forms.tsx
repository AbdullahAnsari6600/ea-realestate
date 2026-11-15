
import { CheckCircle2, AlertCircle } from "lucide-react";
import { z } from "zod";
import { useI18n } from "@/i18n/I18nProvider";
import { BUDGETS, COUNTRY_CODES } from "@/data/site";
import { submitForm } from "@/services/formService";
import { btn } from "./ui";
import { TYPES } from "./PropertySearch";
import { cn } from "@/lib/utils";
import { useEffect, useState, type ReactNode } from "react";
import { LOCATIONS } from "@/data/properties";
import { listProperties } from "@/services/propertyService";
import type { Property } from "@/data/properties";

type Rule = "required" | "email" | "phone";
type Base = { cc: string; phone: string };

function useForm<V extends Base & Record<string, string>>(
  initial: V,
  rules: Partial<Record<keyof V & string, Rule[]>>,
  kind: Parameters<typeof submitForm>[0]
) {
  const { t } = useI18n();
  const [values, setValues] = useState<V>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof V & string, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [submitError, setSubmitError] = useState("");

  const set = (k: keyof V & string) =>
    (e: { target: { value: string } }) =>
      setValues((v) => ({ ...v, [k]: e.target.value }));

  const validate = () => {
    const errs: Partial<Record<keyof V & string, string>> = {};

    for (const k of Object.keys(rules) as (keyof V & string)[]) {
      const rs = rules[k] ?? [];
      const v = (values[k] ?? "").trim();

      if (rs.includes("required") && !v) {
        errs[k] = t("common.required");
      } else if (
        rs.includes("email") &&
        !z.string().email().max(255).safeParse(v).success
      ) {
        errs[k] = t("common.invalidEmail");
      } else if (
        rs.includes("phone") &&
        !/^[0-9\s-]{6,15}$/.test(v)
      ) {
        errs[k] = t("common.invalidPhone");
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setStatus("sending");
    setSubmitError("");

    try {
      await submitForm(kind, values);
      setStatus("done");
    } catch (error) {
      setStatus("idle");
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    }
  };

  const reset = () => {
    setValues(initial);
    setErrors({});
    setSubmitError("");
    setStatus("idle");
  };

  return {
    values,
    set,
    errors,
    status,
    submitError,
    onSubmit,
    reset,
  };
}

export function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string | undefined;
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-xs text-destructive">
          {error}
        </span>
      )}
    </label>
  );
}

function Success({ onReset }: { onReset: () => void }) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center py-12 text-center">
      <CheckCircle2
        className="h-14 w-14 text-gold"
        strokeWidth={1.2}
      />
      <p className="mt-6 max-w-sm font-display text-2xl">
        {t("common.success")}
      </p>
      <button
        type="button"
        onClick={onReset}
        className={cn(btn({ variant: "outline" }), "mt-8")}
      >
        OK
      </button>
    </div>
  );
}

function SubmitError({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive md:col-span-2"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function PhoneField({
  f,
}: {
  f: {
    values: Base;
    errors: { phone?: string | undefined };
    set: (
      k: "cc" | "phone"
    ) => (e: { target: { value: string } }) => void;
  };
}) {
  const { t } = useI18n();

  return (
    <Field label={t("form.phone")} error={f.errors.phone}>
      <div className="flex gap-2" dir="ltr">
        <select
          value={f.values.cc}
          onChange={f.set("cc")}
          className="field !w-28"
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>

        <input
          value={f.values.phone}
          onChange={f.set("phone")}
          inputMode="tel"
          maxLength={15}
          className="field"
          placeholder="50 123 4567"
        />
      </div>
    </Field>
  );
}

const contactRules = {
  name: ["required"],
  email: ["required", "email"],
  phone: ["required", "phone"],
} satisfies Record<string, Rule[]>;

export function EnquiryForm() {
  const { t } = useI18n();

  const f = useForm(
    {
      name: "",
      email: "",
      cc: "+971",
      phone: "",
      intent: "buying",
      budget: "",
      location: "",
      type: "",
      method: "whatsapp",
      message: "",
    },
    {
      ...contactRules,
      budget: ["required"],
      location: ["required"],
      type: ["required"],
    },
    "enquiry"
  );

  if (f.status === "done") {
    return <Success onReset={f.reset} />;
  }

  return (
    <form
      onSubmit={f.onSubmit}
      noValidate
      className="grid gap-5 md:grid-cols-2"
    >
      <Field label={t("form.name")} error={f.errors.name}>
        <input
          value={f.values.name}
          onChange={f.set("name")}
          maxLength={100}
          className="field"
        />
      </Field>

      <Field label={t("form.email")} error={f.errors.email}>
        <input
          type="email"
          value={f.values.email}
          onChange={f.set("email")}
          maxLength={255}
          className="field"
        />
      </Field>

      <PhoneField f={f} />

      <Field label={t("form.intent")}>
        <div className="grid grid-cols-2 gap-2">
          {(["buying", "renting"] as const).map((k) => (
            <button
              type="button"
              key={k}
              onClick={() =>
                f.set("intent")({ target: { value: k } })
              }
              className={cn(
                "field text-center",
                f.values.intent === k && "!border-gold bg-gold/10"
              )}
            >
              {t(`form.${k}`)}
            </button>
          ))}
        </div>
      </Field>

      <Field label={t("form.budget")} error={f.errors.budget}>
        <select
          value={f.values.budget}
          onChange={f.set("budget")}
          className="field"
        >
          <option value="">{t("form.select")}</option>
          {BUDGETS.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
      </Field>

      <Field label={t("form.location")} error={f.errors.location}>
        <select
          value={f.values.location}
          onChange={f.set("location")}
          className="field"
        >
          <option value="">{t("form.select")}</option>
          {LOCATIONS.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
      </Field>

      <Field label={t("form.type")} error={f.errors.type}>
        <select
          value={f.values.type}
          onChange={f.set("type")}
          className="field"
        >
          <option value="">{t("form.select")}</option>
          {TYPES.map((x) => (
            <option key={x} value={x}>
              {t(`types.${x}`)}
            </option>
          ))}
        </select>
      </Field>

      <Field label={t("form.method")}>
        <select
          value={f.values.method}
          onChange={f.set("method")}
          className="field"
        >
          <option value="whatsapp">{t("form.whatsapp")}</option>
          <option value="call">{t("form.call")}</option>
          <option value="email">{t("form.emailMethod")}</option>
        </select>
      </Field>

      <Field label={t("form.message")} className="md:col-span-2">
        <textarea
          value={f.values.message}
          onChange={f.set("message")}
          maxLength={1000}
          rows={4}
          className="field"
        />
      </Field>

      <SubmitError message={f.submitError} />

      <button
        disabled={f.status === "sending"}
        className={cn(btn(), "md:col-span-2")}
      >
        {f.status === "sending"
          ? t("common.sending")
          : t("common.submit")}
      </button>
    </form>
  );
}


export function ViewingForm({
  defaultProperty = "",
}: {
  defaultProperty?: string;
}) {
  const { t } = useI18n();

  const [availableProperties, setAvailableProperties] = useState<Property[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [propertyLoadError, setPropertyLoadError] = useState("");

  const f = useForm(
    {
      name: "",
      email: "",
      cc: "+971",
      phone: "",
      property: defaultProperty,
      date: "",
      time: "",
      mode: "inPerson",
      message: "",
    },
    {
      ...contactRules,
      property: ["required"],
      date: ["required"],
      time: ["required"],
    },
    "viewing"
  );

  useEffect(() => {
    let cancelled = false;

    async function loadProperties() {
      try {
        setPropertiesLoading(true);
        setPropertyLoadError("");

        const result = await listProperties();

        if (!cancelled) {
          setAvailableProperties(result);
        }
      } catch (error) {
        if (!cancelled) {
          setPropertyLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load properties."
          );
        }
      } finally {
        if (!cancelled) {
          setPropertiesLoading(false);
        }
      }
    }

    loadProperties();

    return () => {
      cancelled = true;
    };
  }, []);

  if (f.status === "done") {
    return <Success onReset={f.reset} />;
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form
      onSubmit={f.onSubmit}
      noValidate
      className="grid gap-5 md:grid-cols-2"
    >
      <Field label={t("form.name")} error={f.errors.name}>
        <input
          value={f.values.name}
          onChange={f.set("name")}
          maxLength={100}
          className="field"
        />
      </Field>

      <Field label={t("form.email")} error={f.errors.email}>
        <input
          type="email"
          value={f.values.email}
          onChange={f.set("email")}
          maxLength={255}
          className="field"
        />
      </Field>

      <PhoneField f={f} />

      <Field label={t("book.property")} error={f.errors.property}>
        <select
          value={f.values.property}
          onChange={f.set("property")}
          disabled={propertiesLoading || !!propertyLoadError}
          className="field"
        >
          <option value="">
            {propertiesLoading
              ? "Loading properties..."
              : propertyLoadError
                ? "Unable to load properties"
                : t("form.select")}
          </option>

          {availableProperties.map((p) => (
            <option key={p.id} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
      </Field>

      {propertyLoadError && (
        <div className="text-sm text-destructive md:col-span-2">
          {propertyLoadError}
        </div>
      )}

      {!propertiesLoading &&
        !propertyLoadError &&
        availableProperties.length === 0 && (
          <div className="text-sm text-muted-foreground md:col-span-2">
            No properties are currently available for viewing.
          </div>
        )}

      <Field label={t("book.date")} error={f.errors.date}>
        <input
          type="date"
          min={today}
          value={f.values.date}
          onChange={f.set("date")}
          className="field"
        />
      </Field>

      <Field label={t("book.time")} error={f.errors.time}>
        <select
          value={f.values.time}
          onChange={f.set("time")}
          className="field"
        >
          <option value="">{t("form.select")}</option>
          {["10:00", "11:30", "13:00", "15:00", "16:30", "18:00"].map(
            (x) => (
              <option key={x}>{x}</option>
            )
          )}
        </select>
      </Field>

      <Field label={t("book.mode")} className="md:col-span-2">
        <div className="grid grid-cols-2 gap-2">
          {(["inPerson", "videoCall"] as const).map((k) => (
            <button
              type="button"
              key={k}
              onClick={() =>
                f.set("mode")({ target: { value: k } })
              }
              className={cn(
                "field text-center",
                f.values.mode === k && "!border-gold bg-gold/10"
              )}
            >
              {t(`book.${k}`)}
            </button>
          ))}
        </div>
      </Field>

      <Field label={t("form.message")} className="md:col-span-2">
        <textarea
          value={f.values.message}
          onChange={f.set("message")}
          maxLength={1000}
          rows={3}
          className="field"
        />
      </Field>

      <SubmitError message={f.submitError} />

      <button
        disabled={
          f.status === "sending" ||
          propertiesLoading ||
          !!propertyLoadError ||
          availableProperties.length === 0
        }
        className={cn(btn(), "md:col-span-2")}
      >
        {f.status === "sending"
          ? t("common.sending")
          : t("nav.book")}
      </button>
    </form>
  );
}


export function CareerForm({
  position,
  onPosition,
}: {
  position: string;
  onPosition: (p: string) => void;
}) {
  const { t, tl } = useI18n();

  const f = useForm(
    {
      name: "",
      email: "",
      cc: "+971",
      phone: "",
      experience: "",
      cv: "",
      cover: "",
    },
    {
      ...contactRules,
      experience: ["required"],
      cv: ["required"],
    },
    "career"
  );

  const [posErr, setPosErr] = useState(false);

  if (f.status === "done") {
    return <Success onReset={f.reset} />;
  }

  return (
    <form
      onSubmit={(e) => {
        setPosErr(!position);
        if (!position) {
          e.preventDefault();
          return;
        }
        f.onSubmit(e);
      }}
      noValidate
      className="grid gap-5 md:grid-cols-2"
    >
      <Field
        label={t("careers.position")}
        error={posErr ? t("common.required") : undefined}
      >
        <select
          value={position}
          onChange={(e) => onPosition(e.target.value)}
          className="field"
        >
          <option value="">{t("form.select")}</option>
          {tl<{ title: string }>("careers.jobs").map((j) => (
            <option key={j.title}>{j.title}</option>
          ))}
        </select>
      </Field>

      <Field label={t("form.name")} error={f.errors.name}>
        <input
          value={f.values.name}
          onChange={f.set("name")}
          maxLength={100}
          className="field"
        />
      </Field>

      <Field label={t("form.email")} error={f.errors.email}>
        <input
          type="email"
          value={f.values.email}
          onChange={f.set("email")}
          maxLength={255}
          className="field"
        />
      </Field>

      <PhoneField f={f} />

      <Field
        label={t("careers.experience")}
        error={f.errors.experience}
      >
        <input
          type="number"
          min={0}
          max={50}
          value={f.values.experience}
          onChange={f.set("experience")}
          className="field"
        />
      </Field>

      <Field label={t("careers.cv")} error={f.errors.cv}>
        <input
          type="url"
          value={f.values.cv}
          onChange={f.set("cv")}
          maxLength={300}
          className="field"
          placeholder="https://"
        />
      </Field>

      <Field label={t("careers.cover")} className="md:col-span-2">
        <textarea
          value={f.values.cover}
          onChange={f.set("cover")}
          maxLength={1500}
          rows={4}
          className="field"
        />
      </Field>

      <SubmitError message={f.submitError} />

      <button
        disabled={f.status === "sending"}
        className={cn(btn(), "md:col-span-2")}
      >
        {f.status === "sending"
          ? t("common.sending")
          : t("careers.apply")}
      </button>
    </form>
  );
}
