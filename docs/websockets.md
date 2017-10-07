# Using Web Sockets with monument

Web Sockets are awesome and generally pretty straightforward. `monument` does have some opinions about how to handle them and the settings allow for quite a bit of flexibility when it comes down to it so let's take a deep dive into working with them. If you aren't familiar with how web sockets work the [HTML5 rocks article](http://www.html5rocks.com/en/tutorials/websockets/basics/) is a good place to start. 

Web Sockets allow a low latency, low overhead two-way connection between youe client and server. It dramatically reduces the overhead of normal connections, by staying open and by not involving the transmission of headers with every piece of data. They are pretty fantastic.

The idea of events or messages in Web Sockets meshes very well with `monument`'s own concept of events so it seems like a natural fit here.

## settings

There are four possible settings for web socket config.
- `false` which turns off the web socket server
- `true` which turns it on with `data` and `passthrough` style handling enabled
- `data` which turns on the server but only for `data` style handling
- `passthrough` which turn on the server but only for `passthrough` style handling

Any other value passed to the `config.webSocket` will be treated as `true` turning on the server for both handlings. The default setting is `false`.

## message structure

This is the main opinion that `monument` enforces. For your message to go anywhere once it hits the server you will need to give it a little bit of meta information and structure. Web Sockets is just a pipeline so it doesn't really care about what you pass through it other then that it is text.

```
{
    event: 'some-event-name'
}
```

The `event` key is the only required portion of the object. There are a few more details to this discussed below in the detail sections for the two different styles of events managed by the system.

The integration falls into two categories:

## data style events

data style events follow a pattern of emitting an event like `data:get:this-item` and listening to a response on `data:set:this-item`. It's how the data objects laid down by the CLI work. If the websocket server recieves an event like this (or any event with `:get:` in it) it automatically sets up a listener for the corresponding `:set:` event. This makes it very very easy to pass data back through the socket with essentially no intervention on your part. It handles the `socket.send` for you once the event has resolved.

This is the easiest and weakest form of integration with websockets. But it makes it pretty easy to start pushing data to the client with no extra work on your part.

## passthrough events

For more control or more complex situations the `passthrough` system lets you recieve events from the client and then respond to them as you wish to. Meaning it doesn't send any response to the client, it does however recieve a reference to the `socket` so that you can handle that in your applications code.

The payload of the event that is emitted by the `passthrough` method looks like this:
```
{
    message: {} // The payload sent by the client including the event as shown above
    , socket: {} // The socket that is being used to communicate with the client
}
```

As an example, let's say that you recieve:
```
{
    event: 'authorize:user'
    , credentialsObj: {
        token: 'abcd'
    }
}
```

The web socket server will then emit `authorize:user` passing it: 
```
{
    message: {
        event: 'authorize:user'
        , credentialsObj: {
            token: 'abcd'
        }
    }
    , socket: {} //imagine this is a socket... to big to throw in here
}
```

So your authorization code would listen to `authrize:user` and determine that it was dealing with a web socket request by looking at the payload for a `socket` variable. Your code would then need to diverge just a hair in how it responds to this from the normal http side which would probably respond to the event by appending a hash of the users credentialsObj. For the web socket code you would just respond to the socket. This would look something like this:

```
events.on('authorize:user', (payload) => {
    const credentialsObj = payload.socket ? payload.message.credentialsObj : payload;

    if (payload.socket) {
        socket.send(JSON.stringify(auth.check(credentialsObj)));
    } else {
        events.emit('authorize:user:' + hash(credentialsObj), auth.check(credentialsObj));
    }
});
```

This is not meant to be example authorization code. Just makes for a useful example. The event listener responds either by emitting an event on the internal event system or by responding directly to the socket if it is present.

## Example Server and Client code for `data`

If you are using the `data` setting then you can set up your data stores like this:

```
'use strict';

const events = require('monument').events
    , fetchingStore = {}
    , cache = require('node-cached');

events.on('data:get:person', () => {
    const cached = cache.get('data.person');

    if (cached === null && !fetchingStore['data.person']) {
        // get data from async source faked here by process.nextTick
        fetchingStore['data.person'] = true;

        process.nextTick(() => {
            const result = {
                some: 'data in here'
            };

            fetchingStore['data.person'] = false;
            events.emit('data:set:person', result);
            cache.add('data.person', result, 300000);
        });
    } else if (cached !== null) {
        events.emit('data:set:person', cached);
    }
});
```

Then your client can do this:

```
const ws = new WebSocket('ws://localhost:4000');

ws.onmessage = (msg) => {console.log(msg)};
ws.send(JSON.stringify({event: 'data:get:person'}))
```

and you will get something that looks like this:

```
{
    bubbles: false
    , cancelBubble: false
    , cancelable: false
    , currentTarget: WebSocket
    , data: "{"event":"data:set:person","data":{"some":"data in here"}}"
    , defaultPrevented: false
    , eventPhase: 0
    , isTrusted: true
    , isTrusted: true
    , lastEventId: ""
    , origin: "ws://localhost:4000"
    , path: Array[0]
    , ports: null
    , returnValue: true
    , source: null
    , srcElement: WebSocket
    , target: WebSocket
    , timeStamp: 1457581373172
    , type: "message"
}
```

The important bit being the `data` part. It is a JSON string of the data returned by the `data:set:person` event.

## Example Server and Client for `passthrough`

First off the Server side component that handles the inbound data:

```
'use strict';

const events = require('monument').events
    , store = {};

events.on('analytics:new', (data) => {
    const analyticsEvent = data.message.data;

    if (typeof store[analyticsEvent.type] === 'undefined') {
        store[analyticsEvent.type] = [ analyticsEvent ];
    } else {
        store[analyticsEvent.type].push(analyticsEvent);
    }

    console.log(store);
});
```

Ok, let's be clear. This is a super contrived and simplified example. Here is the client call:

```
const ws = new WebSocket('ws://localhost:4000');

ws.send(JSON.stringify({event: 'analytics:new', data: { type: 'click'}}))
```

So the server on receiving the web socket message passes it off to the data handler, which is above, by emitting the `analytics:new` event with the entire socket message as its contents. So to get at the data we extract it from the `data.message` variable. `data.message` is equal to the value passed into `ws.send` on the client.

The `passthrough` system does not return any events or data to the client, unless you do it explicitly.

## Example Client and Server for `true`

Punting on this one. It is literally a combination of the `data` and `passthrough` versions. If the event has the `data:set:SOMETHING` structure it is handled as a data event. If it isn't then it is handled like the `passthrough` style.

## parting thoughts

If your web socket message does not contain an event (see above structure) then it will be ignored and not passed on. 
