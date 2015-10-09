'use strict';

const parseForm = (formString) => {
        const keys  = formString.match(/(name=")([^"]+)(")([^a-zA-Z0-9]+)([^-]+)/g);

        if (keys !== null) {
            return keys.reduce((prev, current) => {
                const temp = current.match(/(")([^"])+/);

                prev[temp[0].replace(/"/g, '')] = current.match(/([\s].+)/)[0].replace(/^[\s]/, '');

                return prev;
            }, {});
        } else {
            return {};
        }
    };

module.exports = parseForm;
