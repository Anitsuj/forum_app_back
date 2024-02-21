const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mainTopicSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const MainTopic = mongoose.model('mainTopic', mainTopicSchema);
module.exports = MainTopic;
