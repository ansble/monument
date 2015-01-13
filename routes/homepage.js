var emitter = require('../emitter.js');

emitter.on('route:/:get', function(connection){
	connection.res.end('<html><head><meta name="blitz" content="mu-18b0a9f6-f0d7b2bf-ba75d599-041b9238"></head><body><h1>welcome home!</h1></body></html>');
});