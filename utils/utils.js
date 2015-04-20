var getCompression = require('./getCompression')
  , send = require('./send')
  , cleanup = require('./cleanup');

module.exports = {
  getCompression: getCompression
  , send: send
  , cleanup: function () {
  		'use strict';

  		//execute all of the cleanup tasks in the cleanup obejct
  		//	not functionally pure... has sideeffects in the file system
  		//	sorry world
  		Object.keys(cleanup).forEach(function (key) {
  			if(typeof cleanup[key] === 'function'){
  				cleanup[key]();
  			}
  		});
  }
};
