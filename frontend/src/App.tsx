import MapComponent from './components/Map';
import JourneyPlanner from './components/JourneyPlanner';
import LocationInput from './components/LocationInput';
import { useMeQuery } from './__generated__/graphql';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

function App() {
  const { data, loading, error } = useMeQuery();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data?.me) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container mx-auto h-[calc(100vh-4rem)] p-4 flex flex-col gap-4">
      <div className="text-center shrink-0">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-1">
          Journey Planner
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Welcome, {data.me.name}!
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-grow min-h-0">
        <div className="flex flex-col gap-4 w-full lg:w-1/3 shrink-0 lg:h-full">
          <div className="flex-grow overflow-auto min-h-[300px] lg:min-h-0">
            <JourneyPlanner />
          </div>

          <div className="shrink-0 p-4 bg-white rounded-lg border shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Pinned Locations</h2>
            <LocationInput />
            {/* TODO: List pinned locations here */}
          </div>
        </div>

        <div className="w-full lg:w-2/3 h-[400px] lg:h-full min-h-[400px] rounded-lg overflow-hidden border shadow-sm">
          <MapComponent />
        </div>
      </div>
    </div>
  );
}

export default App;
