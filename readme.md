# monument

`monument` is a super light event routed nodejs framework.

[![NPM](https://nodei.co/npm/monument.png?downloadRank=true&stars=true)](https://nodei.co/npm/monument/)

![build status](https://codeship.com/projects/881ed090-9c54-0132-655c-263ab955f60c/status?branch=master) [![david-dm](https://david-dm.org/ansble/monument.svg)](https://david-dm.org/ansble/monument)

[![Coverage Status](https://coveralls.io/repos/ansble/monument/badge.svg?branch=master)](https://coveralls.io/r/ansble/monument?branch=master)

## How To Get Started

The easiest way to get started with monument is to use the CLI tool which does project lay down. `npm install -g monument-cli` From there a simple `monument new <path to project>` will get you up and running with stubbed tests, basic error handlers and an index route and everything you need to knock out an application fast.

![getting started with monument gif](http://g.recordit.co/EwbTO7xDgy.gif) or the [slightly longer video version](http://recordit.co/EwbTO7xDgy)

It is also the easiest way to add routes and fata handlers!

## Config object and the server

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
    }
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

### etags
Hash based etags are now available by default. You can turn them off by adding `'etags': false` to your config object (passed into `monument.server`).

They are generated and used for all static files, and all responses that use `res.send`. One of the cooler things we did was have monumen cache the etags for static assets. That means they get created the first time they are requested after the server starts up, and for all subsequent requests the etag is pulled from an in memory cache so that the file i/o is only done if there is a reason to stream the file to the client. Makes them fast and light!

### Secuirty configuration

Ths server config opbject provides a security object inside it for you to specify what security options you would like to turn on at the server level. They are detailed in the example object above but below is more information on each of the options.

We have done our best to place an out-of-the-box monument server in a secure posture. For instance we autmatically enable HTTP Strict Transport Security headers, No Sniff headers, XSS Protection Headers (where it is secure to do so), Same origin Framegaurd headers, and a strict Content Security Poicy. All without you having to specify anything. We also shut down the powered by header out of the box because we care more about intruders getting information about your server then on seeing who is using monument.

The one thing we don't do is handle Public Key Pinning without configuration. But you can easily add that if you want!  Most of the settings in security turn headers on and off, and documentation around those headers can be found on [OWASP](https://www.owasp.org/index.php/List_of_useful_HTTP_headers) and in [helmet and its source code](https://www.npmjs.com/package/helmet). Much of the code here is inspired by and adapted from helmet.

#### poweredBy
You can set this value to whatever you want it to look like your server is powered by. By default it is off and the server does not return the `X-Powered-By` header. This is more secure then specifying it so we receommend you leave this alone, but since you are an adult you are free to set a value here. Any string passed here will become the value of the `X-Powered-By` header.

#### xssProtection
If set to false this turns off the X-XSS-Protection header for all browsers. This header is disabled in IE < 9 because it opens up vulnerabilities. In everything else it is enabled by default.

#### noSniff
If set to false this turns off the X-Content-Type-Options header for all browsers. This header prevents browsers from trying to infer mime type when a file with a mime type is downloaded. This helps prevent download related vulnerabilities and the misinterpretation of file types.

#### frameguard
Guard is a weird looking word. 
Not that we have that out of the way frameguard allows you to specify under what conditions your application may be wrapped in an `iframe`. Setting `action: 'DENY'` means that your site may never be wrapped in an `iframe`. The default is 'SAMEORIGIN' which allows wrapping of your site by essentially your app. The last allowed setting, `action: 'ALLOW-ORIGIN'`, requires that you pass a `domain` value as well. It allows the specified domain to wrap your application in an iframe. All the calculations for `SAMEORIGIN` and `ALLOW-ORIGIN` follow the CORS rules for determining origin. So `www.designfrontier.net` and `designfrontier.net` are different origins.

#### hsts (HTTP Strict Transport Security)
This tells browsers to require HTTPS security if the connection started out as an HTTPS connection. It does not force the connection to switch, it just requires all subsequent requests by the page to use HTTPS if the page was requested with HTTPS. To disable it set `config.security.hsts` to `false`. It is set with a `maxAge` much like caching. The `maxAge` is set in seconds (not ms) and must be a positive number. 

The two optional settings: `includeSubDomains` and `preload` are turned on by default. `includeSubDomains` requires any request to a subdmain of the current domain to be HTTPS as well. `preload` is a Google Chrome specific extension that allows you to submit your site for baked-into-the-browser HSTS. With it set you can submit your site to [this page](https://hstspreload.appspot.com/). Both of these can be individually turned off by setting them to false in the config object.

For more information the spec is [available](http://tools.ietf.org/html/draft-ietf-websec-strict-transport-sec-04).

#### noCache
Before using this think long and hard about it. It shuts down all client side caching for the server. All of it. As best as it can be shut down. You can set it to an object `{noEtag: true}` if you want to remove etags as well. If you merely set it to true then all no cache headers will be set but the ETag header will not be removed.

There is now also a `res.noCache` function that allows you to do the same thing but on a per request/route/user (however you program it) basis. This is a much better option then setting noCache server wide.

#### publicKeyPin
This one is a bit of a beast. Before setting it and using it please read: [the spec](https://tools.ietf.org/html/rfc7469), [this mdn article](https://developer.mozilla.org/en-US/docs/Web/Security/Public_Key_Pinning) and [this tutorial](https://timtaubert.de/blog/2014/10/http-public-key-pinning-explained/). It's a great security feature to help prevent man in the middle attacks, but it is also complex.

Enough of the warnings! How do you configure it? The config object above explains it pretty well. Some details about `includeSubdomains`: it pins all sub domains of your site if it is set to true. Turned off by setting it to false.

`reportUri` takes a URL and changes the header so that the browser can corretly handle the reporting of mismatches between pins and your certificate keys. If this is set without `reportOnly` being set to false then it only reports it does not also terminate the connection. Setting `reportOnly` to false means that the connection will be terminated if it does not match the pins as well as reporting.

If you specify a report URI it should be ready to recieve a POST from browsers in the form (described here)[https://tools.ietf.org/html/rfc7469#section-3]. The object you should expect looks like this (sourced from previous link):

```
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

#### contentSecurity

This is the Content Security Policy configuration. Content Security Policies are amazing and if you aren't familiar with them you should [go read up on them](https://developer.mozilla.org/en-US/docs/Web/Security/CSP). Firefox pioneered them a long time ago and they have become a powerful standard for protecting your end users.

Because of the extensive options available in configuring your CSP we recommend that you go take a look at [the MDN article on directives](https://developer.mozilla.org/en-US/docs/Web/Security/CSP/CSP_policy_directives). All of the options they spell out are supported. The directives need to be passed in camelCase though (`defaultSrc` not `default-src`).

The default is a very strict `default-src 'self'` which prevents any files from outside the current domain from being loaded and/or executed. You will probably want to ease that off a hair. 

In the event that you don't want a Content Security Policy (why!? WHY!? Trust us you want one) you can disable it by setting `config.security.contentSecurity` to false in the config section of your server. This is not a good idea.

## Setting up routes

The easy way to do this is with the [monument-cli](https://github.com/ansble/monument-cli)and `monument routes` command. It takes your `routes.json` file and stubbs out all the route handlers and files for you.

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

### `.send()`
One of the things that I heard from several users was the lack of response.send was confusing for them. So we added it! It also allows etags and automatically handles strings or objects correctly. Basically it is a nice layer of sugar around res.end and res.setHeaders that correctly handles mimetype and serializing the data if needed.

### put, post, update and parsing out body

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

The `monument.parser` function returns `null` if an error occurs during parsing. If you would like to see the error you can subscribe to the `error:parse` event which recieves the contents of the error or grab the optional second param `err` which only exists when an error has occured. The recommended action at this point is to return an error to the user, terminating the connection with a `connection.req.end`. One way to achieve this would be by `events.emit('error:500', {message: 'The data you sent wasn't properly formatted', connection: connection});`

### Data and Events

#### required events (state machine)
We pulled in [event-state](http://github.com/ansble/event-state) to provide a simple way to do something after multiple events have been fired. Its syntax is very simliar to `Promise.all` and it takes an array of events to listen for.

```
  emitter.required(['event-1', 'event-2', 'event-3'], function (dataArray) {
    //do something here when all three events have triggered
  });
```

More to come... but think about the idea of resource pooling and individual data modules that front DSLs.

### Static Assetts

Static assetts live in `/public` and can be organized in whatever way you see fit. All folders within public become routes on root. So, `/public/compnents` answers to requests on `/components` when the server is running. These static routes take precedent over evented routes and essentially prevent non-static route handling from happening on them.

You can interact with these routes through events to a certain degree. They raise a `static:served` with a payload of the file url that was served, when the file exists. If the file does not exist they raise a `static:missing` with the file url as payload. This will let you log and handle these conditions as needed.

## Testing!
The [testing documentation](docs/testing.md) lives in the docs directory

## Template language
The templates right now default to [dot](http://olado.github.io/doT/index.html) it's documentation is pretty good... though there is definitely room for improvement there. It is still the best place to learn about templating at the moment though.

## Route documentation
The [route documentation](docs/routes.md) lives in the docs directory

## Contributing
Contributing is simple :-)

Feel free to edit away, just make sure that everything still passes its tests `npm test` and add new tests in `*_test.js` files. (For a file named merckx.js you would create a merckx_test.js file that contains the tests.) Once you have done that then open a pull request and we'll get it pulled in.

For things to do check out the [issues](issues/) and grab a ticket. Feel free to reach out if you need help or have questions about it. We want to help you contribute :-)

When we do the next release your name will be added to the AUTHORS file... you know, because you're an author now.
