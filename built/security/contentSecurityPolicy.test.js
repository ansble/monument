

const test = require('ava'),
      csp = require('./contentSecurityPolicy'),
      config = {},
      POLICY = {
  baseUri: '*',
  childSrc: ['child.com'],
  connectSrc: ['connect.com'],
  defaultSrc: ["'self'"],
  fontSrc: ['font.com'],
  formAction: ['formaction.com'],
  frameAncestors: ['frameancestor.com'],
  frameSrc: ['frame.com'],
  imgSrc: ['data:', 'img.com'],
  manifestSrc: ['manifest.com'],
  mediaSrc: ['media.com'],
  objectSrc: ['object.com'],
  pluginTypes: ['application/x-shockwave-flash'],
  reportUri: '/report-violation',
  sandbox: [],
  scriptSrc: ["'unsafe-eval'", 'scripts.com'],
  styleSrc: ['styles.com', "'unsafe-inline'"],
  upgradeInsecureRequests: ''
},
      EXPECTED_POLICY = ['base-uri *; child-src child.com; connect-src connect.com; default-src ', "'self'; font-src font.com; form-action formaction.com; frame-ancestors ", 'frameancestor.com; frame-src frame.com; img-src data: img.com; ', 'manifest-src manifest.com; media-src media.com; object-src object.com; ', 'plugin-types application/x-shockwave-flash; report-uri /report-violation; ', "sandbox; script-src 'unsafe-eval' scripts.com; style-src styles.com ", "'unsafe-inline'; upgrade-insecure-requests"].join(''),
      AGENTS = require('../test_stubs/userAgents');

let res = {},
    req = {};

test.beforeEach(() => {
  req = {
    headers: {}
  };

  res = {};
  res.headers = {};
  res.setHeader = function (key, value) {
    this.headers[key] = value;
  };

  config.security = {};

  csp.flushCache();
});

test('returns a function', t => {
  t.is(typeof csp, 'function');
});

test('should have a flushCache function', t => {
  t.is(typeof csp.flushCache, 'function');
});

test('sets headers by string', t => {
  config.security.contentSecurity = { defaultSrc: 'a.com b.biz' };

  csp(config, req, res);

  t.is(res.headers['Content-Security-Policy'], 'default-src a.com b.biz');
});

test('is turned off by passing false', t => {
  config.security.contentSecurity = false;

  csp(config, req, res);

  t.is(typeof res.headers['Content-Security-Policy'], 'undefined');
});

test('sets default-src to self by default', t => {
  csp(config, req, res);

  t.is(res.headers['Content-Security-Policy'], "default-src 'self'");

  config.security = undefined;

  csp(config, req, res);

  t.is(res.headers['Content-Security-Policy'], "default-src 'self'");
});

test('sets all the headers if you tell it to', t => {
  const expected = "default-src 'self' domain.com";

  req.headers['user-agent'] = AGENTS['Firefox 23'].string;

  config.security.contentSecurity = {
    defaultSrc: ["'self'", 'domain.com'],
    setAllHeaders: true
  };

  csp(config, req, res);

  t.is(res.headers['X-Content-Security-Policy'], expected);
  t.is(res.headers['Content-Security-Policy'], expected);
  t.is(res.headers['X-WebKit-CSP'], expected);
});

test('sets all the headers if you provide an unknown user-agent', t => {
  const expected = "default-src 'self' domain.com";

  req.headers['user-agent'] = 'Some Crazy Fake Browser';

  config.security.contentSecurity = {
    defaultSrc: ['\'self\'', 'domain.com']
  };

  csp(config, req, res);
  t.is(res.headers['X-Content-Security-Policy'], expected);
  t.is(res.headers['Content-Security-Policy'], expected);
  t.is(res.headers['X-WebKit-CSP'], expected);

  res.headers = {};

  req.headers['user-agent'] = AGENTS['Chrome 27'].string;

  csp(config, req, res);
  t.is(typeof res.headers['X-Content-Security-Policy'], 'undefined');
  t.is(res.headers['Content-Security-Policy'], expected);
  t.is(typeof res.headers['X-WebKit-CSP'], 'undefined');
});

