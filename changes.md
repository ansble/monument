# Change Log

## v2.4.0
Minor release time!

### Brötli Compression
Starting with this release brötli compression is supported for both static and dynamic requests. It is amazingly tight compression that beats out gzip and deflate. To keep it snappy we are using a wrapper around the `c` implementation instead of a pure `js` implementation.

Brötli does have one quirk, that it is only supported by browsers over https. So make sure you have https setup if you are going to use it. `monument` itself doesn't care, meaning that you could have monument speaking `http` behind an `https` load balancer and it will still serve up brötli if the browser supports it. But if you are running the `https` right off of `monument` make sure that you are passing in the `https` module to `server` in the config object. It should also work with `http2` or `spdy` which require certificates as well.

### Higher performance web sockets
This release also adds a couple of binary dependencies that improve the performance of the `ws` library. See [the ws docs](https://www.npmjs.com/package/ws#opt-in-for-performance) for more details about that.

### Router API!
There is now a route decleration API so that you can easily add and remove route handlers to the server while it is running. This is awesome! Not only does it provide a code-over-config option for creating route handlers it also makes it possible to create and destroy them as needed.

For more information check out the [documentation](https://github.com/ansble/monument/blob/master/docs/routes.md).

## v2.3.5 & 2.3.6

Minor patch release that fixes several bugs in the web socket code. It also improves test coverage around web sockets and adds working examples of the web socket code in action.

The other thing covered in this release is an update of all dependencies to their latest versions. Including the upgrade to eslint 2.0 which is pretty big.

2.3.6 is being released because I forgot the documentation.

## v2.3.2

Small patch release that has som dependency updates and a change the the linting rules for the codebase. Very Very minor.

## v2.3.0

The big enhancement for Liège–Bastogne–Liège (2.3.0) is the addition of file upload handling courtesy of busboy. The handling is essentially the same as it used to be but using busboy means that the form handling now appropriately handles file upload fields.

### New form handling information

The files that are uploaded are sent to the OS's temp file directory and the object that contains the references to them looks like this:
```
{
    "file1": {
        "tempFile": "/tmp/some/file.jpg"
        , "mimetype": "image/jpg"
        , "file": //this is the file stream
        , "encoding": "UTF-8"
    }
}
```

It also welcome some new contributors with their first commits to the project! Welcome Kelly Innes and Adrian Bobev! Contributor 4 and 5 respectively.

The last real notable change is the addition of some more information around contributing in the contributing.md file. That's it. Not a whole ton of stuff this time around.

## v2.2.0

The main focus of this release is expanding the available protocol stack that `monument` can use to communicate. It adds a builtin Web Socket server and the ability to drop in any http-like server that adheres to the API made popular by the builtin `http` and `https` modules. This includes `spdy` and `http2`!

### Config changes:
Current state of the config object is right below this. Explanations about the new items in the server section of the config is below.

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
    
    // Web Sockets is new for this release!
    , webSockets: false // default setting disables websockets. can be (false, true, 'passthrough', 'data')

    // Server and ServerOptions are new for this release!
    , server: spdy
    , serverOptions: { // anything set in this object will be passed to the server
        key: fs.readFileSync('./server.key')
        , cert: fs.readFileSync('./server.crt')
        , ca: fs.readFileSync(./ca.pem)
    }
}
```

#### Web Sockets
Web Sockets are awesome and generally pretty straightforward. `monument` does have some opinions about how to handle them and the settings allow for quite a bit of flexibility when it comes down to it so let's take a deep dive into working with them. If you aren't familiar with how web sockets work the [HTML5 rocks article](http://www.html5rocks.com/en/tutorials/websockets/basics/) is a good place to start. 

Web Sockets allow a low latency, low overhead two-way connection between youe client and server. It dramatically reduces the overhead of normal connections, by staying open and by not involving the transmission of headers with every piece of data. They are pretty fantastic.

The idea of events or messages in Web Sockets meshes very well with `monument`'s own concept of events so it seems like a natural fit here.

##### Settings

There are four possible settings for web socket config.
- `false` which turns off the web socket server
- `true` which turns it on with `data` and `passthrough` style handling enabled
- `data` which turns on the server but only for `data` style handling
- `passthrough` which turn on the server but only for `passthrough` style handling

Any other value passed to the `config.webSocket` will be treated as `true` turning on the server for both handlings. The default setting is `false`.

For more information check out the [web sockets documentation](docs/websockets.md).

### `spdy` and `http2`

`monument` now ships with support for running a variety of different server types and protocols. At the top of the list is http2/spdy! One of many nice features is the ability to push multiple assets to users over the same connection. Now you can get that in `monument`.

For local use the simplest way to go is generating a self signed certificate. Your browser will complain about it, but you will still be able to test everything and do your development without buying an actual certificate.

Heroku has a [great writeup on the process](https://devcenter.heroku.com/articles/ssl-certificate-self) that will get you up and running. If you are using the [spdy](https://www.npmjs.com/package/spdy) module then you will need to [create a CA as well](http://datacenteroverlords.com/2012/03/01/creating-your-own-ssl-certificate-authority/). Once you have a cert generated in the root of your new `monument` project you will need to setup your server config appropriately. Your new app.js file should look something like this:

```
'use strict';

const monument = require('monument')
    , defaultPort = 4000
    , spdy = require('spdy')
    , fs = require('fs');

monument.server({
    routePath: './routes'
    , templatePath: './templates'
    , publicPath: './public'
    , port: process.env.PORT || defaultPort
    , security: {
        contentSecurity: false
    }
    , webSockets: true

    , server: spdy
    , serverOptions: {
        key: fs.readFileSync('./server.key')
        , cert: fs.readFileSync('./server.crt')
        , ca: fs.readFileSync(./ca.pem)
    }
});
```

For more information including the [documentation for connection.res.push](docs/http2-server.md).

### UUID generator

We added a V4 UUID generator to monument (`require('monument').createUUID`). It's handy for dealing with data and lots of other things. It was mostly added for use when creating new data through events.

### isUndefined

If you are working on the core of monument you now have a `utils.isUndefined` function for checking if a value is undefined. Handy and simplified a lot of the code in the server.

### Code Climate

We added Code Climate checks to the project!

### Cleans up bugs in testing

There were some bugs in the unit tests that manifest themselves once we started testing with multiple types of servers for the http2/spdy stuff. These bugs were fixed and the tests now hum along nicely.

### Tons of documentation

There is a lot more documentation now and it is much more in depth!

## v2.1.0

###Config changes:
Current state of the config object is right below this. Explanations about the new items in the security object are explained in more depth below. Most of the settings in security turn headers on and off, and documentation around those headers can be found on [OWASP](https://www.owasp.org/index.php/List_of_useful_HTTP_headers) and n [helmet and its source code](https://www.npmjs.com/package/helmet). Much of the code here is inspired by helmet.

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

## v2.0.0!
Despite it being a major release this is actually a pretty bland one. It's a major release because monument 2+ requires you to be running on node > 4.0.0. It is a rewrite and cleanup in ES6 syntax.

There will likely be a few more tweaks over the next couple of days, but this is a nice stable release as is.

### Performance
One of the things that did change was how route detection works. It now uses better Array functions instead of forEach, and filter in most places. Array.find has taken over the routing functions which means they exit quicker. This is a minor performance tweak, and the chances of you noticing it are tiny. But, for apps with large route lists this will make a difference, maybe even a big one.

### Testing
We are now over 80% global coverage and have a rule in the build to require we hit 80%. So going forward that number will move upwards and the system as a whole will be more stable.

### Components
We now use [harken](https://github.com/ansble/harken) to handle events. Pulled it out of this code base and made it its own thing, much like event-state in a previous release. Makes the codebase simpler. This also means that you can use the same event system in your clients now. Which is pretty sweet.

This release breaks the router into a whole lot of smaller components. This is for testability, and to make it easier to reason about what is happening in the router. Before this version the router was a black box with terrible testability.

### Better commmit messages!
The git log is now much nicer...

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
