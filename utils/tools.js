module.exports = {
    isDefined: function (item) {
        'use strict';

        return typeof item !== 'undefined';
    }

    , not: function (fn) {
        'use strict';

        return !fn;
    }
};
