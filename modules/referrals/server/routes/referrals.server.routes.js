'use strict';

/**
 * Module dependencies
 */
var referralsPolicy = require('../policies/referrals.server.policy'),
  referrals = require('../controllers/referrals.server.controller');

module.exports = function (app) {
  // Referrals collection routes
  app.route('/api/referrals').all(referralsPolicy.isAllowed)
    .get(referrals.list)
    .post(referrals.create);

  // Single referral routes
  app.route('/api/referrals/:referralId')
    .get(referrals.read)
    .put(referrals.update)
    .delete(referrals.delete);

  app.route('/api/getreferrals/:referral')
    .get(referrals.listReferrals);

  // Finish by binding the referral middleware
  app.param('referralId', referrals.referralByID);
};
