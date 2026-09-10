import type { ApiError } from "@staybnb/shared";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiRequestError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

interface Options extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Next.js fetch cache hint for server components. */
  next?: { revalidate?: number | false; tags?: string[] };
}

/**
 * Fetch helper shared by client and server components.
 * On the client it sends the auth cookie; on the server it is only used for public data.
 */
export async function api<T>(path: string, opts: Options = {}): Promise<T> {
  const { body, headers, ...rest } = opts;
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    credentials: "include",
    headers: { ...(body !== undefined ? { "content-type": "application/json" } : {}), ...headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let payload: ApiError | undefined;
    try {
      payload = (await res.json()) as ApiError;
    } catch {
      /* non-JSON error */
    }
    throw new ApiRequestError(res.status, payload?.error ?? `Request failed (${res.status})`, payload?.details);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Turn any thrown value into a user-facing message. */
export function errorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (err instanceof ApiRequestError) return err.message;
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}

/** Build a query string, skipping empty values. */
export function qs(params: Record<string, string | number | boolean | undefined | null>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}
