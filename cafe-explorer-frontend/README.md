# Cafe Explorer Frontend

A React + TypeScript application for discovering and managing cafe collections with map-based search and personal lists.

## Features

- **Authentication**: Fake login system with email/password
- **Map View**: Interactive Google Maps with cafe markers
- **List View**: Card-based cafe list with search, filter, and sort
- **Cafe Management**: Add, edit, delete, and favorite cafes
- **Rating System**: 1-5 star rating with notes
- **Responsive Design**: Mobile-friendly UI with TailwindCSS

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory:
   ```bash
   # Google Maps JavaScript API Key
   VITE_GOOGLE_MAPS_JS_KEY=your_google_maps_api_key_here
   ```

3. Get a Google Maps API key:
   - Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
   - Create a new project or select existing one
   - Enable the Maps JavaScript API
   - Create credentials (API Key)
   - Add the key to your `.env` file

4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. **Login**: Use any email and password to sign in (fake authentication)
2. **Map View**: 
   - View cafes on the map with custom markers
   - Click on the map to add new cafes
   - Click on markers to view cafe details
3. **List View**:
   - Browse all cafes in card format
   - Search by name, address, or notes
   - Filter by favorites
   - Sort by name, rating, or date added
   - Edit cafe details inline
   - Toggle favorites with heart button

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **TailwindCSS** for styling
- **React Router** for navigation
- **Google Maps JavaScript API** for maps
- **Axios** for future API calls
- **Context API** for state management

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── CafeCard.tsx    # Individual cafe display card
│   ├── MapComponent.tsx # Google Maps wrapper
│   └── Navigation.tsx   # App navigation
├── context/            # React Context providers
│   ├── AuthContext.tsx # Authentication state
│   └── CafeContext.tsx # Cafe data management
├── pages/              # Main application pages
│   ├── Login.tsx       # Login form
│   ├── Map.tsx         # Map view with cafe markers
│   └── List.tsx        # Cafe list view
├── types/              # TypeScript type definitions
│   └── Cafe.ts         # Cafe and User interfaces
└── App.tsx             # Main app component with routing
```

## Fake Data

The app comes with 8 sample cafes in Taipei, Taiwan:
- Starbucks, 路易莎咖啡, 85度C, Cama咖啡
- 丹堤咖啡, 伯朗咖啡, 怡客咖啡, 西雅圖咖啡

Each cafe includes name, address, coordinates, rating, and notes.

## Development

- **Hot Reload**: Changes are reflected immediately
- **TypeScript**: Full type safety throughout the app
- **ESLint**: Code linting and formatting
- **Responsive**: Works on desktop and mobile devices

## Future Enhancements

- Real backend API integration
- User authentication with JWT
- Photo uploads for cafes
- Social features (sharing, reviews)
- Advanced map features (clustering, heatmaps)
- Offline support with PWA