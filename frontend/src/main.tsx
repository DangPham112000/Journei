import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Login from './pages/Login.tsx'
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink } from '@apollo/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ManagePlansPage from './pages/plans/ManagePlansPage';
import PlanDetailsPage from './pages/plans/PlanDetailsPage';

const client = new ApolloClient({
  link: new HttpLink({
    uri: '/graphql',
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
              <Route path="/" element={<Navigate to="/plans" replace />} />
              <Route path="/plans" element={<ManagePlansPage />} />
              <Route path="/plans/:id" element={<PlanDetailsPage />} />
              <Route path="/app" element={<App />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </ApolloProvider>
  </StrictMode>,
)
