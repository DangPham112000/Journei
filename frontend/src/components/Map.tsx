import React from 'react';
import { APIProvider, Map as GoogleMap } from '@vis.gl/react-google-maps';

const MapComponent: React.FC = () => {
  const mapApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const isMockMode = import.meta.env.VITE_MOCK_MODE === 'true';

  if (!mapApiKey && !isMockMode) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-muted border p-4 text-center">
        <h3 className="text-lg font-semibold text-muted-foreground">Map Component</h3>
        <p className="text-sm text-muted-foreground mt-2">Please provide VITE_GOOGLE_MAPS_API_KEY in frontend/.env to load the map.</p>
        {/* TODO: Remove this placeholder once API key is provided */}
      </div>
    );
  }

  if (isMockMode && !mapApiKey) {
    return (
      <div className="w-full h-full min-h-[300px] md:min-h-[400px] overflow-hidden relative bg-muted/20 flex flex-col items-center justify-center">
        <h3 className="text-lg font-semibold text-muted-foreground">Mock Map View</h3>
        <p className="text-sm text-muted-foreground mt-2">Google Maps is bypassed in MOCK_MODE.</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full min-h-[300px] md:min-h-[400px] overflow-hidden relative bg-muted/20">
      <APIProvider apiKey={mapApiKey}>
        <GoogleMap
          defaultCenter={{ lat: 48.8588377, lng: 2.2770206 }}
          defaultZoom={12}
          mapId="DEMO_MAP_ID" // Required for AdvancedMarker
          // TODO: Implement map click handler to add pins
          // onClick={(e) => { console.log(e.detail.latLng) }}
        >
           {/* TODO: Render saved location pins here using AdvancedMarker */}
        </GoogleMap>
      </APIProvider>
    </div>
  );
};

export default MapComponent;
