const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userSchema = require('./schemas/userSchema');
const mainTopicSchema = require('./schemas/mainTopicSchema');
const discussionSchema = require('./schemas/discussionSchema');
const singleDiscussionSchema = require('./schemas/singleDiscussionSchema');
const messageSchema = require('./schemas/messageSchema');
const resSend = require('./plugins/resSend');

/* REGISTRATION AND LOGIN */

exports.register = async (req, res) => {
  const { username, password1, role } = req.body;

  try {
    const existingUser = await userSchema.findOne({ username });
    if (existingUser) {
      return resSend(res, false, null, 'Username is already taken.');
    }
    const hashedPassword = await bcrypt.hash(password1, 10);

    const newUser = new userSchema({
      username,
      password: hashedPassword,
      role,
    });
    await newUser.save();

    resSend(res, true, null, 'Registration is successful');
  } catch (error) {
    resSend(res, false, null, 'Internal server error.');
  }
};

exports.login = async (req, res) => {
  const { username, password1 } = req.body;

  try {
    const existingUser = await userSchema.findOne({ username });
    if (!existingUser) {
      return resSend(res, false, null, 'Wrong username or password.');
    }

    const isPasswordMatch = await bcrypt.compare(
      password1,
      existingUser.password
    );
    if (isPasswordMatch) {
      const token = jwt.sign(
        { username: existingUser.username },
        process.env.JWT_SECRET,
        {
          expiresIn: '1h',
        }
      );

      return resSend(
        res,
        true,
        { token, username, image: existingUser.image, role: existingUser.role },
        'Login is successful.'
      );
    } else {
      return resSend(res, false, null, 'Wrong username or password.');
    }
  } catch (error) {
    return resSend(res, false, null, 'Error occured during login.');
  }
};

exports.autoLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userSchema.findOne({ username: decodedToken.username });

    if (!user) {
      return resSend(res, false, null, 'User not found');
    }

    resSend(
      res,
      true,
      { username: user.username, image: user.image, role: user.role },
      'Successfully authenticated.'
    );
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      resSend(res, false, null, 'Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      resSend(res, false, null, 'Invalid token');
    } else {
      resSend(res, false, null, 'Internal server error');
    }
  }
};

/* PROFILE */

exports.updateImage = async (req, res) => {
  try {
    const { image, username } = req.body;

    const updatedUser = await userSchema.findOneAndUpdate(
      { username },
      { $set: { image } },
      { new: true }
    );

    if (!updatedUser) {
      return resSend(res, false, null, 'User not found');
    }

    resSend(
      res,
      true,
      { username, image: updatedUser.image },
      'Image has been updated'
    );
  } catch (error) {
    resSend(res, false, null, 'Internal server error.');
  }
};

/* FORUM */

exports.createTopic = async (req, res) => {
  const { username, title } = req.body;

  try {
    const existingTopic = await mainTopicSchema.findOne({ title });
    if (existingTopic) {
      return resSend(res, false, null, 'This topic already exists.');
    }

    const newTopic = new mainTopicSchema({
      username: username,
      title: title,
      created_at: Date.now(),
    });
    await newTopic.save();

    resSend(res, true, newTopic, 'New topic has been created');
  } catch (error) {
    resSend(res, false, null, 'Internal server error.');
  }
};

exports.getTopics = async (req, res) => {
  try {
    const topics = await mainTopicSchema.aggregate([
      {
        $lookup: {
          from: 'discussions',
          localField: 'title',
          foreignField: 'mainTopic',
          as: 'discussions',
        },
      },
      {
        $project: {
          username: 1,
          title: 1,
          created_at: 1,
          discussionsCount: { $size: '$discussions' },
        },
      },
    ]);

    resSend(res, true, topics, 'Topics have been fetched');
  } catch (error) {
    resSend(res, false, null, 'Internal server error.');
  }
};

exports.createDiscussion = async (req, res) => {
  const { username, title, description, discussionTitle } = req.body;

  try {
    const existingDiscussion = await discussionSchema.findOne({
      title,
    });
    if (existingDiscussion) {
      return resSend(res, false, null, 'This discussion already exists.');
    }

    const newDiscussion = new discussionSchema({
      mainTopic: discussionTitle,
      username: username,
      title: title,
      description: description,
      created_at: Date.now(),
    });
    await newDiscussion.save();

    resSend(res, true, newDiscussion, 'New discussion has been created');
  } catch (error) {
    resSend(res, false, null, 'Internal server error.');
  }
};

