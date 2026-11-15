
import villa from "@/assets/prop-villa.jpg";
import type {
  Property,
  PropertyType,
  Listing,
} from "@/data/properties";

export interface PropertyFilters {
  listing?: Listing | "all" | undefined;
  location?: string | undefined;
  type?: PropertyType | "all" | undefined;
  maxBudget?: number | undefined;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not configured.");
}

// ==========================================
// API TYPES
// ==========================================

interface ApiMedia {
  id: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  sortOrder: number;
  isCover: boolean;
  altText?: string | null;
}

interface ApiAmenity {
  id: string;
  propertyId: string;
  name: string;
  sortOrder: number;
}

interface ApiProperty {
  id: string;
  slug: string;
  name: string;
  type: string;
  listingType: string;
  location: string;
  developer?: string | null;
  description?: string | null;

  priceMin: number | string;
  priceMax: number | string;

  bedrooms?: number | null;
  bathrooms?: number | string | null;
  area?: number | string | null;
  areaUnit?: string | null;
  currency?: string | null;

  projectName?: string | null;
  handoverDate?: string | null;
  paymentPlan?: string | null;

  isFeatured?: boolean;
  isTrending?: boolean;
  isBestDeal?: boolean;
  isNewListing?: boolean;

  media?: ApiMedia[];
  amenities?: ApiAmenity[];
}

interface PropertiesResponse {
  success: boolean;
  message?: string;
  properties: ApiProperty[];
}

interface PropertyResponse {
  success: boolean;
  message?: string;
  property: ApiProperty;
}

// ==========================================
// PROPERTY TYPE MAPPING
// ==========================================

const typeMap: Record<string, PropertyType> = {
  APARTMENT: "apartment",
  VILLA: "villa",
  PENTHOUSE: "penthouse",
  TOWNHOUSE: "townhouse",
  DUPLEX: "duplex",
  COMMERCIAL: "commercial",
  LAND: "land",
  OTHER: "other",
};

// ==========================================
// MEDIA URL
// ==========================================

function getMediaUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

// ==========================================
// MAP API PROPERTY TO FRONTEND PROPERTY
// ==========================================

function mapProperty(item: ApiProperty): Property {
  const media = [...(item.media ?? [])].sort((a, b) => {
    if (a.isCover !== b.isCover) {
      return a.isCover ? -1 : 1;
    }

    return a.sortOrder - b.sortOrder;
  });

  const images = media
    .filter((mediaItem) => mediaItem.type === "IMAGE" && mediaItem.url)
    .map((mediaItem) => getMediaUrl(mediaItem.url));

  const video = media.find(
    (mediaItem) => mediaItem.type === "VIDEO" && mediaItem.url
  );

  // Convert backend amenity records into frontend amenity names.
  const amenities = [...(item.amenities ?? [])]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((amenity) => amenity.name)
    .filter((name) => typeof name === "string" && name.trim().length > 0);

  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    type: typeMap[item.type] ?? "other",
    listing: item.listingType === "RENT" ? "rent" : "buy",
    location: item.location,
    developer: item.developer || "—",
    description: item.description || "",

    priceMin: Number(item.priceMin) || 0,
    priceMax: Number(item.priceMax) || 0,
    currency: item.currency || "AED",

    beds: item.bedrooms != null ? String(item.bedrooms) : "—",
    baths: Number(item.bathrooms) || 0,
    area: Number(item.area) || 0,
    areaUnit: item.areaUnit || "sqft",

    projectName: item.projectName || undefined,
    handoverDate: item.handoverDate || undefined,
    paymentPlan: item.paymentPlan || undefined,

    images: images.length > 0 ? images : [villa],
    videoUrl: video ? getMediaUrl(video.url) : undefined,

    amenities,

    featured: Boolean(item.isFeatured),
    trending: Boolean(item.isTrending),
    bestDeal: Boolean(item.isBestDeal),
    newListing: Boolean(item.isNewListing),
  };
}

// ==========================================
// PUBLIC API REQUEST
// ==========================================

async function publicRequest<T>(path: string): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/properties${path}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
  } catch {
    throw new Error(
      "Unable to connect to the property server. Please try again."
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message || "Unable to retrieve property information."
    );
  }

  return data as T;
}

// ==========================================
// GET PUBLIC PROPERTIES
// ==========================================

export async function listProperties(
  filters: PropertyFilters = {}
): Promise<Property[]> {
  const params = new URLSearchParams();

  if (filters.listing && filters.listing !== "all") {
    params.set("listingType", filters.listing.toUpperCase());
  }

  if (filters.location && filters.location !== "all") {
    params.set("location", filters.location);
  }

  if (filters.type && filters.type !== "all") {
    const backendType = Object.entries(typeMap).find(
      ([, frontendType]) => frontendType === filters.type
    )?.[0];

    if (backendType) {
      params.set("type", backendType);
    }
  }

  if (filters.maxBudget && filters.maxBudget > 0) {
    params.set("maxPrice", String(filters.maxBudget));
  }

  const query = params.toString();
  const path = query ? `?${query}` : "";

  const response = await publicRequest<PropertiesResponse>(path);

  return (response.properties ?? []).map(mapProperty);
}

// ==========================================
// GET FEATURED PROPERTIES
// ==========================================

export async function getFeaturedProperties(): Promise<Property[]> {
  const properties = await listProperties();

  return properties.filter((property) => property.featured);
}

// ==========================================
// GET PROPERTY BY SLUG
// ==========================================

export async function getPropertyBySlug(
  slug: string
): Promise<Property | null> {
  try {
    const response = await publicRequest<PropertyResponse>(
      `/slug/${encodeURIComponent(slug)}`
    );

    return response.property ? mapProperty(response.property) : null;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("not found")
    ) {
      return null;
    }

    throw error;
  }
}
