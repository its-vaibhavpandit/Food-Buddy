import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from './env.js';

let io: Server | null = null;

export const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: [env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:3001'],
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket: Socket) => {
    // Join Order Tracking Room
    socket.on('join-order-room', (orderId: string) => {
      if (orderId) {
        socket.join(`order:${orderId}`);
      }
    });

    // Leave Order Tracking Room
    socket.on('leave-order-room', (orderId: string) => {
      if (orderId) {
        socket.leave(`order:${orderId}`);
      }
    });

    // Join Admin Dashboard Room
    socket.on('join-admin-room', () => {
      socket.join('admin-room');
    });

    socket.on('disconnect', () => {
      /* disconnected silently */
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initSocket first.');
  }
  return io;
};

// Helper: Broadcast order status update to customer tracking room
export const emitOrderStatusUpdate = (orderId: string, status: string, updatedAt?: string) => {
  if (io) {
    io.to(`order:${orderId}`).emit('order:status_updated', {
      orderId,
      status,
      updatedAt: updatedAt || new Date().toISOString(),
    });
    // Also notify admin room
    io.to('admin-room').emit('order:status_updated', {
      orderId,
      status,
      updatedAt: updatedAt || new Date().toISOString(),
    });
  }
};

// Helper: Broadcast new order placed to admin room
export const emitNewOrderPlaced = (order: Record<string, unknown>) => {
  if (io) {
    io.to('admin-room').emit('order:new_placed', { order });
  }
};