exports.getDiscussions = async (req, res) => {
  const { discussionTitle } = req.params;

  try {
    const discussions = await discussionSchema.find({
      mainTopic: discussionTitle,
    });
    const discussionsWithAnswers = await Promise.all(
      discussions.map(async (discussion) => {
        const answers = await singleDiscussionSchema.find({
          discussionTheme: discussion._id,
        });
        return {
          ...discussion.toObject(),
          answers: answers,
        };
      })
    );

    resSend(
      res,
      true,
      discussionsWithAnswers,
      'Discussions with answers have been fetched.'
    );
  } catch (error) {
    resSend(res, false, null, 'Internal server error.');
  }
};

exports.createPost = async (req, res) => {
  const { username, comment, image, video, discussionId } = req.body;

  try {
    const newPost = new singleDiscussionSchema({
      discussionTheme: discussionId,
      username: username,
      comment: comment,
      image: image,
      video: video,
      created_at: Date.now(),
    });
    await newPost.save();

    resSend(res, true, newPost, 'New post has been created.');
  } catch (error) {
    resSend(res, false, null, 'Internal server error.');
  }
};

exports.getSingleDiscussion = async (req, res) => {
  const { discussionId } = req.params;

  try {
    const discussions = await singleDiscussionSchema.find({
      discussionTheme: discussionId,
    });

    resSend(res, true, discussions, 'Posts have been fetched.');
  } catch (error) {
    resSend(res, false, null, 'Internal server error.');
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userSchema.find();

    resSend(res, true, users, 'All users have been fetched.');
  } catch (error) {
    resSend(res, false, null, 'Internal server error.');
  }
};

exports.getAllDiscussions = async (req, res) => {
  try {
    const discussions = await discussionSchema.find();

    resSend(res, true, discussions, 'All discussions have been fetched.');
  } catch (error) {
    resSend(res, false, null, 'Internal server error.');
  }
};

exports.getAllAnswers = async (req, res) => {
  try {
    const answers = await singleDiscussionSchema.find();

    resSend(res, true, answers, 'All answers have been fetched.');
  } catch (error) {
    resSend(res, false, null, 'Internal server error.');
  }
};

/* MESSAGES AND CHAT */

exports.sendMessage = async (req, res) => {
  const { usernameWhoSends, usernameWhoGets, message } = req.body;

  try {
    const newMessage = new messageSchema({
      usernameWhoSends: usernameWhoSends,
      usernameWhoGets: usernameWhoGets,
      message: message,
      created_at: Date.now(),
    });
    await newMessage.save();

    resSend(res, true, newMessage, 'New message has been sent.');
  } catch (error) {
    resSend(res, false, null, 'Internal server error.');
  }
};

exports.getAllMessages = async (req, res) => {
  try {
    const messages = await messageSchema.find();

    resSend(res, true, messages, 'All messages have been fetched.');
  } catch (error) {
    resSend(res, false, null, 'Internal server error.');
  }
};

exports.messages = async (req, res) => {
  const { loggedInUser } = req.body;
  const otherUsername = req.params.username;

  try {
    const unreadMessages = await messageSchema.find({
      usernameWhoSends: otherUsername,
      usernameWhoGets: loggedInUser,
      unreadMessage: true,
    });

    await Promise.all(
      unreadMessages.map(async (msg) => {
        msg.unreadMessage = false;
        await msg.save();
      })
    );

    const chat = await messageSchema
      .find({
        $or: [
          {
            usernameWhoSends: loggedInUser,
            usernameWhoGets: otherUsername,
          },
          {
            usernameWhoSends: otherUsername,
            usernameWhoGets: loggedInUser,
          },
        ],
      })
      .sort({ created_at: 1 });

    resSend(res, true, chat, 'All chat have been fetched.');
  } catch (error) {
    resSend(res, false, null, 'Internal server error.');
  }
};
