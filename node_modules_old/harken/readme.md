# Harken!

[![Greenkeeper badge](https://badges.greenkeeper.io/ansble/harken.svg)](https://greenkeeper.io/)
Harken is a drop in replacement for the built in eventemitter in nodejs/iojs with a few extre nice pieces. It also works in clients because it is pretty much just simple javascript. So now you can take the node event goodness and have it everywhere.

[ ![Codeship Status for ansble/harken](https://codeship.com/projects/f07390c0-352f-0133-3b06-06da35d24f74/status?branch=master)](https://codeship.com/projects/100700)
## API

This is how you use this thing.

### .on / .addListener
The most basic usage looks like this:
```
    harken.on('some-event', function () {
        //do something
    });

    harken.addListener('some-event', function () {
        //do something
    });
```
Pass in an event to listen for, and a function to execute when the event happens. Simple.

>`.on` and `.addListener` are the same function so from here on out we'll just be using `.on` in the examples. But know that you can change the name of the function to `.addListener` and it will work exactly the same.

A `.on` allows you to pass it the following options either as positionals or as an object hash:
```
    harken.on(eventName, handler, scope, once);

    harkent.on({
        eventName: 'event'
        , handler: function () {}
        , scope: {}
        , once: true
    });
```
##### Required parameters
eventName is the event that you want to listen for.
handler is the function to be executed, it recieves the payload of the event.

##### Optional parameters
scope is the scope applied to the execution of the function. Can be useful at times and is optional
once is a boolean that indicates if the listener should be un-bound after it has been called.

### .off / .removeListener
The most basic usage looks like this:
```
    harken.off('some-event', function () {
        //do something
    });

    harken.removeListener('some-event', function () {
        //do something
    });
```
Pass in an event to stop listening too, and the function that you want to stop triggering.

>`.off` and `.removeListener` are the same function so from here on out we'll just be using `.off` in the examples. But know that you can change the name of the function to `.removeListener` and it will work exactly the same.

A `.off` allows you to pass it the following options either as positionals or as an object hash:
```
    harken.off(eventName, handler, scope, once);

    harkent.off({
        eventName: 'event'
        , handler: function () {}
        , scope: {}
        , once: true
    });
```
##### Required parameters
eventName is the event that you want to stop listening to.

##### Optional parameters
handler is the function that was executing.
scope is the scope applied to the execution of the function.
once is a boolean that indicates if the listener should be un-bound after it has been called.

`.off` looks for an exact combination of the parameters passed into it. This allows for either precise unbinding of listeners, or a more heavy-handed approach that turns off all the listeners for a given event. It's all up to you and how you use it.

### .emit
```
    harken.emit('some-event', {payload: 'is cool and awesome'});
```

Emit triggers the listeners for a given event and can accept an optional payload. The payload can be any valid javascript value, so objects, strings, arrays, you name it.

### .cleanup
```
    harken.cleanup();
```

`.cleanup` removes any old listeners that are hanging around for no good reason. It executes `.off` on any listener in the store that is over 120000ms old. It's arbitrary... but this will be an area of improvement going forward.

### .listeners
```
    var listenersArray = harken.listeners('some-event');
```
Returns all of the listeners for a given event.

### .once
This is a convenience function for creating one-time-use event listeners. Any listener created with it will be unbound after executing.
```
    harken.once('some-event', function () {
        //do something
    });
```
Pass in an event to listen for, and a function to execute when the event happens.

A `.once` allows you to pass it the following options either as positionals or as an object hash:
```
    harken.once(eventName, handler, scope);

    harkent.once({
        eventName: 'event'
        , handler: function () {}
        , scope: {}
    });
```
### .removeAllListeners
```
    harken.removeAllListeners('some-event');
```

This is a convenience function for `harken.off('some-event')` which is already pretty convenient. It removes all the listeners for a given event.

### .required
```
    harken.required(['event-1', 'event-2', 'event-3'], function (dataArray) {
    //do something here when all three events have triggered
  });
```
Harken uses [event-state](https://www.npmjs.com/package/event-state) to provide stateful eventing. Above is a simple example but you probably want to read the documentation on `event-state` if you are going to use this extensively. It's API is pretty simple.
