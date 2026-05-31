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
    server: {
      proxy: {
        '/graphql': 'http://localhost:4000',
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        ...mockAliases,
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react-dom')) {
                return 'react-dom-vendor';
              }
              if (id.includes('react-router')) {
                return 'react-router-vendor';
              }
              if (id.includes('react')) {
                return 'react-core-vendor';
              }
              if (id.includes('@apollo/client')) {
                return 'apollo-client-vendor';
              }
              if (id.includes('graphql')) {
                return 'graphql-vendor';
              }
              if (id.includes('@apollo')) {
                return 'apollo-vendor';
              }
              if (id.includes('@vis.gl') || id.includes('@react-oauth')) {
                return 'google-vendor';
              }
              if (id.includes('shadcn') || id.includes('@base-ui') || id.includes('lucide-react') || id.includes('tailwind') || id.includes('clsx')) {
                return 'ui-vendor';
              }
              if (id.includes('date-fns') || id.includes('dayjs') || id.includes('react-day-picker')) {
                return 'date-vendor';
              }
              return 'vendor';
            }
          }
        }
      }
    }
  };
})
