import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getToken } from '@clerk/react';

// Sends the Clerk session token so the backend knows who is signed in.
const authLink = setContext(async (_, { headers }) => {
  const token = await getToken();
  if (!token) return {};
  return { headers: { ...headers, Authorization: `Bearer ${token}` } };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(new HttpLink({ uri: '/graphql' })),
  cache: new InMemoryCache(),
});
