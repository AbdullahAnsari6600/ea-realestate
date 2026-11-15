
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");

// if (!API_BASE_URL) {
//   throw new Error("VITE_API_BASE_URL is not configured.");
// }

// // ==========================================
// // TYPES
// // ==========================================

// export type AdminPropertyType =
//   | "APARTMENT"
//   | "VILLA"
//   | "PENTHOUSE"
//   | "TOWNHOUSE"
//   | "DUPLEX"
//   | "COMMERCIAL"
//   | "LAND"
//   | "OTHER";

// export type AdminListingType = "BUY" | "RENT";

// export type AdminPublicationStatus = "DRAFT" | "PUBLISHED";

// export type AdminAvailabilityStatus =
//   | "AVAILABLE"
//   | "RESERVED"
//   | "SOLD";

// export type AdminMediaType = "IMAGE" | "VIDEO";

// export interface AdminPropertyAmenity {
//     id: string;
//     propertyId: string;
//     name: string;
//     sortOrder: number;
//     createdAt?: string;
//     updatedAt?: string;
//   }

// export interface AdminPropertyMedia {
//   id: string;
//   propertyId: string;
//   type: AdminMediaType;
//   url: string;
//   sortOrder: number;
//   isCover: boolean;
//   altText?: string | null;
//   fileName?: string | null;
//   mimeType?: string | null;
//   fileSize?: number | null;
//   createdAt?: string;
//   updatedAt?: string;
// }

// export interface AdminProperty {
//   id: string;
//   slug: string;
//   name: string;
//   type: AdminPropertyType;
//   listingType: AdminListingType;
//   location: string;
//   description: string;
//   amenities: AdminPropertyAmenity[];

//   priceMin: number | string;
//   priceMax: number | string;
//   currency: string;

//   bedrooms: number | null;
//   bathrooms: number | null;
//   area: number | string | null;
//   areaUnit: string | null;

//   developer: string | null;
//   projectName: string | null;
//   handoverDate: string | null;
//   paymentPlan: string | null;

//   publicationStatus: AdminPublicationStatus;
//   availabilityStatus: AdminAvailabilityStatus;

//   isFeatured: boolean;
//   isTrending: boolean;
//   isBestDeal: boolean;
//   isNewListing: boolean;

//   publishedAt: string | null;
//   deletedAt: string | null;
//   createdAt: string;
//   updatedAt: string;

//   media: AdminPropertyMedia[];
// }

// export interface AdminPropertyFilters {
//   page?: number;
//   limit?: number;
//   search?: string;
//   type?: AdminPropertyType;
//   listingType?: AdminListingType;
//   location?: string;
//   minPrice?: number;
//   maxPrice?: number;
//   bedrooms?: number;
//   sort?: "newest" | "price_low" | "price_high";
// }

// export interface AdminPropertyPagination {
//   total: number;
//   page: number;
//   limit: number;
//   totalPages: number;
//   hasNextPage: boolean;
//   hasPreviousPage: boolean;
// }

// export interface AdminPropertyDashboardStats {
//   totalProperties: number;
//   publishedProperties: number;
//   draftProperties: number;
//   availableProperties: number;
//   reservedProperties: number;
//   soldProperties: number;
// }

// export interface AdminPropertyListResponse {
//   properties: AdminProperty[];
//   pagination: AdminPropertyPagination;
// }

// export interface AdminPropertyFlags {
//   isFeatured?: boolean;
//   isTrending?: boolean;
//   isBestDeal?: boolean;
//   isNewListing?: boolean;
// }

// export interface UploadAdminPropertyMediaInput {
//   type: AdminMediaType;
//   altText?: string;
//   sortOrder?: number;
//   isCover?: boolean;
// }

// // Payload types. The backend validators remain authoritative.
// export type CreateAdminPropertyInput = Record<string, unknown>;
// export type UpdateAdminPropertyInput = Record<string, unknown>;

// // ==========================================
// // ERROR HANDLING
// // ==========================================

// export class AdminPropertyError extends Error {
//   status: number;
//   details?: unknown;

//   constructor(message: string, status: number, details?: unknown) {
//     super(message);
//     this.name = "AdminPropertyError";
//     this.status = status;
//     this.details = details;
//   }
// }

// interface ApiResponse<T> {
//   success: boolean;
//   message?: string;
//   errors?: unknown;
//   [key: string]: unknown;
// }

// async function propertyRequest<T>(
//   endpoint: string,
//   options: {
//     method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
//     body?: unknown;
//   } = {}
// ): Promise<T> {
//   let response: Response;

