import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

type ApiRequestOptions = {
  url: string;
  method?: string;
  body?: any;
  headers?: HeadersInit;
};

export async function apiRequest(method: string, url: string, data?: unknown): Promise<Response>;
export async function apiRequest(options: ApiRequestOptions): Promise<Response>;
export async function apiRequest(url: string, init?: RequestInit): Promise<Response>;
export async function apiRequest(methodOrOptions: string | ApiRequestOptions, urlOrInit?: string | RequestInit, data?: unknown): Promise<Response> {
  let method: string;
  let targetUrl: string;
  let body: any;
  let headers: HeadersInit | undefined;

  if (typeof methodOrOptions === "string" && typeof urlOrInit === "string") {
    // Signature: apiRequest("POST", "/api/x", data)
    method = methodOrOptions;
    targetUrl = urlOrInit;
    body = data ? JSON.stringify(data) : undefined;
    headers = data ? { "Content-Type": "application/json" } : undefined;
  } else if (typeof methodOrOptions === "string" && typeof urlOrInit === "object") {
    // Signature: apiRequest("/api/x", { method, body, headers })
    targetUrl = methodOrOptions;
    method = urlOrInit?.method || "GET";
    const providedBody = (urlOrInit as RequestInit).body;
    body =
      typeof providedBody === "string" || providedBody === undefined
        ? providedBody
        : JSON.stringify(providedBody);
    headers = urlOrInit?.headers;
    if (body && !headers) {
      headers = { "Content-Type": "application/json" };
    }
  } else {
    // Signature: apiRequest({ url, method, body, headers })
    const options = methodOrOptions as ApiRequestOptions;
    method = options.method || "GET";
    targetUrl = options.url;
    const providedBody = options.body;
    body =
      typeof providedBody === "string" || providedBody === undefined
        ? providedBody
        : JSON.stringify(providedBody);
    headers = options.headers;
    if (body && !headers) {
      headers = { "Content-Type": "application/json" };
    }
  }

  const res = await fetch(targetUrl, {
    method,
    headers,
    body,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
