const mongoose = require('mongoose');
const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.CHAT_SECRET_KEY;
const IV_LENGTH = 16;

if (!ENCRYPTION_KEY || Buffer.from(ENCRYPTION_KEY).length !== 32) {
  throw new Error("CHAT_SECRET_KEY must be a 32-byte key for AES-256-CBC");
}

function encrypt(text) {
  if (!text) return '';
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const encryptedValue = iv.toString('hex') + ':' + encrypted;

    console.log('🔐 Encrypted:', text, '→', encryptedValue.slice(0, 25) + '...');
    return encryptedValue;
  } catch (err) {
    console.error('Encryption failed:', err.message);
    return text;
  }
}

function decrypt(text) {
  if (!text) return '';
  try {
    const [ivHex, encryptedText] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    console.log('🔓 Decrypted:', decrypted);
    return decrypted;
  } catch (err) {
    console.error('Decryption failed for', text, '→', err.message);
    return text;
  }
}

const ChatMessageSchema = new mongoose.Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    text: {
      type: String,
      required: true,
      set: encrypt, // Encrypt before saving
      get: decrypt, // Decrypt when reading
    },
    timestamp: { type: Date, default: Date.now },
    edited: { type: Boolean, default: false },
    seenBy: { type: [String], default: [] },
  },
  {
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);

module.exports = ChatMessage;