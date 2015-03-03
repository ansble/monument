var eventStore = {}
	
	, emitter = {
		emit: function(eventNameIn, eventDataIn){
			'use strict';

	        var eventStack = eventStore[eventNameIn];

	        //emit the event
	        if(typeof eventStack !== 'undefined'){
	            eventStack.forEach(function (listener) {
	                if(typeof listener.scope !== 'undefined'){
	                    listener.call.apply(listener.scope,[eventDataIn]);
	                }else{
	                    listener.call(eventDataIn);
	                }

	                if(listener.once){
	                    emitter.off({
	                        eventName: eventNameIn
	                        , scope: listener.scope
	                        , handler: listener.call
	                        , once: listener.once
	                    });
	                }
	            });
	        }

	        emitter.cleanup();
	    }

	    , cleanup: function () {
			'use strict';

			Object.keys(eventStore).forEach(function (event) {
				eventStore[event].forEach(function (item) {
					if(item.created + 120000 <= new Date()){
						emitter.off({
		                        eventName: event
		                        , scope: item.scope
		                        , handler: item.call
		                        , once: item.once
		                    });
					}
				});
			});
		}
	    
	    , listeners: function (eventNameIn) {
	    	'use strict';

	    	return eventStore[eventNameIn];
	    }

	    , on: function(eventNameIn, handlerIn, scopeIn, onceIn){
	    	'use strict';

	        var newCheck = true

	            //attribute holders and such
	            , eventName = eventNameIn
	            , handler = handlerIn
	            , scope = scopeIn
	            , once = onceIn

	            //variables for later
	            , eventStack = eventStore[eventName];

	        if(typeof eventNameIn === 'object'){
	            //we have an object to split up dude
	            eventName = eventNameIn.eventName;
	            handler = eventNameIn.handler;
	            scope = eventNameIn.scope;
	            once = (typeof eventNameIn.once !== 'undefined') ? eventNameIn.once : false;
	        }

	        if(typeof eventStack !== 'undefined'){
	            //already exists check to see if the function is already bound
	            eventStack.some(function (listener) {
	                if(listener.call.toString() === handler.toString() && listener.once === false){
	                    newCheck = false;
	                    return true;
	                }
	            });

	            if(newCheck && typeof scope !== 'undefined'){
	                eventStack.push({once: once, call: handler, scope: scope, created: new Date()});
	            }else if(newCheck){
	                eventStack.push({once: once, call:handler, created: new Date()});
	            }

	        } else {
	            //new event
	            eventStore[eventName] = []; //use an array to store functions
	            if(typeof scope !== 'undefined'){
	            	eventStore[eventName].push({once: once, call: handler, scope: scope, created: new Date()});
	            }else{
	            	eventStore[eventName].push({once: once, call: handler, created: new Date()});
	            }
	        }
	    }

	    , once: function(eventNameIn, handlerIn, scopeIn){
	    	'use strict';

	        //same thing as .listen() but is only triggered once
	        var that = this;

	        if(typeof eventNameIn === 'object'){
	            eventNameIn.once = true;
	            that.on(eventNameIn);
	        }else{
	            that.on({
	                eventName: eventNameIn
	                , handler: handlerIn
	                , scope: scopeIn
	                , once: true
	            });
	        }
	    }

	    , removeAllListeners: function (eventNameIn) {
	    	'use strict';

	    	this.removeListener(eventNameIn);
	    }

	    , off:  function(eventNameIn, handlerIn, onceIn, scopeIn){
	    	'use strict';
	        //localize variables
	        var eventName = eventNameIn
	            , handler = handlerIn
	            , once = onceIn
	            , scope = scopeIn;

	        if(typeof eventNameIn === 'object'){
	            // passed in a collection of params instead of params
	            eventName = eventNameIn.eventName;
	            handler = eventNameIn.handler;
	            once = eventNameIn.once;
	            scope = eventNameIn.scope;
	        }

	        if(typeof eventStore[eventName] === 'undefined'){
	            //if there is no event with that name... return nothing
	            return;
	        }

	        if(typeof handler !== 'undefined'){
	            //there is an event that matches... proceed
	            eventStore[eventName] = eventStore[eventName].filter(function(listener){
	                var isMatch = (handler.toString() === listener.call.toString());

	                //function is passed in
	                if(typeof scope !== 'undefined'){
	                    //scope is passed in...
	                    isMatch = !!(isMatch && scope);

	                    if(typeof once === 'boolean'){
	                        // function + scope + once provides the match
	                        isMatch = !!(isMatch && once === listener.once);
	                    }
	                } else if (typeof once === 'boolean'){
	                    isMatch = !!( isMatch && listener.once === once);
	                }

	                return !isMatch;
	            });

	        } else {
	            //no function unbind everything by resetting
	            eventStore[eventName] = [];
	        }
	    }

	    , required: require('event-state')
	};

emitter.addListener = emitter.on;
emitter.removeListener = emitter.off;

// if(process.env.NODE_ENV === 'production'){
// 	//turn off the max listener warnings in production
// 	//	leave them on for everywhere else so that potential issues
// 	//	can be tracked down. By default the max listeners is 10 for 
// 	//	a single event and node throws a warning on the console if you exceed it.
// 	emitter.setMaxListeners(0);
// }

module.exports = emitter;