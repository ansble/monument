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
      }

      , validateStuffMoney1000Unsafe = (query, t) => {
        const jsonStuff = JSON.stringify(query.stuff)
              , correctJson = JSON.stringify([ `'"><svg/onload=alert('test')>`, '1000' ]); // eslint-disable-line quotes

        t.not(query.stuff, 'undefined', '"stuff" should be defined on the query object');
        t.true(Array.isArray(query.stuff), '"stuff" should be an array');
        t.is(typeof query['stuff[]'], 'undefined', '"stuff[]" should not be defined on the query object');
        t.is(query.stuff.length, 2, `should be a two element array: ${query}`);
        t.deepEqual(jsonStuff, correctJson, 'query param value of "stuff" got dorked');
      };

test('should remove html from the query items', (t) => {
  const thisValue = '%27"><svg/onload=alert(%27test%27)>'
        , queryStr = `?stuff=${thisValue}`
        , query = parseUrl({ urlStr: urlStr + queryStr }).query;

  t.not(query.stuff, thisValue);
  t.is(query.stuff, '&apos;&quot;&gt;');
});

test('should combine query params and remove square brackets and remove html from items', (t) => {
  const queryStr = '?stuff[]=%27"><svg/onload=alert(%27test%27)>&stuff[]=1000';

  validateStuffMoney1000(parseUrl({ urlStr: urlStr + queryStr }).query, t);
});

test('should not remove html from the query items if unsafeQuery', (t) => {
  const thisValue = '%27"><svg/onload=alert(%27test%27)>'
        , queryStr = `?stuff=${thisValue}`
        , query = parseUrl({ urlStr: urlStr + queryStr, unsafeQuery: true }).query;

  t.is(query.stuff, `'"><svg/onload=alert('test')>`); // eslint-disable-line quotes
  t.not(query.stuff, '&apos;&quot;&gt;');
});

test('should combine query params and remove square brackets and not remove html from items if unsafeQuery', (t) => {
  const queryStr = '?stuff[]=%27"><svg/onload=alert(%27test%27)>&stuff[]=1000';

  validateStuffMoney1000Unsafe(parseUrl({ urlStr: urlStr + queryStr, unsafeQuery: true }).query, t);
});


