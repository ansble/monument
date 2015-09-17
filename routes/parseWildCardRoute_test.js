'use strict';

const assert = require('chai').assert
    , parseWildCardRoute = require('./parseWildCardRoute')
    , parseRoutes = require('./parseRoutes')
    , stubRoutes = parseRoutes(require('../test_stubs/routes_stub.json'));

describe('Wildcard route parsing tests', function () {
    it('should export a function', () => {
        assert.isFunction(parseWildCardRoute);
    });

    it('should properly parse a wildcard route', function () {
        var routeObj = parseWildCardRoute('/1234', stubRoutes.wildcard);

        assert.isObject(routeObj);
        assert.strictEqual(routeObj.values.id, '1234');
        assert.isObject(routeObj.route);
    });
});
