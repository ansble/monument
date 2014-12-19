var emitter = require('../emitter.js');

emitter.on('route:/team:get', function (connection) {
	connection.res.end('welcome to the team page!');
});

emitter.on('route:/news:get', function (connection) {
	connection.res.end('This is the news! It is full of news!');
});