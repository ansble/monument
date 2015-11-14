'use strict';

const etag = require('etag')
    , getCompression = require('./getCompression')
    , zlib = require('zlib')
    , tools = require('./tools')
    , not = tools.not
    , isDefined = tools.isDefined
    , encoding = 'utf-8'

    , etagMatch = (ifNoneMatch, etagIn) => {
        return isDefined(ifNoneMatch) && ifNoneMatch === etagIn;
    }

    , setContentTypeHeaders = (data, isBuffer, response) => {
        const type = typeof data;

        if (type === 'undefined') {
            response.setHeader('Content-Type', `text/plain; charset=${encoding}`);
        } else if (type === 'string') {
            response.setHeader('Content-Type', `text/html; charset=${encoding}`);
        } else if (type === 'object' && not(isBuffer)) {
            response.setHeader('Content-Type', `application/json; charset=${encoding}`);
        } else if (type === 'object') {
            response.setHeader('Content-Type', `text/html; charset=${encoding}`);
        }

        return response;
    }

    , prepareData = (data, isBuffer) => {
        const type = typeof data;

        if (type === 'undefined') {
            return '';
        } else if (type === 'object' && isBuffer) {
            return data.toString();
        } else if (type === 'string') {
            return data;
        } else {
            return JSON.stringify(data);
        }
    }

    , setCompressionHeader = (compression, response) => {
        if (compression !== 'none') {
            response.setHeader('Content-Encoding', compression);
        }
    }

    , send = (req, config) => {
        // TODO: think about making this a constructor that returns the
        //  modified response object instead of being added as it is
        //  in the router.js file.

        return function (dataIn) {
            /* eslint-disable no-invalid-this */
            const that = this
            /* eslint-enable no-invalid-this */
                , isBuffer = Buffer.isBuffer(dataIn)
                , compression = getCompression(req.headers['accept-encoding'], config)
                , data = prepareData(dataIn, isBuffer)
                , reqEtag = etag(data);

            setContentTypeHeaders(dataIn, isBuffer, that);

            if (etagMatch(req.headers['if-none-match'], reqEtag)) {
                that.statusCode = 304;
                that.end();
            } else {
                that.setHeader('ETag', reqEtag);
                setCompressionHeader(compression, that);

                if (compression === 'deflate') {
                    zlib.deflate(data, (err, result) => {
                        that.end(result, encoding);
                    });
                } else if (compression === 'gzip') {
                    zlib.gzip(data, (err, result) => {
                        that.end(result, encoding);
                    });
                } else {
                    that.end(data, encoding);
                }
            }
        };
    };

module.exports = send;
