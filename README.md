# ☕ Cafe Explorer - Full-Stack Application

A map-centric coffee shop exploration application that allows users to discover, save, and rate cafes. Built with React + TypeScript frontend and Express + SQLite backend, featuring Google Maps integration and JWT authentication.

## 🏗️ Architecture

```
Frontend (React + TypeScript + Vite)
├── UI: Map View (Google Maps JS) + List View + Forms
├── API Calls: Axios to Backend
└── Auth: JWT in localStorage
         ↓ (HTTP Requests)
Backend (Node + Express + TypeScript)
├── Routes: /auth + /api/locations (CRUD for coffee shops)
├── Google Integration: Places API (search nearby cafes)
├── DB: SQLite (users + locations tables)
└── Security: bcrypt + JWT + CORS
         ↓ (Persistent Storage)
Database (SQLite)
├── users (id, email, password_hash, created_at)
└── locations (id, name, lat, lng, address, rating, notes, is_favorite, user_id, created_at)
```

## ✨ Features

- **Authentication**: User registration, login, and JWT-based session management
- **Interactive Map**: Google Maps integration with click-to-add functionality
- **Cafe Search**: Google Places API integration for discovering nearby cafes
- **CRUD Operations**: Create, read, update, and delete cafe entries
- **Favorites System**: Mark cafes as favorites with heart icons
- **Rating System**: 1-5 star rating system for cafes
- **Notes**: Add personal notes to each cafe
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm
- Google Cloud Console account with API keys:
  - Maps JavaScript API (Browser Key)
  - Places API (Server Key)

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

**Environment Variables (.env):**
```env
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
GOOGLE_SERVER_KEY=your-server-key
DATABASE_PATH=./db.sqlite
```

### 2. Frontend Setup

```bash
cd cafe-explorer-frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

**Environment Variables (.env):**
```env
VITE_GOOGLE_MAPS_JS_KEY=your-browser-key
VITE_API_BASE_URL=http://localhost:3000
```

### 3. Google Cloud Setup

1. Create a new project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the following APIs:
   - Maps JavaScript API
   - Places API
3. Create API keys:
   - **Browser Key**: For frontend Maps JavaScript API (restrict to your domain)
   - **Server Key**: For backend Places API (restrict to your server IP)

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

#### Login User
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Location Endpoints

#### Get All User's Cafes
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/locations
```

#### Create New Cafe
```bash
curl -X POST http://localhost:3000/api/locations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Starbucks",
    "lat":25.0330,
    "lng":121.5654,
    "address":"台北市信義區信義路五段7號",
    "rating":4,
    "notes":"Great coffee and atmosphere"
  }'
```

#### Update Cafe
```bash
curl -X PUT http://localhost:3000/api/locations/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rating":5,"notes":"Updated notes"}'
```

#### Delete Cafe
```bash
curl -X DELETE http://localhost:3000/api/locations/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Toggle Favorite
```bash
curl -X PATCH http://localhost:3000/api/locations/1/favorite \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Search Endpoints

#### Search Places
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/search/places?query=starbucks&lat=25.0330&lng=121.5654&radius=1000"
```

#### Search Nearby Cafes
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/search/places/nearby?lat=25.0330&lng=121.5654&radius=1000"
```

## 🔧 Development

### Backend Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
```

### Frontend Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🛡️ Security Features

- **Password Hashing**: bcrypt with salt rounds (10)
- **JWT Authentication**: HS256 signed tokens with 1-hour expiration
- **Input Validation**: Zod schemas for all endpoints
- **CORS Protection**: Restricted to frontend origins
- **User Isolation**: Users can only access their own cafes
- **SQL Injection Prevention**: Parameterized queries

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Locations Table
```sql
CREATE TABLE locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  address TEXT,
  rating INTEGER CHECK(rating >= 1 AND rating <= 5),
  notes TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  user_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

## 🚨 Known Limitations

- **No Rate Limiting**: API endpoints lack rate limiting (production consideration)
- **Places API Quota**: Google Places API has usage limits
- **No Refresh Tokens**: JWT tokens expire after 1 hour
- **Local Development**: Server key has no IP restrictions (security risk for production)

## 🔮 Future Improvements

- Add refresh token mechanism
- Implement rate limiting
- Add caching for Places API responses
- Add social sharing features
- Implement real-time collaboration
- Add photo uploads for cafes
- Add cafe reviews and comments

## 📝 License

This project is for educational purposes. Please ensure you have proper Google Cloud API keys and follow their terms of service.
