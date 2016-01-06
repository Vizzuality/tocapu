'use strict';

import mongoose from 'mongoose';

const db = 'mongodb://localhost/tocapu_test';
const helpers = {};

/**
 * To connect DB before test models
 * @param  {Function} done
 */
helpers.connectdb = done => mongoose.connect(db, done);

/**
 * To disconnect DB after test models
 * @param  {Function} done
 */
helpers.disconnectdb = done => mongoose.disconnect(done);

/**
 * Remove DB after test models
 * @param  {Function} done
 */
helpers.cleardb = function (done) {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    if (collections.hasOwnProperty(key)) {
      collections[key].remove(() => {});
    }
  }
  return done();
};

/**
 * Check if a date is valid
 * @param  {Date}  d
 * @return {Boolean}
 */
helpers.isDate = function (d) {
  if (Object.prototype.toString.call(d) !== '[object Date]') {
    return false;
  }
  return !isNaN(d.getTime());
};

export default helpers;
