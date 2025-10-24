# Cafe Explorer Backend API

Express + TypeScript + SQLite backend for the Cafe Explorer application.

## 🚀 Quick Start

```bash
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

## 📋 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Locations (Protected)
- `GET /api/locations` - Get all user's cafes
- `GET /api/locations/:id` - Get specific cafe
- `POST /api/locations` - Create new cafe
- `PUT /api/locations/:id` - Update cafe
- `DELETE /api/locations/:id` - Delete cafe
- `PATCH /api/locations/:id/favorite` - Toggle favorite status

### Search (Protected)
- `GET /api/search/places` - Search cafes using Google Places API
- `GET /api/search/places/nearby` - Search nearby cafes

### Health Check
- `GET /health` - Server health status

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

## 🔧 Environment Variables

```env
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
GOOGLE_SERVER_KEY=your-server-key
DATABASE_PATH=./db.sqlite
```

## 🛡️ Security Features

- JWT authentication with 1-hour expiration
- bcrypt password hashing (salt rounds: 10)
- Input validation with Zod schemas
- CORS protection for frontend origins
- User isolation (users can only access their own data)
- SQL injection prevention with parameterized queries

## 📦 Dependencies

- **express** - Web framework
- **sqlite3** - Database
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT tokens
- **cors** - Cross-origin requests
- **axios** - HTTP client for Google APIs
- **zod** - Input validation
- **dotenv** - Environment variables
