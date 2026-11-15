
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not configured.");
}

export type CareerStatus =
  | "NEW"
  | "REVIEWING"
  | "SHORTLISTED"
  | "REJECTED"
  | "HIRED";

export interface CareerApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  linkedin: string | null;
  coverLetter: string | null;
  adminNotes: string | null;
  cvUrl: string;
  status: CareerStatus;
  createdAt: string;
  updatedAt: string;
  experience?: number | null;
}

export interface CareerStats {
  total: number;
  new: number;
  reviewing: number;
  shortlisted: number;
  rejected: number;
  hired: number;
}

export interface CareerPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  [key: string]: unknown;
}

export class CareerAdminError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "CareerAdminError";
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new CareerAdminError(
      "Unable to connect to the server. Please try again.",
      0
    );
  }

  const data = await response.json().catch(() => null) as
    | ApiResponse<T>
    | null;

  if (!response.ok || !data?.success) {
    throw new CareerAdminError(
      data?.message || "The request could not be completed.",
      response.status
    );
  }

  return data as T;
}

export async function getCareerApplications(params: {
  page: number;
  limit: number;
  search?: string;
  status?: CareerStatus | "";
}) {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });

  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);

  return request<{
    applications: CareerApplication[];
    pagination: CareerPagination;
  }>(`/api/careers/admin?${query.toString()}`);
}

export async function getCareerStats() {
  return request<{ stats: CareerStats }>("/api/careers/admin/stats");
}

export async function getCareerApplication(id: string) {
  return request<{ application: CareerApplication }>(
    `/api/careers/admin/${encodeURIComponent(id)}`
  );
}

export async function updateCareerApplication(
  id: string,
  data: { status?: CareerStatus; adminNotes?: string | null }
) {
  return request<{ application: CareerApplication }>(
    `/api/careers/admin/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
}

export async function deleteCareerApplication(id: string) {
  return request<{ message: string }>(
    `/api/careers/admin/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
}

export async function downloadCareerCv(id: string) {
  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}/api/careers/admin/${encodeURIComponent(id)}/cv`,
      { credentials: "include" }
    );
  } catch {
    throw new CareerAdminError("Unable to connect to the server.", 0);
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new CareerAdminError("Your admin session has expired.", 401);
    }

    throw new CareerAdminError("Unable to download this CV.", response.status);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `CV-${id}`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}
