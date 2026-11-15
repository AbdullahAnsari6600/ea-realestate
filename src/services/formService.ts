
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/+$/, "");

type FormKind = "enquiry" | "viewing" | "career" | "newsletter";

type FormData = Record<string, unknown>;

interface ApiResponse {
  success?: boolean;
  message?: string;
  property?: {
    id?: string;
  };
  id?: string;
}

async function getPropertyId(propertySlug: string): Promise<string> {
  const response = await fetch(
    `${API_BASE_URL}/api/properties/slug/${encodeURIComponent(propertySlug)}`
  );

  const result = (await response.json()) as ApiResponse;

  if (!response.ok || !result.success || !result.property?.id) {
    throw new Error("Unable to find the selected property. Please select another property.");
  }

  return result.property.id;
}

export async function submitForm(kind: FormKind, data: FormData) {
  // Contact Us / general property enquiry
  if (kind === "enquiry") {
    const message = [
      data.message ? String(data.message) : "",
      `Intent: ${data.intent ?? "Not specified"}`,
      `Budget: ${data.budget ?? "Not specified"}`,
      `Preferred location: ${data.location ?? "Not specified"}`,
      `Property type: ${data.type ?? "Not specified"}`,
      `Preferred contact method: ${data.method ?? "Not specified"}`,
    ]
      .filter(Boolean)
      .join("\n");

    return submitEnquiry({
      type: "CONTACT",
      fullName: String(data.name ?? ""),
      email: String(data.email ?? ""),
      phone: `${data.cc ?? ""}${data.phone ?? ""}`,
      message,
    });
  }

  // Book a Viewing
  if (kind === "viewing") {
    const propertySlug = String(data.property ?? "");

    if (!propertySlug) {
      throw new Error("Please select a property.");
    }

    const propertyId = await getPropertyId(propertySlug);

    return submitEnquiry({
      type: "VIEWING",
      fullName: String(data.name ?? ""),
      email: String(data.email ?? ""),
      phone: `${data.cc ?? ""}${data.phone ?? ""}`,
      message: String(data.message ?? ""),
      propertyId,
      preferredDate: String(data.date ?? ""),
      preferredTime: String(data.time ?? ""),
    });
  }

  // Career and newsletter are not connected to the enquiries API.
  throw new Error(`${kind} submissions are not connected yet.`);
}

async function submitEnquiry(payload: Record<string, unknown>) {
  const response = await fetch(`${API_BASE_URL}/api/enquiries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const result = (await response.json()) as ApiResponse;

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Unable to submit your enquiry. Please try again.");
  }

  return result;
}
