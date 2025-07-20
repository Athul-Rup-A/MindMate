const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const ChatMessageSchema = new Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
});

const ChatMessage = model('ChatMessage', ChatMessageSchema);

module.exports = ChatMessage;
