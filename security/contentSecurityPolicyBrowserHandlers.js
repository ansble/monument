'use strict';
const config = require('./contentSecurityPolicyConfig')
    , shallowCopy = (directives) => {
        return JSON.parse(JSON.stringify(directives));
    }
    , SET_NOTHING = { headers: [] }
    , handlers = {};

handlers.default = function () {
    return { headers: config.allHeaders };
};

handlers.IE = function (browser) {
    const header = browser.version < 12 ? 'X-Content-Security-Policy' : 'Content-Security-Policy';

    return { headers: [ header ] };
};

handlers.Firefox = function (browser, directives) {
    const version = parseFloat(browser.version)
        , policy = shallowCopy(directives);

    if (version >= 23) {
        return { headers: [ 'Content-Security-Policy' ] };
    } else if (version >= 4 && version < 23) {
        policy.defaultSrc = policy.defaultSrc || [ '*' ];

        Object.keys(policy).forEach((key) => {
            const value = policy[key];

            let index;

            if (key === 'connectSrc') {
                policy.xhrSrc = value;
            } else if (key === 'defaultSrc') {
                if (version < 5) {
                    policy.allow = value;
                } else {
                    policy.defaultSrc = value;
                }
            } else if (key !== 'sandbox') {
                policy[key] = value;
            }

            if ((index = policy[key].indexOf('\'unsafe-inline\'')) !== -1) {
                if (key === 'scriptSrc') {
                    policy[key][index] = '\'inline-script\'';
                } else {
                    policy[key].splice(index, 1);
                }
            }

            if ((index = policy[key].indexOf('\'unsafe-eval\'')) !== -1) {
                if (key === 'scriptSrc') {
                    policy[key][index] = '\'eval-script\'';
                } else {
                    policy[key].splice(index, 1);
                }
            }
        });

        return {
            headers: [ 'X-Content-Security-Policy' ]
            , directives: policy
        };
    } else {
        return SET_NOTHING;
    }
};

handlers.Chrome = function (browser) {
    const version = parseFloat(browser.version);

    if (version >= 14 && version < 25) {
        return { headers: [ 'X-WebKit-CSP' ] };
    } else if (version >= 25) {
        return { headers: [ 'Content-Security-Policy' ] };
    } else {
        return SET_NOTHING;
    }
};

handlers.Safari = function (browser, directives, options) {
    const version = parseFloat(browser.version);

    if (version >= 7) {
        return { headers: [ 'Content-Security-Policy' ] };
    } else if (version >= 6 || options.safari5) {
        return { headers: [ 'X-WebKit-CSP' ] };
    } else {
        return SET_NOTHING;
    }
};

handlers.Opera = function (browser) {
    if (parseFloat(browser.version) >= 15) {
        return { headers: [ 'Content-Security-Policy' ] };
    } else {
        return SET_NOTHING;
    }
};

handlers['Android Browser'] = function (browser, directives, options) {
    if (parseFloat(browser.os.version) < 4.4 || options.disableAndroid) {
        return SET_NOTHING;
    } else {
        return { headers: [ 'Content-Security-Policy' ] };
    }
};

handlers['Chrome Mobile'] = function (browser, directives) {
    if (browser.os.family === 'iOS') {
        const result = { headers: [ 'Content-Security-Policy' ] }
            , connect = directives.connectSrc || directives.connectSrc;

        if (!connect) {
            result.directives = shallowCopy(directives);
            result.directives.connectSrc = [ '\'self\'' ];
        } else if (connect.indexOf('\'self\'') === -1) {
            result.directives = shallowCopy(directives);
            result.directives.connectSrc.push('\'self\'');
        }

        return result;
    } else {
        return handlers['Android Browser'].apply(this, arguments);
    }
};

module.exports = handlers;
