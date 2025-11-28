import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SocketUser {
  userId: string;
  socketId: string;
}

const connectedUsers = new Map<string, SocketUser>();

export const setupSocketIO = (io: Server) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
      (socket as any).userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    connectedUsers.set(userId, { userId, socketId: socket.id });

    console.log(`User ${userId} connected`);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        const { matchId, content, type = 'text' } = data;

        // Verify user is part of this match
        const match = await prisma.match.findFirst({
          where: {
            id: matchId,
            OR: [
              { userId },
              { matchedUserId: userId },
            ],
            status: 'matched',
          },
        });

        if (!match) {
          socket.emit('error', { message: 'Match not found' });
          return;
        }

        // Create message
        const message = await prisma.message.create({
          data: {
            matchId,
            senderId: userId,
            content,
            type,
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        // Get other user ID
        const otherUserId = match.userId === userId ? match.matchedUserId : match.userId;

        // Send to other user
        io.to(`user:${otherUserId}`).emit('new_message', message);
        
        // Confirm to sender
        socket.emit('message_sent', message);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', async (data) => {
      const { matchId } = data;
      
      const match = await prisma.match.findFirst({
        where: {
          id: matchId,
          OR: [
            { userId },
            { matchedUserId: userId },
          ],
        },
      });

      if (match) {
        const otherUserId = match.userId === userId ? match.matchedUserId : match.userId;
        io.to(`user:${otherUserId}`).emit('user_typing', { matchId, userId });
      }
    });

    socket.on('stop_typing', async (data) => {
      const { matchId } = data;
      
      const match = await prisma.match.findFirst({
        where: {
          id: matchId,
          OR: [
            { userId },
            { matchedUserId: userId },
          ],
        },
      });

      if (match) {
        const otherUserId = match.userId === userId ? match.matchedUserId : match.userId;
        io.to(`user:${otherUserId}`).emit('user_stopped_typing', { matchId, userId });
      }
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(userId);
      console.log(`User ${userId} disconnected`);
    });
  });
};

