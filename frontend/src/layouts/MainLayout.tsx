import { Container, Typography, CircularProgress, Box, AppBar, Toolbar, Button } from '@mui/material';
import { useMeQuery } from '../__generated__/graphql';
import { Navigate, Outlet, Link as RouterLink } from 'react-router-dom';

export default function MainLayout() {
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
    <Box className="flex flex-col min-h-screen bg-gray-50">
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Journey Planner
          </Typography>
          <Button color="inherit" component={RouterLink} to="/">Dashboard</Button>
          <Button color="inherit" component={RouterLink} to="/discover">Discover</Button>
          <Button color="inherit" component={RouterLink} to="/manage">Manage Events</Button>
          <Typography variant="body2" sx={{ ml: 2 }}>
            Welcome, {data.me.name}!
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" className="flex-grow py-8">
        <Outlet />
      </Container>
    </Box>
  );
}
