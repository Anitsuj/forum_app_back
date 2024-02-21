const express = require('express');
const router = express.Router();
const controller = require('./controller');
const middleware = require('./middleware');

/* POST */

router.post('/login', controller.login);
router.post(
  '/register',
  middleware.validUsername,
  middleware.validPassword,
  controller.register
);
router.post('/autoLogin', middleware.validToken, controller.autoLogin);
router.post('/updateImage', middleware.validImageUrl, controller.updateImage);
router.post('/createTopic', controller.createTopic);
router.post('/createDiscussion', controller.createDiscussion);
router.post(
  '/createPost',
  middleware.validImageUrlWhenImageNotRequired,
  middleware.validYoutubeVideoWhenVideoNotRequired,
  controller.createPost
);
router.post('/sendMessage', controller.sendMessage);
router.post('/messages/:username', controller.messages);

/* GET */

router.get('/getTopics', controller.getTopics);
router.get('/getDiscussions/:discussionTitle', controller.getDiscussions);
router.get(
  '/getSingleDiscussion/:discussionId',
  controller.getSingleDiscussion
);
router.get('/getAllUsers', controller.getAllUsers);
router.get('/getAllDiscussions', controller.getAllDiscussions);
router.get('/getAllAnswers', controller.getAllAnswers);
router.get('/getAllMessages', controller.getAllMessages);

module.exports = router;
