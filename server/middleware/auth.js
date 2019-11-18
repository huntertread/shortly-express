const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {

  if (req.headers.cookie === {}) {
    console.log('this cookie is empty');
  } else {
    return req.headers.cookie;
  }
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

