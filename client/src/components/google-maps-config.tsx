import { useEffect, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { useConfig } from "@/hooks/use-config";
import { AlertTriangle, MapPin, CheckCircle, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function GoogleMapsStatus() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid_key'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { data: config } = useConfig();

  useEffect(() => {
    const testGoogleMaps = async () => {
      if (!config?.GOOGLE_MAPS_API_KEY) {
        setStatus('error');
        setErrorMessage('Google Maps API key niet gevonden');
        return;
      }

      try {
        const loader = new Loader({
          apiKey: config.GOOGLE_MAPS_API_KEY,
          version: "weekly",
          libraries: ["maps", "marker", "places"]
        });

        await loader.load();
        
        // Test if we can create a basic map instance
        const testDiv = document.createElement('div');
        const testMap = new google.maps.Map(testDiv, {
          center: { lat: 52.3676, lng: 4.9041 },
          zoom: 10
        });

        if (testMap) {
          setStatus('success');
        }
      } catch (error: any) {
        console.error('Google Maps API Error:', error);
        
        if (error.message?.includes('InvalidKeyMapError') || 
            error.message?.includes('ApiNotActivatedMapError')) {
          setStatus('invalid_key');
          setErrorMessage('Maps JavaScript API moet worden geactiveerd in Google Cloud Console');
        } else {
          setStatus('error');
          setErrorMessage(error.message || 'Onbekende Google Maps fout');
        }
      }
    };

    if (config) {
      testGoogleMaps();
    }
  }, [config]);

  const getStatusBadge = () => {
    switch (status) {
      case 'loading':
        return <Badge variant="outline">Testing...</Badge>;
      case 'success':
        return <Badge className="bg-green-600">Werkend</Badge>;
      case 'invalid_key':
        return <Badge variant="destructive">API Setup Vereist</Badge>;
      case 'error':
        return <Badge variant="destructive">Fout</Badge>;
      default:
        return <Badge variant="outline">Onbekend</Badge>;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'invalid_key':
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <MapPin className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span>Google Maps API Status</span>
          </div>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {status === 'loading' && (
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">API verbinding testen...</span>
            </div>
          )}

          {status === 'success' && (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-800">
                Google Maps API is correct geconfigureerd en werkend.
              </p>
            </div>
          )}

          {status === 'invalid_key' && (
            <div className="space-y-3">
              <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-500">
                <h4 className="font-medium text-yellow-800">Setup Vereist</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  De Maps JavaScript API moet worden geactiveerd in Google Cloud Console.
                </p>
              </div>
              
              <div className="text-sm space-y-2">
                <p className="font-medium">Volg deze stappen:</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>Ga naar Google Cloud Console</li>
                  <li>Selecteer je project</li>
                  <li>Ga naar "APIs & Services" → "Library"</li>
                  <li>Zoek naar "Maps JavaScript API"</li>
                  <li>Klik "Enable" om de API te activeren</li>
                  <li>Vernieuw deze pagina</li>
                </ol>
              </div>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://console.cloud.google.com/apis/library/maps-backend.googleapis.com', '_blank')}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Google Cloud Console
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-50 p-3 rounded-lg border-l-4 border-red-500">
              <h4 className="font-medium text-red-800">API Fout</h4>
              <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
            </div>
          )}

          <div className="pt-3 border-t text-xs text-gray-500">
            <p>API Key: {config?.GOOGLE_MAPS_API_KEY ? 
              `${config.GOOGLE_MAPS_API_KEY.substring(0, 8)}...` : 
              'Niet gevonden'
            }</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default GoogleMapsStatus;