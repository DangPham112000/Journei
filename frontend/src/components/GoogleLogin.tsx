import { useGoogleLogin } from '@react-oauth/google';
import { Button, Typography, Box, Avatar } from '@mui/material';
import { useLoginWithGoogleMutation, useGetMeQuery } from '../__generated__/graphql';

export default function GoogleLoginComponent() {
  const { data, loading, refetch } = useGetMeQuery();
  const [loginWithGoogle, { loading: loginLoading }] = useLoginWithGoogleMutation();

  const login = useGoogleLogin({
    flow: 'auth-code',
    scope: 'https://www.googleapis.com/auth/calendar',
    onSuccess: async (codeResponse) => {
      try {
        await loginWithGoogle({ variables: { code: codeResponse.code } });
        refetch(); // Reload the user data after login
      } catch (error) {
        console.error('Login failed:', error);
      }
    },
    onError: (error) => console.log('Login Failed:', error),
  });

  if (loading) return <Typography>Loading user...</Typography>;

  if (data?.me) {
    return (
      <Box display="flex" alignItems="center" gap={2}>
        <Avatar src={data.me.picture || undefined} alt={data.me.name} />
        <Typography variant="body1">Welcome, {data.me.name}</Typography>
      </Box>
    );
  }

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={() => login()}
      disabled={loginLoading}
    >
      {loginLoading ? 'Logging in...' : 'Sign in with Google'}
    </Button>
  );
}
