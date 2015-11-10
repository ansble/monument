/* eslint-env node, mocha */
'use strict';

const assert = require('chai').assert
    , csp = require('./contentSecurityPolicy')
    , config = {}

    , POLICY = {
        baseUri: '*'
        , childSrc: [ 'child.com' ]
        , connectSrc: [ 'connect.com' ]
        , defaultSrc: [ `'self'` ]
        , fontSrc: [ 'font.com' ]
        , formAction: [ 'formaction.com' ]
        , frameAncestors: [ 'frameancestor.com' ]
        , frameSrc: [ 'frame.com' ]
        , imgSrc: [ 'data:', 'img.com' ]
        , manifestSrc: [ 'manifest.com' ]
        , mediaSrc: [ 'media.com' ]
        , objectSrc: [ 'object.com' ]
        , pluginTypes: [ 'application/x-shockwave-flash' ]
        , reportUri: '/report-violation'
        , sandbox: []
        , scriptSrc: [ `'unsafe-eval'`, 'scripts.com' ]
        , styleSrc: [ 'styles.com', `'unsafe-inline'` ]
        , upgradeInsecureRequests: ''
    }
    , EXPECTED_POLICY = [
        'base-uri *; child-src child.com; connect-src connect.com; default-src '
        , `'self'; font-src font.com; form-action formaction.com; frame-ancestors `
        , 'frameancestor.com; frame-src frame.com; img-src data: img.com; '
        , 'manifest-src manifest.com; media-src media.com; object-src object.com; '
        , 'plugin-types application/x-shockwave-flash; report-uri /report-violation; '
        , `sandbox; script-src 'unsafe-eval' scripts.com; style-src styles.com `
        , `'unsafe-inline'; upgrade-insecure-requests`
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
        config.security.contentSecurity = { defaultSrc: 'a.com b.biz' };

        csp(config, req, res);

        assert.strictEqual(res.headers['Content-Security-Policy'], 'default-src a.com b.biz');
    });

    it('sets all the headers if you tell it to', () => {
        const expected = `default-src 'self' domain.com`;

        req.headers['user-agent'] = AGENTS['Firefox 23'].string;

        config.security.contentSecurity = {
            defaultSrc: [ `'self'`, 'domain.com' ]
            , setAllHeaders: true
        };

        csp(config, req, res);

        assert.strictEqual(res.headers['X-Content-Security-Policy'], expected);
        assert.strictEqual(res.headers['Content-Security-Policy'], expected);
        assert.strictEqual(res.headers['X-WebKit-CSP'], expected);
    });

    it('sets all the headers if you provide an unknown user-agent', () => {
        const expected = `default-src 'self' domain.com`;

        req.headers['user-agent'] = 'Some Crazy Fake Browser';

        config.security.contentSecurity = {
            defaultSrc: [ '\'self\'', 'domain.com' ]
        };

        csp(config, req, res);
        assert.strictEqual(res.headers['X-Content-Security-Policy'], expected);
        assert.strictEqual(res.headers['Content-Security-Policy'], expected);
        assert.strictEqual(res.headers['X-WebKit-CSP'], expected);

        res.headers = {};

        // unknown browser shouldn't effect a subsequent request
        req.headers['user-agent'] = AGENTS['Chrome 27'].string;

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
            , defaultSrc: [ `'self'` ]
            , reportUri: '/reporter'
        };

        req.headers['user-agent'] = AGENTS['Firefox 23'].string;

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

        req.headers['user-agent'] = AGENTS['Firefox 23'].string;

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
            config.security.contentSecurity = { defaultSrc: [ 'none' ] };
            csp(config, req, res);
        }, Error);
        assert.throws(() => {
            config.security.contentSecurity = { defaultSrc: [ 'self' ] };
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
            config.security.contentSecurity = { defaultSrc: 'self' };
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
            req.headers['user-agent'] = agent.string;

            csp(config, req, res);

            assert.strictEqual(res.headers[agent.header], EXPECTED_POLICY);
        });
    });

    it('sets the header properly for Firefox 22', () => {
        const header = 'X-Content-Security-Policy';

        config.security.contentSecurity = POLICY;
        req.headers['user-agent'] = AGENTS['Firefox 22'].string;

        csp(config, req, res);

        assert.include(res.headers[header], `default-src 'self'`);
        assert.include(res.headers[header], 'xhr-src connect.com');
    });

    it('sets the header properly for Firefox 4.0', () => {
        const header = 'X-Content-Security-Policy';

        config.security.contentSecurity = POLICY;
        req.headers['user-agent'] = AGENTS['Firefox 4.0b8'].string;

        csp(config, req, res);

        // assert.strictEqual(res.headers[header], EXPECTED_POLICY);
        assert.include(res.headers[header], `'eval-script' scripts.com`);
        assert.include(res.headers[header], 'style-src styles.com;');
        assert.include(res.headers[header], 'xhr-src connect.com;');
        assert.include(res.headers[header], `allow 'self'`);

    });

    [
        'Safari 4.1'
        , 'Safari 5.1 on OS X'
        , 'Safari 5.1 on Windows Server 2008'
        , 'Chrome 13'
        , 'Firefox 3'
        , 'Android Browser 4.0.3'
        , 'Opera 12.16'
    ].forEach((browser) => {
        it(`does not set the property for ${browser} by default`, () => {
            config.security.contentSecurity = POLICY;
            req.headers['user-agent'] = AGENTS[browser].string;

            csp(config, req, res);

            assert.isUndefined(res.headers['X-WebKit-CSP']);
            assert.isUndefined(res.headers['X-Content-Security-Policy']);
            assert.isUndefined(res.headers['Content-Security-Policy']);
        });
    });

    it('sets the header for Safari 4.1 if you force it', () => {
        config.security.contentSecurity = {
            safari5: true
            , defaultSrc: 'a.com'
        };

        req.headers['user-agent'] = AGENTS['Safari 4.1'].string;

        csp(config, req, res);

        assert.strictEqual(res.headers['X-WebKit-CSP'], 'default-src a.com');
    });

    it('sets the header for Safari 5.1 if you force it', () => {
        config.security.contentSecurity = {
            safari5: true
            , defaultSrc: 'a.com'
        };

        req.headers['user-agent'] = AGENTS['Safari 5.1 on OS X'].string;

        csp(config, req, res);

        assert.strictEqual(res.headers['X-WebKit-CSP'], 'default-src a.com');
    });

    it('lets you disable Android', () => {
        config.security.contentSecurity = {
            disableAndroid: true
            , defaultSrc: 'a.com'
        };

        req.headers['user-agent'] = AGENTS['Android 4.4.3'].string;

        assert.isUndefined(res.headers['X-Webkit-CSP']);
        assert.isUndefined(res.headers['Content-Security-Policy']);
        assert.isUndefined(res.headers['X-Content-Security-Policy']);
    });

    it('appends connect-src \'self\' in iOS Chrome when connect-src is already defined', () => {
        const iosChrome = AGENTS['iOS Chrome 40'];

        config.security.contentSecurity = POLICY;
        req.headers['user-agent'] = iosChrome.string;

        csp(config, req, res);

        assert.match(res.headers[iosChrome.header], /connect-src (?:'self' connect.com)|(?:connect.com 'self')/);
    });

    it('adds connect-src \'self\' in iOS Chrome when connect-src is undefined', () => {
        const iosChrome = AGENTS['iOS Chrome 40'];

        config.security.contentSecurity = { styleSrc: [ `'self'` ] };
        req.headers['user-agent'] = iosChrome.string;

        csp(config, req, res);

        assert.match(res.headers[iosChrome.header], /connect-src 'self'/);
    });

    it('does nothing in iOS Chrome if connect-src \'self\' is defined', () => {
        const iosChrome = AGENTS['iOS Chrome 40'];

        config.security.contentSecurity = { connectSrc: [ 'somedomain.com', `'self'` ] };
        req.headers['user-agent'] = iosChrome.string;

        csp(config, req, res);

        assert.strictEqual(res.headers[iosChrome.header], `connect-src somedomain.com 'self'`);
    });

    it('doesn\'t splice the original array', () => {
        const chrome = AGENTS['Chrome 27']
            , ff = AGENTS['Firefox 22'];

        config.security.contentSecurity = {
            styleSrc: [
                `'self'`
                , `'unsafe-inline'`
            ]
        };

        req.headers['user-agent'] = chrome.string;
        csp(config, req, res);
        assert.match(res.headers[chrome.header], /style-src 'self' 'unsafe-inline'/);

        res.headers = {};

        req.headers['user-agent'] = ff.string;
        csp(config, req, res);
        assert.match(res.headers['X-Content-Security-Policy'], /style-src 'self'/);

        res.headers = {};

        req.headers['user-agent'] = chrome.string;
        csp(config, req, res);
        assert.match(res.headers[chrome.header], /style-src 'self' 'unsafe-inline'/);
    });
});
