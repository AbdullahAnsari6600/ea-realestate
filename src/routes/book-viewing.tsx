import { createFileRoute } from "@tanstack/react-router";
import bedroom from "@/assets/prop-bedroom.jpg";
import { useI18n } from "@/i18n/I18nProvider";
import { PageHero } from "@/components/site/ui";
import { ViewingForm } from "@/components/site/Forms";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/book-viewing")({
  validateSearch: (s: Record<string, unknown>): { property?: string | undefined } => {
    const { property } = s;
    return { property: typeof property === "string" ? property : undefined };
  },
  head: () => seo("Book a Viewing", "Arrange a private in-person or video viewing of luxury Dubai property with Early Approve Real Estate Group."),
  component: Book,
});

function Book() {
  const { t } = useI18n();
  const { property } = Route.useSearch();
  return (
    <>
      <PageHero title={t("book.title")} subtitle={t("book.subtitle")} image={bedroom} />
      <section className="py-24"><div className="container-luxe max-w-4xl"><div className="bg-card p-8 shadow-luxe md:p-12"><ViewingForm defaultProperty={property ?? ""} /></div></div></section>
    </>
  );
}
