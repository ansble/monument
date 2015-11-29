# Getting up and running with `http2`

`monument` now ships with support for running a variety of different server types and protocols. At the top of the list is http2! One of many nice features is the ability to push multiple assets to users over the same connection. Now you can get that in `monument`.

## Getting setup

So the first thing that you need to do to make thinge work is you will need an `ssl` cert and key. This is because http2 is an SSL only protocol. So if you were hoping to use this without a cert... sorry. :-(

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
    }
});
```
the lines of interest here are where we require in the spdy module ( `, spdy = require('spdy')`) and then pass it to the `config.server`. Since it needs to have a cert and key you need to pass a `serverOptions` object that has a `cert` and `key` in it. These need to be the actual cert and key sot hat things will work.

With those two things done you are now up and running with an spdy instance of monument.

## `connection.res.push`

When the browser connecting to your server supports spdy a new method will ba available on the `connection.res` object.

You can use `connection.res.push` to push additional files down to the server over the same connection. For instance, if you want to push down `app.js` with your `/` route you would do something like this:

```
events.on('route:/:get', (connection) => {
    let push;

    if (connection.res.push) {
        push = connection.res.push('./public/app.js');
        push.writeHead(200);

        fs.createReadStream(path.join(__dirname, './public/app.js')).pipe(push);
    }

    connection.res.send(mainTemplate({ version: pkg.version }));
});
```
