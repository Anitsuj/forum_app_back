const jwt = require('jsonwebtoken');
const resSend = require('./plugins/resSend');

require('dotenv').config();

module.exports = {
  validUsername: (req, res, next) => {
    const { username } = req.body;

    if (username.length < 4 || username.length > 20)
      return resSend(
        res,
        false,
        null,
        'Username length is wrong. Length should be between 4-20 symbols.'
      );
    next();
  },

  validPassword: (req, res, next) => {
    const { password1, password2 } = req.body;

    if (password1.length < 4 || password1.length > 20) {
      return resSend(
        res,
        false,
        null,
        'Password length is wrong. Length should be between 4-20 symbols.'
      );
    } else if (password1 !== password2) {
      return resSend(res, false, null, 'Passwords does not match.');
    } else if (!/[0-9]/.test(password1)) {
      return resSend(
        res,
        false,
        null,
        'Password should contain at least one number.'
      );
    } else if (!/[^A-Za-z0-9]/.test(password1)) {
      return resSend(
        res,
        false,
        null,
        'Password should contain at least one special character.'
      );
    }

    next();
  },

  validToken: (req, res, next) => {
    const token = req.headers.authorization;

    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) return resSend(res, false, null, 'Wrong validation token.');

      req.user = { username: decoded.username };

      next();
    });
  },

  validImageUrl: (req, res, next) => {
    const { image } = req.body;

    if (!image) {
      return resSend(res, false, null, 'Please enter image url.');
    } else if (!image.startsWith('https://')) {
      return resSend(
        res,
        false,
        null,
        'Image should have "https://" in its link.'
      );
    }

    next();
  },

  validImageUrlWhenImageNotRequired: (req, res, next) => {
    const { image } = req.body;

    if (image === '') {
      return next();
    }
    if (!image.startsWith('https://')) {
      return resSend(
        res,
        false,
        null,
        'Image should have "https://" in its link.'
      );
    }

    next();
  },

  validYoutubeVideoWhenVideoNotRequired: (req, res, next) => {
    const { video } = req.body;

    if (video === '') {
      return next();
    }

    const youtubeRegExp =
      /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/;

    if (!youtubeRegExp.test(video)) {
      return resSend(res, false, null, 'Invalid YouTube video URL.');
    }

    next();
  },
};
