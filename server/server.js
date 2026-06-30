import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import connectDB from './config/db.js';
import Message from './models/Message.js';

// Connect Database
connectDB();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: '*', // in production, configure to frontend URL
    methods: ['GET', 'POST'],
  },
});

// Socket.IO event handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // User joins their personal room based on their user ID
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  // User sends a message via Socket
  socket.on('send_message', async (data) => {
    const { sender, receiver, content } = data;

    try {
      if (sender && receiver && content) {
        // Save to Database
        const newMessage = await Message.create({
          sender,
          receiver,
          content,
        });

        // Emit message to receiver's private room
        io.to(receiver).emit('receive_message', newMessage);

        // Also emit back to sender to confirm delivery/update UI
        io.to(sender).emit('message_sent', newMessage);
      }
    } catch (error) {
      console.error('Error handling socket message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
