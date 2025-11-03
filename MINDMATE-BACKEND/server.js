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
    // path: "/socket.io/",
    cors: {
      origin: "http://localhost:5173",
      methods: ['GET', 'POST'],
      // credentials: true,
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
      console.log("➡️ callUser triggered to:", to);
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
      try {
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

        // Convert back to plain object with getters (decrypt)
        const cleanMsg = saved.toObject({ getters: true });

        // Emit to both users (so both see decrypted text)
        io.to(to).emit('receiveMessage', cleanMsg);
        io.to(from).emit('receiveMessage', cleanMsg);

        console.log('💬 Message saved & emitted:', cleanMsg.text);
      } catch (err) {
        console.error('❌ Failed to send message:', err);
      }
    });

    socket.on("messageSeen", async ({ messageId, userId }) => {
      try {
        const updated = await ChatMessage.findByIdAndUpdate(
          messageId,
          { $addToSet: { seenBy: userId } }, // add user if not already there
          { new: true }
        );

        if (updated) {
          io.to(updated.from).emit("messageSeenUpdate", {
            messageId,
            seenBy: updated.seenBy
          });
        }
      } catch (err) {
        console.error("❌ Failed to mark message seen:", err);
      }
    });

    socket.on("editMessage", async (updatedMsg) => {
      try {
        await ChatMessage.findByIdAndUpdate(
          updatedMsg._id,
          { text: updatedMsg.text, edited: true },
          { new: true }
        );

        const saved = await ChatMessage.findById(updatedMsg._id).lean({ getters: true });

        io.to(updatedMsg.from).emit("messageEdited", saved);
        io.to(updatedMsg.to).emit("messageEdited", saved);
      } catch (err) {
        console.error("❌ Failed to edit message:", err);
      }
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