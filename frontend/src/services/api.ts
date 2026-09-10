const API_BASE_URL = "https://hms-1-eav6.onrender.com";

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const headers = new Headers(options.headers);

  if (
    !(options.body instanceof FormData) &&
    !(options.body instanceof URLSearchParams)
  ) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    let message = `Request failed with status ${response.status}`;

    if (typeof error.detail === "string") {
      message = error.detail;
    } else if (Array.isArray(error.detail)) {
      message = error.detail
        .map((item: unknown) => {
          if (
            typeof item === "object" &&
            item !== null &&
            "msg" in item
          ) {
            return String(item.msg);
          }

          return String(item);
        })
        .join(", ");
    } else if (error.detail) {
      message = JSON.stringify(error.detail);
    }

    throw new Error(message);
  }

  return response.json();
}