//   const isFormData =
//     typeof FormData !== "undefined" &&
//     options.body instanceof FormData;

//   try {
//     response = await fetch(
//       `${API_BASE_URL}/api/properties${endpoint}`,
//       {
//         method: options.method ?? "GET",
//         credentials: "include",
//         headers: {
//           Accept: "application/json",
//           ...(options.body !== undefined && !isFormData
//             ? { "Content-Type": "application/json" }
//             : {}),
//         },
//         ...(options.body !== undefined
//           ? {
//               body: isFormData
//                 ? (options.body as FormData)
//                 : JSON.stringify(options.body),
//             }
//           : {}),
//       }
//     );
//   } catch {
//     throw new AdminPropertyError(
//       "Unable to connect to the server. Please check your connection.",
//       0
//     );
//   }

//   let data: ApiResponse<T>;

//   try {
//     data = await response.json();
//   } catch {
//     throw new AdminPropertyError(
//       "The server returned an invalid response.",
//       response.status
//     );
//   }

//   if (!response.ok || data.success !== true) {
//     throw new AdminPropertyError(
//       data.message ?? "The property request failed.",
//       response.status,
//       data.errors
//     );
//   }

//   return data as T;
// }

// // ==========================================
// // MEDIA URL
// // ==========================================

// export function getAdminMediaUrl(url: string): string {
//   if (/^https?:\/\//i.test(url)) {
//     return url;
//   }

//   return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
// }

// // ==========================================
// // LIST ADMIN PROPERTIES
// // ==========================================

// export async function listAdminProperties(
//   filters: AdminPropertyFilters = {}
// ): Promise<AdminPropertyListResponse> {
//   const params = new URLSearchParams();

//   Object.entries(filters).forEach(([key, value]) => {
//     if (value !== undefined && value !== null && value !== "") {
//       params.set(key, String(value));
//     }
//   });

//   const query = params.toString();

//   const response = await propertyRequest<
//     ApiResponse<AdminPropertyListResponse>
//   >(`/admin${query ? `?${query}` : ""}`);

//   return {
//     properties: response.properties as AdminProperty[],
//     pagination: response.pagination as AdminPropertyPagination,
//   };
// }

// // ==========================================
// // GET PROPERTY DASHBOARD STATISTICS
// // ==========================================

// export async function getAdminPropertyDashboardStats(): Promise<AdminPropertyDashboardStats> {
//   const response = await propertyRequest<
//     ApiResponse<{ stats: AdminPropertyDashboardStats }>
//   >("/admin/stats");

//   return response.stats;
// }

// // ==========================================
// // GET SINGLE ADMIN PROPERTY
// // ==========================================

// export async function getAdminPropertyById(
//   id: string
// ): Promise<AdminProperty> {
//   const response = await propertyRequest<
//     ApiResponse<{ property: AdminProperty }>
//   >(`/admin/${encodeURIComponent(id)}`);

//   return response.property;
// }

// // ==========================================
// // CREATE PROPERTY
// // ==========================================

// export async function createAdminProperty(
//   input: CreateAdminPropertyInput
// ): Promise<AdminProperty> {
//   const response = await propertyRequest<
//     ApiResponse<{ property: AdminProperty }>
//   >("", {
//     method: "POST",
//     body: input,
//   });

//   return response.property;
// }

// // ==========================================
// // UPDATE PROPERTY
// // ==========================================

// export async function updateAdminProperty(
//   id: string,
//   input: UpdateAdminPropertyInput
// ): Promise<AdminProperty> {
//   const response = await propertyRequest<
//     ApiResponse<{ property: AdminProperty }>
//   >(`/${encodeURIComponent(id)}`, {
//     method: "PUT",
//     body: input,
//   });

//   return response.property;
// }

// // ==========================================
// // GET PROPERTY MEDIA
// // ==========================================

// export async function getAdminPropertyMedia(
//   propertyId: string
// ): Promise<AdminPropertyMedia[]> {
//   const response = await propertyRequest<
//     ApiResponse<{ media: AdminPropertyMedia[] }>
//   >(`/${encodeURIComponent(propertyId)}/media`);

//   return response.media;
// }

// // ==========================================
// // UPLOAD PROPERTY MEDIA
// // ==========================================

// export async function uploadAdminPropertyMedia(
//   propertyId: string,
//   file: File,
//   input: UploadAdminPropertyMediaInput
// ): Promise<AdminPropertyMedia> {
//   const formData = new FormData();

//   formData.append("file", file);
//   formData.append("type", input.type);
//   formData.append("sortOrder", String(input.sortOrder ?? 0));
//   formData.append("isCover", String(input.isCover ?? false));

