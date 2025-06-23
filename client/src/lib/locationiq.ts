// LocationIQ API utilities
export const getLocationIQApiKey = () => {
  // Try to get from server-side environment first
  if (typeof window !== 'undefined' && (window as any).LOCATIONIQ_API_KEY) {
    return (window as any).LOCATIONIQ_API_KEY;
  }
  
  // Fallback to client-side environment variable
  return import.meta.env.VITE_LOCATIONIQ_API_KEY;
};

// LocationIQ API endpoints
export const LOCATIONIQ_ENDPOINTS = {
  staticMap: (key: string, center: { lat: number; lng: number }, zoom: number, size: number) =>
    `https://maps.locationiq.com/v3/static/map?key=${key}&center=${center.lat},${center.lng}&zoom=${zoom}&size=${size}x${size}&format=png&maptype=roads`,
  
  geocoding: (key: string, query: string) =>
    `https://locationiq.com/v1/search.php?key=${key}&q=${encodeURIComponent(query)}&format=json&limit=5`,
  
  reverse: (key: string, lat: number, lng: number) =>
    `https://locationiq.com/v1/reverse.php?key=${key}&lat=${lat}&lon=${lng}&format=json`
};

// Test LocationIQ API availability
export const testLocationIQConnection = async (): Promise<boolean> => {
  const apiKey = getLocationIQApiKey();
  if (!apiKey) return false;
  
  try {
    const response = await fetch(LOCATIONIQ_ENDPOINTS.geocoding(apiKey, 'Amsterdam'));
    return response.ok;
  } catch (error) {
    console.warn('LocationIQ API test failed:', error);
    return false;
  }
};