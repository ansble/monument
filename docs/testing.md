# A brief guide to testing monument apps

Testing is important. Super important. It is the foundation on which all lifecycle and deploy automation is grounded. If you aren't testing please start! It will help you be better at what you do, and your customers will end up with a more stable experience. </rant>

This guide will get you up and running with unit tests in `monument`. This is one of several types of tests that you will want to conduct on your code. As such it is the simplest and the most focused on the individual pieces of code in isolation. So let's get started.

## Getting Started

If you are using the [CLI](https://www.npmjs.com/package/monument-cli) all of this is very very simple. Everytime it lays down new files (routes, data, project) it lays down working tests for you! They are stub tests essentially but they show you how to test the code it generated for you.

All the examples that will follow here willl be using [ava](https://github.com/avajs/ava). So if you are doing this by hand without the CLI then the first thing to do is `npm install --save-dev ava`.

## Testing routes

Routes define your applications outward facing API so it is important to make sure that your route handlers are doing what they are supposed to. And to lock down that API so that you will know if you break it.

So what does it look like?

```js
'use strict';

const test = require('ava')
    , events = require('monument').events
    , fakeConnection = require('../test_stubs/connectionStub')

    , response = '<!doctype html><html lang="en"> <head> </head> <body> <h1>Welcome to monument</h1> <p>"It never gets easier, you just go faster" - Greg Lemond</p> <p> You are on version 1.0.0 of your project</p> </body></html>';

// initialize the code to be tested
require('./main');

test.beforeEach(() => {
    fakeConnection.reset();
});

test.cb('should respond to route:/:get', (t) => {
    events.emit('route:/:get', fakeConnection);

    process.nextTick(() => {
        t.is(fakeConnection.out().response, response);
        t.end();
    });
});
```

Okay, let's take a closer look at what is going on.

```js
'use strict';

const test = require('ava')
    , events = require('monument').events
    , fakeConnection = require('../test_stubs/connectionStub')

    , response = '<!doctype html><html lang="en"> <head> </head> <body> <h1>Welcome to monument</h1> <p>"It never gets easier, you just go faster" - Greg Lemond</p> <p> You are on version 1.0.0 of your project</p> </body></html>';

// initialize the code to be tested
require('./main');
```

One interesting thing here is that you include the route file to be tested without assigning it a variable (Last line). Because of the way that monument works through events you don't need direct access to modules API.

The other is the fakeConnection object. This contains a bunch of stubs for testing routes. If you didn't use the CLI then you will want to grab this for your testing from the [CLI project](https://github.com/ansble/monument-cli/blob/master/templates/base/test_stubs/connectionStub.js). It will be very useful going forward.

The more interesting stuff is the actual test:

```js
test.beforeEach(() => {
    fakeConnection.reset();
});

test.cb('should respond to route:/:get', (t) => {
    events.emit('route:/:get', fakeConnection);

    process.nextTick(() => {
        t.is(fakeConnection.out().response, response);
        t.end();
    });
});
```

When you create a project with the CLI you get a set of test stubs for faking connection objects. This allows you to see what they are doing. Before each test run we need to flush the fake connection with `fakeConnection.reset()`. Then for the `route:/:get` test we simply emit the route event and pass it the fakeConnection. 

We can do this because our route handler looks like this:
```js
events.on('route:/:get', (connection) => {
    connection.res.send(mainTemplate({ version: pkg.version }));
});
```
So it is listening for the route event and expecting a connection to perform operations on. Super simple. With the test it responds to the event, and performs operations on the `fakeConnection` because that is what is passed to it.

Then we check to make sure that the response matches what we are expecting and we know that the route is working as advertised.

This gets a bit more complicated when we start dealing with data, but not that much more complicated because of the event system at the core of `monument` that makes it very very simple to stub data when needed.

## Testing Data modules
This is going to feel very familiar if you read the section on testing routes. The process is essentially the same.

The basic pattern here is: 1) listen for the event that the data module will respond with 2) emit the event that the data module listens too 3) check to see that the value you receive is what you expected.

In a simple module this looks like:
```js
'use strict';

const test = require('ava')
    , events = require('monument').events;

require('./new.js');

test.cb('should respond to data:get:new', (t) => {
    events.once('data:set:new', (data) => {
        t.is(typeof data, 'object');
        t.end();
    });

    events.emit('data:get:new');
});
```

The top part should look familiar, though we aren't using the fakeConnection here because data models are not concerned with the connection.

We setup the test with `events.once` so that it will receive the response of the data module, and then emit the data event that our module is listening too.

Once we receive our response we check to see that it is the correct data and then call `t.end()` letting ava know that the test has completed.

The one thing that gets tricky here is that you may need to insert stubs or initial data into your module so that it doesn't make database/network calls. How you do this is largely up to you. You could export a function for recieving stub data from your data module for instance. We are working to find a consistent way to make this easy, and will have more information once we nail it down.

## Routes that need Data or other things listening for multiple events

Everything is basically the same as with the routes we talked about above. The only difference is that you need to make sure that you emit the correct events and their data. Otherwise nothing will happen.

As an example this route:

```js
events.on('route:/:get', (connection) => {
    events.required(['data:myModel', 'data:myOtherModel', 'data:pkg'], (results) => {
        const pkg = results[2];

        connection.res.send(mainTemplate({ version: pkg.version }));
    })
});
```

I have no idea why it cares about `data:myModel` and `data:myOtherModel` but it does. It does definitely care about and use `data:pkg`.

So in our test we need to do this:

```js
test.beforeEach(() => {
    fakeConnection.reset();
});

test.cb('should respond to route:/:get', (t) => {
    const fakePkg = {version: '1.0.0'};

    events.emit('route:/:get', fakeConnection);
    events.emit('data:myModel');
    events.emit('data:myOtherModel');
    events.emit('data:pkg', fakePkg);

    process.nextTick(() => {
      t.is(fakeConnection.out().response, response);
      t.true(fakeConnection.out().response.includes(fakePkg.version));
      t.end();
    })
});
```

We emit all of the events it is looking for, stubbing the ones that need to be stubbed, and then check to see that the result is what it should be. 

That wasn't too hard, was it?