//   if (input.altText?.trim()) {
//     formData.append("altText", input.altText.trim());
//   }

//   const response = await propertyRequest<
//     ApiResponse<{ media: AdminPropertyMedia }>
//   >(`/${encodeURIComponent(propertyId)}/media`, {
//     method: "POST",
//     body: formData,
//   });

//   return response.media;
// }

// // ==========================================
// // DELETE PROPERTY MEDIA
// // ==========================================

// export async function deleteAdminPropertyMedia(
//   propertyId: string,
//   mediaId: string
// ): Promise<void> {
//   await propertyRequest<ApiResponse<unknown>>(
//     `/${encodeURIComponent(propertyId)}/media/${encodeURIComponent(mediaId)}`,
//     {
//       method: "DELETE",
//     }
//   );
// }

// // ==========================================
// // REORDER PROPERTY MEDIA
// // ==========================================

// export async function reorderAdminPropertyMedia(
//   propertyId: string,
//   media: Array<{ id: string; sortOrder: number }>
// ): Promise<AdminPropertyMedia[]> {
//   const response = await propertyRequest<
//     ApiResponse<{ media: AdminPropertyMedia[] }>
//   >(`/${encodeURIComponent(propertyId)}/media/reorder`, {
//     method: "PATCH",
//     body: { media },
//   });

//   return response.media;
// }
// // ==========================================
// // SET PROPERTY COVER IMAGE
// // ==========================================

// export async function setAdminPropertyMediaCover(
//     propertyId: string,
//     mediaId: string
//   ): Promise<AdminPropertyMedia> {
//     const response = await propertyRequest<
//       ApiResponse<{ media: AdminPropertyMedia }>
//     >(
//       `/${encodeURIComponent(propertyId)}/media/${encodeURIComponent(mediaId)}/cover`,
//       {
//         method: "PATCH",
//       }
//     );
  
//     return response.media;
//   }
// // ==========================================
// // PUBLISH / UNPUBLISH PROPERTY
// // ==========================================

// export async function setAdminPropertyPublication(
//   id: string,
//   publicationStatus: AdminPublicationStatus
// ): Promise<AdminProperty> {
//   const response = await propertyRequest<
//     ApiResponse<{ property: AdminProperty }>
//   >(`/${encodeURIComponent(id)}/publication`, {
//     method: "PATCH",
//     body: { publicationStatus },
//   });

//   return response.property;
// }

// // ==========================================
// // UPDATE PROPERTY AVAILABILITY
// // ==========================================

// export async function setAdminPropertyAvailability(
//   id: string,
//   availabilityStatus: AdminAvailabilityStatus
// ): Promise<AdminProperty> {
//   const response = await propertyRequest<
//     ApiResponse<{ property: AdminProperty }>
//   >(`/${encodeURIComponent(id)}/availability`, {
//     method: "PATCH",
//     body: { availabilityStatus },
//   });

//   return response.property;
// }

// // ==========================================
// // UPDATE PROPERTY FLAGS
// // ==========================================

// export async function updateAdminPropertyFlags(
//   id: string,
//   flags: AdminPropertyFlags
// ): Promise<AdminProperty> {
//   const response = await propertyRequest<
//     ApiResponse<{ property: AdminProperty }>
//   >(`/${encodeURIComponent(id)}/flags`, {
//     method: "PATCH",
//     body: flags,
//   });

//   return response.property;
// }

// // ==========================================
// // SOFT DELETE PROPERTY
// // ==========================================

// export async function deleteAdminProperty(
//   id: string
// ): Promise<void> {
//   await propertyRequest<ApiResponse<unknown>>(
//     `/${encodeURIComponent(id)}`,
//     {
//       method: "DELETE",
//     }
//   );
// }



const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not configured.");
}

// ==========================================
// TYPES
// ==========================================

export type AdminPropertyType =
  | "APARTMENT"
  | "VILLA"
  | "PENTHOUSE"
  | "TOWNHOUSE"
  | "DUPLEX"
  | "COMMERCIAL"
  | "LAND"
  | "OTHER";

export type AdminListingType = "BUY" | "RENT";

export type AdminPublicationStatus = "DRAFT" | "PUBLISHED";

export type AdminAvailabilityStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "SOLD";

export type AdminMediaType = "IMAGE" | "VIDEO";

