import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Login from './pages/Login.tsx'
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink } from '@apollo/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/events/LandingPage';
import DiscoverPage from './pages/events/DiscoverPage';
import ManageEventsPage from './pages/events/ManageEventsPage';

const client = new ApolloClient({
  link: new HttpLink({
    uri: import.meta.env.VITE_GRAPHQL_URI || 'http://localhost:4000/graphql',
    // We can't easily configure credentials: 'include' using just HttpLink, so wait,
    // we should add fetchOptions to HttpLink
    fetchOptions: {
      credentials: 'include',
    },
  }),
  cache: new InMemoryCache(),
});

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your_google_client_id';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <GoogleOAuthProvider clientId={clientId}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<MainLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/manage" element={<ManageEventsPage />} />
              <Route path="/app" element={<App />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </ApolloProvider>
  </StrictMode>,
)
