'use strict';

const test = require('ava')
      , parseUrl = require('./url')
      , host = 'thehost'
      , port = '9090'
      , path = '/path1/path2/'
      , urlStr = `http://${host}:${port}${path}`

      , validateStuffMoney1000 = (query, t) => {
        const jsonStuff = JSON.stringify(query.stuff)
              , correctJson = JSON.stringify([ '&apos;&quot;&gt;', '1000' ]);

        t.not(query.stuff, 'undefined', '"stuff" should be defined on the query object');
        t.true(Array.isArray(query.stuff), '"stuff" should be an array');
        t.is(typeof query['stuff[]'], 'undefined', '"stuff[]" should not be defined on the query object');
        t.is(query.stuff.length, 2, `should be a two element array: ${query}`);
        t.deepEqual(jsonStuff, correctJson, 'query param value of "stuff" got dorked');
      };

test('should remove html from the query items', (t) => {
  const thisValue = '%27"><svg/onload=alert(%27test%27)>'
        , queryStr = `?stuff=${thisValue}`
        , query = parseUrl(urlStr + queryStr).query;

  t.not(query.stuff, thisValue, 'query param value of "stuff" got dorked');
  t.is(query.stuff, '&apos;&quot;&gt;', 'query param value of "stuff" got dorked');
});

test('should combine query params and remove square brackets', (t) => {
  const queryStr = '?stuff[]=%27"><svg/onload=alert(%27test%27)>&stuff[]=1000';

  validateStuffMoney1000(parseUrl(urlStr + queryStr).query, t);
});
