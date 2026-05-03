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

### Setup Instructions
We use [Yarn Workspaces](https://yarnpkg.com/features/workspaces) to manage both the frontend and backend dependencies from the root directory.

1. Ensure you are in the root directory.
2. Install dependencies for both frontend and backend: `yarn install`
3. Set up the environment files:
   - **Backend:** In the `backend` directory, create a `.env` file with:
     ```env
     PORT=4000
     MONGODB_URI=mongodb://localhost:27017/journey-planner
     GOOGLE_CLIENT_ID=your_google_client_id
     GOOGLE_CLIENT_SECRET=your_google_client_secret
     JWT_SECRET=your_jwt_secret
     FRONTEND_URL=http://localhost:5173
     ```
   - **Frontend:** In the `frontend` directory, create a `.env` file with:
     ```env
     VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
     VITE_GRAPHQL_URI=http://localhost:4000/graphql
     VITE_GOOGLE_CLIENT_ID=your_google_client_id
     ```

### Running the App
You can run both the frontend and backend development servers concurrently from the root directory:

```bash
yarn start
```

Alternatively, you can run them individually:
- Run backend: `yarn run dev:backend`
- Run frontend: `yarn run dev:frontend`

### GraphQL Code Generation
This project uses GraphQL Code Generator to automatically create TypeScript types and Apollo hooks from `.gql` files.
- To generate types for both backend and frontend, run: `yarn generate`

## Features

- **Interactive Map:** Click to drop pins on locations you want to visit, or paste Google Maps links to resolve coordinates.
- **Calendar Integration:** Authenticate with Google Calendar to view your free time and automatically create "Journey" events.
- **Data Persistence:** Journeys and pinned locations are saved to a MongoDB database.
