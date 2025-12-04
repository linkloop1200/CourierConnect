import { Loader } from "@googlemaps/js-api-loader";

let loaderInstance: Loader | null = null;
let loadPromise: Promise<typeof google> | null = null;

export function getGoogleMapsLoader(apiKey: string): Promise<typeof google> {
  // Return existing promise if already loading
  if (loadPromise) {
    return loadPromise;
  }

  // Create loader instance only once
  if (!loaderInstance) {
    loaderInstance = new Loader({
      apiKey: apiKey,
      version: "weekly",
      libraries: ["maps", "marker", "places"]
    });
  }

  // Create and cache the load promise
  loadPromise = loaderInstance.load();
  
  return loadPromise;
}

export function resetGoogleMapsLoader() {
  loaderInstance = null;
  loadPromise = null;
}