import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';

const LocationInput: React.FC = () => {
  const [inputValue, setInputValue] = useState('');

  const handleAddLocation = () => {
    if (!inputValue.trim()) return;

    // TODO: Determine if inputValue is a Google Maps link or just a place name
    // If it's a short link (e.g. goo.gl), send to backend to resolve coordinates.
    // If it's a long link, parse out the @lat,lng portion directly on the frontend.
    // Finally, save the location to the current Journey via GraphQL mutation.

    console.log('Location to add:', inputValue);
    setInputValue('');
  };

  return (
    <Box className="flex gap-2 w-full mt-4">
      <TextField
        fullWidth
        size="small"
        label="Paste Google Maps link or search location"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        variant="outlined"
      />
      <Button variant="contained" color="primary" onClick={handleAddLocation}>
        Add
      </Button>
    </Box>
  );
};

export default LocationInput;
