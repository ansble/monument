'use strict';

module.exports = (version, type) => {
  const versionArr = version.split('.');

  if (type === 'major') {
    versionArr[0] = parseInt(versionArr[0], 10) + 1;
    versionArr[1] = 0;
    versionArr[2] = 0;
  } else if (type === 'minor') {
    versionArr[1] = parseInt(versionArr[1], 10) + 1;
    versionArr[2] = 0;
  } else {
    versionArr[2] = parseInt(versionArr[2], 10) + 1;
  }

  return versionArr.join('.');
};
