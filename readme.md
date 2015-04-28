# monument

`monument` is a super light event routed isomorphic nodejs framework.

[![NPM](https://nodei.co/npm/monument.png)](https://nodei.co/npm/monument.png?downloadRank=true&stars=true)

![build status](https://codeship.com/projects/881ed090-9c54-0132-655c-263ab955f60c/status?branch=master) [![david-dm](https://david-dm.org/ansble/monument.svg)](https://david-dm.org/ansble/monument)

[![Coverage Status](https://coveralls.io/repos/ansble/monument/badge.svg?branch=feature%2Fcode-coverage)](https://coveralls.io/r/ansble/monument?branch=feature%2Fcode-coverage)

## Changes in 1.5.0

`parser` The `monument.parser` function now returns `null` if an error occurs during parsing. If you would like to see the error you can subscribe to the `error:parse` event which recieves the contents of the error or grab the optional second param `err` which only exists when an error has occured. The recommended action at this point is to return an error to the user, terminating the connection with a `connection.req.end`. One way to achieve this would be by `events.emit('error:500', {message: 'The data you sent wasn't properly formatted', connection: connection});`

Updated to latest version (0.3.5) of [event-state](https://github.com/ansble/event-state) which fixed some bugs in its implementation.

Expanded test suite... (yay!)

We also added compression for non-static resources. It is turned on and off with the same compression flag as static file compression.

Added max-age and other cache headers in addition to etags to make PageSpeed and ySlow happy. Works very nicely.

Complete rework of the startup system. Modularized and will be pluggable in the future. Right now it handles the cleanup of static files, which makes development a lot nicer. It also Compiles the dot.js templates and gets them ready for use. The last thing that it does is include the etag system for handling etag creation. Basically all the same startup tasks just handled in a modular way.

HEAD requests are now supported correctly for static resources. If you want to use HEAD requests in your applications then you can handle them very easily from the routes.json.

That's the majority of the changes for 1.5.0!


## New in 1.4.0
This was essentially a patch that turned into a minor release. We found some issues with using the builtin node event system that seemed to be revving up memory usage like crazy and so we rewrote the whole event system to use a custom one. The API is identical to 1.3.0 but the 99% rewrite of a core module felt more like a minor release then a patch release. So the new for this release is pretty much transparent, but it is lower overhead for your application.

Also updated all dependencies to latest.

## New in 1.3.0!

### etags
Hash based etags are now available by default. You can turn them off by adding `'etags': false` to your config object (passed into `monument.server`).

They are generated and used for all static files, and all responses that use `res.send`. One of the cooler things we did was have monumen cache the etags for static assets. That means they get created the first time they are requested after the server starts up, and for all subsequent requests the etag is pulled from an in memory cache so that the file i/o is only done if there is a reason to stream the file to the client. Makes them fast and light!

### `.send()`
One of the things that I heard from several users was the lack of response.send was confusing for them. So we added it! It also allows etags and automatically handles strings or objects correctly. Basically it is a nice layer of sugar around res.end and res.setHeaders that correctly handles mimetype and serializing the data if needed.

Should make developing in monumet just a little easier.

### required events (state machine)
We pulled in [event-state](http://github.com/ansble/event-state) to provide a simple way to do something after multiple events have been fired. Its syntax is very simliar to `Promise.all` and it takes an array of events to listen for.

```
  emitter.required(['event-1', 'event-2', 'event-3'], function (dataArray) {
    //do something here when all three events have triggered
  });
```

### compression for static files
Deflate and gzip compression of static files is handled according to the accepts header from the client. We do it in a pretty slick way that writes out the compressed file to the file system at first request, reducing the computing required for serving them on subsequent requests as compressed files. Compression for non-static files is scheduled for the next release (1.4).

You can turn compression on or off in the config object described below.

## How To Get Started

### Config object and the server

When you create your server it takes a config object that allows you to pass in some options for your particular environment. It looks like this and these are the default values:

```
{
  port: 3000 // the port for the server to run on
  , compress: true // turns on or off compression for static files (deflate/gzip)
  , routePath: './routes' // the folder your routes live in
  , templatePath: './templates' // the folder where your templates live
  , dotjs: {
    //dotjs defaults
    // see [doT.js documentation](https://olado.github.io/doT/index.html) for available options.
  }
  , publicPath: './public' // the folder where your static files live
  , maxAge: 31536000 // time to cache static files client side in milliseconds
  , etags: true // turns on or off etag generation and headers
}
```

All the values are optional. It is used like this to create a server (heroku example of port):

```
var monument = require('monument');

monument.server({
        routePath: './routes'
        , templatePath: './templates'
        , publicPath: './public'
        , port: process.env.PORT || 3000
      });
```

### Setting up routes

The easy way to do this is with the [monument-cli](https://github.com/ansble/monument-cli)and `yo monument-cli:routes` command. It takes your `routes.json` file and stubbs out all the route handlers and files for you.

Whichever way you decide to do it the first step is to add your route to the `routes.json` file. It looks like this:

```
{
  "/": ["get"],
  "/sign-up": ["get", "post"],
  "/member/:username": ["get"]
}
```

So you have a key (the route) and then an array of allowed verbs for that route. This means that a request to a disallowed verb will not be handled. It returns a 404 just like a request to a route path does.

You are allowed to specify routes with params in them as demonstrated by the `/member/:username` route above. This means that when someone requests that route with something like `/member/designfrontier` there will be a variable named `username` included in the variable req.params (req.params.username will equal 'designfrontier' in this example). You can use that variable in the event handler for the route. Oh yeah, that will be handled by the 'route:/member/:username:get' event. Hopefully that makes sense.

The structure of a route event is: 'route:/path/to/resource:http-verb'. So if you want to listen to those events for something, route handling, logging, jumping jack counter, whatever you just listen to the exposed emitter and you are good to go.

The route events recieve an object right now, often called connection, that looks like this

```
{
  res: response,
  req: request,
  params: the url parameters as an object,
  query: the queryparams as an object
}
```

these are the request and response objects from node. The other thing of interest are the other parts of the connection object, the params, and query objects. `params` contains the key/value pairs from the url params laid out with `:name` notation in the path. Lastly you get the `query` object which is the key/value pairs found in any queryparams on the path.

#### put, post, update and parsing out body

At some point you are going to need to deal with body data from a form or ajax request. This is one of the areas where monument diverges from the mainstream you may be used to in server side js. We expose a parser function that you use like this in the event handler for the route you want:

```
var parser = require('monument').parser;

events.on('route:/join:post', function (connection) {
  //parse out the request body
  parser(connection, function (err, body) {
    console.log(err, body);
    connection.res.end('route /join now responding to post requests');
  });
});
```

`body` is the parsed body of the request and is passed into the callback function.

### Data and Events

More to come... but think about the idea of resource pooling and individual data modules that front DSLs.

### Static Assetts

Static assetts live in `/public` and can be organized in whatever way you see fit. All folders within public become routes on root. So, `/public/compnents` answers to requests on `/components` when the server is running. These static routes take precedent over evented routes and essentially prevent non-static route handling from happening on them.

You can interact with these routes through events to a certain degree. They raise a `static:served` with a payload of the file url that was served, when the file exists. If the file does not exist they raise a `static:missing` with the file url as payload. This will let you log and handle these conditions as needed.

## Contributing
Contributing is simple :-)

Feel free to edit away, just make sure that everything still passes its tests `npm test` and add new tests in `*_test.js` files. (For a file named merckx.js you would create a merckx_test.js file that contains the tests.) Once you have done that then open a pull request and we'll get it pulled in.

When we do the next release your name will be added to the AUTHORS file... you know, because you're an author now.
