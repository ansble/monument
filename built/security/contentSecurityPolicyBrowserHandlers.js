
const config = require('./contentSecurityPolicyConfig'),
      contains = require('../utils').contains,
      not = require('../utils').not,
      shallowCopy = directives => {
  return JSON.parse(JSON.stringify(directives));
},
      SET_NOTHING = { headers: [] },
      handlers = {},
      setUnsafeInline = (policyStringIn, key) => {
  const index = policyStringIn.indexOf("'unsafe-inline'"),
        policyString = policyStringIn;

  if (index >= 0) {
    if (key === 'scriptSrc') {
      policyString[index] = "'inline-script'";
    } else {
      policyString.splice(index, 1);
    }
  }

  return policyString;
},
      setUnsafeEval = (policyStringIn, key) => {
  const index = policyStringIn.indexOf("'unsafe-eval'"),
        policyString = policyStringIn;

  if (index >= 0) {
    if (key === 'scriptSrc') {
      policyString[index] = "'eval-script'";
    } else {
      policyString.splice(index, 1);
    }
  }

  return policyString;
};

handlers.default = function () {
  return { headers: config.allHeaders };
};

handlers.IE = function (browser) {
  const headerSwitchVersion = 12,
        header = browser.version < headerSwitchVersion ? 'X-Content-Security-Policy' : 'Content-Security-Policy';

  return { headers: [header] };
};

handlers.Firefox = function (browser, directives) {
  const version = parseFloat(browser.version),
        policy = shallowCopy(directives),
        TWENTYTHREE = 23,
        FOUR = 4,
        FIVE = 5;

  if (version >= TWENTYTHREE) {
    return { headers: ['Content-Security-Policy'] };
  } else if (version >= FOUR && version < TWENTYTHREE) {
    policy.defaultSrc = policy.defaultSrc || ['*'];

    Object.keys(policy).forEach(key => {
      const value = policy[key];

      if (key === 'connectSrc') {
        policy.xhrSrc = value;
      } else if (key === 'defaultSrc') {
        if (version < FIVE) {
          policy.allow = value;
        } else {
          policy.defaultSrc = value;
        }
      } else if (key !== 'sandbox') {
        policy[key] = value;
      }

      policy[key] = setUnsafeInline(policy[key], key);
      policy[key] = setUnsafeEval(policy[key], key);
    });

    return {
      headers: ['X-Content-Security-Policy'],
      directives: policy
    };
  } else {
    return SET_NOTHING;
  }
};

handlers.Chrome = function (browser) {
  const version = parseFloat(browser.version),
        TWENTYFIVE = 25,
        FOURTEEN = 14;

  if (version >= FOURTEEN && version < TWENTYFIVE) {
    return { headers: ['X-WebKit-CSP'] };
  } else if (version >= TWENTYFIVE) {
    return { headers: ['Content-Security-Policy'] };
  } else {
    return SET_NOTHING;
  }
};

handlers.Safari = function (browser, directives, options) {
  const version = parseFloat(browser.version),
        SEVEN = 7,
        SIX = 6;

  if (version >= SEVEN) {
    return { headers: ['Content-Security-Policy'] };
  } else if (version >= SIX || options.safari5) {
    return { headers: ['X-WebKit-CSP'] };
  } else {
    return SET_NOTHING;
  }
};

handlers.Opera = function (browser) {
  const FIFTEEN = 15;

  if (parseFloat(browser.version) >= FIFTEEN) {
    return { headers: ['Content-Security-Policy'] };
  } else {
    return SET_NOTHING;
  }
};

handlers['Android Browser'] = function (browser, directives, options = {}) {
  const FOURPOINTFOUR = 4.4;

  if (parseFloat(browser.os.version) < FOURPOINTFOUR || options.disableAndroid) {
    return SET_NOTHING;
  } else {
    return { headers: ['Content-Security-Policy'] };
  }
};

handlers['Chrome Mobile'] = function (browser, directives) {
  if (browser.os.family === 'iOS') {
    const result = { headers: ['Content-Security-Policy'] },
          connect = directives.connectSrc;

    if (!connect) {
      result.directives = shallowCopy(directives);
      result.directives.connectSrc = ["'self'"];
    } else if (not(contains(connect, "'self'"))) {
      result.directives = shallowCopy(directives);
      result.directives.connectSrc.push("'self'");
    }

    return result;
  } else {
    return handlers['Android Browser'].apply(this, arguments);
  }
};

module.exports = handlers;