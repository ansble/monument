

module.exports = (a = {}, b = {}) => {
  return Object.keys(b).reduce((result, key) => {
    const accum = result;

    if (Array.isArray(accum[key])) {
      accum[key] = [].concat(accum[key], b[key].filter((v) => {
        return accum[key].indexOf(v) < 0;
      }));
    } else if (typeof accum[key] === 'object') {
      accum[key].verbs = [].concat(accum[key].verbs, b[key].verbs).filter((v, i, arr) => {
        return arr.indexOf(v) === i;
      });
    } else {
      accum[key] = b[key];
    }

    return accum;
  }, a);
};
