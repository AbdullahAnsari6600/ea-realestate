
import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Building2,
  ShieldCheck,
  Save,
  Loader2,
  Check,
  Plus,
  X,
  Image as ImageIcon,
  Video,
  Upload,
  Star,
  Trash2,
} from "lucide-react";

import {
  getCurrentAdmin,
  AdminAuthError,
  type Admin,
} from "@/services/adminAuthService";

import {
  createAdminProperty,
  uploadAdminPropertyMedia,
  AdminPropertyError,
  type CreateAdminPropertyInput,
  type AdminMediaType,
} from "@/services/adminPropertyService";

import AdminLayout from "@/components/admin/AdminLayout";
import PropertyMediaManager from "@/components/admin/PropertyMediaManager";

export const Route = createFileRoute("/admin/properties/create")({
  head: () => ({
    meta: [
      { title: "Create Property | EA Real Estate Administration" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CreatePropertyPage,
});

const inputClass =
  "w-full rounded-lg border border-white/10 bg-[#080D17] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#C5A46D]/60";

const labelClass = "mb-2 block text-xs font-medium text-white/65";

const sectionClass =
  "rounded-xl border border-white/10 bg-[#111827] p-5 sm:p-7";

const MAX_FILE_SIZE = 100 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
];

interface SelectedMedia {
  file: File;
  type: AdminMediaType;
}

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

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function CreatePropertyPage() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");

  const [createdPropertyId, setCreatedPropertyId] = useState<string | null>(
    null
  );

  const [createdPropertyName, setCreatedPropertyName] = useState("");

  const [amenities, setAmenities] = useState<string[]>([]);
  const [amenityInput, setAmenityInput] = useState("");

  // Media selected before property creation.
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia[]>([]);
  const [coverIndex, setCoverIndex] = useState<number | null>(null);

  const [form, setForm] = useState({
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
  });

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

  function updateField(
    field: keyof typeof form,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  // Select images and videos before creating the property.
  function handleMediaSelection(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) return;

    const validFiles: SelectedMedia[] = [];
    const failures: string[] = [];

    for (const file of files) {
      const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
      const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

      if (!isImage && !isVideo) {
        failures.push(`${file.name}: Unsupported file type.`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        failures.push(`${file.name}: File exceeds the 100 MB limit.`);
        continue;
      }

      validFiles.push({
        file,
        type: isImage ? "IMAGE" : "VIDEO",
      });
    }

    if (validFiles.length > 0) {
      setSelectedMedia((current) => {
        const next = [...current, ...validFiles];

        // Automatically choose the first image as cover.
        if (coverIndex === null) {
          const firstImageIndex = next.findIndex(
            (item) => item.type === "IMAGE"
          );

          if (firstImageIndex !== -1) {
            setCoverIndex(firstImageIndex);
          }
        }

        return next;
      });
    }

    setError(failures.length > 0 ? failures.join("\n") : "");
    event.target.value = "";
  }

  function removeSelectedMedia(index: number) {
    const updated = selectedMedia.filter(
      (_, itemIndex) => itemIndex !== index
    );

    setSelectedMedia(updated);

    if (coverIndex === index) {
      const nextCover = updated.findIndex(
        (item) => item.type === "IMAGE"
      );

      setCoverIndex(nextCover === -1 ? null : nextCover);
    } else if (coverIndex !== null && index < coverIndex) {
      setCoverIndex(coverIndex - 1);
    }
  }

  function selectCoverImage(index: number) {
    if (selectedMedia[index]?.type !== "IMAGE") return;
    setCoverIndex(index);
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
    setSuccess("");
    setUploadProgress("");

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
      setError(
        "Maximum price must be greater than or equal to minimum price."
      );
      return;
    }

    if (!Number.isFinite(area) || area <= 0) {
      setError("Please enter a valid property area.");
      return;
    }

    const optionalNumber = (value: string): number | null => {
      if (value.trim() === "") return null;
      return Number(value);
    };

    const bedrooms = optionalNumber(form.bedrooms);
    const bathrooms = optionalNumber(form.bathrooms);

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

    const payload: CreateAdminPropertyInput & {
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
      areaUnit: form.areaUnit.trim(),

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
      // Step 1: Create the property.
      const createdProperty = await createAdminProperty(payload);

      if (!createdProperty?.id) {
        throw new Error(
          "Property was created, but the server did not return its ID. Please check the property list before trying again."
        );
      }

      // Step 2: Upload selected media using the new property ID.
      const uploadFailures: string[] = [];
      let successfulUploads = 0;

      for (let index = 0; index < selectedMedia.length; index++) {
        const item = selectedMedia[index];

        setUploadProgress(
          `Uploading media ${index + 1} of ${selectedMedia.length}: ${item.file.name}`
        );

        try {
          await uploadAdminPropertyMedia(
            createdProperty.id,
            item.file,
            {
              type: item.type,
              sortOrder: index,
              isCover:
                item.type === "IMAGE" && index === coverIndex,
              altText:
                item.type === "IMAGE" ? item.file.name : undefined,
            }
          );

          successfulUploads++;
        } catch (uploadError) {
          if (
            uploadError instanceof AdminPropertyError &&
            uploadError.status === 401
          ) {
            window.location.replace("/admin/login");
            return;
          }

          uploadFailures.push(
            `${item.file.name}: ${
              uploadError instanceof Error
                ? uploadError.message
                : "Upload failed."
            }`
          );
        }
      }

      // Step 3: Show the existing gallery manager.
      setCreatedPropertyId(createdProperty.id);
      setCreatedPropertyName(createdProperty.name);

      if (selectedMedia.length === 0) {
        setSuccess(
          "Property created successfully. You can upload its media now."
        );
      } else if (uploadFailures.length === 0) {
        setSuccess(
          `Property created successfully. All ${successfulUploads} media file(s) uploaded successfully.`
        );
      } else {
        setSuccess(
          `Property created successfully. ${successfulUploads} of ${selectedMedia.length} media file(s) uploaded.`
        );

        setError(
          `Some files could not be uploaded:\n${uploadFailures.join("\n")}\n\nYou can retry uploading them through the gallery manager.`
        );
      }

      window.setTimeout(() => {
        document
          .getElementById("property-media-section")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      if (err instanceof AdminPropertyError && err.status === 401) {
        window.location.replace("/admin/login");
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "Unable to create property. Please try again."
      );
    } finally {
      setSubmitting(false);
      setUploadProgress("");
    }
  }

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
          <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-[#C5A46D]" />
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

  return (
    <AdminLayout admin={admin} title="Create Property">
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
              {createdPropertyId ? "Manage Property Media" : "Create Property"}
            </h1>

            <p className="mt-2 text-sm text-white/45">
              {createdPropertyId
                ? "Your property has been created. Manage its photos, videos and cover image."
                : "Add a new property, including its photos and videos."}
            </p>
          </div>

          {!createdPropertyId ? (
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
                      placeholder="e.g. Luxury 2 Bedroom Apartment in Dubai Marina"
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
                      placeholder="e.g. Dubai Marina, Dubai, UAE"
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
                      placeholder="Describe the property, its features, amenities and surroundings..."
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
                  Set the property price range and built-up area.
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
                      placeholder="e.g. 1200000"
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
                      placeholder="e.g. 1500000"
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
                      placeholder="e.g. 1250"
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
                  Add the property's room and bathroom details.
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
                      placeholder="e.g. 2"
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
                      placeholder="e.g. 2"
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
                      placeholder="e.g. Emaar Properties"
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
                      placeholder="e.g. Marina Gate"
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
                      placeholder="e.g. 60/40 payment plan"
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              <section className={sectionClass}>
                <h2 className="mb-2 font-semibold">Property Amenities</h2>
                <p className="mb-6 text-xs text-white/40">
                  Add facilities and features available with this property.
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
                          Added Amenities
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

              {/* Property media selection before creation */}
              <section className={sectionClass}>
                <div className="mb-6 flex items-center gap-3">
                  <ImageIcon className="text-[#C5A46D]" size={22} />
                  <div>
                    <h2 className="font-semibold">Property Images & Videos</h2>
                    <p className="mt-1 text-xs text-white/40">
                      Select your gallery media before creating the property.
                    </p>
                  </div>
                </div>

                <input
                  id="property-media-input"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
                  onChange={handleMediaSelection}
                  disabled={submitting}
                  className="hidden"
                />

                <label
                  htmlFor="property-media-input"
                  className={`flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-[#C5A46D]/40 bg-[#C5A46D]/[0.04] px-5 py-9 text-center transition hover:bg-[#C5A46D]/[0.08] ${
                    submitting ? "pointer-events-none opacity-50" : ""
                  }`}
                >
                  <div className="mb-3 rounded-full bg-[#C5A46D]/10 p-4">
                    <Upload size={25} className="text-[#C5A46D]" />
                  </div>

                  <span className="font-medium text-white">
                    Choose Photos & Videos
                  </span>

                  <span className="mt-2 text-sm text-white/45">
                    Select multiple files from your device
                  </span>

                  <span className="mt-2 text-xs text-white/30">
                    JPG, PNG, WebP, AVIF, MP4 and WebM
                  </span>

                  <span className="mt-1 text-xs text-white/30">
                    Maximum 100 MB per file
                  </span>
                </label>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-white/55">
                    Selected media: <strong className="text-white">{selectedMedia.length}</strong>
                  </p>

                  {selectedMedia.length > 0 && (
                    <p className="text-xs text-white/40">
                      {selectedMedia.filter((item) => item.type === "IMAGE").length} images ·{" "}
                      {selectedMedia.filter((item) => item.type === "VIDEO").length} videos
                    </p>
                  )}
                </div>

                {selectedMedia.length === 0 ? (
                  <div className="mt-4 rounded-lg border border-white/10 bg-[#080D17] px-4 py-7 text-center">
                    <ImageIcon className="mx-auto mb-2 text-white/25" size={26} />
                    <p className="text-sm text-white/45">
                      No photos or videos selected yet.
                    </p>
                    <p className="mt-1 text-xs text-white/30">
                      You can also add media later from the property gallery.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {selectedMedia.map((item, index) => (
                      <div
                        key={`${item.file.name}-${index}`}
                        className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
                          coverIndex === index
                            ? "border-[#C5A46D]/50 bg-[#C5A46D]/[0.06]"
                            : "border-white/10 bg-[#080D17]"
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="rounded-lg bg-white/5 p-3">
                            {item.type === "IMAGE" ? (
                              <ImageIcon className="text-[#C5A46D]" size={21} />
                            ) : (
                              <Video className="text-[#C5A46D]" size={21} />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p
                              className="truncate text-sm font-medium text-white"
                              title={item.file.name}
                            >
                              {item.file.name}
                            </p>
                            <p className="mt-1 text-xs text-white/40">
                              {item.type} · {formatFileSize(item.file.size)}
                            </p>

                            {coverIndex === index && (
                              <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#C5A46D]">
                                <Star size={12} fill="currentColor" />
                                Selected cover image
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          {item.type === "IMAGE" && (
                            <button
                              type="button"
                              onClick={() => selectCoverImage(index)}
                              disabled={submitting}
                              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition disabled:opacity-40 ${
                                coverIndex === index
                                  ? "border-[#C5A46D]/40 bg-[#C5A46D]/10 text-[#C5A46D]"
                                  : "border-white/10 text-white/60 hover:border-[#C5A46D]/40 hover:text-[#C5A46D]"
                              }`}
                            >
                              <Star size={14} />
                              {coverIndex === index ? "Cover Selected" : "Set as Cover"}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => removeSelectedMedia(index)}
                            disabled={submitting}
                            aria-label={`Remove ${item.file.name}`}
                            className="rounded-lg border border-red-500/20 p-2 text-red-400 transition hover:bg-red-500/10 disabled:opacity-40"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedMedia.length > 0 && coverIndex === null && (
                  <p className="mt-3 text-xs text-amber-300">
                    No cover image selected. Select an image to use as the property cover.
                  </p>
                )}

                <p className="mt-4 text-xs leading-relaxed text-white/35">
                  Your selected files will be uploaded automatically after the
                  property is created. You can manage, reorder, replace or
                  delete them from the property gallery afterward.
                </p>
              </section>

              <section className={sectionClass}>
                <h2 className="mb-2 font-semibold">Listing Settings</h2>
                <p className="mb-7 text-xs text-white/40">
                  Control the property's publication and availability.
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
                  Select the badges applicable to this property.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  {([
                    ["isFeatured", "Featured Property", "Highlight this property."],
                    ["isTrending", "Trending", "Mark as a trending listing."],
                    ["isBestDeal", "Best Deal", "Show as a special deal."],
                    ["isNewListing", "New Listing", "Mark as a newly added listing."],
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
                <div className="whitespace-pre-line rounded-lg border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
                  {error}
                </div>
              )}

              {uploadProgress && (
                <div className="flex items-center gap-3 rounded-lg border border-[#C5A46D]/20 bg-[#C5A46D]/5 p-4 text-sm text-[#E5D0A8]">
                  <Loader2 size={18} className="shrink-0 animate-spin" />
                  <span>{uploadProgress}</span>
                </div>
              )}

              <div className="flex flex-col-reverse justify-end gap-3 pb-8 sm:flex-row">
                <Link
                  to="/admin/properties"
                  className={`rounded-lg border border-white/10 px-6 py-3 text-center text-sm text-white/65 transition hover:bg-white/5 ${
                    submitting ? "pointer-events-none opacity-40" : ""
                  }`}
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
                      {uploadProgress ? "Uploading Media..." : "Creating Property..."}
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      Create Property
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <>
              {success && (
                <div className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm text-emerald-300">
                  <Check size={17} />
                  {success}
                </div>
              )}

              {error && (
                <div className="mb-6 whitespace-pre-line rounded-lg border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
                  {error}
                </div>
              )}

              <section className="mb-6 rounded-xl border border-[#C5A46D]/20 bg-[#C5A46D]/5 p-5">
                <div className="flex items-start gap-3">
                  <ImageIcon
                    className="mt-1 shrink-0 text-[#C5A46D]"
                    size={22}
                  />
                  <div>
                    <h2 className="font-semibold text-white">
                      {createdPropertyName}
                    </h2>
                    <p className="mt-1 text-sm text-white/50">
                      Your property details are saved. Manage its gallery
                      images, videos and cover image below.
                    </p>
                  </div>
                </div>
              </section>

              <div id="property-media-section" className="scroll-mt-8">
                <PropertyMediaManager propertyId={createdPropertyId} />
              </div>

              <div className="mt-7 flex flex-col-reverse justify-end gap-3 pb-8 sm:flex-row">
                <Link
                  to="/admin/properties"
                  className="rounded-lg border border-white/10 px-6 py-3 text-center text-sm text-white/65 transition hover:bg-white/5"
                >
                  Finish Later
                </Link>

                <Link
                  to="/admin/properties"
                  className="rounded-lg bg-[#C5A46D] px-6 py-3 text-center text-sm font-semibold text-[#080D17] transition hover:bg-[#D8BB8B]"
                >
                  Finish & View Properties
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
