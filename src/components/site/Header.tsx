import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Globe, Menu, X, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { LANGS, useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { btn } from "./ui";

export const NAV = [
  { to: "/", key: "home" },
  { to: "/about", key: "about" },
  { to: "/services", key: "services" },
  { to: "/properties", key: "properties" },
  { to: "/careers", key: "careers" },
  { to: "/investment", key: "investment" },
  { to: "/faq", key: "faq" },
  { to: "/contact", key: "contact" },
] as const;

// import { Link } from "@tanstack/react-router";
import logo from "@/assets/ea-logo.png";

export function Logo({ light = true }: { light?: boolean }) {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2.5">
      <img
        src={logo}
        alt="EA Real Estate Group"
        className="h-16 w-16 object-contain"
      />

      <span
        className={cn(
          "leading-tight -translate-y-1",
          light ? "text-ink-foreground" : "text-foreground"
        )}
      >
        <span className="block font-display text-base tracking-wide sm:text-lg">
          Early Approve
        </span>
        <span className="block text-[0.55rem] uppercase tracking-[0.25em] text-gold">
          Real Estate Group™
        </span>
      </span>
    </Link>
  );
}


function LanguageOptions() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Select language"
        aria-expanded={open}
        className="flex items-center gap-2 border border-ink-foreground/20 px-3 py-2 text-xs font-semibold text-ink-foreground transition hover:border-gold hover:text-gold"
      >
        <Globe size={16} />
        {LANGS.find((l) => l.code === lang)?.short}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute end-0 top-full z-[60] mt-2 min-w-36 border border-ink-foreground/15 bg-ink py-2 shadow-xl"
          >
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
                className={cn(
                  "block w-full px-4 py-2.5 text-start text-sm transition hover:bg-ink-foreground/10",
                  lang === l.code
                    ? "text-gold"
                    : "text-ink-foreground/80"
                )}
              >
                {l.label}
                {lang === l.code && (
                  <span className="ms-2 text-gold">✓</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Header() {
  const { t, lang } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const isRTL = lang === "ar";

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on);
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [lang]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-all duration-500",
          scrolled
            ? "bg-ink/95 py-3 shadow-lg backdrop-blur-xl"
            : "bg-transparent py-4 sm:py-6"
        )}
      >
       <div className="container-luxe flex items-center justify-between gap-3 px-5 sm:px-8">
          <Logo />

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-5 xl:flex">
            {NAV.filter((n) => n.key !== "faq").map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="whitespace-nowrap text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-ink-foreground/80 transition hover:text-gold"
                activeProps={{ className: "!text-gold" }}
              >
                {t(`nav.${n.key}`)}
              </Link>
            ))}
          </nav>

          {/* Header actions */}
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden xl:block">
              <LanguageOptions />
            </div>

            <Link
  to="/admin/login"
  className={cn(
    btn(),
    "hidden whitespace-nowrap px-5 py-2.5 xl:inline-flex"
  )}
>
  Login
</Link>

            <button
              aria-label={t("nav.menu")}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
              className="flex h-10 w-10 items-center justify-center border border-ink-foreground/20 text-ink-foreground transition hover:border-gold hover:text-gold xl:hidden"
            >
              {open ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile navigation */}

{/* Mobile navigation drawer */}
<AnimatePresence>
  {open && (
    <>
      {/* Background overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setOpen(false)}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm xl:hidden"
      />

      {/* Side drawer */}
      <motion.div
        initial={{ x: isRTL ? "-100%" : "100%" }}
        animate={{ x: 0 }}
        exit={{ x: isRTL ? "-100%" : "100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        dir={isRTL ? "rtl" : "ltr"}
        className={cn(
          "fixed bottom-0 top-0 z-[60] flex w-[82%] max-w-[360px] flex-col overflow-y-auto bg-ink px-6 pb-6 pt-5 shadow-2xl xl:hidden",
          isRTL ? "left-0" : "right-0"
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-ink-foreground/10 pb-5">
          <Logo />

          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center border border-ink-foreground/20 text-ink-foreground transition hover:border-gold hover:text-gold"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6">
          <p className="mb-4 text-[9px] font-semibold uppercase tracking-[0.3em] text-gold">
            Navigation
          </p>

          <div className="flex flex-col">
            {NAV.filter((n) => n.key !== "faq").map((n, i) => (
              <motion.div
                key={n.to}
                initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.035 }}
              >
                <Link
                  to={n.to}
                  onClick={() => setOpen(false)}
                  activeProps={{
                    className: "!text-gold !border-gold",
                  }}
                  className="flex items-center justify-between border-b border-ink-foreground/10 py-3 text-sm font-medium tracking-wide text-ink-foreground/80 transition hover:text-gold"
                >
                  {t(`nav.${n.key}`)}
                  <ArrowUpRight
                    size={15}
                    className="text-gold opacity-60"
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </nav>

        {/* Bottom section */}
        <div className="border-t border-ink-foreground/10 pt-5">
          <div className="mb-5 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-ink-foreground/50">
              Language
            </span>
            <LanguageOptions />
          </div>

          <Link
  to="/admin/login"
  onClick={() => setOpen(false)}
  className={cn(
    btn(),
    "flex w-full items-center justify-center py-3.5 text-sm"
  )}
>
  Admin Login
</Link>

          <p className="mt-5 text-center text-[9px] tracking-[0.2em] text-ink-foreground/30">
            EARLY APPROVE REAL ESTATE GROUP™
          </p>
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>

    </>
  );
}
