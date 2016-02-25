'use strict';

import chai from 'chai';
import User from '../../app/models/user';
import helpers from '../helpers';

const expect = chai.expect;

describe('User', () => {
  let user;

  before(done => {
    helpers.connectdb(() => {
      helpers.cleardb(done);
    });
  });

  beforeEach(() => {
    user = new User({
      email: 'user@example.com',
      password: 'password'
    });
  });

  describe('instance', () => {
    it('user should be instance of User', () => {
      expect(user).to.be.instanceOf(User);
    });
  });

  describe('save', () => {
    it('save user', done => {
      user.save(done);
    });

    it('if email was not valid action should fail ', done => {
      user.email = 'user_at_example.com';
      user.save(err => {
        expect(err.name).to.be.equal('ValidationError');
        done();
      });
    });
  });
});
