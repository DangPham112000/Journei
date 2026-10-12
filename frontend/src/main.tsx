import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import SignInPage from './pages/SignInPage.tsx'
import { ApolloProvider } from '@apollo/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { apolloClient } from './lib/apolloClient';
import { ClerkWithRouter } from './components/auth/ClerkWithRouter';
import { RequireAuth } from './components/auth/RequireAuth';
import ManagePlansPage from './pages/plans/ManagePlansPage';
import PlanDetailsPage from './pages/plans/PlanDetailsPage';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <BrowserRouter>
        <ClerkWithRouter>
          <Routes>
            <Route path="/sign-in/*" element={<SignInPage mode="sign-in" />} />
            <Route path="/sign-up/*" element={<SignInPage mode="sign-up" />} />
            <Route path="/login" element={<Navigate to="/sign-in" replace />} />

            <Route
              element={
                <RequireAuth>
                  <MainLayout />
                </RequireAuth>
              }
            >
              <Route path="/" element={<Navigate to="/plans" replace />} />
              <Route path="/plans" element={<ManagePlansPage />} />
              <Route path="/plans/:id" element={<PlanDetailsPage />} />
              <Route path="/app" element={<App />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </ClerkWithRouter>
      </BrowserRouter>
    </ApolloProvider>
  </StrictMode>,
)
