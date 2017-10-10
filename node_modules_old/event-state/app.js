//TODO: convert to ES6 and add built option for clientside use
var tools = require('./components/tools')
    , required = function (eventsArrayIn, callback, scopeIn, multiple) {
        'use strict';

        var that = this
            , scope = scopeIn || {}
            , eventArray = eventsArrayIn
            , eventData = []
            , updateData = []
            , called = false
            , listen = tools.getListener(that, multiple)//use once if available, one, if available, and lastly on if available.
            , silence = that.off || that.removeListener
            , isOn = (listen === that.on) || (listen === that.addListener) //are we using .on/.addListener?

            , clear = function () {
                //this function silences listeners once they are not needed anymore
                eventArray.forEach(function (event) {
                    silence.apply(that,[event, updateData[eventArray.indexOf(event)]]);
                });

                eventData = [];
            }

            , updateState = function (eventName) {
                // this function handles updating the whether or not an event has been triggered
                //  it returns a function that holds onto the eventName in closure scope
                var index = eventArray.indexOf(eventName);

                return function (data) {
                    if(typeof data === 'undefined'){
                        data = true;
                    }
                    
                    eventData[index] = data; //update the data array
                    stateCheck(); //check to see if all the events have triggered
                };
            }

            , stateCheck = function () {
                //the state check function... it checks to see if all the events have triggered
                var ready = eventArray.every(function (event) {
                    return (typeof eventData[eventArray.indexOf(event)] !== 'undefined');
                });

                if(ready && !called){ //have all events triggered? and has the callback been called before?
                    //yep... apply the callback
                    callback.apply(scope, [eventData]);

                    //if we aren't dealing with a set of events we want to trigger multiple times then
                    //  mark called true so we don't call the callback mulitple times
                    if(!multiple){
                        called = true;

                        if(isOn){ //if we used .on to bind then unbind the listeners we created
                            clear();
                        }
                    }
                }
            }

            , addState = function () {
                var events = tools.flatten([].slice.call(arguments));

                events.forEach(function (event) {
                    var index = eventArray.indexOf(event);

                    if(index === -1){
                        eventArray.push(event);
                        index = eventArray.length - 1;
                    }

                    updateData[index] = updateState(event);
                    listen.apply(that, [event, updateData[index]]);
                });
            };

        //setup the listeners for each event
        eventArray.forEach(function (event) {
            addState(event);
        });

        //returns a function that clears the event listeners
        return {cancel: clear, add: addState, events: eventArray, status: eventData};
    };

module.exports = required;
