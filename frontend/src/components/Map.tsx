import React from 'react';
import { Box, Typography } from '@mui/material';
import { APIProvider, Map as GoogleMap } from '@vis.gl/react-google-maps';

const MapComponent: React.FC = () => {
  const mapApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!mapApiKey) {
    return (
      <Box className="flex flex-col items-center justify-center h-full bg-gray-100 border border-gray-300 p-4">
        <Typography variant="h6" color="textSecondary">Map Component</Typography>
        <Typography variant="body2" color="textSecondary">Please provide VITE_GOOGLE_MAPS_API_KEY in frontend/.env to load the map.</Typography>
        {/* TODO: Remove this placeholder once API key is provided */}
      </Box>
    );
  }

  return (
    <Box className="w-full h-full min-h-[400px] border border-gray-300 rounded-md overflow-hidden relative">
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
    </Box>
  );
};

export default MapComponent;
