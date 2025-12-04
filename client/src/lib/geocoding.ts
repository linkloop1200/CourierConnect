// Helper function to convert address to coordinates using Google Maps Geocoding
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return null;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Convert string coordinates to number coordinates
export function parseCoordinates(lat?: string | null, lng?: string | null): { lat: number; lng: number } | null {
  if (!lat || !lng) return null;
  
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  
  if (isNaN(latNum) || isNaN(lngNum)) return null;
  
  return { lat: latNum, lng: lngNum };
}