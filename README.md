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

### Backend Setup
1. Navigate to the `backend` directory.
2. Install dependencies: `npm install`
3. Create a `.env` file based on the instructions inside the backend directory (requires MongoDB URI and Google credentials).
4. Run the development server: `npm run dev`

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`
3. Create a `.env` file with your Google Maps API key and Backend URL.
4. Run the development server: `npm run dev`

## Features

- **Interactive Map:** Click to drop pins on locations you want to visit, or paste Google Maps links to resolve coordinates.
- **Calendar Integration:** Authenticate with Google Calendar to view your free time and automatically create "Journey" events.
- **Data Persistence:** Journeys and pinned locations are saved to a MongoDB database.
