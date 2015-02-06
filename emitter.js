var Events = require('events').EventEmitter
	, emitter = new Events()
	, required = require('event-state');

if(process.env.NODE_ENV === 'production'){
	//turn off the max listener warnings in production
	//	leave them on for everywhere else so that potential issues
	//	can be tracked down. By default the max listeners is 10 for 
	//	a single event and node throws a warning on the console if you exceed it.
	emitter.setMaxListeners(0);
}

emitter.required = required;

module.exports = emitter;
