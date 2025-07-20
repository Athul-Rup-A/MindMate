require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./src/config/db');
const { Server } = require('socket.io');
const ChatMessage = require('./src/models/ChatMessage')

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  const server = http.createServer(app);

  // Socket.IO setup
  const io = new Server(server, {
    cors: {
      origin: '*' || 'http://localhost:5173/',
      methods: ['GET', 'POST'],
    },
  });

  // Socket.IO events
  io.on('connection', (socket) => {
    console.log('🔌 New user connected:', socket.id);

    socket.on('join', (userId) => {
      socket.join(userId); // Join user room
      console.log(`User ${userId} joined their room`);
    });

    socket.on('callUser', ({ from, to, signalData }) => {
      io.to(to).emit('incomingCall', { from, signalData });
    });

    socket.on('answerCall', ({ to, signal }) => {
      io.to(to).emit('callAccepted', signal);
    });

    socket.on('endCall', ({ to }) => {
      io.to(to).emit('callEnded');
    });

    socket.on('readyForCall', ({ studentId }) => {
      console.log(`✅ Student ${studentId} is ready for call`);
      io.to(studentId).emit('readyForCall', { studentId });
    });

    socket.on('sendMessage', async ({ to, from, text, fromName }) => {
      const message = {
        sender: from,
        text,
        fromName: fromName || 'User',
        timestamp: new Date().toISOString(),
      };

      const saved = await ChatMessage.create({
        from,
        to,
        text,
        timestamp: message.timestamp,
      });

      io.to(to).emit('receiveMessage', saved);
    });

    socket.on("deleteMessage", async ({ _id, from, to }) => {
      try {
        await ChatMessage.findByIdAndDelete(_id);
        io.to(from).emit("messageDeleted", _id);
        io.to(to).emit("messageDeleted", _id);
      } catch (err) {
        console.error("❌ Failed to delete message on server:", err);
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ User disconnected:', socket.id);
    });
  });

  server.listen(PORT, () => {
    console.log(`🚀 Server running on port http://localhost:${PORT}`);
  });

}).catch((err) => {
  console.error('❌ Failed to connect to MongoDB:', err);
});