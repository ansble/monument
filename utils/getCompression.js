var getCompression = function (header, config) {
    'use strict';

    var typeArray
      , maxq = 0;

    if(typeof header === 'undefined'){
       return 'none';
    }

    if(typeof config.compress !== 'undefined' && !config.compress){
      // compression turned off... bail
      return 'none';
    }

    if(header.match(/q=/)){
      //we have q values to calculate
      typeArray.forEach(function (qIn) {
        var q = parseFloat(qIn.match('/[0-9]\.[0-9]/')[0], 10);

        if(q > maxq){
          maxq = q;
          type = q.split(';')[0];
        }
      });

      return type;
    } else if (header.match(/\bgzip\b/)) {
        return 'gzip';
    } else if (header.match(/\bdeflate\b/)) {
        return 'deflate';
    } else {
        return 'none';
    }
  };

module.exports = getCompression;
