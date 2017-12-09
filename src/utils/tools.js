// @flow

module.exports = {
  isDefined: (item: any): boolean => {
    return typeof item !== 'undefined';
  }

  , not: (fn: () => mixed): boolean => {
    return !fn;
  }

  , isUndefined: (item: any): boolean => {
    return typeof item === 'undefined';
  }

  , contains: (array: Array<any>, item: any): boolean => {
    return array.indexOf(item) >= 0;
  }
};
