# Writing Route Handlers in `monument`

This document will walk you through writing route handlers and includes a variety of examples of common tasks to help you get started. Enjoy!

## The `connection` object and what it contains

The basic route handler created by the CLI looks essentially like this:

```js
events.on('route:/api/v1/team/:teamid:get', (connection) => {
    connection.res.send('hello team');
});
```

which means that the route handler you write recieves a single paramter called `connection`. When you look inside it `connection` looks like this:

```js
{
  res: response, // node response object with a few convenience functions
  req: request, // node request object
  params: {}, // the url parameters as an object,
  query: {} // the queryparams as an object
}
```
 So looking at our above route handler the exact connection object you would recieve would be:

 ```js
{
  res: response,
  req: request,
  params: {
    teamid: 'some-value'
  },
  query: {}
}
```

unless there were some query params involved in the request.

## The response conveniece functions

`connection.res` has a few convenience functions that make writing your application a little bit easier. For the most part it is a vanilla [`IncomingMessage`](https://nodejs.org/api/http.html#http_class_http_incomingmessage).

### `.setStatus`

`.setStatus` does what it sounds like it does. It is chainable and can set the status headers (status, statusMessage) from either the numerical status code or from the statusMessage. So you can do:

```js
connection.res.setStatus(404);
connection.res.end('No item there');

// or

connectoin.res.setStatus('Not Found').end('No item there');

// or

connection.res.setStatus(304).end();
```

This was added in the 2.5.0(Vattenfall) release of monument.

### `.send`

One of the things that I heard from several users was the lack of response.send was confusing for them. So we added it! It also allows etags and automatically handles strings or objects correctly. Basically it is a nice layer of sugar around res.end and res.setHeaders that correctly handles mimetype and serializing the data if needed.

### `.redirect`

Often we need to redirect to a new route when a request comes in. The easiest way to do this is with `.redirect`.

Simply pass the route you want to redirect visits to and you are good to go.

```js
// if this is the root route it will redirect to: site.com/some-other-page/1
connection.res.redirect('some-other-page/1');
```
