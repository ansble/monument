'use strict';

module.exports = {
    isDefined: (item) => {
        return typeof item !== 'undefined';
    }

    , not: (fn) => {
          return !fn;
      }

    , contains: (array, item) => {
          return array.indexOf(item) >= 0;
      }
};
