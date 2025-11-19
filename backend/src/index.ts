import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import matchRoutes from './routes/matches.js';
import chatRoutes from './routes/chat.js';
import qaRoutes from './routes/qa.js';
import photoRoutes from './routes/photos.js';
import aiCoachRoutes from './routes/ai-coach.js';
import { setupSocketIO } from './socket/socket.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/qa', qaRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/ai-coach', aiCoachRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Dating Platform API is running' });
});

// Setup Socket.IO
setupSocketIO(io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

