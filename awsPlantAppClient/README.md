# Plant Recognition Web App

A React frontend application for identifying plants using AWS Lambda and Plant.id API.

## Features

- 🌱 **Plant Identification**: Upload or drag-and-drop plant images to identify them
- 💧 **Care Instructions**: View watering and care information for identified plants
- 🦠 **Disease Detection**: Get information about plant diseases
- 📚 **My Plants Collection**: Save and manage your identified plants
- 🔐 **User Authentication**: Sign up and login with JWT token storage
- 📱 **Responsive Design**: Works on all devices (mobile, tablet, desktop)

## Tech Stack

- React 19 (functional components + hooks)
- React Router DOM for navigation
- Vite for build tooling
- CSS for styling (fully responsive)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=https://your-api-gateway-url.execute-api.region.amazonaws.com
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Backend API Endpoints

The app expects the following backend endpoints:

- `POST /login` - User login (returns JWT token)
- `POST /signup` - User signup (returns JWT token)
- `POST /identify` - Identify plant from image (FormData with 'image' field)
- `POST /save` - Save plant to user's collection (requires authentication)
- `GET /my-plants` - Get user's saved plants (requires authentication)

## Project Structure

```
src/
├── components/
│   ├── Header.jsx          # Navigation header
│   └── Header.css
├── pages/
│   ├── Home.jsx            # Main page with plant identification
│   ├── Home.css
│   ├── Login.jsx           # Login page
│   ├── Signup.jsx          # Signup page
│   ├── Auth.css            # Shared auth styles
│   ├── MyPlants.jsx        # User's saved plants
│   └── MyPlants.css
├── utils/
│   └── api.js              # API utilities and auth helpers
├── App.jsx                 # Main app component with routing
├── App.css
├── main.jsx                # Entry point
└── index.css               # Global styles
```

## Usage

1. **Home Page**: Available to all users. Upload a plant image to identify it.
2. **Login/Signup**: Create an account or login to save plants.
3. **My Plants**: View your saved plant collection (requires login).

## Notes

- JWT tokens are stored in localStorage
- The app redirects to login when accessing protected routes without authentication
- All API requests include the JWT token in the Authorization header when available