export interface AdminPropertyAmenity {
  id: string;
  propertyId: string;
  name: string;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminPropertyMedia {
  id: string;
  propertyId: string;
  type: AdminMediaType;
  url: string;
  sortOrder: number;
  isCover: boolean;
  altText?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminProperty {
  id: string;
  slug: string;
  name: string;
  type: AdminPropertyType;
  listingType: AdminListingType;
  location: string;
  description: string;

  amenities: AdminPropertyAmenity[];

  priceMin: number | string;
  priceMax: number | string;
  currency: string;

  bedrooms: number | null;
  bathrooms: number | null;
  area: number | string | null;
  areaUnit: string | null;

  developer: string | null;
  projectName: string | null;
  handoverDate: string | null;
  paymentPlan: string | null;

  publicationStatus: AdminPublicationStatus;
  availabilityStatus: AdminAvailabilityStatus;

  isFeatured: boolean;
  isTrending: boolean;
  isBestDeal: boolean;
  isNewListing: boolean;

  publishedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;

  media: AdminPropertyMedia[];
}

export interface AdminPropertyFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: AdminPropertyType;
  listingType?: AdminListingType;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  sort?: "newest" | "price_low" | "price_high";
}

export interface AdminPropertyPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AdminPropertyDashboardStats {
  totalProperties: number;
  publishedProperties: number;
  draftProperties: number;
  availableProperties: number;
  reservedProperties: number;
  soldProperties: number;
}

export interface AdminPropertyListResponse {
  properties: AdminProperty[];
  pagination: AdminPropertyPagination;
}

export interface AdminPropertyFlags {
  isFeatured?: boolean;
  isTrending?: boolean;
  isBestDeal?: boolean;
  isNewListing?: boolean;
}

export interface UploadAdminPropertyMediaInput {
  type: AdminMediaType;
  altText?: string;
  sortOrder?: number;
  isCover?: boolean;
}

// Backend validators remain authoritative.
export type CreateAdminPropertyInput = Record<string, unknown>;
export type UpdateAdminPropertyInput = Record<string, unknown>;

// ==========================================
// ERROR HANDLING
// ==========================================

export class AdminPropertyError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "AdminPropertyError";
    this.status = status;
    this.details = details;
  }
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  errors?: unknown;
  [key: string]: unknown;
}

async function propertyRequest<T>(
  endpoint: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
  } = {}
): Promise<T> {
  let response: Response;

  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  try {
    response = await fetch(
      `${API_BASE_URL}/api/properties${endpoint}`,
      {
        method: options.method ?? "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          ...(options.body !== undefined && !isFormData
            ? { "Content-Type": "application/json" }
            : {}),
        },
        ...(options.body !== undefined
          ? {
              body: isFormData
                ? (options.body as FormData)
                : JSON.stringify(options.body),
            }
          : {}),
      }
    );
  } catch {
    throw new AdminPropertyError(
      "Unable to connect to the server. Please check your connection.",
      0
    );
  }

  let data: ApiResponse<T>;

  try {
    data = await response.json();
  } catch {
    throw new AdminPropertyError(
      "The server returned an invalid response.",
      response.status
    );
  }

  if (!response.ok || data.success !== true) {
    throw new AdminPropertyError(
      data.message ?? "The property request failed.",
      response.status,
      data.errors
    );
  }

  return data as T;
}

// ==========================================
// MEDIA URL
// ==========================================

export function getAdminMediaUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

// ==========================================
// LIST ADMIN PROPERTIES
// ==========================================

export async function listAdminProperties(
  filters: AdminPropertyFilters = {}
): Promise<AdminPropertyListResponse> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const query = params.toString();

  const response = await propertyRequest<
    ApiResponse<AdminPropertyListResponse>
  >(`/admin${query ? `?${query}` : ""}`);

  return {
    properties: response.properties as AdminProperty[],
    pagination: response.pagination as AdminPropertyPagination,
  };
}

// ==========================================
// GET PROPERTY DASHBOARD STATISTICS
// ==========================================

export async function getAdminPropertyDashboardStats(): Promise<AdminPropertyDashboardStats> {
  const response = await propertyRequest<
    ApiResponse<{ stats: AdminPropertyDashboardStats }>
  >("/admin/stats");

  return response.stats;
}

// ==========================================
// GET SINGLE ADMIN PROPERTY
// ==========================================

export async function getAdminPropertyById(
  id: string
): Promise<AdminProperty> {
  const response = await propertyRequest<
    ApiResponse<{ property: AdminProperty }>
  >(`/admin/${encodeURIComponent(id)}`);

  return response.property;
}

// ==========================================
// CREATE PROPERTY
// ==========================================