test('sets the report-only headers', t => {
  const expected = 'default-src \'self\'; report-uri /reporter';

  config.security.contentSecurity = {
    reportOnly: true,
    setAllHeaders: true,
    defaultSrc: ["'self'"],
    reportUri: '/reporter'
  };

  req.headers['user-agent'] = AGENTS['Firefox 23'].string;

  csp(config, req, res);

  t.is(res.headers['X-Content-Security-Policy-Report-Only'], expected);
  t.is(res.headers['Content-Security-Policy-Report-Only'], expected);
  t.is(res.headers['X-WebKit-CSP-Report-Only'], expected);
});

test('can set empty directives', t => {
  config.security.contentSecurity = {
    scriptSrc: [],
    sandbox: ['']
  };

  req.headers['user-agent'] = AGENTS['Firefox 23'].string;

  csp(config, req, res);

  const header = res.headers['Content-Security-Policy'],
        split = header.split(';').map(str => {
    return str.trim();
  }).sort();

  t.is(split[0], 'sandbox');
  t.is(split[1], 'script-src');
});

test('throws an error when directives need quotes', t => {
  t.throws(() => {
    config.security.contentSecurity = { defaultSrc: ['none'] };
    csp(config, req, res);
  }, Error);
  t.throws(() => {
    config.security.contentSecurity = { defaultSrc: ['self'] };
    csp(config, req, res);
  }, Error);
  t.throws(() => {
    config.security.contentSecurity = { 'script-src': ['unsafe-inline'] };
    csp(config, req, res);
  }, Error);
  t.throws(() => {
    config.security.contentSecurity = { scriptSrc: 'unsafe-eval' };
    csp(config, req, res);
  }, Error);
  t.throws(() => {
    config.security.contentSecurity = { 'style-src': ['unsafe-inline'] };
    csp(config, req, res);
  }, Error);
  t.throws(() => {
    config.security.contentSecurity = { styleSrc: 'unsafe-eval' };
    csp(config, req, res);
  }, Error);
  t.throws(() => {
    config.security.contentSecurity = { defaultSrc: 'self' };
    csp(config, req, res);
  }, Error);
  t.throws(() => {
    config.security.contentSecurity = { defaultSrc: 'self unsafe-inline' };
    csp(config, req, res);
  }, Error);
});

test('throws an error reportOnly is true and there is no report-uri', t => {
  t.throws(() => {
    config.security.contentSecurity = { reportOnly: true };
    csp(config, req, res);
  }, Error);
});

Object.keys(AGENTS).forEach(key => {
  const agent = AGENTS[key];

  if (agent.special) {
    return;
  }

  test(`sets the header properly for ${key}`, t => {
    config.security.contentSecurity = POLICY;
    req.headers['user-agent'] = agent.string;

    csp(config, req, res);

    t.is(res.headers[agent.header], EXPECTED_POLICY);
  });
});

test('sets the header properly for Firefox 22', t => {
  const header = 'X-Content-Security-Policy';

  config.security.contentSecurity = POLICY;
  req.headers['user-agent'] = AGENTS['Firefox 22'].string;

  csp(config, req, res);

  t.true(res.headers[header].includes("default-src 'self'"));
  t.true(res.headers[header].includes('xhr-src connect.com'));
});

test('sets the header properly for Firefox 4.0', t => {
  const header = 'X-Content-Security-Policy';

  config.security.contentSecurity = POLICY;
  req.headers['user-agent'] = AGENTS['Firefox 4.0b8'].string;

  csp(config, req, res);

  t.true(res.headers[header].includes("'eval-script' scripts.com"));
  t.true(res.headers[header].includes('style-src styles.com;'));
  t.true(res.headers[header].includes('xhr-src connect.com;'));
  t.true(res.headers[header].includes("allow 'self'"));
});

['Safari 4.1', 'Safari 5.1 on OS X', 'Safari 5.1 on Windows Server 2008', 'Chrome 13', 'Firefox 3', 'Android Browser 4.0.3', 'Opera 12.16'].forEach(browser => {
  test(`does not set the property for ${browser} by default`, t => {
    config.security.contentSecurity = POLICY;
    req.headers['user-agent'] = AGENTS[browser].string;

    csp(config, req, res);

    t.is(typeof res.headers['X-WebKit-CSP'], 'undefined');
    t.is(typeof res.headers['X-Content-Security-Policy'], 'undefined');
    t.is(typeof res.headers['Content-Security-Policy'], 'undefined');
  });
});

