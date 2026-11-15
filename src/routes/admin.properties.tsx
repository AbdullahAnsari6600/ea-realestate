
import { useEffect, useState, useCallback } from "react";
import {
  createFileRoute,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";

import {
  Building2,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
} from "lucide-react";

import {
  getCurrentAdmin,
  AdminAuthError,
  type Admin,
} from "@/services/adminAuthService";

import AdminLayout from "@/components/admin/AdminLayout";

import {
  listAdminProperties,
  getAdminMediaUrl,
  AdminPropertyError,
  type AdminProperty,
  type AdminPropertyType,
  type AdminPropertyPagination,
} from "@/services/adminPropertyService";

export const Route = createFileRoute("/admin/properties")({
  head: () => ({
    meta: [
      { title: "Properties | EA Real Estate Administration" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPropertiesPage,
});

const propertyTypes: {
  label: string;
  value: AdminPropertyType | "ALL";
}[] = [
  { label: "All types", value: "ALL" },
  { label: "Apartment", value: "APARTMENT" },
  { label: "Villa", value: "VILLA" },
  { label: "Penthouse", value: "PENTHOUSE" },
  { label: "Townhouse", value: "TOWNHOUSE" },
  { label: "Duplex", value: "DUPLEX" },
  { label: "Commercial", value: "COMMERCIAL" },
  { label: "Land", value: "LAND" },
  { label: "Other", value: "OTHER" },
];

function formatPrice(value: number | string, currency: string) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return "Price unavailable";

  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function StatusBadge({ value }: { value: string }) {
  const styles: Record<string, string> = {
    PUBLISHED: "bg-emerald-400/10 text-emerald-300",
    DRAFT: "bg-white/10 text-white/55",
    AVAILABLE: "bg-emerald-400/10 text-emerald-300",
    RESERVED: "bg-amber-400/10 text-amber-300",
    SOLD: "bg-red-400/10 text-red-300",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide ${
        styles[value] ?? "bg-white/10 text-white/50"
      }`}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}

function AdminPropertiesPage() {
  // Detect whether the Create Property child route is active.
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const [admin, setAdmin] = useState<Admin | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [pagination, setPagination] =
    useState<AdminPropertyPagination | null>(null);

  const [search, setSearch] = useState("");
  const [type, setType] = useState<AdminPropertyType | "ALL">("ALL");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function verifySession() {
      try {
        const currentAdmin = await getCurrentAdmin();

        if (active) setAdmin(currentAdmin);
      } catch (err) {
        if (!active) return;

        if (err instanceof AdminAuthError && err.status === 401) {
          window.location.replace("/admin/login");
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Unable to verify administrator session."
        );
      } finally {
        if (active) setCheckingSession(false);
      }
    }

    void verifySession();

    return () => {
      active = false;
    };
  }, []);

  const loadProperties = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await listAdminProperties({
        page,
        limit: 10,
        search: search.trim() || undefined,
        type: type === "ALL" ? undefined : type,
        sort: "newest",
      });

      setProperties(result.properties);
      setPagination(result.pagination);
    } catch (err) {
      setError(
        err instanceof AdminPropertyError
          ? err.message
          : "Unable to load properties."
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, type]);

  useEffect(() => {
    if (admin && pathname === "/admin/properties") {
      void loadProperties();
    }
  }, [admin, pathname, loadProperties]);

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080D17] text-white">
        <div className="text-center">
          <div className="mx-auto mb-5 h-9 w-9 animate-spin rounded-full border-2 border-[#C5A46D] border-t-transparent" />
          <p className="text-sm text-white/55">
            Verifying secure admin session...
          </p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080D17] px-5 text-white">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold">
            Unable to verify session
          </h1>
          <p className="mt-3 text-sm text-white/50">
            {error || "Redirecting to administrator login..."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-lg bg-[#C5A46D] px-5 py-3 text-sm font-semibold text-[#080D17]"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Render the nested Create Property route instead of the listing page.
  if (pathname !== "/admin/properties") {
    return <Outlet />;
  }
  return (
    <AdminLayout admin={admin} title="Properties">
      <div className="px-5 py-8 text-white sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-[#C5A46D]">
                PROPERTY MANAGEMENT
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Properties
              </h1>

              <p className="mt-2 text-sm text-white/45">
                Manage your real estate inventory and listings.
              </p>
            </div>

            <button
              onClick={() => {
                window.location.assign("/admin/properties/create");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C5A46D] px-5 py-3 text-sm font-semibold text-[#080D17] transition hover:bg-[#D8BB8B]"
            >
              <Plus size={17} />
              Create Property
            </button>
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-[#111827] p-5">
              <p className="text-xs text-white/45">Total Properties</p>
              <p className="mt-3 text-2xl font-semibold">
                {pagination?.total ?? "—"}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#111827] p-5">
              <p className="text-xs text-white/45">Current Page</p>
              <p className="mt-3 text-2xl font-semibold">
                {pagination?.page ?? "—"}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#111827] p-5">
              <p className="text-xs text-white/45">Total Pages</p>
              <p className="mt-3 text-2xl font-semibold">
                {pagination?.totalPages ?? "—"}
              </p>
            </div>
          </div>

          <div className="mb-5 flex flex-col gap-3 rounded-xl border border-white/10 bg-[#111827] p-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by property, location or developer..."
                className="w-full rounded-lg border border-white/10 bg-[#080D17] py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#C5A46D]/50"
              />
            </div>

            <select
              value={type}
              onChange={(event) => {
                setType(event.target.value as AdminPropertyType | "ALL");
                setPage(1);
              }}
              className="rounded-lg border border-white/10 bg-[#080D17] px-4 py-3 text-sm text-white outline-none focus:border-[#C5A46D]/50"
            >
              {propertyTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => void loadProperties()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-sm text-white/65 transition hover:bg-white/5 disabled:opacity-40"
            >
              <RefreshCw
                size={15}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-400/20 bg-red-400/5 p-4">
              <p className="text-sm text-red-300">{error}</p>
              <button
                onClick={() => void loadProperties()}
                className="text-xs text-[#D8BB8B] hover:underline"
              >
                Retry
              </button>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111827]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
              <div>
                <h2 className="font-semibold">All Properties</h2>
                <p className="mt-1 text-xs text-white/40">
                  Showing {properties.length} properties on this page
                </p>
              </div>
              <Building2 className="text-[#C5A46D]" size={21} />
            </div>

            {loading ? (
              <div className="flex min-h-64 items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#C5A46D] border-t-transparent" />
                  <p className="text-sm text-white/45">
                    Loading properties...
                  </p>
                </div>
              </div>
            ) : properties.length === 0 ? (
              <div className="px-5 py-20 text-center">
                <Building2 className="mx-auto mb-4 text-white/20" size={36} />
                <h3 className="font-medium">No properties found</h3>
                <p className="mt-2 text-sm text-white/40">
                  Try changing your search or filters.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    className="flex flex-col gap-4 p-5 transition hover:bg-white/[0.02] lg:flex-row lg:items-center"
                  >
                   <div className="h-24 w-full shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#080D17] sm:w-36">
  {(() => {
    const coverImage =
      property.media?.find(
        (item) => item.type === "IMAGE" && item.isCover
      ) ??
      property.media?.find((item) => item.type === "IMAGE");

    return coverImage?.url ? (
      <img
        src={getAdminMediaUrl(coverImage.url)}
        alt={property.name}
        className="h-full w-full object-cover"
      />
    ) : (
      <div className="flex h-full items-center justify-center">
        <Building2 className="text-white/20" size={30} />
      </div>
    );
  })()}
</div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-white">
                          {property.name}
                        </h3>
                        <StatusBadge value={property.publicationStatus} />
                        <StatusBadge value={property.availabilityStatus} />
                      </div>

                      <p className="mt-2 text-xs text-white/45">
                        {property.location}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-white/40">
                        <span>{property.type.replaceAll("_", " ")}</span>
                        <span>{property.listingType}</span>
                        {property.bedrooms !== null && (
                          <span>{property.bedrooms} bedrooms</span>
                        )}
                        {property.area !== null && (
                          <span>
                            {property.area} {property.areaUnit ?? ""}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 lg:min-w-44 lg:text-right">
                      <p className="text-sm font-semibold text-[#D8BB8B]">
                        {formatPrice(property.priceMin, property.currency)}
                      </p>
                      <button
  type="button"
  onClick={() => {
    window.location.assign(
      `/admin/properties/${encodeURIComponent(property.id)}/edit`
    );
  }}
  className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg border border-[#C5A46D]/30 px-4 py-2 text-xs font-medium text-[#D8BB8B] transition hover:bg-[#C5A46D]/10"
>
  <Pencil size={14} />
  Edit Property
</button>

                      {Number(property.priceMax) >
                        Number(property.priceMin) && (
                        <p className="mt-1 text-xs text-white/35">
                          Up to{" "}
                          {formatPrice(property.priceMax, property.currency)}
                        </p>
                      )}

                      <p className="mt-2 text-[10px] text-white/30">
                        {property.isFeatured ? "FEATURED" : ""}
                        {property.isTrending ? " · TRENDING" : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 px-5 py-4">
              <p className="text-xs text-white/40">
                Page {pagination?.page ?? page} of{" "}
                {pagination?.totalPages ?? 0}
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={!pagination?.hasPreviousPage || loading}
                  onClick={() => setPage((current) => current - 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/65 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft size={15} />
                  Previous
                </button>

                <button
                  disabled={!pagination?.hasNextPage || loading}
                  onClick={() => setPage((current) => current + 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/65 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Next
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-[10px] tracking-wide text-white/25">
            © {new Date().getFullYear()} EA Real Estate Group™. All rights
            reserved.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
