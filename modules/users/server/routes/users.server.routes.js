'use strict';

module.exports = function (app) {
  // User Routes
  var users = require('../controllers/users.server.controller');

  // Setting up the users profile api
  app.route('/api/users/me').get(users.me);
  app.route('/api/users').put(users.update);
  app.route('/api/users/accounts').delete(users.removeOAuthProvider);
  app.route('/api/users/password').post(users.changePassword);
  app.route('/api/users/picture').post(users.changeProfilePicture);
  app.route('/api/getusernames/:text').get(users.listUsernames);
  app.route('/api/getuserbycode/:code').get(users.listUsernames);
  app.route('/api/managesuscription').post(users.manageSubscription);
  app.route('/api/datawinner').post(users.userDataWinner);

  // Finish by binding the user middleware
  app.param('userId', users.userByID);
  app.param('text', users.userByUsername);
  app.param('code', users.userByReferralCode);
};
