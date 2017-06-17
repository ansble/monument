/* eslint-disable no-invalid-this */
'use strict';

const statusCodes = require('http').STATUS_CODES
      , events = require('harken')
      , defaultRedirectStatus = 307

      , redirect = (req) => {
        return function (url, status) {
          if (typeof url === 'undefined') {
            events.emit('error:500', 'you must pass an URL to the redirect method');
            return;
          }

          this.setHeader('location', url);
          this.statusCode = status || defaultRedirectStatus;

          if (req.method === 'HEAD') {
            this.end();
          } else {
            this.end(`${this.statusCode} ${statusCodes[this.statusCode]} to ${encodeURI(url)}`);
          }
        };
      };


module.exports = redirect;
