import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useLoginWithGoogleMutation } from '../__generated__/graphql';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-sm text-center">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold">Journey Planner</CardTitle>
          <CardDescription>
            Sign in or register to plan your trips.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            If you don't have an account, one will be created automatically.
          </p>
          <Button
            className="w-full"
            size="lg"
            onClick={() => login()}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              'Continue with Google'
            )}
          </Button>
          {error && (
            <p className="text-sm text-destructive mt-2">
              Failed to sign in. Please try again.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
