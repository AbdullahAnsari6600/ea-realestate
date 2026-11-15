
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  BedDouble,
  Bath,
  Maximize,
  MapPin,
  Check,
  Play,
  Building2,
  CalendarDays,
  Wallet,
  BadgeCheck,
} from "lucide-react";

import { getPropertyBySlug } from "@/services/propertyService";
import { useI18n } from "@/i18n/I18nProvider";
import { priceRange } from "@/components/site/PropertyCard";
import { ViewingForm } from "@/components/site/Forms";
import { Reveal } from "@/components/site/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/properties/$slug")({
  loader: async ({ params }) => {
    const property = await getPropertyBySlug(params.slug);

    if (!property) throw notFound();

    return { property };
  },

  head: ({ loaderData }) => {
    const p = loaderData?.property;
    const title = p ? `${p.name} — ${p.location}` : "Property";
    const desc = p
      ? p.description.slice(0, 155)
      : "Luxury Dubai property by Early Approve Real Estate Group.";

    return {
      meta: [
        { title: `${title} | Early Approve` },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },

  notFoundComponent: () => (
    <div className="container-luxe py-48 text-center">
      <h1 className="text-4xl">Property not found</h1>
  
      <div className="mt-6 flex justify-center">
        <Link
          to="/properties"
          className="inline-flex items-center justify-center border border-gold bg-gold px-8 py-4 text-xs font-semibold uppercase tracking-widest text-ink transition hover:bg-transparent hover:text-gold"
        >
          View Available Properties
        </Link>
      </div>
    </div>
  ),
  component: PropertyDetail,
});

function PropertyDetail() {
  const { property: p } = Route.useLoaderData();
  const { t } = useI18n();

  const [active, setActive] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const handover = p.handoverDate
    ? new Date(p.handoverDate).toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
      })
    : null;

  const highlights = [
    p.featured ? "Featured Property" : null,
    p.trending ? "Trending Property" : null,
    p.bestDeal ? "Best Deal" : null,
    p.newListing ? "New Listing" : null,
  ].filter(Boolean) as string[];

  const specifications = [
    { icon: BedDouble, label: "Bedrooms", value: p.beds },
    { icon: Bath, label: "Bathrooms", value: p.baths },
    {
      icon: Maximize,
      label: "Built-up Area",
      value: `${p.area.toLocaleString()} ${p.areaUnit || "sqft"}`,
    },
  ];

  const projectDetails = [
    { label: "Property Type", value: t(`types.${p.type}`) },
    { label: "Listing Type", value: t(`search.${p.listing}`) },
    { label: "Developer", value: p.developer },
    { label: "Project Name", value: p.projectName },
    { label: "Handover", value: handover },
    { label: "Payment Plan", value: p.paymentPlan },
  ].filter((item) => item.value);

  return (
    <>
      <section className="bg-ink pb-16 pt-32">
        <div className="container-luxe">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-ink-muted hover:text-gold"
            >
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              {t("common.back")}
            </Link>

            <Link
              to="/properties"
              className="inline-flex items-center justify-center border border-gold bg-gold px-6 py-3 text-xs font-semibold uppercase tracking-widest text-ink transition hover:bg-transparent hover:text-gold"
            >
              View Available Properties
            </Link>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">
                {t(`types.${p.type}`)} · {t(`search.${p.listing}`)} ·{" "}
                {p.developer}
              </p>

              <h1 className="mt-3 text-5xl text-ink-foreground md:text-6xl">
                {p.name}
              </h1>

              <p className="mt-3 flex items-center gap-2 text-ink-muted">
                <MapPin className="h-4 w-4 text-gold" />
                {p.location}
              </p>
            </div>

            <p
              className="font-display text-4xl text-gold-gradient"
              dir="ltr"
            >
              {priceRange(p)}
            </p>
          </div>

          {highlights.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {highlights.map((highlight) => (
                <span
                  key={highlight}
                  className="border border-gold/40 bg-gold/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gold"
                >
                  {highlight}
                </span>
              ))}
            </div>
          )}

          <div className="mt-10 grid gap-3 lg:grid-cols-[1fr_200px]">
            <div className="relative aspect-[16/9] overflow-hidden bg-ink">
              {showVideo && p.videoUrl ? (
                <video
                  src={p.videoUrl}
                  controls
                  autoPlay
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={p.images[active]}
                  alt={p.name}
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <div className="grid grid-cols-4 gap-3 lg:grid-cols-1">
              {p.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setActive(i);
                    setShowVideo(false);
                  }}
                  aria-label={`${t("common.gallery")} ${i + 1}`}
                  className={cn(
                    "aspect-[4/3] overflow-hidden border-2",
                    !showVideo && active === i
                      ? "border-gold"
                      : "border-transparent opacity-70 hover:opacity-100"
                  )}
                >
                  <img
                    src={img}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}

              {p.videoUrl && (
                <button
                  onClick={() => setShowVideo(true)}
                  className={cn(
                    "relative flex aspect-[4/3] items-center justify-center border-2 bg-ink-foreground/10 text-ink-foreground",
                    showVideo ? "border-gold" : "border-transparent"
                  )}
                >
                  <Play className="h-6 w-6 text-gold" />
                  <span className="absolute bottom-1 text-[0.6rem] uppercase tracking-widest">
                    {t("common.video")}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-luxe grid gap-16 lg:grid-cols-[1fr_440px]">
          <Reveal>
            <div className="flex flex-wrap gap-8 border-b pb-8 text-sm">
              {specifications.map(({ icon: Icon, label, value }) => (
                <span
                  key={label}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-5 w-5 text-gold" />
                  {value}{" "}
                  {label === "Bedrooms"
                    ? t("common.beds")
                    : label === "Bathrooms"
                      ? t("common.baths")
                      : label === "Built-up Area"
                        ? ""
                        : label}
                </span>
              ))}
            </div>

            <h2 className="mb-5 mt-12 font-display text-3xl">
              Property Description
            </h2>

            <p className="text-lg leading-relaxed text-muted-foreground">
              {p.description}
            </p>

            {projectDetails.length > 0 && (
              <div className="mt-14">
                <h2 className="mb-8 font-display text-3xl">
                  Project Information
                </h2>

                <div className="grid gap-5 sm:grid-cols-2">
                  {projectDetails.map((item) => (
                    <div
                      key={item.label}
                      className="border-b border-border pb-4"
                    >
                      <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="font-medium">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {p.amenities.length > 0 && (
              <div className="mt-14">
                <h2 className="mb-8 font-display text-3xl">
                  Property Amenities
                </h2>

                <ul className="grid gap-4 sm:grid-cols-2">
                  {p.amenities.map((amenity) => (
                    <li
                      key={amenity}
                      className="flex items-center gap-3"
                    >
                      <Check className="h-4 w-4 text-gold" />
                      {amenity}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-14 border border-border p-8">
              <h2 className="mb-6 font-display text-3xl">
                Investment Overview
              </h2>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <Wallet className="mb-3 h-6 w-6 text-gold" />
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Asking Price
                  </p>
                  <p className="mt-2 text-xl font-semibold">
                    {priceRange(p)}
                  </p>
                </div>

                {p.paymentPlan && (
                  <div>
                    <BadgeCheck className="mb-3 h-6 w-6 text-gold" />
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      Payment Plan
                    </p>
                    <p className="mt-2 text-xl font-semibold">
                      {p.paymentPlan}
                    </p>
                  </div>
                )}

                {handover && (
                  <div>
                    <CalendarDays className="mb-3 h-6 w-6 text-gold" />
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      Expected Handover
                    </p>
                    <p className="mt-2 text-xl font-semibold">
                      {handover}
                    </p>
                  </div>
                )}

                {p.projectName && (
                  <div>
                    <Building2 className="mb-3 h-6 w-6 text-gold" />
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      Project
                    </p>
                    <p className="mt-2 text-xl font-semibold">
                      {p.projectName}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Reveal>

          <div className="h-fit bg-card p-8 shadow-luxe">
            <h2 className="mb-6 text-3xl">{t("nav.book")}</h2>
            <ViewingForm defaultProperty={p.slug} />
          </div>
        </div>

        <div className="container-luxe mt-16 flex justify-center">
          <Link
            to="/properties"
            className="inline-flex items-center justify-center border border-gold bg-gold px-8 py-4 text-xs font-semibold uppercase tracking-widest text-ink transition hover:bg-transparent hover:text-gold"
          >
            View Available Properties
          </Link>
        </div>
      </section>
    </>
  );
}
