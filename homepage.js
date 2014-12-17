var emitter = require('./emitter.js');

emitter.on('route:/:get', function(connection){
	connection.res.end('welcome home!');
});