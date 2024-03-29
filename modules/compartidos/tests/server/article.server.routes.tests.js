'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Compartido = mongoose.model('Compartido'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  compartido;

/**
 * Compartido routes tests
 */
describe('Compartido CRUD tests', function () {

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

    // Save a user to the test db and create new compartido
    user.save(function () {
      compartido = {
        title: 'Compartido Title',
        content: 'Compartido Content'
      };

      done();
    });
  });

  it('should be able to save an compartido if logged in', function (done) {
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

        // Save a new compartido
        agent.post('/api/compartidos')
          .send(compartido)
          .expect(200)
          .end(function (compartidoSaveErr, compartidoSaveRes) {
            // Handle compartido save error
            if (compartidoSaveErr) {
              return done(compartidoSaveErr);
            }

            // Get a list of compartidos
            agent.get('/api/compartidos')
              .end(function (compartidosGetErr, compartidosGetRes) {
                // Handle compartido save error
                if (compartidosGetErr) {
                  return done(compartidosGetErr);
                }

                // Get compartidos list
                var compartidos = compartidosGetRes.body;

                // Set assertions
                (compartidos[0].user._id).should.equal(userId);
                (compartidos[0].title).should.match('Compartido Title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an compartido if not logged in', function (done) {
    agent.post('/api/compartidos')
      .send(compartido)
      .expect(403)
      .end(function (compartidoSaveErr, compartidoSaveRes) {
        // Call the assertion callback
        done(compartidoSaveErr);
      });
  });

  it('should not be able to save an compartido if no title is provided', function (done) {
    // Invalidate title field
    compartido.title = '';

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

        // Save a new compartido
        agent.post('/api/compartidos')
          .send(compartido)
          .expect(400)
          .end(function (compartidoSaveErr, compartidoSaveRes) {
            // Set message assertion
            (compartidoSaveRes.body.message).should.match('Title cannot be blank');

            // Handle compartido save error
            done(compartidoSaveErr);
          });
      });
  });

  it('should be able to update an compartido if signed in', function (done) {
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

        // Save a new compartido
        agent.post('/api/compartidos')
          .send(compartido)
          .expect(200)
          .end(function (compartidoSaveErr, compartidoSaveRes) {
            // Handle compartido save error
            if (compartidoSaveErr) {
              return done(compartidoSaveErr);
            }

            // Update compartido title
            compartido.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing compartido
            agent.put('/api/compartidos/' + compartidoSaveRes.body._id)
              .send(compartido)
              .expect(200)
              .end(function (compartidoUpdateErr, compartidoUpdateRes) {
                // Handle compartido update error
                if (compartidoUpdateErr) {
                  return done(compartidoUpdateErr);
                }

                // Set assertions
                (compartidoUpdateRes.body._id).should.equal(compartidoSaveRes.body._id);
                (compartidoUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of compartidos if not signed in', function (done) {
    // Create new compartido model instance
    var compartidoObj = new Compartido(compartido);

    // Save the compartido
    compartidoObj.save(function () {
      // Request compartidos
      request(app).get('/api/compartidos')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single compartido if not signed in', function (done) {
    // Create new compartido model instance
    var compartidoObj = new Compartido(compartido);

    // Save the compartido
    compartidoObj.save(function () {
      request(app).get('/api/compartidos/' + compartidoObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', compartido.title);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single compartido with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/compartidos/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Compartido is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single compartido which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent compartido
    request(app).get('/api/compartidos/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No compartido with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an compartido if signed in', function (done) {
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

        // Save a new compartido
        agent.post('/api/compartidos')
          .send(compartido)
          .expect(200)
          .end(function (compartidoSaveErr, compartidoSaveRes) {
            // Handle compartido save error
            if (compartidoSaveErr) {
              return done(compartidoSaveErr);
            }

            // Delete an existing compartido
            agent.delete('/api/compartidos/' + compartidoSaveRes.body._id)
              .send(compartido)
              .expect(200)
              .end(function (compartidoDeleteErr, compartidoDeleteRes) {
                // Handle compartido error error
                if (compartidoDeleteErr) {
                  return done(compartidoDeleteErr);
                }

                // Set assertions
                (compartidoDeleteRes.body._id).should.equal(compartidoSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an compartido if not signed in', function (done) {
    // Set compartido user
    compartido.user = user;

    // Create new compartido model instance
    var compartidoObj = new Compartido(compartido);

    // Save the compartido
    compartidoObj.save(function () {
      // Try deleting compartido
      request(app).delete('/api/compartidos/' + compartidoObj._id)
        .expect(403)
        .end(function (compartidoDeleteErr, compartidoDeleteRes) {
          // Set message assertion
          (compartidoDeleteRes.body.message).should.match('User is not authorized');

          // Handle compartido error error
          done(compartidoDeleteErr);
        });

    });
  });

  it('should be able to get a single compartido that has an orphaned user reference', function (done) {
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

          // Save a new compartido
          agent.post('/api/compartidos')
            .send(compartido)
            .expect(200)
            .end(function (compartidoSaveErr, compartidoSaveRes) {
              // Handle compartido save error
              if (compartidoSaveErr) {
                return done(compartidoSaveErr);
              }

              // Set assertions on new compartido
              (compartidoSaveRes.body.title).should.equal(compartido.title);
              should.exist(compartidoSaveRes.body.user);
              should.equal(compartidoSaveRes.body.user._id, orphanId);

              // force the compartido to have an orphaned user reference
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

                    // Get the compartido
                    agent.get('/api/compartidos/' + compartidoSaveRes.body._id)
                      .expect(200)
                      .end(function (compartidoInfoErr, compartidoInfoRes) {
                        // Handle compartido error
                        if (compartidoInfoErr) {
                          return done(compartidoInfoErr);
                        }

                        // Set assertions
                        (compartidoInfoRes.body._id).should.equal(compartidoSaveRes.body._id);
                        (compartidoInfoRes.body.title).should.equal(compartido.title);
                        should.equal(compartidoInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single compartido if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new compartido model instance
    compartido.user = user;
    var compartidoObj = new Compartido(compartido);

    // Save the compartido
    compartidoObj.save(function () {
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

          // Save a new compartido
          agent.post('/api/compartidos')
            .send(compartido)
            .expect(200)
            .end(function (compartidoSaveErr, compartidoSaveRes) {
              // Handle compartido save error
              if (compartidoSaveErr) {
                return done(compartidoSaveErr);
              }

              // Get the compartido
              agent.get('/api/compartidos/' + compartidoSaveRes.body._id)
                .expect(200)
                .end(function (compartidoInfoErr, compartidoInfoRes) {
                  // Handle compartido error
                  if (compartidoInfoErr) {
                    return done(compartidoInfoErr);
                  }

                  // Set assertions
                  (compartidoInfoRes.body._id).should.equal(compartidoSaveRes.body._id);
                  (compartidoInfoRes.body.title).should.equal(compartido.title);

                  // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                  (compartidoInfoRes.body.isCurrentUserOwner).should.equal(true);

                  // Call the assertion callback
                  done();
                });
            });
        });
    });
  });

  it('should be able to get a single compartido if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new compartido model instance
    var compartidoObj = new Compartido(compartido);

    // Save the compartido
    compartidoObj.save(function () {
      request(app).get('/api/compartidos/' + compartidoObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', compartido.title);
          // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
          res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
          // Call the assertion callback
          done();
        });
    });
  });

  it('should be able to get single compartido, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
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

      // Sign in with the user that will create the Compartido
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

          // Save a new compartido
          agent.post('/api/compartidos')
            .send(compartido)
            .expect(200)
            .end(function (compartidoSaveErr, compartidoSaveRes) {
              // Handle compartido save error
              if (compartidoSaveErr) {
                return done(compartidoSaveErr);
              }

              // Set assertions on new compartido
              (compartidoSaveRes.body.title).should.equal(compartido.title);
              should.exist(compartidoSaveRes.body.user);
              should.equal(compartidoSaveRes.body.user._id, userId);

              // now signin with the temporary user
              agent.post('/api/auth/signin')
                .send(_creds)
                .expect(200)
                .end(function (err, res) {
                  // Handle signin error
                  if (err) {
                    return done(err);
                  }

                  // Get the compartido
                  agent.get('/api/compartidos/' + compartidoSaveRes.body._id)
                    .expect(200)
                    .end(function (compartidoInfoErr, compartidoInfoRes) {
                      // Handle compartido error
                      if (compartidoInfoErr) {
                        return done(compartidoInfoErr);
                      }

                      // Set assertions
                      (compartidoInfoRes.body._id).should.equal(compartidoSaveRes.body._id);
                      (compartidoInfoRes.body.title).should.equal(compartido.title);
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      (compartidoInfoRes.body.isCurrentUserOwner).should.equal(false);

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
      Compartido.remove().exec(done);
    });
  });
});
