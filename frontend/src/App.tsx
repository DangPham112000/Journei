import { Container, Grid, Typography, Box, CircularProgress } from '@mui/material';
import MapComponent from './components/Map';
import JourneyPlanner from './components/JourneyPlanner';
import LocationInput from './components/LocationInput';
import { useMeQuery } from './__generated__/graphql';
import { Navigate } from 'react-router-dom';

function App() {
  const { data, loading, error } = useMeQuery();

  if (loading) {
    return (
      <Container className="h-screen flex items-center justify-center">
        <CircularProgress />
      </Container>
    );
  }

  if (error || !data?.me) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Container maxWidth="xl" className="h-screen py-8 flex flex-col">
        <Typography variant="h3" component="h1" gutterBottom className="font-bold text-gray-800 text-center">
          Journey Planner
        </Typography>
        <Typography variant="subtitle1" gutterBottom className="text-gray-600 text-center mb-6">
          Welcome, {data.me.name}!
        </Typography>

        <Grid container spacing={4} className="flex-grow min-h-0">
          <Grid item xs={12} md={4} className="flex flex-col h-full gap-4">
            <JourneyPlanner />
            <Box className="flex-grow p-4 bg-white rounded-md shadow-md overflow-auto">
                <Typography variant="h6" className="mb-2">Pinned Locations</Typography>
                <LocationInput />
                {/* TODO: List pinned locations here */}
            </Box>
          </Grid>

          <Grid item xs={12} md={8} className="h-full">
            <MapComponent />
          </Grid>
        </Grid>
      </Container>
  );
}

export default App;
