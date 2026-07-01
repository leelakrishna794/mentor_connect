import http from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
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
  maxHttpBufferSize: 1e8, // Increase limits for base64 file payloads
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
    const { sender, receiver, content, file } = data;

    try {
      if (sender && receiver && (content || file)) {
        let fileUrl = '';
        let fileName = '';
        let fileType = '';

        if (file && file.data && file.name) {
          if (!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads');
          }
          const base64Data = file.data.split(';base64,').pop();
          const uniqueName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
          const filePath = path.join('uploads', uniqueName);
          fs.writeFileSync(filePath, base64Data, { encoding: 'base64' });
          fileUrl = `http://localhost:5000/uploads/${uniqueName}`;
          fileName = file.name;
          fileType = file.type;
        }

        // Save to Database
        const newMessage = await Message.create({
          sender,
          receiver,
          content: content || '',
          fileUrl,
          fileName,
          fileType,
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
