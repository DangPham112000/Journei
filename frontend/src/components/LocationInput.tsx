import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
    <div className="flex flex-col sm:flex-row gap-2 w-full mt-4">
      <Input
        className="flex-1"
        placeholder="Paste Google Maps link or search location"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <Button onClick={handleAddLocation}>
        Add
      </Button>
    </div>
  );
};

export default LocationInput;
