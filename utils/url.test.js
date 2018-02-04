'use strict';

const test = require('ava')
      , parseUrl = require('./url')
      , host = 'thehost'
      , port = '9090'
      , path = '/path1/path2/'
      , urlStr = `http://${host}:${port}${path}`

      , validateStuffMoney1000 = (query, t) => {
        const jsonStuff = JSON.stringify(query.stuff)
              , correctJson = JSON.stringify([ 'money', '1000' ]);

        t.not(query.stuff, 'undefined', '"stuff" should be defined on the query object');
        t.true(Array.isArray(query.stuff), '"stuff" should be an array');
        t.is(typeof query['stuff[]'], 'undefined', '"stuff[]" should not be defined on the query object');
        t.is(query.stuff.length, 2, `should be a two element array: ${query}`);
        t.deepEqual(jsonStuff, correctJson, 'query param value of "stuff" got dorked');
      };

test('should return a parse function', (t) => {
  t.is(typeof parseUrl, 'function');
});

test('should behave itself without request parameters', (t) => {
  const query = parseUrl({ urlStr: urlStr }).query
        , errString = `expected an empty query object: ${parseUrl({ urlStr })}`;

  t.is(typeof query, 'object');
  t.is(Object.keys(query).length, 0, errString);
});

test('should not dork with single value query parms that don\'t have square brackets', (t) => {
  const thisValue = 'money'
        , queryStr = `?stuff=${thisValue}`
        , query = parseUrl({ urlStr: urlStr + queryStr }).query;

  t.is(query.stuff, thisValue, 'query param value of "stuff" got dorked');
});

test('should combine query params and remove square brackets', (t) => {
  const queryStr = '?stuff[]=money&stuff[]=1000';

  validateStuffMoney1000(parseUrl({ urlStr: urlStr + queryStr }).query, t);
});

test('should create a single element array even when only a single value exists', (t) => {
  const queryStr = '?stuff[]=money'
        , query = parseUrl({ urlStr: urlStr + queryStr }).query
        , definedError = '"stuff[]" should not be defined on the query object'
        , arrayError = `"stuff" should be an array even though only one value was present,
            because of the deliberate square brackets`;

  t.not(query.stuff, 'undefined', '"stuff" should be defined on the query object');
  t.true(Array.isArray(query.stuff), arrayError);
  t.is(typeof query['stuff[]'], 'undefined', definedError);
  t.is(query.stuff[0], 'money', 'query param of "stuff" got dorked');
  t.is(query.stuff.length, 1, 'should be a single element array');
});

test('should remove square brackets on a single parm with a comma delimited value', (t) => {
  // NOTE: comma delimited values are not parsed into an array!
  const queryStr = '?stuff[]=one,two,three'
        , query = parseUrl({ urlStr: urlStr + queryStr }).query
        , jsonStuff = JSON.stringify(query.stuff)
        , correctJson = JSON.stringify([ 'one,two,three' ])

        , definedError = '"stuff[]" should not be defined on the query object';

  t.not(query.stuff, 'undefined', '"stuff" should be defined on the query object');
  t.true(Array.isArray(query.stuff), '"stuff" should be an array');
  t.is(typeof query['stuff[]'], 'undefined', definedError);
  t.is(query.stuff.length, 1, `should be a single element array: ${query}`);
  t.deepEqual(jsonStuff, correctJson, 'query param value of "stuff" got dorked');
});

test('should combine query parms that are not using square brackets', (t) => {
  const queryStr = '?stuff=money&stuff=1000';

  validateStuffMoney1000(parseUrl({ urlStr: urlStr + queryStr }).query, t);
});

test('should combine query parms that inconsistently use [] convention with [] last', (t) => {
  const queryStr = '?stuff=money&stuff[]=1000';

  validateStuffMoney1000(parseUrl({ urlStr: urlStr + queryStr }).query, t);
});

test('should combine query parms that inconsistently use [] convention with [] first', (t) => {
  const queryStr = '?stuff[]=money&stuff=1000';

  validateStuffMoney1000(parseUrl({ urlStr: urlStr + queryStr }).query, t);
});

test('should combine multiple query parms that use comma delimited values', (t) => {
  const queryStr = '?stuff=one,two,three&stuff=four,five,six&stuff=seven,eight,nine,ten'
        , query = parseUrl({ urlStr: urlStr + queryStr }).query
        , jsonStuff = JSON.stringify(query.stuff)
        , correctJson = JSON.stringify([
          'one,two,three'
          , 'four,five,six'
          , 'seven,eight,nine,ten' ])
        , definedError = '"stuff[]" should not be defined on the query object'

        , stuffLength = 3;

  t.not(query.stuff, 'undefined', '"stuff" should be defined on the query object');
  t.true(Array.isArray(query.stuff), '"stuff" should be an array');
  t.is(typeof query['stuff[]'], 'undefined', definedError);
  t.is(query.stuff.length, stuffLength, `should be a three element array: ${query}`);
  t.deepEqual(jsonStuff, correctJson, 'query param value of "stuff" got dorked');
});
