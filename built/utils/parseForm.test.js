

const test = require('ava'),
      parseForm = require('./parseForm'),
      fs = require('fs'),
      path = require('path'),
      fileToRead = path.join(process.cwd(), '/test_stubs/formDataBody.txt'),
      validString = fs.readFileSync(fileToRead, 'utf-8');

test('should return a function ', t => {
  t.is(typeof parseForm, 'function');
});

test('should parse a form string out correctly', t => {
  t.is(typeof parseForm(validString), 'object');
  t.is(parseForm(validString).cont, 'some random content');
  t.is(parseForm(validString).pass, 'some random pass');
});

test('should return an empty object if no form string', t => {
  t.is(typeof parseForm('this is bogus'), 'object');
  t.is(Object.keys(parseForm('this is something')).length, 0);
});