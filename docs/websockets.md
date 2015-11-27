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

This is the main opinion that monumen enforces. For your message to go anywhere once it hits the server you will need to give it a little bit of meta information and structure. Web Sockets is just a pipeline so it doesn't really care about what you pass through it other then that it is text.

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

As an example, let's say that you have recieve:
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

## parting thoughts

If your web socket message does not contain an event (see above structure) then it will be ignored and not passed on. 