test('sets the header for Safari 4.1 if you force it', t => {
  config.security.contentSecurity = {
    safari5: true,
    defaultSrc: 'a.com'
  };

  req.headers['user-agent'] = AGENTS['Safari 4.1'].string;

  csp(config, req, res);

  t.is(res.headers['X-WebKit-CSP'], 'default-src a.com');
});

test('sets the header for Safari 5.1 if you force it', t => {
  config.security.contentSecurity = {
    safari5: true,
    defaultSrc: 'a.com'
  };

  req.headers['user-agent'] = AGENTS['Safari 5.1 on OS X'].string;

  csp(config, req, res);

  t.is(res.headers['X-WebKit-CSP'], 'default-src a.com');
});

test('lets you disable Android', t => {
  config.security.contentSecurity = {
    disableAndroid: true,
    defaultSrc: 'a.com'
  };

  req.headers['user-agent'] = AGENTS['Android 4.4.3'].string;

  t.is(typeof res.headers['X-Webkit-CSP'], 'undefined');
  t.is(typeof res.headers['Content-Security-Policy'], 'undefined');
  t.is(typeof res.headers['X-Content-Security-Policy'], 'undefined');
});

test('appends connect-src \'self\' in iOS Chrome when connect-src is already defined', t => {
  const iosChrome = AGENTS['iOS Chrome 40'],
        iosChromeRegex = /connect-src (?:'self' connect.com)|(?:connect.com 'self')/;

  config.security.contentSecurity = POLICY;
  req.headers['user-agent'] = iosChrome.string;

  csp(config, req, res);

  t.true(iosChromeRegex.test(res.headers[iosChrome.header]));
});

test('adds connect-src \'self\' in iOS Chrome when connect-src is undefined', t => {
  const iosChrome = AGENTS['iOS Chrome 40'];

  config.security.contentSecurity = { styleSrc: ["'self'"] };
  req.headers['user-agent'] = iosChrome.string;

  csp(config, req, res);

  t.true(/connect-src 'self'/.test(res.headers[iosChrome.header]));
});

test('does nothing in iOS Chrome if connect-src \'self\' is defined', t => {
  const iosChrome = AGENTS['iOS Chrome 40'];

  config.security.contentSecurity = { connectSrc: ['somedomain.com', "'self'"] };
  req.headers['user-agent'] = iosChrome.string;

  csp(config, req, res);

  t.is(res.headers[iosChrome.header], "connect-src somedomain.com 'self'");
});

test('doesn\'t splice the original array', t => {
  const chrome = AGENTS['Chrome 27'],
        ff = AGENTS['Firefox 22'];

  config.security.contentSecurity = {
    styleSrc: ["'self'", "'unsafe-inline'"]
  };

  req.headers['user-agent'] = chrome.string;
  csp(config, req, res);
  t.true(/style-src 'self' 'unsafe-inline'/.test(res.headers[chrome.header]));

  res.headers = {};

  req.headers['user-agent'] = ff.string;
  csp(config, req, res);
  t.true(/style-src 'self'/.test(res.headers['X-Content-Security-Policy']));

  res.headers = {};

  req.headers['user-agent'] = chrome.string;
  csp(config, req, res);
  t.true(/style-src 'self' 'unsafe-inline'/.test(res.headers[chrome.header]));
});

test('should not blow up if a string is passed instead of an array of options', t => {
  const ff = AGENTS['Firefox 22'],
        contentSecurityRegex = /style-src 'self' cdn-images.mailchimp.com/;

  config.security.contentSecurity = {
    defaultSrc: "'self'", styleSrc: "'self' cdn-images.mailchimp.com 'unsafe-inline'",
    imgSrc: "'self' maps.googleapis.com images.vivintcdn.com www.masteryconnect.com" + ' smartrhinolabs.com cdn.hacknightslc.com cdn.sqhk.co *.cloudfront.net' + ' www.google-analytics.com data:',
    scriptSrc: "'self' 'sha256-ZmBLMRsmRpaF/hQbWKT9xhd6Ql2Wf2a1WXhO2tdH6Xg='" + ' www.google-analytics.com'
  };

  req.headers['user-agent'] = ff.string;
  csp(config, req, res);
  t.true(contentSecurityRegex.test(res.headers['X-Content-Security-Policy']));
});