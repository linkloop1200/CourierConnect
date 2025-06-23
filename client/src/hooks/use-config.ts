import { useQuery } from "@tanstack/react-query";

interface Config {
  GOOGLE_MAPS_API_KEY: string | null;
}

export function useConfig() {
  return useQuery<Config>({
    queryKey: ["/api/config"],
    staleTime: Infinity, // Config doesn't change during session
  });
}