const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  usernameWhoSends: {
    type: String,
    required: true,
  },
  usernameWhoGets: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  unreadMessage: {
    type: Boolean,
    default: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Message = mongoose.model('message', messageSchema);
module.exports = Message;
