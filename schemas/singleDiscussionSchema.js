const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const singleDiscussionSchema = new Schema({
  discussionTheme: {
    type: Schema.Types.ObjectId,
    ref: 'discussionTheme',
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
  video: {
    type: String,
    required: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const SingleDiscussion = mongoose.model(
  'singleDiscussion',
  singleDiscussionSchema
);
module.exports = SingleDiscussion;