export async function createAdminProperty(
  input: CreateAdminPropertyInput
): Promise<AdminProperty> {
  const response = await propertyRequest<
    ApiResponse<{ property: AdminProperty }>
  >("", {
    method: "POST",
    body: input,
  });

  return response.property;
}

// ==========================================
// UPDATE PROPERTY
// ==========================================

export async function updateAdminProperty(
  id: string,
  input: UpdateAdminPropertyInput
): Promise<AdminProperty> {
  const response = await propertyRequest<
    ApiResponse<{ property: AdminProperty }>
  >(`/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: input,
  });

  return response.property;
}

// ==========================================
// GET PROPERTY MEDIA
// ==========================================

export async function getAdminPropertyMedia(
  propertyId: string
): Promise<AdminPropertyMedia[]> {
  const response = await propertyRequest<
    ApiResponse<{ media: AdminPropertyMedia[] }>
  >(`/${encodeURIComponent(propertyId)}/media`);

  return response.media;
}

// ==========================================
// UPLOAD PROPERTY MEDIA
// ==========================================

export async function uploadAdminPropertyMedia(
  propertyId: string,
  file: File,
  input: UploadAdminPropertyMediaInput
): Promise<AdminPropertyMedia> {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("type", input.type);
  formData.append("sortOrder", String(input.sortOrder ?? 0));
  formData.append("isCover", String(input.isCover ?? false));

  if (input.altText?.trim()) {
    formData.append("altText", input.altText.trim());
  }

  const response = await propertyRequest<
    ApiResponse<{ media: AdminPropertyMedia }>
  >(`/${encodeURIComponent(propertyId)}/media`, {
    method: "POST",
    body: formData,
  });

  return response.media;
}

// ==========================================
// DELETE PROPERTY MEDIA
// ==========================================

export async function deleteAdminPropertyMedia(
  propertyId: string,
  mediaId: string
): Promise<void> {
  await propertyRequest<ApiResponse<unknown>>(
    `/${encodeURIComponent(propertyId)}/media/${encodeURIComponent(mediaId)}`,
    {
      method: "DELETE",
    }
  );
}

// ==========================================
// REORDER PROPERTY MEDIA
// ==========================================

export async function reorderAdminPropertyMedia(
  propertyId: string,
  media: Array<{ id: string; sortOrder: number }>
): Promise<AdminPropertyMedia[]> {
  const response = await propertyRequest<
    ApiResponse<{ media: AdminPropertyMedia[] }>
  >(`/${encodeURIComponent(propertyId)}/media/reorder`, {
    method: "PATCH",
    body: { media },
  });

  return response.media;
}

// ==========================================
// SET PROPERTY COVER IMAGE
// ==========================================

export async function setAdminPropertyMediaCover(
  propertyId: string,
  mediaId: string
): Promise<AdminPropertyMedia> {
  const response = await propertyRequest<
    ApiResponse<{ media: AdminPropertyMedia }>
  >(
    `/${encodeURIComponent(propertyId)}/media/${encodeURIComponent(mediaId)}/cover`,
    {
      method: "PATCH",
    }
  );

  return response.media;
}

// ==========================================
// PUBLISH / UNPUBLISH PROPERTY
// ==========================================

export async function setAdminPropertyPublication(
  id: string,
  publicationStatus: AdminPublicationStatus
): Promise<AdminProperty> {
  const response = await propertyRequest<
    ApiResponse<{ property: AdminProperty }>
  >(`/${encodeURIComponent(id)}/publication`, {
    method: "PATCH",
    body: { publicationStatus },
  });

  return response.property;
}

// ==========================================
// UPDATE PROPERTY AVAILABILITY
// ==========================================

export async function setAdminPropertyAvailability(
  id: string,
  availabilityStatus: AdminAvailabilityStatus
): Promise<AdminProperty> {
  const response = await propertyRequest<
    ApiResponse<{ property: AdminProperty }>
  >(`/${encodeURIComponent(id)}/availability`, {
    method: "PATCH",
    body: { availabilityStatus },
  });

  return response.property;
}

// ==========================================
// UPDATE PROPERTY FLAGS
// ==========================================

export async function updateAdminPropertyFlags(
  id: string,
  flags: AdminPropertyFlags
): Promise<AdminProperty> {
  const response = await propertyRequest<
    ApiResponse<{ property: AdminProperty }>
  >(`/${encodeURIComponent(id)}/flags`, {
    method: "PATCH",
    body: flags,
  });

  return response.property;
}

// ==========================================
// SOFT DELETE PROPERTY
// ==========================================

export async function deleteAdminProperty(
  id: string
): Promise<void> {
  await propertyRequest<ApiResponse<unknown>>(
    `/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );
}
