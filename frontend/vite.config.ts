import { loadEnv } from 'vite';
import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isMockMode = env.VITE_MOCK_MODE === 'true';

  const mockAliases: Record<string, string> = isMockMode ? {
    '@react-oauth/google': path.resolve(__dirname, './src/__mocks__/@react-oauth/google.tsx'),
    '@vis.gl/react-google-maps': path.resolve(__dirname, './src/__mocks__/@vis.gl/react-google-maps.tsx'),
  } : {};

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        ...mockAliases,
      },
    },
  };
})
