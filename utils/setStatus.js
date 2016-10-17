'use strict';

const statusCodes = require('http').STATUS_CODES
    , isUndefined = require('./tools').isUndefined
    , setStatus = () => {
        return function (status) {
            /* eslint-disable no-invalid-this */
            const that = this;
            /* eslint-enable no-invalid-this */

            if (!isUndefined(statusCodes[status])) {
                that.statusCode = parseInt(status, 10);
                that.statusMessage = statusCodes[status];
                return true;
            }

            if (typeof status === 'string') {
                return Object.keys(statusCodes).some((k) => {
                    if (statusCodes[k].toLowerCase() === status.toLowerCase()) {
                        that.statusCode = parseInt(k, 10);
                        that.statusMessage = statusCodes[k];
                        return true;
                    }
                    return false;
                });
            }
            return false;
        };
    };

module.exports = setStatus;
