
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not configured.");
}

export interface Admin {
  id: string;
  email: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  admin?: T;
}

export class AdminAuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminAuthError";
    this.status = status;
  }
}

async function authRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/auth${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new AdminAuthError(
      "Unable to connect to the server. Please check your connection.",
      0
    );
  }

  const data = (await response.json().catch(() => null)) as
    | (ApiResponse<Admin> & { admin?: Admin })
    | null;

  if (!response.ok || !data?.success) {
    throw new AdminAuthError(
      data?.message || "Something went wrong. Please try again.",
      response.status
    );
  }

  return data as T;
}

export async function adminLogin(
  email: string,
  password: string
): Promise<Admin> {
  const data = await authRequest<ApiResponse<Admin>>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!data.admin) {
    throw new AdminAuthError("Invalid server response.", 500);
  }

  return data.admin;
}

export async function getCurrentAdmin(): Promise<Admin> {
  const data = await authRequest<ApiResponse<Admin>>("/me");

  if (!data.admin) {
    throw new AdminAuthError("Admin session not found.", 401);
  }

  return data.admin;
}

export async function adminLogout(): Promise<void> {
  await authRequest<ApiResponse<never>>("/logout", {
    method: "POST",
  });
}
