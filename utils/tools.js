module.exports = {
    isDefined: (item) => {
        'use strict';

        return typeof item !== 'undefined';
    }

    , not: (fn) => {
        'use strict';

        return !fn;
    }
};
