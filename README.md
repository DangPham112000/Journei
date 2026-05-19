# Journey Planner

A web application to plan your journeys. This app allows you to choose dates for your trips (integrated with Google Calendar to prevent scheduling conflicts with your free time) and interact with a map to pinpoint locations you'd like to visit.

## Tech Stack

**Frontend:**
- React 19
- Vite
- TypeScript
- Material UI (MUI)
- Tailwind CSS
- Apollo Client

**Backend:**
- Express.js
- GraphQL (Apollo Server)
- TypeScript
- MongoDB (via Mongoose)

## Project Structure

- `/frontend` - Contains the React application.
- `/backend` - Contains the Express/GraphQL server.

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB instance (local or MongoDB Atlas)
- Google Cloud Project with Calendar API and Maps JavaScript API enabled.

### Local Development

We use [Yarn Workspaces](https://yarnpkg.com/features/workspaces) to manage dependencies.

1. Ensure you are in the root directory.
2. Install dependencies for all workspaces: `yarn install`
3. Run the development environment:
   ```bash
   yarn start
   ```

**Mock Mode Details:**
By default, `yarn start` spins up the application in a sandboxed **Mock Mode**. You do not need any environment variables or external API keys to start working!
- **Database:** An in-memory MongoDB instance is automatically created and seeded with a mock user and events.
- **Authentication:** Google OAuth is bypassed via a local mock endpoint.
- **Maps:** Google Maps integration is mocked seamlessly via Vite aliases.

### Production Deployment

To run the application in a standard production environment, you need to build the code and configure real environment variables.

1. **Build Workspaces:**
   ```bash
   yarn build:backend
   yarn build:frontend
   ```

2. **Configure Environment Variables:**
   - **Backend** (`backend/.env`):
     - `MONGODB_URI`: Connection string to your production MongoDB cluster.
     - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Credentials from Google Cloud.
     - `JWT_SECRET`: A secure, random string for signing session tokens.
     - `NODE_ENV`: Set to `production`.
   - **Frontend** (`frontend/.env`):
     - `VITE_GOOGLE_MAPS_API_KEY`: A valid Maps API Key.
     - `VITE_GOOGLE_CLIENT_ID`: The same Client ID used in the backend.

3. **Start the Production App:**
   From the root directory, start both the real backend and frontend:
   ```bash
   yarn start:prod
   ```
   *(Note: For an actual server deployment, you will typically run `node dist/index.js` in the `backend` folder and serve the `frontend/dist` folder using a static host like Nginx, Vercel, or Netlify.)*

### GraphQL Code Generation
This project uses GraphQL Code Generator to automatically create TypeScript types and Apollo hooks from `.gql` files.
- To generate types for both backend and frontend, run: `yarn generate`

## Features

- **Interactive Map:** Click to drop pins on locations you want to visit, or paste Google Maps links to resolve coordinates.
- **Calendar Integration:** Authenticate with Google Calendar to view your free time and automatically create "Journey" events.
- **Data Persistence:** Journeys and pinned locations are saved to a MongoDB database.
