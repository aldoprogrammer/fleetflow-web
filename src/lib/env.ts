const DEFAULT_API_URL = "http://localhost:3000/v1";

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

function assertValidApiUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error(`Invalid protocol: ${parsed.protocol}`);
    }
    return normalizeBaseUrl(url);
  } catch {
    throw new Error(
      `NEXT_PUBLIC_API_URL must be a valid URL. Received: "${url}"`,
    );
  }
}

export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;
  return assertValidApiUrl(configured);
}

export const env = {
  apiBaseUrl: getApiBaseUrl(),
  ordersEndpoint: `${getApiBaseUrl()}/orders`,
} as const;
