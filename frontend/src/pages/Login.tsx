import { useGoogleLogin } from '@react-oauth/google';
import { Container, Typography, Box, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useLoginWithGoogleMutation } from '../__generated__/graphql';

export default function Login() {
  const navigate = useNavigate();
  const [loginWithGoogle, { loading, error }] = useLoginWithGoogleMutation();

  const handleLoginSuccess = async (codeResponse: any) => {
    try {
      await loginWithGoogle({
        variables: {
          code: codeResponse.code,
        },
        // Refetch the "Me" query so the app knows we're logged in
        refetchQueries: ['Me'],
      });
      navigate('/');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const login = useGoogleLogin({
    onSuccess: handleLoginSuccess,
    flow: 'auth-code',
  });

  return (
    <Container maxWidth="sm" className="h-screen flex items-center justify-center">
      <Box className="p-8 bg-white rounded-md shadow-md text-center flex flex-col gap-4">
        <Typography variant="h4" component="h1" gutterBottom className="font-bold text-gray-800">
          Welcome to Journey Planner
        </Typography>
        <Typography variant="body1" color="textSecondary" className="mb-4">
          Please sign in or register to plan your trips and view your locations.
        </Typography>
        <Typography variant="body2" color="textSecondary" className="mb-6">
          If you don't have an account, one will be created for you automatically.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => login()}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Sign In / Register with Google'}
        </Button>
        {error && (
          <Typography color="error" variant="body2" className="mt-2">
            Failed to sign in. Please try again.
          </Typography>
        )}
      </Box>
    </Container>
  );
}
