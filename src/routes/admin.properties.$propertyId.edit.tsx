
import {
  useEffect,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import {
  ArrowLeft,
  Building2,
  Loader2,
  Save,
  ShieldCheck,
  Plus,
  X,
} from "lucide-react";

import {
  getCurrentAdmin,
  AdminAuthError,
  type Admin,
} from "@/services/adminAuthService";

import {
  getAdminPropertyById,
  updateAdminProperty,
  AdminPropertyError,
  type AdminProperty,
  type UpdateAdminPropertyInput,
} from "@/services/adminPropertyService";

import AdminLayout from "@/components/admin/AdminLayout";
import PropertyMediaManager from "@/components/admin/PropertyMediaManager";

export const Route = createFileRoute(
  "/admin/properties/$propertyId/edit"
)({
  head: () => ({
    meta: [
      { title: "Edit Property | EA Real Estate Administration" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: EditPropertyPage,
});

const inputClass =
  "w-full rounded-lg border border-white/10 bg-[#080D17] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#C5A46D]/60";

const labelClass = "mb-2 block text-xs font-medium text-white/65";

const sectionClass =
  "rounded-xl border border-white/10 bg-[#111827] p-5 sm:p-7";

const propertyTypes = [
  ["APARTMENT", "Apartment"],
  ["VILLA", "Villa"],
  ["PENTHOUSE", "Penthouse"],
  ["TOWNHOUSE", "Townhouse"],
  ["DUPLEX", "Duplex"],
  ["COMMERCIAL", "Commercial"],
  ["LAND", "Land"],
  ["OTHER", "Other"],
];

type PropertyForm = {
  name: string;
  type: string;
  listingType: string;
  location: string;
  description: string;
  priceMin: string;
  priceMax: string;
  currency: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  areaUnit: string;
  developer: string;
  projectName: string;
  handoverDate: string;
  paymentPlan: string;
  publicationStatus: string;
  availabilityStatus: string;
  isFeatured: boolean;
  isTrending: boolean;
  isBestDeal: boolean;
  isNewListing: boolean;
};

type PropertyAmenityData = {
  name: string;
};

type PropertyWithAmenities = AdminProperty & {
  amenities?: (string | PropertyAmenityData)[];
};

const emptyForm: PropertyForm = {
  name: "",
  type: "APARTMENT",
  listingType: "BUY",
  location: "",
  description: "",
  priceMin: "",
  priceMax: "",
  currency: "AED",
  bedrooms: "",
  bathrooms: "",
  area: "",
  areaUnit: "sqft",
  developer: "",
  projectName: "",
  handoverDate: "",
  paymentPlan: "",
  publicationStatus: "DRAFT",
  availabilityStatus: "AVAILABLE",
  isFeatured: false,
  isTrending: false,
  isBestDeal: false,
  isNewListing: false,
};

function propertyToForm(property: AdminProperty): PropertyForm {
  return {
    name: property.name ?? "",
    type: property.type,
    listingType: property.listingType,
    location: property.location ?? "",
    description: property.description ?? "",
    priceMin: String(property.priceMin ?? ""),
    priceMax: String(property.priceMax ?? ""),
    currency: property.currency ?? "AED",
    bedrooms: property.bedrooms == null ? "" : String(property.bedrooms),
    bathrooms: property.bathrooms == null ? "" : String(property.bathrooms),
    area: property.area == null ? "" : String(property.area),
    areaUnit: property.areaUnit ?? "sqft",
    developer: property.developer ?? "",
    projectName: property.projectName ?? "",
    handoverDate: property.handoverDate
      ? property.handoverDate.slice(0, 10)
      : "",
    paymentPlan: property.paymentPlan ?? "",
    publicationStatus: property.publicationStatus,
    availabilityStatus: property.availabilityStatus,
    isFeatured: property.isFeatured,
    isTrending: property.isTrending,
    isBestDeal: property.isBestDeal,
    isNewListing: property.isNewListing,
  };
}

function getAmenityNames(property: AdminProperty): string[] {
  const propertyWithAmenities = property as PropertyWithAmenities;

  return (propertyWithAmenities.amenities ?? [])
    .map((amenity) =>
      typeof amenity === "string" ? amenity : amenity.name
    )
    .filter((name) => typeof name === "string" && name.trim().length > 0);
}

function EditPropertyPage() {
  const { propertyId } = Route.useParams();
  const navigate = useNavigate();

  const [admin, setAdmin] = useState<Admin | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loadingProperty, setLoadingProperty] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<PropertyForm>(emptyForm);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [amenityInput, setAmenityInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPage() {
      try {
        const currentAdmin = await getCurrentAdmin();

        if (!active) return;
        setAdmin(currentAdmin);

        const property = await getAdminPropertyById(propertyId);

        if (!active) return;

        setForm(propertyToForm(property));
        setAmenities(getAmenityNames(property));
      } catch (err) {
        if (!active) return;

        if (
          (err instanceof AdminAuthError ||
            err instanceof AdminPropertyError) &&
          err.status === 401
        ) {
          window.location.replace("/admin/login");
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load property details."
        );
      } finally {
        if (active) {
          setCheckingSession(false);
          setLoadingProperty(false);
        }
      }
    }

    void loadPage();

    return () => {
      active = false;
    };
  }, [propertyId]);

  function updateField(
    field: keyof PropertyForm,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function addAmenity() {
    const name = amenityInput.trim();

    if (!name) return;

    if (amenities.some((item) => item.toLowerCase() === name.toLowerCase())) {
      setError("This amenity has already been added.");
      return;
    }

    if (amenities.length >= 50) {
      setError("You can add a maximum of 50 amenities.");
      return;
    }

    if (name.length > 120) {
      setError("Amenity names cannot exceed 120 characters.");
      return;
    }

    setAmenities((current) => [...current, name]);
    setAmenityInput("");
    setError("");
  }

  function removeAmenity(index: number) {
    setAmenities((current) =>
      current.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  function handleAmenityKeyDown(
    event: KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      addAmenity();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const priceMin = Number(form.priceMin);
    const priceMax = Number(form.priceMax);
    const area = Number(form.area);

    if (form.name.trim().length < 3) {
      setError("Property name must contain at least 3 characters.");
      return;
    }

    if (form.location.trim().length < 2) {
      setError("Please enter a valid property location.");
      return;
    }

    if (form.description.trim().length < 20) {
      setError("Description must contain at least 20 characters.");
      return;
    }

    if (
      !Number.isFinite(priceMin) ||
      !Number.isFinite(priceMax) ||
      priceMin <= 0 ||
      priceMax <= 0
    ) {
      setError("Please enter valid minimum and maximum prices.");
      return;
    }

    if (priceMax < priceMin) {
      setError("Maximum price must be greater than or equal to minimum price.");
      return;
    }

    if (!Number.isFinite(area) || area <= 0) {
      setError("Please enter a valid property area.");
      return;
    }

    const bedrooms =
      form.bedrooms.trim() === "" ? null : Number(form.bedrooms);

    const bathrooms =
      form.bathrooms.trim() === "" ? null : Number(form.bathrooms);

    if (
      bedrooms !== null &&
      (!Number.isInteger(bedrooms) || bedrooms < 0)
    ) {
      setError("Bedrooms must be a non-negative whole number.");
      return;
    }

    if (
      bathrooms !== null &&
      (!Number.isFinite(bathrooms) || bathrooms <= 0)
    ) {
      setError("Bathrooms must be greater than zero.");
      return;
    }

    const payload: UpdateAdminPropertyInput & {
      amenities: string[];
    } = {
      name: form.name.trim(),
      type: form.type,
      listingType: form.listingType,
      location: form.location.trim(),
      description: form.description.trim(),

      priceMin,
      priceMax,
      currency: form.currency,

      bedrooms,
      bathrooms,
      area,
      areaUnit: form.areaUnit,

      developer: form.developer.trim() || null,
      projectName: form.projectName.trim() || null,
      handoverDate: form.handoverDate || null,
      paymentPlan: form.paymentPlan.trim() || null,

      amenities,

      publicationStatus: form.publicationStatus,
      availabilityStatus: form.availabilityStatus,

      isFeatured: form.isFeatured,
      isTrending: form.isTrending,
      isBestDeal: form.isBestDeal,
      isNewListing: form.isNewListing,
    };

    setSubmitting(true);

    try {
      await updateAdminProperty(propertyId, payload);

      await navigate({
        to: "/admin/properties",
      });
    } catch (err) {
      if (
        err instanceof AdminPropertyError &&
        err.status === 401
      ) {
        window.location.replace("/admin/login");
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update property. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingSession || loadingProperty) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080D17] text-white">
        <div className="text-center">
          <Loader2 className="mx-auto mb-5 h-9 w-9 animate-spin text-[#C5A46D]" />
          <p className="text-sm text-white/55">
            {checkingSession
              ? "Verifying secure admin session..."
              : "Loading property details..."}
          </p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080D17] px-5 text-white">
        <div className="max-w-md text-center">
          <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-[#C5A46D]" />
          <h1 className="text-xl font-semibold">
            Unable to verify session
          </h1>
          <p className="mt-3 text-sm text-white/50">
            {error || "Please sign in again."}
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

  if (error && !form.name) {
    return (
      <AdminLayout admin={admin} title="Edit Property">
        <div className="px-5 py-10 text-white sm:px-8">
          <div className="mx-auto max-w-2xl rounded-xl border border-red-400/20 bg-red-400/5 p-6">
            <h1 className="text-xl font-semibold">Unable to load property</h1>
            <p className="mt-3 text-sm text-red-300">{error}</p>
            <Link
              to="/admin/properties"
              className="mt-6 inline-flex items-center gap-2 text-sm text-[#C5A46D]"
            >
              <ArrowLeft size={16} />
              Back to Properties
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout admin={admin} title="Edit Property">
      <div className="px-5 py-8 text-white sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1100px]">
          <Link
            to="/admin/properties"
            className="mb-7 inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-[#C5A46D]"
          >
            <ArrowLeft size={16} />
            Back to Properties
          </Link>

          <div className="mb-8">
            <p className="text-xs font-medium tracking-[0.2em] text-[#C5A46D]">
              PROPERTY MANAGEMENT
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Edit Property
            </h1>
            <p className="mt-2 text-sm text-white/45">
              Update the saved property information.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <section className={sectionClass}>
              <div className="mb-7 flex items-center gap-3">
                <Building2 className="text-[#C5A46D]" size={22} />
                <div>
                  <h2 className="font-semibold">Basic Information</h2>
                  <p className="mt-1 text-xs text-white/40">
                    Main property details
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Property Name *</label>
                  <input
                    required
                    minLength={3}
                    maxLength={255}
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Property Type *</label>
                  <select
                    value={form.type}
                    onChange={(e) => updateField("type", e.target.value)}
                    className={inputClass}
                  >
                    {propertyTypes.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Listing Type *</label>
                  <select
                    value={form.listingType}
                    onChange={(e) =>
                      updateField("listingType", e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="BUY">For Sale</option>
                    <option value="RENT">For Rent</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Location *</label>
                  <input
                    required
                    minLength={2}
                    maxLength={255}
                    value={form.location}
                    onChange={(e) => updateField("location", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Description *</label>
                  <textarea
                    required
                    minLength={20}
                    rows={6}
                    value={form.description}
                    onChange={(e) =>
                      updateField("description", e.target.value)
                    }
                    className={`${inputClass} resize-y`}
                  />
                  <p className="mt-2 text-right text-[10px] text-white/30">
                    {form.description.length} characters (minimum 20)
                  </p>
                </div>
              </div>
            </section>

            <section className={sectionClass}>
              <h2 className="mb-2 font-semibold">Pricing & Area</h2>
              <p className="mb-7 text-xs text-white/40">
                Property price range and built-up area.
              </p>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Minimum Price *</label>
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="any"
                    value={form.priceMin}
                    onChange={(e) => updateField("priceMin", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Maximum Price *</label>
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="any"
                    value={form.priceMax}
                    onChange={(e) => updateField("priceMax", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Currency *</label>
                  <select
                    value={form.currency}
                    onChange={(e) => updateField("currency", e.target.value)}
                    className={inputClass}
                  >
                    <option value="AED">AED - UAE Dirham</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="SAR">SAR - Saudi Riyal</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Property Area *</label>
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="any"
                    value={form.area}
                    onChange={(e) => updateField("area", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Area Unit *</label>
                  <select
                    value={form.areaUnit}
                    onChange={(e) => updateField("areaUnit", e.target.value)}
                    className={inputClass}
                  >
                    <option value="sqft">Square Feet (sqft)</option>
                    <option value="sqm">Square Metres (sqm)</option>
                    <option value="sqyd">Square Yards (sqyd)</option>
                  </select>
                </div>
              </div>
            </section>

            <section className={sectionClass}>
              <h2 className="mb-2 font-semibold">Property Specifications</h2>
              <p className="mb-7 text-xs text-white/40">
                Room and bathroom details.
              </p>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Bedrooms</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.bedrooms}
                    onChange={(e) => updateField("bedrooms", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Bathrooms</label>
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    value={form.bathrooms}
                    onChange={(e) => updateField("bathrooms", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            <section className={sectionClass}>
              <h2 className="mb-2 font-semibold">Project Information</h2>
              <p className="mb-7 text-xs text-white/40">
                Optional developer and project information.
              </p>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Developer</label>
                  <input
                    value={form.developer}
                    onChange={(e) => updateField("developer", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Project Name</label>
                  <input
                    value={form.projectName}
                    onChange={(e) =>
                      updateField("projectName", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Handover Date</label>
                  <input
                    type="date"
                    value={form.handoverDate}
                    onChange={(e) =>
                      updateField("handoverDate", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Payment Plan</label>
                  <input
                    value={form.paymentPlan}
                    onChange={(e) =>
                      updateField("paymentPlan", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            {/* PROPERTY AMENITIES */}
            <section className={sectionClass}>
              <h2 className="mb-2 font-semibold">Property Amenities</h2>
              <p className="mb-6 text-xs text-white/40">
                Manage the facilities and features available with this property.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  maxLength={120}
                  value={amenityInput}
                  onChange={(e) => setAmenityInput(e.target.value)}
                  onKeyDown={handleAmenityKeyDown}
                  placeholder="e.g. Swimming Pool, Gymnasium, Covered Parking"
                  className={inputClass}
                />

                <button
                  type="button"
                  onClick={addAmenity}
                  disabled={!amenityInput.trim() || amenities.length >= 50}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#C5A46D] px-5 py-3 text-sm font-semibold text-[#080D17] transition hover:bg-[#D8BB8B] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus size={17} />
                  Add Amenity
                </button>
              </div>

              <div className="mt-5">
                {amenities.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-white/10 px-4 py-7 text-center">
                    <p className="text-sm text-white/40">
                      No amenities added yet.
                    </p>
                    <p className="mt-1 text-xs text-white/25">
                      Add amenities such as swimming pool, gym, balcony or security.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-medium text-white/55">
                        Saved and New Amenities
                      </p>
                      <p className="text-xs text-white/35">
                        {amenities.length}/50
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {amenities.map((amenity, index) => (
                        <span
                          key={`${amenity}-${index}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-[#C5A46D]/25 bg-[#C5A46D]/10 px-3 py-2 text-sm text-[#E5D0A8]"
                        >
                          {amenity}

                          <button
                            type="button"
                            onClick={() => removeAmenity(index)}
                            aria-label={`Remove ${amenity}`}
                            className="rounded-full p-0.5 text-white/45 transition hover:bg-white/10 hover:text-red-300"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>

            <section className={sectionClass}>
              <h2 className="mb-2 font-semibold">Listing Settings</h2>
              <p className="mb-7 text-xs text-white/40">
                Publication and availability settings.
              </p>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Publication Status</label>
                  <select
                    value={form.publicationStatus}
                    onChange={(e) =>
                      updateField("publicationStatus", e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Availability Status</label>
                  <select
                    value={form.availabilityStatus}
                    onChange={(e) =>
                      updateField("availabilityStatus", e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="RESERVED">Reserved</option>
                    <option value="SOLD">Sold</option>
                  </select>
                </div>
              </div>
            </section>

            <section className={sectionClass}>
              <h2 className="mb-2 font-semibold">Property Highlights</h2>
              <p className="mb-6 text-xs text-white/40">
                Select the applicable property badges.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                {([
                  ["isFeatured", "Featured Property", "Highlight this property."],
                  ["isTrending", "Trending", "Mark as a trending listing."],
                  ["isBestDeal", "Best Deal", "Show as a special deal."],
                  ["isNewListing", "New Listing", "Mark as newly added."],
                ] as const).map(([field, title, description]) => (
                  <label
                    key={field}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-[#080D17] p-4 transition hover:border-[#C5A46D]/40"
                  >
                    <input
                      type="checkbox"
                      checked={form[field]}
                      onChange={(e) => updateField(field, e.target.checked)}
                      className="mt-1 h-4 w-4 accent-[#C5A46D]"
                    />
                    <span>
                      <span className="block text-sm font-medium text-white/85">
                        {title}
                      </span>
                      <span className="mt-1 block text-xs text-white/40">
                        {description}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </section>

            {error && (
              <div className="rounded-lg border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* PROPERTY MEDIA - MOVED INSIDE THE FORM */}
            <PropertyMediaManager propertyId={propertyId} />

            {/* FINAL FORM ACTIONS */}
            <div className="flex flex-col-reverse justify-end gap-3 pb-8 sm:flex-row">
              <Link
                to="/admin/properties"
                className="rounded-lg border border-white/10 px-6 py-3 text-center text-sm text-white/65 transition hover:bg-white/5"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C5A46D] px-7 py-3 text-sm font-semibold text-[#080D17] transition hover:bg-[#D8BB8B] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
