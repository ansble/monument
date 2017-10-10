# event-state

A state machine for events.

![codeship](https://codeship.com/projects/73c90930-9c53-0132-6219-263ab955f60c/status?branch=master
)

![stats](https://nodei.co/npm/event-state.png?downloadRank=true&stars=true)


## API

```
var Emitter = require('events').EventEmitter, //Any event emitter will do.
    emitter = new Emitter(),
	state;

// Event State extends your chosen event emitter.
emitter.required = require('event-state');

// `required` returns a state object with `add` and `clear` methods.
state = emitter.required(['event-one', 'event-two'], function (dataArray) {
	//this function will be executed when all of the
	//	required events are triggered.
}, scope);

// The `add` method will dynamically add events to your event state machine.
// Multiple events can be added either as an arguments list or an array of events.
state.add('event-three');
state.add('event-three', 'event-four');
state.add(['event-five', 'event-six']);

// `cancel` will remove all events from your state machine.
state.cancel();
```

Very simple and concise. Collects a list of events, and when all the events have been triggered it executes the callback passing it an array containing the data received by each event in the order in which they were added.

`dataArray` is in the order in which the events are declared in the required events array and the order in which they were added via the `add` method.

`scope` is the scope that will be applied to the callback function.

`required` needs to be attached to an event emitter that has an `on`, `one` or `once` function that listens to events. It uses one of them (once > one > on) to do it's listening. `on` is less then ideal and most likely will cause a memory leak of some sort.

`required` returns an object with `add` and `cancel` methods.

The `add` method dynamically adds events to the state machine. The required callback will only fire once the event-state machine has "heard" all events registered with it.

The `cancel` method will immediately clear the event-state machine of all events.

### Returns
`state` above is an object that contains a `cancel` and `add` function respectively.

`state.add(event-name-in)` adds that event or events to your required state. This is handy for lots of stuff... ok like one thing: building file structure into an object.

`state.cancel()` let's you cancel the entire thing. That way if you are waiting on event-a, event-b and event-x but want to bail on the operation if event-x and event-y are triggered then you just call state.cancel() and are done with it.
