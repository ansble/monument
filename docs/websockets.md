# Using Web Sockets with monument

Web Sockets are awesome and generally pretty straight-forward. `monument` does have some opinions about how to handle them, and the settings allow for quite a bit of flexibility when it comes down to it, so let's take a deep dive into working with them. If you aren't familiar with how Web Sockets work [this HTML5 Rocks article](http://www.html5rocks.com/en/tutorials/websockets/basics/) is a good place to start. 

Web Sockets allow a low latency, low overhead, two-way connection between the client and the server. It dramatically reduces the overhead of normal connections by staying open and by not involving the transmission of headers with every piece of data. They are pretty fantastic.

The idea of events or messages in Web Sockets meshes very well with `monument`'s own concept of events so it seems like a natural fit here.

## Settings

There are four possible settings for Web Socket config:
- `false` - Boolean: This turns off the Web Socket server
- `true` - Boolean: This turns on the Web Socket server with `data` and `passthrough` style handling enabled
- `data` - String: This turns on the Web Socket server, but only for `data` style handling
- `passthrough` - String: This turns on the Web Socket server, but only for `passthrough` style handling

Any other value passed to `config.webSocket` that can be evaluated as `true` turns on the server for both handlings. The default setting is `false`.

## Message Structure

This is the main opinion that monument enforces. For your message to go anywhere once it hits the server you will need to give it a little bit of meta information and structure. A Web Socket is just a pipeline so it doesn't really care about what you pass through it other then that it is text.

Here's an example of opening a Web Socket connection and sending a message:

```js
// client-side script

var socket = new WebSocket("ws://localhost:3000");

socket.onopen = function() {
  var authData = {
    event: "test:event",
    credentialsObj: {
      token: 'abcd'
    }
  };

  socket.send( JSON.stringify(authData) );
};
```

The `event` key/property is the only required portion of the object. There are a few more details to this discussed below for the two different styles of events managed by the system.

The integration falls into two categories:

## Data Style Events

Data Style Events follow a pattern of emitting an event like `data:get:this-item` and listening to a response on `data:set:this-item`. It's how the data objects laid down by the CLI work. If the Web Socket server receives an event like this (or any event with `:get:` in it) it automatically sets up a listener for the corresponding `:set:` event. This makes it very, very easy to pass data back through the socket with essentially no intervention on your part; It handles the `socket.send` for you once the event has been resolved.

This is the easiest and weakest form of integration with Web Sockets, but it makes it pretty easy to start pushing data to the client with no extra work on your part.

## Passthrough Events

For more control or more complex situations the `passthrough` system lets you receive events from the client and then respond to them as you wish to. This means it doesn't send any response to the client, however it does receive a reference to the `socket` so that you can handle it in your application's code.

The payload of the event that is emitted by the `passthrough` method looks like this:
```
{
  message: {} // The payload sent by the client including the event as shown above
  , socket: {} // The socket that is being used to communicate with the client
}
```

As an example, let's say that you have receive:
```json
{
  event: 'authorize:user'
  , credentialsObj: {
      token: 'abcd'
  }
}
```

The Web Socket server will then emit `authorize:user` passing it: 
```json
{
  message: {
    event: 'authorize:user'
    , credentialsObj: {
        token: 'abcd'
    }
  }
  , socket: {} //imagine this is a socket... too big to throw in here
}
```

So your authorization code would listen to `authrize:user` and determine that it was dealing with a Web Socket request by looking at the payload for a `socket` variable. Your code would then need to diverge just a hair in how it responds to this from the normal HTTP side, which would probably respond to the event by appending a hash of the users credentialsObj. For the Web Socket code you would just respond to the socket. This would look something like this:

```js
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

## Parting Thoughts

If your Web Socket message does not contain an event (see above structure) then it will be ignored and not passed on. 
