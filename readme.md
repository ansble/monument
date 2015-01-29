# monumentjs

`monumentjs` is a super light event routed isomorphic nodejs framework. 

## How To Get Started

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
	parser(connection, function (body) {
		console.log(body);
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