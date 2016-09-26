# Routing in monument

Route creation in monument is based on convention and it requires you to edit a file and create another one for any route you want to listen too. First we'll walk through the easy way which uses the CLI tools, then we'll deep dive into what is really going on behind the scenes and how to create routes manually.

## The easy way

First, get the CLI tools (`npm install -g monument-cli` ) and use them to create a new project.

Part of the project structure for `monument` is the routes.json file. It will look like this in a brand new project:
```
{
  "/": ["get"]
}
```

Adding new routes with the CLI is as simple as adding them to the routes.json file and running `monument routes` from your project root.

### Creating new routes in the routes.json file

This is fairly simple but it would probably make sense to talk about what the values are. The routes.json file is used to validate an incoming route and make sure that it does not result in a 404. So any route that your app should respond to will need to be listed here.

The location of the routes.json file is specified in the confining object, so you can put it wherever, but the default location is at the root of your project.

Routes are defined as key value pairs where the key is the route and the value is an array of verbs that you want the route to respond to. For example a restful API for pro cycling teams might look like this:
```
{
    "/api/v1/team": [ "get", "post" ],
    "/api/v1/team/:teamid": [ "get", "put", "delete" ],
    "/api/v1/team/:teamid/rider": [ "get", "post" ],
    "/api/v1/team/:teamid/rider/:riderid": [ "get", "put", "delete" ]
}
```

Requests that use verbs not listed in the routes.json file will be ignored and receive 404s. monument supports any verb you can throw at it. From report to head. Head is automatically supported for all routes and does not need to be added explicitly.

You are allowed to specify routes with params in them as demonstrated by the `/team/:teamid` route above. This means that when someone requests that route with something like `/team/astana` there will be a variable named `teamid` included in the variable req.params (req.params.teamid will equal 'astana' in this example). You can use that variable in the event handler for the route. Oh yeah, that will be handled by the 'route:/team/:teamid:get' event. Hopefully that makes sense.

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

## Route handlers

Generally rout handlers live in the /routes directory, however this is configurable in the server's configure object. No matter where they live though they look like this:

```
events.on('route:/api/v1/team/:teamid:get', (connection) => {
    connection.res.send('hello team');
});
```

The handler listens for the route event and then responds with the connection object that is the payload of the event.

## Route Decleration API

### Adding new routes

```
// A simple route...
routeStore.add('/this/is/a/test', 'get');

// A wildcard route...
routeStore.add('/rangers/:name', [ 'get', 'post', 'put', 'delete' ]);
```

The two parameters are the route... and the array of verbs that you want that route to respond to. Pretty simple.

If you want to add verbs to an existing route then you call `.add` again with the route and additional verbs. They are added to the verbs that are being listened to. They do not become the only verbs, think composition not replacement.

### Remove routes

```
// remove all of a standard route
routeStore.remove('/this/is/a/test');

// remove all of a wild card route
routeStore.remove('/hobbits/:name');

// remove a single verb from a wild card route
routeStore.remove('/hobbits/:name', 'get');

// remove multiple verbs from a wild card route
routeStore.remove('/hobbits/:name', [ 'post', 'delete' ]);

```

The api for removing is pretty simple as well. Pass the route to change and then no verbs to remove all verbs and an array of verbs or a string containing a verb and the correct listeners will be removed.

### Parse

```
routeStore.parse({'/this/is/a/route': ['get']})
```

You can pass a whole router full of route config as an object to the `parse` method and it will setup the router accordingly


### Get the route objects

```
routeStore.get() // returns {wildcard: {}, standard: {}} with the standard and wildcard route objects populated

routeStore.getWildcard() // Returns an object containing the wild card routes and their meta information

routeStore.getStandard() // returns an object containing the standard routes and their meta information
```
