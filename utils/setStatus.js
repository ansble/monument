'use strict';

const statusCodes = require('http').STATUS_CODES
    , setStatus = (status) => {
        /* eslint-disable no-invalid-this */
        const that = this;
        /* eslint-enable no-invalid-this */
        let k;

        if (status in statusCodes) {
            that.statusCode = status;
            that.statusMessage = statusCodes[status];
            return;
        }

        for (k in statusCodes) {
            if (statusCodes[k].toLowerCase() === status.toLowerCase()) {
                that.statusCode = k;
                that.statusMessage = statusCodes[k];
                return;
            }
        }
    };

module.exports = setStatus;
