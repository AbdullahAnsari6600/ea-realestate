
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not configured.");
}

export type EnquiryType = "CONTACT" | "VIEWING";

export type EnquiryStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "CLOSED";

export interface EnquiryProperty {
  id: string;
  name: string;
  slug: string;
  location: string;
}

export interface AdminEnquiry {
  id: string;
  type: EnquiryType;
  status: EnquiryStatus;
  fullName: string;
  email: string;
  phone: string;
  message: string | null;
  propertyId: string | null;
  property: EnquiryProperty | null;
  preferredDate: string | null;
  preferredTime: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: EnquiryType | "ALL";
  status?: EnquiryStatus | "ALL";
  sort?: "newest" | "oldest";
}

export interface EnquiryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EnquiryStats {
  totalEnquiries: number;
  newEnquiries: number;
  contactedEnquiries: number;
  qualifiedEnquiries: number;
  closedEnquiries: number;
  contactEnquiries: number;
  viewingEnquiries: number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  enquiries?: T[];
  enquiry?: T;
  pagination?: EnquiryPagination;
  stats?: EnquiryStats;
}

export class AdminEnquiryError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminEnquiryError";
    this.status = status;
  }
}

async function enquiryRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/enquiries${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new AdminEnquiryError(
      "Unable to connect to the server. Please check your connection.",
      0
    );
  }

  const data = (await response.json().catch(() => null)) as
    | ApiResponse<AdminEnquiry>
    | null;

  if (!response.ok || !data?.success) {
    throw new AdminEnquiryError(
      data?.message || "Unable to process the enquiry request.",
      response.status
    );
  }

  return data as T;
}

// ==========================================
// GET ADMIN ENQUIRIES
// ==========================================

export async function listAdminEnquiries(
  filters: EnquiryFilters = {}
): Promise<{
  enquiries: AdminEnquiry[];
  pagination: EnquiryPagination;
}> {
  const params = new URLSearchParams();

  params.set("page", String(filters.page ?? 1));
  params.set("limit", String(filters.limit ?? 10));
  params.set("sort", filters.sort ?? "newest");

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.type && filters.type !== "ALL") {
    params.set("type", filters.type);
  }

  if (filters.status && filters.status !== "ALL") {
    params.set("status", filters.status);
  }

  const data = await enquiryRequest<
    ApiResponse<AdminEnquiry> & {
      enquiries: AdminEnquiry[];
      pagination: EnquiryPagination;
    }
  >(`/admin?${params.toString()}`);

  if (!data.pagination) {
    throw new AdminEnquiryError("Invalid server response.", 500);
  }

  return {
    enquiries: data.enquiries ?? [],
    pagination: data.pagination,
  };
}

// ==========================================
// GET ENQUIRY BY ID
// ==========================================

export async function getAdminEnquiryById(
  id: string
): Promise<AdminEnquiry> {
  const data = await enquiryRequest<ApiResponse<AdminEnquiry>>(
    `/admin/${encodeURIComponent(id)}`
  );

  if (!data.enquiry) {
    throw new AdminEnquiryError("Enquiry not found.", 404);
  }

  return data.enquiry;
}

// ==========================================
// UPDATE ENQUIRY
// ==========================================

export async function updateAdminEnquiry(
  id: string,
  updates: {
    status?: EnquiryStatus;
    adminNotes?: string | null;
  }
): Promise<AdminEnquiry> {
  const data = await enquiryRequest<ApiResponse<AdminEnquiry>>(
    `/admin/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(updates),
    }
  );

  if (!data.enquiry) {
    throw new AdminEnquiryError("Invalid server response.", 500);
  }

  return data.enquiry;
}

// ==========================================
// DELETE ENQUIRY
// ==========================================

export async function deleteAdminEnquiry(id: string): Promise<void> {
  await enquiryRequest<ApiResponse<AdminEnquiry>>(
    `/admin/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );
}

// ==========================================
// GET ENQUIRY DASHBOARD STATISTICS
// ==========================================

export async function getAdminEnquiryStats(): Promise<EnquiryStats> {
  const data = await enquiryRequest<
    ApiResponse<AdminEnquiry> & { stats: EnquiryStats }
  >("/admin/stats");

  if (!data.stats) {
    throw new AdminEnquiryError("Invalid statistics response.", 500);
  }

  return data.stats;
}
