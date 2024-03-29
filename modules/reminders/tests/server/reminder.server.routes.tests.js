'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Reminder = mongoose.model('Reminder'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  reminder;

/**
 * Reminder routes tests
 */
describe('Reminder CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new reminder
    user.save(function () {
      reminder = {
        title: 'Reminder Title',
        content: 'Reminder Content'
      };

      done();
    });
  });

  it('should be able to save an reminder if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new reminder
        agent.post('/api/reminders')
          .send(reminder)
          .expect(200)
          .end(function (reminderSaveErr, reminderSaveRes) {
            // Handle reminder save error
            if (reminderSaveErr) {
              return done(reminderSaveErr);
            }

            // Get a list of reminders
            agent.get('/api/reminders')
              .end(function (remindersGetErr, remindersGetRes) {
                // Handle reminder save error
                if (remindersGetErr) {
                  return done(remindersGetErr);
                }

                // Get reminders list
                var reminders = remindersGetRes.body;

                // Set assertions
                (reminders[0].user._id).should.equal(userId);
                (reminders[0].title).should.match('Reminder Title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an reminder if not logged in', function (done) {
    agent.post('/api/reminders')
      .send(reminder)
      .expect(403)
      .end(function (reminderSaveErr, reminderSaveRes) {
        // Call the assertion callback
        done(reminderSaveErr);
      });
  });

  it('should not be able to save an reminder if no title is provided', function (done) {
    // Invalidate title field
    reminder.title = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new reminder
        agent.post('/api/reminders')
          .send(reminder)
          .expect(400)
          .end(function (reminderSaveErr, reminderSaveRes) {
            // Set message assertion
            (reminderSaveRes.body.message).should.match('Title cannot be blank');

            // Handle reminder save error
            done(reminderSaveErr);
          });
      });
  });

  it('should be able to update an reminder if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new reminder
        agent.post('/api/reminders')
          .send(reminder)
          .expect(200)
          .end(function (reminderSaveErr, reminderSaveRes) {
            // Handle reminder save error
            if (reminderSaveErr) {
              return done(reminderSaveErr);
            }

            // Update reminder title
            reminder.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing reminder
            agent.put('/api/reminders/' + reminderSaveRes.body._id)
              .send(reminder)
              .expect(200)
              .end(function (reminderUpdateErr, reminderUpdateRes) {
                // Handle reminder update error
                if (reminderUpdateErr) {
                  return done(reminderUpdateErr);
                }

                // Set assertions
                (reminderUpdateRes.body._id).should.equal(reminderSaveRes.body._id);
                (reminderUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of reminders if not signed in', function (done) {
    // Create new reminder model instance
    var reminderObj = new Reminder(reminder);

    // Save the reminder
    reminderObj.save(function () {
      // Request reminders
      request(app).get('/api/reminders')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single reminder if not signed in', function (done) {
    // Create new reminder model instance
    var reminderObj = new Reminder(reminder);

    // Save the reminder
    reminderObj.save(function () {
      request(app).get('/api/reminders/' + reminderObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', reminder.title);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single reminder with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/reminders/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Reminder is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single reminder which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent reminder
    request(app).get('/api/reminders/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No reminder with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an reminder if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new reminder
        agent.post('/api/reminders')
          .send(reminder)
          .expect(200)
          .end(function (reminderSaveErr, reminderSaveRes) {
            // Handle reminder save error
            if (reminderSaveErr) {
              return done(reminderSaveErr);
            }

            // Delete an existing reminder
            agent.delete('/api/reminders/' + reminderSaveRes.body._id)
              .send(reminder)
              .expect(200)
              .end(function (reminderDeleteErr, reminderDeleteRes) {
                // Handle reminder error error
                if (reminderDeleteErr) {
                  return done(reminderDeleteErr);
                }

                // Set assertions
                (reminderDeleteRes.body._id).should.equal(reminderSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an reminder if not signed in', function (done) {
    // Set reminder user
    reminder.user = user;

    // Create new reminder model instance
    var reminderObj = new Reminder(reminder);

    // Save the reminder
    reminderObj.save(function () {
      // Try deleting reminder
      request(app).delete('/api/reminders/' + reminderObj._id)
        .expect(403)
        .end(function (reminderDeleteErr, reminderDeleteRes) {
          // Set message assertion
          (reminderDeleteRes.body.message).should.match('User is not authorized');

          // Handle reminder error error
          done(reminderDeleteErr);
        });

    });
  });

  it('should be able to get a single reminder that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new reminder
          agent.post('/api/reminders')
            .send(reminder)
            .expect(200)
            .end(function (reminderSaveErr, reminderSaveRes) {
              // Handle reminder save error
              if (reminderSaveErr) {
                return done(reminderSaveErr);
              }

              // Set assertions on new reminder
              (reminderSaveRes.body.title).should.equal(reminder.title);
              should.exist(reminderSaveRes.body.user);
              should.equal(reminderSaveRes.body.user._id, orphanId);

              // force the reminder to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the reminder
                    agent.get('/api/reminders/' + reminderSaveRes.body._id)
                      .expect(200)
                      .end(function (reminderInfoErr, reminderInfoRes) {
                        // Handle reminder error
                        if (reminderInfoErr) {
                          return done(reminderInfoErr);
                        }

                        // Set assertions
                        (reminderInfoRes.body._id).should.equal(reminderSaveRes.body._id);
                        (reminderInfoRes.body.title).should.equal(reminder.title);
                        should.equal(reminderInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single reminder if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new reminder model instance
    reminder.user = user;
    var reminderObj = new Reminder(reminder);

    // Save the reminder
    reminderObj.save(function () {
      agent.post('/api/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var userId = user.id;

          // Save a new reminder
          agent.post('/api/reminders')
            .send(reminder)
            .expect(200)
            .end(function (reminderSaveErr, reminderSaveRes) {
              // Handle reminder save error
              if (reminderSaveErr) {
                return done(reminderSaveErr);
              }

              // Get the reminder
              agent.get('/api/reminders/' + reminderSaveRes.body._id)
                .expect(200)
                .end(function (reminderInfoErr, reminderInfoRes) {
                  // Handle reminder error
                  if (reminderInfoErr) {
                    return done(reminderInfoErr);
                  }

                  // Set assertions
                  (reminderInfoRes.body._id).should.equal(reminderSaveRes.body._id);
                  (reminderInfoRes.body.title).should.equal(reminder.title);

                  // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                  (reminderInfoRes.body.isCurrentUserOwner).should.equal(true);

                  // Call the assertion callback
                  done();
                });
            });
        });
    });
  });

  it('should be able to get a single reminder if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new reminder model instance
    var reminderObj = new Reminder(reminder);

    // Save the reminder
    reminderObj.save(function () {
      request(app).get('/api/reminders/' + reminderObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', reminder.title);
          // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
          res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
          // Call the assertion callback
          done();
        });
    });
  });

  it('should be able to get single reminder, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      username: 'temp',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create temporary user
    var _user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _user.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the Reminder
      agent.post('/api/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var userId = user._id;

          // Save a new reminder
          agent.post('/api/reminders')
            .send(reminder)
            .expect(200)
            .end(function (reminderSaveErr, reminderSaveRes) {
              // Handle reminder save error
              if (reminderSaveErr) {
                return done(reminderSaveErr);
              }

              // Set assertions on new reminder
              (reminderSaveRes.body.title).should.equal(reminder.title);
              should.exist(reminderSaveRes.body.user);
              should.equal(reminderSaveRes.body.user._id, userId);

              // now signin with the temporary user
              agent.post('/api/auth/signin')
                .send(_creds)
                .expect(200)
                .end(function (err, res) {
                  // Handle signin error
                  if (err) {
                    return done(err);
                  }

                  // Get the reminder
                  agent.get('/api/reminders/' + reminderSaveRes.body._id)
                    .expect(200)
                    .end(function (reminderInfoErr, reminderInfoRes) {
                      // Handle reminder error
                      if (reminderInfoErr) {
                        return done(reminderInfoErr);
                      }

                      // Set assertions
                      (reminderInfoRes.body._id).should.equal(reminderSaveRes.body._id);
                      (reminderInfoRes.body.title).should.equal(reminder.title);
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      (reminderInfoRes.body.isCurrentUserOwner).should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Reminder.remove().exec(done);
    });
  });
});
