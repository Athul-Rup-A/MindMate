const express = require('express');
const asyncHandler = require('../utils/asyncHandler')
const ChatMessage = require('../models/ChatMessage');

const router = express.Router();

const getDecryptedMessage = async (id) => {
  const msg = await ChatMessage.findById(id).lean({ getters: true });
  return {
    _id: msg._id,
    from: msg.from,
    to: msg.to,
    text: msg.text,
    timestamp: msg.timestamp,
    edited: msg.edited,
    seenBy: msg.seenBy,
  };
};

router.get('/:myId/:targetId', asyncHandler(async (req, res) => {
  const { myId, targetId } = req.params;

  // Fetch raw docs (not lean) so getters run properly
  const messages = await ChatMessage.find({
    $or: [
      { from: myId, to: targetId },
      { from: targetId, to: myId }
    ]
  }).sort({ timestamp: 1 });

  // Force run decryption getter for each message
  const decryptedMessages = messages.map(msg => ({
    _id: msg._id,
    from: msg.from,
    to: msg.to,
    text: msg.text, // triggers the getter (decrypt)
    timestamp: msg.timestamp,
    edited: msg.edited,
    seenBy: msg.seenBy
  }));

  res.json(decryptedMessages);
}));


router.put('/:id', asyncHandler(async (req, res) => {
  const messageId = req.params.id;
  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ message: "Message text is required" });
  }

  // Update and save (encrypts automatically)
  const message = await ChatMessage.findById(messageId);
  if (!message) {
    return res.status(404).json({ message: 'Message not found' });
  }

  message.text = text;
  message.edited = true;
  message.timestamp = new Date();

  await message.save();

  const decrypted = await getDecryptedMessage(messageId);

  res.status(200).json(decrypted);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const messageId = req.params.id;

  const deleted = await ChatMessage.findByIdAndDelete(messageId);

  if (!deleted) {
    return res.status(404).json({ message: 'Message not found' });
  }

  return res.status(200).json({ message: 'Message deleted successfully' });
}));

module.exports = router;