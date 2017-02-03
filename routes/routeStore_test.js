/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
    , routeStore = require('./routeStore');


describe('routeStore Tests', () => {
    // let routeObject;

    // beforeEach(() => {
    //     routeObject = require('../test_stubs/routes_stub.json');
    // });
    afterEach(() => {
        routeStore.clear();
    });

    it('should return an object', () => {
        assert.isFunction(routeStore.get);
        assert.isFunction(routeStore.getStandard);
        assert.isFunction(routeStore.getWildcard);
        assert.isFunction(routeStore.add);
        assert.isFunction(routeStore.remove);
        assert.isFunction(routeStore.parse);
    });

    describe('#add', () => {
        it('should add a route to the server', () => {
            const wild = routeStore.add('/this/is/a/:test', [ 'get', 'post' ]);

            assert.isArray(routeStore.add('/this/is/a/test', 'get').standard['/this/is/a/test']);
            assert.isObject(wild.wildcard['/this/is/a/:test']);
        });

        it('should add a verb if the route already exists', () => {
            const step1 = routeStore.add('/this/is/a/test', 'get');

            assert.strictEqual(step1.standard['/this/is/a/test'].length, 1);
            assert.strictEqual(step1.standard['/this/is/a/test'][0], 'get');

            assert.strictEqual(routeStore.add('/this/is/a/test', 'post')
                                         .standard['/this/is/a/test'].length, 2);

            assert.strictEqual(routeStore.add('/this/is/a/test', 'post')
                                         .standard['/this/is/a/test'][0], 'get');

            assert.strictEqual(routeStore.add('/this/is/a/test', 'post')
                                         .standard['/this/is/a/test'][1], 'post');


            assert.strictEqual(routeStore.add('/this/is/a/test', [ 'put', 'report' ])
                                         .standard['/this/is/a/test'].length, 4);

            assert.strictEqual(routeStore.add('/this/is/a/test', [ 'put', 'report' ])
                                         .standard['/this/is/a/test'][0], 'get');

            assert.strictEqual(routeStore.add('/this/is/a/test', [ 'put', 'report' ])
                                         .standard['/this/is/a/test'][1], 'post');

            assert.strictEqual(routeStore.add('/this/is/a/test', [ 'put', 'report' ])
                                         .standard['/this/is/a/test'][2], 'put');

            assert.strictEqual(routeStore.add('/this/is/a/test', [ 'put', 'report' ])
                                         .standard['/this/is/a/test'][3], 'report');

        });

        it('should do nothing if there is no change', () => {
            const step1 = routeStore.add('/this/is/a/test', 'get');

            assert.strictEqual(step1.standard['/this/is/a/test'].length, 1);
            assert.strictEqual(step1.standard['/this/is/a/test'][0], 'get');

            assert.strictEqual(routeStore.add('/this/is/a/test', 'get')
                                         .standard['/this/is/a/test']
                                         .length, 1);
        });
    });

    describe('#get', () => {
        it('should return the current route object', () => {
            routeStore.parse(require('../test_stubs/routes_stub.json'));

            assert.isObject(routeStore.get());
            assert.isObject(routeStore.get().standard);
            assert.isObject(routeStore.get().wildcard);
            assert.isArray(routeStore.get().standard['/']);
            assert.isArray(routeStore.get().standard['/api/articles']);
            assert.isArray(routeStore.get().standard['/api']);
        });
    });

    describe('#getWildcard', () => {
        beforeEach(() => {
            routeStore.add('/test/:id', [ 'get', 'put' ]);
        });

        it('should return the current wildcard routes only', () => {
            const routes = routeStore.getWildcard();

            assert.isObject(routes);
            assert.isObject(routes['/test/:id']);
        });
    });

    describe('#getStandard', () => {
        beforeEach(() => {
            routeStore.add('/test', [ 'get', 'put' ]);
        });

        it('should return the current standard routes only', () => {
            const routes = routeStore.getStandard();

            assert.isObject(routes);
            assert.isArray(routes['/test']);
        });
    });

    describe('#remove', () => {
        beforeEach(() => {
            routeStore.add('/test', [ 'get', 'post', 'put' ]);
            routeStore.add('/hobbits', [ 'get' ]);
            routeStore.add('/hobbits/:name', [ 'get' ]);
            routeStore.add('/rangers/:name', [ 'get', 'post', 'put', 'delete' ]);
        });

        it('should remove all if no verbs are passed', () => {
            assert.isUndefined(routeStore.remove('/test').standard['/test']);
            assert.isDefined(routeStore.get().standard['/hobbits']);
            assert.isUndefined(routeStore.remove('/hobbits').standard['/hobbits']);
            assert.isUndefined(routeStore.remove('/hobbits/:name').wildcard['/hobbits/:name']);
        });

        it('should remove the whole route if all verbs are passed to it', () => {
            const allVerbs = [ 'get', 'post', 'put', 'delete' ];

            assert.isUndefined(routeStore.remove('/test', [ 'get', 'put', 'post' ])
                                         .standard['/test']);

            assert.isDefined(routeStore.get().standard['/hobbits']);

            assert.isUndefined(routeStore.remove('/hobbits', 'get')
                                         .standard['/hobbits']);

            assert.isUndefined(routeStore.remove('/hobbits/:name', 'get')
                                         .wildcard['/hobbits/:name']);

            assert.isUndefined(routeStore.remove('/rangers/:name', allVerbs)
                                         .wildcard['/rangers/:name']);
        });

        it('should remove only a verb if a route listens to multiple but one is passed', () => {
            const routes = routeStore.remove('/test', [ 'get' ]).standard
                , wild = routeStore.remove('/rangers/:name', [ 'get', 'post' ]);

            assert.isArray(routes['/test']);
            assert.strictEqual(routes['/test'].length, 2);
            assert.isArray(wild.wildcard['/rangers/:name'].verbs);
            assert.strictEqual(wild.wildcard['/rangers/:name'].verbs.length, 2);
        });

        it('should remove only the verbs passed if a route listens to multiple', () => {
            const routes = routeStore.remove('/test', [ 'put', 'post' ]).standard
                , wild = routeStore.remove('/rangers/:name', [ 'put', 'post', 'delete' ]).wildcard;

            assert.isArray(routes['/test']);
            assert.strictEqual(routes['/test'].length, 1);
            assert.strictEqual(routes['/test'][0], 'get');
            assert.isArray(wild['/rangers/:name'].verbs);
            assert.strictEqual(wild['/rangers/:name'].verbs.length, 1);
            assert.strictEqual(wild['/rangers/:name'].verbs[0], 'get');
        });

        it('should do nothing if there is no match', () => {
            const routes = routeStore.remove('/sam', [ 'get' ]).standard;

            assert.isArray(routes['/test']);
            assert.strictEqual(routes['/test'].length, 3);
        });
    });

    describe('#parse', () => {
        it('should parse a routes.json', () => {
            const routes = routeStore.parse(require('../test_stubs/routes_stub.json'));

            assert.isObject(routes);
            assert.isArray(routes.standard['/']);
            assert.isArray(routes.standard['/api/articles']);
            assert.isArray(routes.standard['/api']);
        });
    });
});
