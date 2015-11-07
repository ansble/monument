/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
    , csp = require('./contentSecurityPolicy')
    , config = {}

    , POLICY = {
        baseUri: '*'
        , 'child-src': [ 'child.com' ]
        , connectSrc: [ 'connect.com' ]
        , 'default-src': [ '\'self\'' ]
        , fontSrc: [ 'font.com' ]
        , 'form-action': [ 'formaction.com' ]
        , frameAncestors: [ 'frameancestor.com' ]
        , 'frame-src': [ 'frame.com' ]
        , imgSrc: [ 'data:', 'img.com' ]
        , 'manifest-src': [ 'manifest.com' ]
        , mediaSrc: [ 'media.com' ]
        , 'object-src': [ 'object.com' ]
        , pluginTypes: [ 'application/x-shockwave-flash' ]
        , 'report-uri': '/report-violation'
        , sandbox: []
        , 'script-src': [ '\'unsafe-eval\'', 'scripts.com' ]
        , styleSrc: [ 'styles.com', '\'unsafe-inline\'' ]
        , 'upgrade-insecure-requests': ''
    }
    , EXPECTED_POLICY = [
        'base-uri *; child-src child.com; connect-src connect.com; default-src '
        , '\'self\'; font-src font.com; form-action formaction.com; frame-ancestors '
        , 'frameancestor.com; frame-src frame.com; img-src data: img.com; '
        , 'manifest-src manifest.com; media-src media.com; object-src object.com; '
        , 'plugin-types application/x-shockwave-flash; report-uri /report-violation; '
        , 'sandbox; script-src \'unsafe-eval\' scripts.com; style-src styles.com '
        , '\'unsafe-inline\'; upgrade-insecure-requests'
    ].join('')
    , AGENTS = require('../test_stubs/userAgents');

let res = {}
    , req = {};

