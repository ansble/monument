# monument

`monument` is a super light event routed nodejs framework.

[![NPM](https://nodei.co/npm/monument.png?downloadRank=true&stars=true)](https://nodei.co/npm/monument/)

[![npm version](https://img.shields.io/npm/v/monument.svg?style=flat-square)](https://www.npmjs.com/package/monument)
[![downloads](https://img.shields.io/npm/dm/monument.svg?style=flat-square)](http://npm-stat.com/charts.html?package=monument&from=2016-08-01)
![build status](https://travis-ci.org/ansble/monument.svg?branch=master) 
[![David](https://img.shields.io/david/ansble/monument.svg?style=flat-square)](https://david-dm.org/ansble/monument)
[![Coveralls branch](https://img.shields.io/coveralls/ansble/monument/master.svg?style=flat-square)](https://coveralls.io/r/ansble/monument?branch=master)
[![Code Climate](https://img.shields.io/codeclimate/github/ansble/monument.svg?style=flat-square)](https://codeclimate.com/github/ansble/monument)
[![Gitter](https://img.shields.io/gitter/room/nwjs/nw.js.svg?style=flat-square)](https://gitter.im/ansble/monument)
[![Issue Stats](http://issuestats.com/github/ansble/monument/badge/pr?style=flat-square)](http://issuestats.com/github/ansble/monument)
[![Issue Stats](http://issuestats.com/github/ansble/monument/badge/issue?style=flat-square)](http://issuestats.com/github/ansble/monument)
[![Known Vulnerabilities](https://snyk.io/test/npm/monument/badge.svg)](https://snyk.io/test/npm/monument)
[![Greenkeeper badge](https://badges.greenkeeper.io/ansble/monument.svg)](https://greenkeeper.io/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Code of Conduct](https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat-square)](https://github.com/ansble/monument/blob/master/CODE_OF_CONDUCT.md)

## Table of Contents
- [How to Get Started](#how-to-get-started)
- [Config Object and the Server](#config-object-and-the-server)
- [Data and Events](#data-and-events)
- [Security Configuration](#security-configuration)
- [Template Language](#template-language)
- [Route Documentation](docs/routes.md)
- [Testing Documentation](docs/testing.md)
- [Using Web Sockets with monument](docs/websockets.md)
- [HTTP2 and SPDY with monument](docs/http2-server.md)
- [Writing Route Handlers](docs/writing-route-handlers.md)
- [Contributing](contributing.md)
- [Sites Using Monument](docs/Monument-in-action.md)

## How to Get Started

The easiest way to get started with monument is to use the CLI tool which does project lay down. `npm install -g monument-cli` From there a simple `monument new <path to project>` will get you up and running with stubbed tests, basic error handlers and an index route and everything you need to knock out an application fast.

![getting started with monument gif](http://g.recordit.co/EwbTO7xDgy.gif) 
or the [slightly longer video version](http://recordit.co/EwbTO7xDgy)

It is also the easiest way to add routes and data handlers!

## Config Object and the Server

When you create your server it takes a config object that allows you to pass in some options for your particular environment. It looks like this and these are the default values:

```js
{
    port: 3000 // the port for the server to run on
    , compress: true // turns on or off compression (deflate/gzip/br)
    , routePath: './routes' // the folder your routes live in
    , publicPath: './public' // the folder where your static files live
    , maxAge: 31536000 // time to cache static files client side in milliseconds
    , etags: true // turns on or off etag generation and headers
    , webSockets: false // default setting disables websockets. can be (false, true, 'passthrough', 'data')


    , log: { // configurable logger with the same bunyan/pino API
        debug: (payload) => {
            console.log(payload);
        }
        , info: (payload) => {
            console.info(payload);
        }
        , warn: (payload) => {
            console.warn(payload);
        }
        , error: (payload) => {
            console.error(payload);
        }
        , trace: () => {}
    }
    
    //the security object is brand new in this release
    , security: {
        xssProtection: true //default, can be set to false to disable
        , poweredBy: 'bacon' //the default is blank can be any string
        , noSniff: true //default, can be set to false to disable
        , frameguard: {
            action: 'SAMEORIGIN' //the default allows iframes from same domain
            , domain: '' //defaults to not used. Only used for 'ALLOW-ORIGIN' 
        }
        , hsts: {
            maxAge: 86400 // defaults to 1 day in seconds. All times in seconds
            , includeSubDomains: true // optional. Defaults to true
            , preload: true // optional. Defaults to true
        }
        , noCache: false // defaults to off. This is the nuclear option for caching
        , publicKeyPin: { // default is off. This one is complicated read below...
            sha256s: ['keynumberone', 'keynumbertwo'] // an array of SHA-256 public key pins see below for how to obtain
            , maxAge: 100 // time in seconds for the pin to be in effect
            , includeSubdomains: false // whether or not to pin for sub domains as well defaults to false
            , reportUri: false // whether or not to report problems to a URL more details below. Defaults to false
            , reportOnly: false // if a reportURI is passed and this is set to true it reports and terminates connection
        }
        , contentSecurity: {
            defaultSrc: `'self'` // optional. This is the default setting and is very strict
        }
        , unsafeQuery: false // optional. This is the default setting and we recommend that you leave it alone :-)
    }

    , server: spdy //an http API compliant server module. See below for more info [optional]
    , serverOptions: { // The options object to be passed to the createServer function [optional]
        key: fs.readFileSync('./server.key')
        , cert: fs.readFileSync('./server.crt')
        , ca: fs.readFileSync(./ca.pem)
    }

    // options for hooking into the statsd internal to monument
    //  The sendXxx all default to false which means that if you want timers for your
    //  non 200 codes then you will need to turn on the range or ranges you would
    //  like to see. This is to reduce the chattiness to the statsd server and the
    //  noise in your stats to a more useful level.
    , statsd: {
        host: 'server-address'
        , port: 'port'
        , prefix: 'string prefix'
        , suffix: 'string suffix'
        , send3xx: false // this prevents sending timers for 3xx status codes
        , send4xx: false // this prevents sending timers for 4xx status codes
        , send5xx: false // this prevents sending timers for 5xx status codes
    }
}
```

All the values are optional. It is used like this to create a server (heroku example of port):

```js
var monument = require('monument');

monument.server({
        routePath: './routes'
        , templatePath: './templates'
        , publicPath: './public'
        , port: process.env.PORT || 3000
      });
```

If you need to get access to the server object listen to the `server:started` event.
For example do this:

```js
monument.events.once('server:started', (settings) => {
    // settings.server is the server object
    // there is also a settings.port and settings.version that
    //  are the port you are running on and the version of monument you are
    //  running.
    servers.push(settings.server);
});
```

### `monument`'s API

In addition to the server `monument` exposes the following:

```js
monument.uuid
```
a v4 UUID generator which return a UUID when called with no paramters

```js
monument.events
```
The event emitter/subscriber api for your app

```js
monument.parser
```
The body parser for dealing with forms


#### Route API

##### Adding new route with CLI:

```
npm install -g monument-cli
```

CLI tool used to create new project.

The file routes.json will look like this in a brand new project:

```js
{
  "/": ["get"]
}
```

#### Creating new routes in the routes.json file

The file routes.json will by default located in root of the file, but it's location is changeable.

Routes are defined as key value pairs where the key is the route and the value is an array of verbs that you want the route to respond to. For example a restful API for pro cycling teams might look like this:
```js
{
    "/api/v1/team": [ "get", "post" ],
    "/api/v1/team/:teamid": [ "get", "put", "delete" ],
    "/api/v1/team/:teamid/rider": [ "get", "post" ],
    "/api/v1/team/:teamid/rider/:riderid": [ "get", "put", "delete" ]
}
```

The structure of a route event is: 'route:/path/to/resource:http-verb'. The route events recieve an object right now, often called connection, that looks like this:

```js
{
  res: response,
  req: request,
  params: the url parameters as an object,
  query: the queryparams as an object,
  path: the pathParsed as an object
}
```
To learn more about what to expect in the pathParsed object. Read about Node's path.parse method [here](https://nodejs.org/api/path.html#path_path_parse_path)

#### Adding new routes

```js
routeStore.add('/this/is/a/test', 'get');
```

A simple route...

```js
routeStore.add('/rangers/:name', [ 'get', 'post', 'put', 'delete' ]);
```

A wildcard route...


#### Remove routes

```js
routeStore.remove('/this/is/a/test');
```

Remove all of a standard route

```js
routeStore.remove('/hobbits/:name');
```

Remove all of a wild card route

```js
routeStore.remove('/hobbits/:name', 'get');
```

Remove a single verb from a wild card route

```js
routeStore.remove('/hobbits/:name', [ 'post', 'delete' ]);
```

Remove multiple verbs from a wild card route

#### Parse

```js
routeStore.parse({'/this/is/a/route': ['get']})
```

#### Get the route objects

```js
routeStore.get()
```

Returns {wildcard: {}, standard: {}} with the standard and wildcard route objects populated

```js
routeStore.getWildcard()
```

Returns an object containing the wild card routes and their meta information

```js
routeStore.getStandard()
```

Returns an object containing the standard routes and their meta information

For more details, Have a look on /docs/routes.md file

### Etags
Hash based etags are now available by default. You can turn them off by adding `'etags': false` to your config object (passed into `monument.server`).

They are generated and used for all static files, and all responses that use `res.send`. One of the cooler things we did was have monumen cache the etags for static assets. That means they get created the first time they are requested after the server starts up, and for all subsequent requests the etag is pulled from an in memory cache so that the file i/o is only done if there is a reason to stream the file to the client. Makes them fast and light!

### Security Configuration

Ths server config opbject provides a security object inside it for you to specify what security options you would like to turn on at the server level. They are detailed in the example object above but below is more information on each of the options.

We have done our best to place an out-of-the-box monument server in a secure posture. For instance we autmatically enable HTTP Strict Transport Security headers, No Sniff headers, XSS Protection Headers (where it is secure to do so), Same origin Framegaurd headers, and a strict Content Security Poicy. All without you having to specify anything. We also shut down the powered by header out of the box because we care more about intruders getting information about your server then on seeing who is using monument.

The one thing we don't do is handle Public Key Pinning without configuration. But you can easily add that if you want!  Most of the settings in security turn headers on and off, and documentation around those headers can be found on [OWASP](https://www.owasp.org/index.php/List_of_useful_HTTP_headers) and in [helmet and its source code](https://www.npmjs.com/package/helmet). Much of the code here is inspired by and adapted from helmet.

#### Powered By
You can set this value to whatever you want it to look like your server is powered by. By default it is off and the server does not return the `X-Powered-By` header. This is more secure then specifying it so we receommend you leave this alone, but since you are an adult you are free to set a value here. Any string passed here will become the value of the `X-Powered-By` header.

#### XSS Protection
If set to false this turns off the X-XSS-Protection header for all browsers. This header is disabled in IE < 9 because it opens up vulnerabilities. In everything else it is enabled by default.

#### No Sniff
If set to false this turns off the X-Content-Type-Options header for all browsers. This header prevents browsers from trying to infer mime type when a file with a mime type is downloaded. This helps prevent download related vulnerabilities and the misinterpretation of file types.

#### Frameguard
Guard is a weird looking word. 
Not that we have that out of the way frameguard allows you to specify under what conditions your application may be wrapped in an `iframe`. Setting `action: 'DENY'` means that your site may never be wrapped in an `iframe`. The default is 'SAMEORIGIN' which allows wrapping of your site by essentially your app. The last allowed setting, `action: 'ALLOW-ORIGIN'`, requires that you pass a `domain` value as well. It allows the specified domain to wrap your application in an iframe. All the calculations for `SAMEORIGIN` and `ALLOW-ORIGIN` follow the CORS rules for determining origin. So `www.designfrontier.net` and `designfrontier.net` are different origins.

#### HSTS (HTTP Strict Transport Security)
This tells browsers to require HTTPS security if the connection started out as an HTTPS connection. It does not force the connection to switch, it just requires all subsequent requests by the page to use HTTPS if the page was requested with HTTPS. To disable it set `config.security.hsts` to `false`. It is set with a `maxAge` much like caching. The `maxAge` is set in seconds (not ms) and must be a positive number. 

The two optional settings: `includeSubDomains` and `preload` are turned on by default. `includeSubDomains` requires any request to a subdmain of the current domain to be HTTPS as well. `preload` is a Google Chrome specific extension that allows you to submit your site for baked-into-the-browser HSTS. With it set you can submit your site to [this page](https://hstspreload.appspot.com/). Both of these can be individually turned off by setting them to false in the config object.

For more information the spec is [available](http://tools.ietf.org/html/draft-ietf-websec-strict-transport-sec-04).

#### No Cache
Before using this think long and hard about it. It shuts down all client side caching for the server. All of it. As best as it can be shut down. You can set it to an object `{noEtag: true}` if you want to remove etags as well. If you merely set it to true then all no cache headers will be set but the ETag header will not be removed.

There is now also a `res.noCache` function that allows you to do the same thing but on a per request/route/user (however you program it) basis. This is a much better option then setting noCache server wide.

#### Public Key Pin
This one is a bit of a beast. Before setting it and using it please read: [the spec](https://tools.ietf.org/html/rfc7469), [this mdn article](https://developer.mozilla.org/en-US/docs/Web/Security/Public_Key_Pinning) and [this tutorial](https://timtaubert.de/blog/2014/10/http-public-key-pinning-explained/). It's a great security feature to help prevent man in the middle attacks, but it is also complex.

Enough of the warnings! How do you configure it? The config object above explains it pretty well. Some details about `includeSubdomains`: it pins all sub domains of your site if it is set to true. Turned off by setting it to false.

`reportUri` takes a URL and changes the header so that the browser can corretly handle the reporting of mismatches between pins and your certificate keys. If this is set without `reportOnly` being set to false then it only reports it does not also terminate the connection. Setting `reportOnly` to false means that the connection will be terminated if it does not match the pins as well as reporting.

If you specify a report URI it should be ready to recieve a POST from browsers in the form (described here)[https://tools.ietf.org/html/rfc7469#section-3]. The object you should expect looks like this (sourced from previous link):

```js
{
    "date-time": date-time,
    "hostname": hostname,
    "port": port,
    "effective-expiration-date": expiration-date,
    "include-subdomains": include-subdomains,
    "noted-hostname": noted-hostname,
    "served-certificate-chain": [
        pem1, ... pemN
    ],
    "validated-certificate-chain": [
        pem1, ... pemN
    ],
    "known-pins": [
        known-pin1, ... known-pinN
    ]
}
```

#### Content Security Policy

This is the Content Security Policy configuration. Content Security Policies are amazing and if you aren't familiar with them you should [go read up on them](https://developer.mozilla.org/en-US/docs/Web/Security/CSP). Firefox pioneered them a long time ago and they have become a powerful standard for protecting your end users.

Because of the extensive options available in configuring your CSP we recommend that you go take a look at [the MDN article on directives](https://developer.mozilla.org/en-US/docs/Web/Security/CSP/CSP_policy_directives). All of the options they spell out are supported. The directives need to be passed in camelCase though (`defaultSrc` not `default-src`).

The default is a very strict `default-src 'self'` which prevents any files from outside the current domain from being loaded and/or executed. You will probably want to ease that off a hair. 

In the event that you don't want a Content Security Policy (why!? WHY!? Trust us you want one) you can disable it by setting `config.security.contentSecurity` to false in the config section of your server. This is not a good idea.

### PUT, POST, UPDATE and Parsing Out Body

At some point you are going to need to deal with body data from a form or ajax request. This is one of the areas where monument diverges from the mainstream you may be used to in server side js. We expose a parser function that you use like this in the event handler for the route you want:

```js
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

The `monument.parser` function returns `null` if an error occurs during parsing. If you would like to see the error you can subscribe to the `error:parse` event which recieves the contents of the error or grab the optional second param `err` which only exists when an error has occured. The recommended action at this point is to return an error to the user, terminating the connection with a `connection.req.end`. One way to achieve this would be by `events.emit('error:500', {message: 'The data you sent wasn't properly formatted', connection: connection});`

#### Example object

```js
{
    "file1": {
        "tempFile": "/tmp/some/file.jpg"
        , "mimetype": "image/jpg"
        , "file": //this is the file stream
        , "encoding": "UTF-8"
    }
    , "name": "Daniel"
    , "check": "true"
}
```

### Data and Events

#### Required Events (State Machine)
We pulled in [event-state](http://github.com/ansble/event-state) to provide a simple way to do something after multiple events have been fired. Its syntax is very simliar to `Promise.all` and it takes an array of events to listen for.

```js
emitter.required(['event-1', 'event-2', 'event-3'], function (dataArray) {
    //do something here when all three events have triggered
});
```

More to come... but think about the idea of resource pooling and individual data modules that front DSLs.

### Web Socket Connections

moument has a built in websocket server! So when you spin up a server you can connect either through normal `http` or through a web socket connection. Under the hoods it uses [ws](https://www.npmjs.com/package/ws) which provides a light weight, performant, and standards compliant web socket server.

For more information check out [Using Web Sockets with monument](docs/websockets.md).


### Static Assetts

Static assetts live in `/public` and can be organized in whatever way you see fit. All folders within public become routes on root. So, `/public/compnents` answers to requests on `/components` when the server is running. These static routes take precedent over evented routes and essentially prevent non-static route handling from happening on them.

You can interact with these routes through events to a certain degree. They raise a `static:served` with a payload of the file url that was served, when the file exists. If the file does not exist they raise a `static:missing` with the file url as payload. This will let you log and handle these conditions as needed.

## Logging
Monument has a built-in logging functionality that relies on a custom logger residing inside the configuration object. The default one is a simple logging object that exposes these functions:

- the `debug` function, a shorthand for `console.log`
- the `info` function, a shorthand for `console.info`
- the `warn` function, a shorthand for `console.warn`
- the `error` function, a shorthand for `console.error`
- the `trace` function, a noop in our original implementation

The purpose of this behavior is, say you want to implement your custom logger or replace the default logger with [bunyan](https://github.com/trentm/node-bunyan) or [pino](https://github.com/pinojs/pino), you can just pass them inside the configuration object.

An example:

```js
var monument = require('monument');
var pino = require('pino');

monument.server({
        routePath: './routes'
        , templatePath: './templates'
        , publicPath: './public'
        , port: process.env.PORT || 3000
        , log: pino
      });
```

We just require `pino`, then pass it as a logger to the configuration object. Pino has the same API as our default logger, so can be directly dropped in. That's the same with bunyan.

## Template Language
monument is template language agnostic! You can use whatever your prefered template system is but you will need to do the setup and usage yourself in your application. The CLI support handlebars and dot for now, and the handlebars system gives you a really great example of how to integrate your template language of choice.
