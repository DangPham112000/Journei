import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink } from '@apollo/client';
import { Container, Grid, Typography, Box } from '@mui/material';
import MapComponent from './components/Map';
import JourneyPlanner from './components/JourneyPlanner';
import LocationInput from './components/LocationInput';

// Initialize Apollo Client
const client = new ApolloClient({
  link: new HttpLink({
    uri: import.meta.env.VITE_GRAPHQL_URI || 'http://localhost:4000/graphql',
  }),
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Container maxWidth="xl" className="h-screen py-8 flex flex-col">
        <Typography variant="h3" component="h1" gutterBottom className="font-bold text-gray-800 text-center">
          Journey Planner
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
    </ApolloProvider>
  );
}

export default App;
