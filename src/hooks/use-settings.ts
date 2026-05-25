import useSWR from "swr";
import type { CmsSiteSettings } from "@/types/cms";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  });

/**
 * Custom hook to retrieve site settings with a 30-minute caching duration.
 * Supports conditional fetching via the `enabled` parameter.
 */
export function useSettings(enabled: boolean = true) {
  const { data, error, isLoading } = useSWR<CmsSiteSettings>(
    enabled ? "/api/cms/settings" : null,
    fetcher,
    {
      dedupingInterval: 30 * 60 * 1000, // Cache for 30 minutes
      revalidateOnFocus: false,         // Do not fetch on window focus
      revalidateIfStale: false,         // Avoid fetching if data is cached
      revalidateOnReconnect: false,     // Do not fetch on network reconnect
    }
  );

  return {
    settings: data ?? null,
    error,
    isLoading,
  };
}