describe('content security policy', () => {

    beforeEach(() => {
        req = {
            headers: {}
        };

        res = {};
        res.headers = {};
        res.setHeader = function (key, value) {
            this.headers[key] = value;
        };

        config.security = {};
    });

    it('returns a function', () => {
        assert.isFunction(csp);
    });

    it('sets headers by string', () => {
        config.security.contentSecurity = { 'default-src': 'a.com b.biz' };

        csp(config, req, res);

        assert.strictEqual(res.headers['Content-Security-Policy'], 'default-src a.com b.biz');
    });

    it('sets all the headers if you tell it to', () => {
        const expected = `default-src 'self' domain.com`;

        req.headers['User-Agent'] = AGENTS['Firefox 23'].string;

        config.security.contentSecurity = {
            'default-src': [ '\'self\'', 'domain.com' ]
            , setAllHeaders: true
        };

        csp(config, req, res);

        assert.strictEqual(res.headers['X-Content-Security-Policy'], expected);
        assert.strictEqual(res.headers['Content-Security-Policy'], expected);
        assert.strictEqual(res.headers['X-WebKit-CSP'], expected);
    });

    it('sets all the headers if you provide an unknown user-agent', () => {
        const expected = `default-src 'self' domain.com`;

        req.headers['User-Agent'] = 'Some Crazy Fake Browser';

        config.security.contentSecurity = {
            'default-src': [ '\'self\'', 'domain.com' ]
        };

        csp(config, req, res);

        assert.strictEqual(res.headers['X-Content-Security-Policy'], expected);
        assert.strictEqual(res.headers['Content-Security-Policy'], expected);
        assert.strictEqual(res.headers['X-WebKit-CSP'], expected);

        // unknown browser shouldn't effect a subsequent request
        req.headers['User-Agent'] = AGENTS['Chrome 27'].string;

        csp(config, req, res);

        assert.isUndefined(res.headers['X-Content-Security-Policy']);
        assert.strictEqual(res.headers['Content-Security-Policy'], expected);
        assert.isUndefined(res.headers['X-WebKit-CSP']);
    });

    it('sets the report-only headers', () => {
        const expected = 'default-src \'self\'; report-uri /reporter';

        config.security.contentSecurity = {
            reportOnly: true
            , setAllHeaders: true
            , 'default-src': [ `'self'` ]
            , 'report-uri': '/reporter'
        };

        req.headers['User-Agent'] = AGENTS['Firefox 23'].string;

        csp(config, req, res);

        assert.strictEqual(res.headers['X-Content-Security-Policy-Report-Only'], expected);
        assert.strictEqual(res.headers['Content-Security-Policy-Report-Only'], expected);
        assert.strictEqual(res.headers['X-WebKit-CSP-Report-Only'], expected);
    });

    it('can set empty directives', () => {
        let header
            , split;

        config.security.contentSecurity = {
            scriptSrc: []
            , sandbox: [ '' ]
        };

        req.headers['User-Agent'] = AGENTS['Firefox 23'].string;

        csp(config, req, res);


        header = res.headers['Content-Security-Policy'];
        split = header.split(';').map((str) => {
            return str.trim();
        }).sort();

        assert.strictEqual(split[0], 'sandbox');
        assert.strictEqual(split[1], 'script-src');
    });

    it('throws an error when directives need quotes', () => {
        assert.throws(() => {
            config.security.contentSecurity = { 'default-src': [ 'none' ] };
            csp(config, req, res);
        }, Error);
        assert.throws(() => {
            config.security.contentSecurity = { 'default-src': [ 'self' ] };
            csp(config, req, res);
        }, Error);
        assert.throws(() => {
            config.security.contentSecurity = { 'script-src': [ 'unsafe-inline' ] };
            csp(config, req, res);
        }, Error);
        assert.throws(() => {
            config.security.contentSecurity = { scriptSrc: 'unsafe-eval' };
            csp(config, req, res);
        }, Error);
        assert.throws(() => {
            config.security.contentSecurity = { 'style-src': [ 'unsafe-inline' ] };
            csp(config, req, res);
        }, Error);
        assert.throws(() => {
            config.security.contentSecurity = { styleSrc: 'unsafe-eval' };
            csp(config, req, res);
        }, Error);
        assert.throws(() => {
            config.security.contentSecurity = { 'default-src': 'self' };
            csp(config, req, res);
        }, Error);
        assert.throws(() => {
            config.security.contentSecurity = { defaultSrc: 'self unsafe-inline' };
            csp(config, req, res);
        }, Error);
    });

    it('throws an error reportOnly is true and there is no report-uri', () => {
        assert.throws(() => {
            config.security.contentSecurity = { reportOnly: true };
            csp(config, req, res);
        }, Error);
    });

    Object.keys(AGENTS).forEach((key) => {
        const agent = AGENTS[key];

        if (agent.special) {
            return;
        }

        it(`sets the header properly for ${key}`, () => {
            config.security.contentSecurity = POLICY;
            req.headers['User-Agent'] = agent.string;
            assert.strictEqual(res.headers[agent.header], EXPECTED_POLICY);
        });
    });

    it('sets the header properly for Firefox 22', () => {
        const header = 'X-Content-Security-Policy';

        config.security.contentSecurity = POLICY;
        req.headers['User-Agent'] = AGENTS['Firefox 22'].string;

        csp(config, req, res);

        assert.includes(res.headers[header], `default-src 'self'`);
        assert.includes(res.headers[header], 'xhr-src connect.com');
    });

    [
        'Safari 4.1'
        , 'Safari 5.1 on OS X'
        , 'Safari 5.1 on Windows Server 2008'
    ].forEach((browser) => {
        it(`does not set the property for ${browser} by default`, () => {
            config.security.contentSecurity = POLICY;
            req.headers['User-Agent'] = AGENTS[browser].string;

            assert.isUndefined(res.headers['X-WebKit-CSP']);
            assert.isUndefined(res.headers['X-Content-Security-Policy']);
            assert.isUndefined(res.headers['Content-Security-Policy']);
        });
    });

    it('sets the header for Safari 4.1 if you force it', () => {
        config.security.contentSecurity = {
            safari5: true
            , 'default-src': 'a.com'
        };

        req.headers['User-Agent'] = AGENTS['Safari 4.1'].string;

        csp(config, req, res);

        assert.strictEqual(res.headers['X-WebKit-CSP'], 'default-src a.com');
    });

    it('sets the header for Safari 5.1 if you force it', () => {
        config.security.contentSecurity = {
            safari5: true
            , 'default-src': 'a.com'
        };

        req.headers['User-Agent'] = AGENTS['Safari 5.1 on OS X'].string;

        csp(config, req, res);

        assert.strictEqual(res.headers['X-WebKit-CSP'], 'default-src a.com');
    });

    it('lets you disable Android', () => {
        config.security.contentSecurity = {
            disableAndroid: true
            , defaultSrc: 'a.com'
        };

        req.headers['User-Agent'] = AGENTS['Android 4.4.3'].string;

        assert.isUndefined(res.header['X-Webkit-CSP']);
        assert.isUndefined(res.header['Content-Security-Policy']);
        assert.isUndefined(res.header['X-Content-Security-Policy']);
    });

    it('appends connect-src \'self\' in iOS Chrome when connect-src is already defined', () => {
        const iosChrome = AGENTS['iOS Chrome 40'];

        config.security.contentSecurity = POLICY;
        req.headers['User-Agent'] = iosChrome.string;

        csp(config, req, res);

        assert.includes(res.headers[iosChrome.header], /connect-src (?:'self' connect.com)|(?:connect.com 'self')/);
    });

    it('adds connect-src \'self\' in iOS Chrome when connect-src is undefined', () => {
        const iosChrome = AGENTS['iOS Chrome 40'];

        config.security.contentSecurity = { styleSrc: [ `'self'` ] };
        req.headers['User-Agent'] = iosChrome.string;

        csp(config, req, res);

        assert.includes(res.headers[iosChrome.header], /connect-src 'self'/);
    });

    it('does nothing in iOS Chrome if connect-src \'self\' is defined', () => {
        const iosChrome = AGENTS['iOS Chrome 40'];

        config.security.contentSecurity = { connectSrc: [ 'somedomain.com', '\'self\'' ] };
        req.headers['User-Agent'] = iosChrome.string;

        csp(config, req, res);

        assert.strictEqual(res.headers[iosChrome.header], 'connect-src somedomain.com \'self\'');
    });

    it('doesn\'t splice the original array', () => {
        const chrome = AGENTS['Chrome 27']
            , ff = AGENTS['Firefox 22'];

        config.security.contentSecurity = {
            'style-src': [
                '\'self\''
                , '\'unsafe-inline\''
            ]
        };

        req.headers['User-Agent'] = chrome.string;
        csp(config, req, res);
        assert.includes(res.headers[chrome.header], /style-src 'self' 'unsafe-inline'/);

        req.headers['User-Agent'] = ff.string;
        csp(config, req, res);
        assert.includes(res.headers[ff.header], /style-src 'self'/);

        req.headers['User-Agent'] = chrome.string;
        csp(config, req, res);
        assert.includes(res.headers[chrome.header], /style-src 'self' 'unsafe-inline'/);
    });
});
