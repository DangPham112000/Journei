# Journey Planner

A web application to plan your journeys. This app allows you to choose dates for your trips (integrated with Google Calendar to prevent scheduling conflicts with your free time) and interact with a map to pinpoint locations you'd like to visit.

## Tech Stack

**Frontend:**
- React 19
- Vite
- TypeScript
- Tailwind CSS
- Shadcn UI
- Base UI
- Apollo Client
- Google Maps React (`@vis.gl/react-google-maps`)
- React OAuth Google (`@react-oauth/google`)

**Backend:**
- Express.js
- GraphQL (Apollo Server)
- TypeScript
- MongoDB (via Mongoose)
- Google Auth Library
- JWT & Cookie Parser

## Project Structure

- `/frontend` - Contains the React application.
- `/backend` - Contains the Express/GraphQL server.

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB instance (local or MongoDB Atlas)
- Google Cloud Project with Calendar API and Maps JavaScript API enabled.

### Google Integration

To run this application properly with its full capabilities in production (or to disable local Mock Mode), you need to configure integrations with Google APIs. This provides map interactions and user authentication with Google Calendar.

#### 1. Obtaining a Google Maps API Key
This key is used by the frontend to render the interactive map and handle location coordinates.

1. Go to the <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a>.
2. Create a new project or select an existing one.
3. Navigate to **APIs & Services > Library**.
4. Search for and enable the **Maps JavaScript API**.
5. Go to **APIs & Services > Credentials**.
6. Click **Create Credentials** and select **API key**.
7. Copy the generated key.
8. Set this as `VITE_GOOGLE_MAPS_API_KEY` in your frontend environment variables (`frontend/.env`).

*(Note: It is highly recommended to restrict this API key to your specific domain or IP address in the Google Cloud Console to prevent unauthorized usage).*

#### 2. Obtaining OAuth Credentials
These credentials are used to authenticate users via Google OAuth and request access to their Google Calendar. The frontend needs the Client ID to initiate the login, and the backend needs both the Client ID and Client Secret to verify tokens securely.

1. In the same Google Cloud Project, go to **APIs & Services > Library**.
2. Search for and enable the **Google Calendar API**.
3. Go to **APIs & Services > OAuth consent screen**.
   - Choose "External" (or "Internal" if using Google Workspace).
   - Fill in the required App information (App name, support email, developer contact).
   - Under Scopes, add `.../auth/calendar.events` and `.../auth/userinfo.profile` (or similar required scopes).
   - Add your test users if your app is in "Testing" status.
4. Go to **APIs & Services > Credentials**.
5. Click **Create Credentials** and select **OAuth client ID**.
6. Choose **Web application** as the Application type.
7. Add your application's URIs:
   - **Authorized JavaScript origins**: e.g., `http://localhost:5173` (for local dev) or `https://journei.yourdomain.com` (for production).
   - **Authorized redirect URIs**: Typically the same as your origin, or wherever your auth callback handles the response.
8. Click **Create**. You will receive a **Client ID** and a **Client Secret**.
9. Configure the environment variables:
   - Add the Client ID to `frontend/.env` as `VITE_GOOGLE_CLIENT_ID`.
   - Add the Client ID to `backend/.env` as `GOOGLE_CLIENT_ID`.
   - Add the Client Secret to `backend/.env` as `GOOGLE_CLIENT_SECRET`.

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

The production deployment is fully automated using a **GitHub Actions CI/CD** pipeline. We utilize **Cloudflare** for DNS and SSL termination to serve the application on a subdomain.

Here is a high-level summary of the steps involved in the deployment process:
1. **VPS Preparation:** Set up an Ubuntu VPS, install Docker and Docker Compose, and configure SSH keys.
2. **Cloudflare Setup:** Configure domain DNS to point to the VPS using Cloudflare's proxy.
3. **App Configuration:** Prepare the application directories and `.env` variables directly on the VPS.
4. **GitHub Secrets:** Add necessary credentials (VPS IP, username, SSH key, and a GHCR Personal Access Token) as GitHub Secrets.
5. **Automated Pipeline:** On push to the `main` branch, GitHub Actions builds the Docker images, pushes them to the GitHub Container Registry, and restarts the containers via SSH on the VPS.

For a comprehensive, step-by-step guide on configuring each of these components, please refer to the detailed [**DEPLOYMENT.md**](./DEPLOYMENT.md) documentation.

### GraphQL Code Generation
This project uses GraphQL Code Generator to automatically create TypeScript types and Apollo hooks from `.gql` files.
- To generate types for both backend and frontend, run: `yarn generate`

## Features

- **Interactive Map:** Click to drop pins on locations you want to visit, or paste Google Maps links to resolve coordinates.
- **Calendar Integration:** Authenticate with Google Calendar to view your free time and automatically create "Journey" events.
- **Data Persistence:** Journeys and pinned locations are saved to a MongoDB database.
