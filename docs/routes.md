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


## Behind the scenes

## Setting up routes

The easy way to do this is with the [monument-cli](https://github.com/ansble/monument-cli)and `monument routes` command. It takes your `routes.json` file and stubs out all the route handlers and files for you.

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
