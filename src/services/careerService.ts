
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not configured.");
}

interface CareerApplicationResponse {
  success: boolean;
  message?: string;
  application?: {
    id: string;
    status: string;
    createdAt: string;
  };
}

export async function submitCareerApplication(
  formData: FormData
): Promise<CareerApplicationResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/careers`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
  } catch {
    throw new Error(
      "Unable to connect to the server. Please check your connection and try again."
    );
  }

  const data = (await response.json().catch(() => null)) as
    | CareerApplicationResponse
    | null;

  if (!response.ok || !data?.success) {
    throw new Error(
      data?.message || "Your application could not be submitted. Please try again."
    );
  }

  return data;
}
