import { createFileRoute, Link } from "@tanstack/react-router";
import townhouse from "@/assets/prop-townhouse.jpg";
import { useI18n } from "@/i18n/I18nProvider";
import { PageHero, btn } from "@/components/site/ui";
import { FAQList } from "@/components/site/Sections";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/faq")({
  head: () => seo("FAQ", "Answers on buying property in Dubai as a foreigner, mortgages, purchase costs, Golden Visa and remote buying."),
  component: Faq,
});

function Faq() {
  const { t } = useI18n();
  return (
    <>
      <PageHero title={t("faq.title")} subtitle={t("contact.subtitle")} image={townhouse} />
      <section className="py-24"><div className="container-luxe"><FAQList /><div className="mt-14 text-center"><Link to="/contact" className={btn({ variant: "dark" })}>{t("nav.contact")}</Link></div></div></section>
    </>
  );
}
