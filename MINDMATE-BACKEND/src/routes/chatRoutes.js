const express = require('express');
const asyncHandler = require('../utils/asyncHandler')
const ChatMessage = require('../models/ChatMessage');

const router = express.Router();

router.get('/:myId/:targetId', asyncHandler(async (req, res) => {
  const { myId, targetId } = req.params;

  const messages = await ChatMessage.find({
    $or: [
      { from: myId, to: targetId },
      { from: targetId, to: myId }
    ]
  }).sort({ timestamp: 1 });

  res.json(messages);
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