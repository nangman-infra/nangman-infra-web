import { fetchBackend, parseJsonSafely } from "@/lib/server/backend-proxy";

interface FetchBackendJsonOptions {
  backendPath: string;
  revalidate?: number;
}

type NextRequestInit = RequestInit & {
  next?: {
    revalidate?: number;
  };
};

export async function fetchBackendJson(
  options: FetchBackendJsonOptions,
): Promise<unknown> {
  const { backendPath, revalidate } = options;

  const init: NextRequestInit = {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  };

  if (typeof revalidate === "number") {
    init.next = { revalidate };
  } else {
    init.cache = "no-store";
  }

  const response = await fetchBackend(backendPath, init);

  if (!response.ok) {
    throw new Error(`Failed to fetch backend resource: ${backendPath}`);
  }

  return parseJsonSafely(response);
}
