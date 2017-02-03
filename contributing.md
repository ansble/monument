## Contributing
Contributing is simple :-)

Feel free to edit away, just make sure that everything still passes its tests `npm test` and add new tests in `*_test.js` files. (For a file named merckx.js you would create a merckx_test.js file that contains the tests.) Also make sure you are following the styles set up by the .eslintrc file. The easiest way to do that is to run eslint in your editor of choice. The styles are pretty strict so that we maintain a consistent code base. Once you have done that, open a pull request and we'll get it pulled in.

If the ticket you are working on is attached to a milestone please open the pull request to the branch that has the same name as the milestone for that ticket. Makes our release cycle work a little better.

For things to do check out the [issues](../../issues/) and grab a ticket. Feel free to reach out if you need help or have questions about it. We want to help you contribute :-)

When we do the next release your name will be added to the AUTHORS file... you know, because you're an author now.

If you have questions pop into our [![Gitter](https://img.shields.io/gitter/room/nwjs/nw.js.svg?style=flat-square)](https://gitter.im/ansble/monument) and ask!

### Getting things setup
Generally a simple npm install in the repo will get you 80-90% of the way there. But there are a couple other things you will need to do to make testing and contributing a little bit easier. If you are planning on working with statsd or any of the other parts of `monument` that have external dependencies for testing then you will want to make sure you have:

- docker (we use docker for mac)
- dory (if you are on a mac, alternatly dinghy covers this on *nix)

With those in place 

### Contributor List
[Can be found here](AUTHORS)
