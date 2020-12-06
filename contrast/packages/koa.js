'use strict'

const shimmer = require('shimmer');

const record = require('../recorder.js').record;
const getStringCounts = require('../string-counter');
const debug = require('../debug.js');
const log = {
  patch: debug.make('patch'),
  koa: debug.make('koa'),
  info: debug.make('info'),
};

module.exports = koa => {
  // allow the caller to invoke this with or without "new" by
  // not using an arrow function.
  return function (settings) {
    const app = new koa(settings);
    log.info('think i am wrapping');
    wrapApp(app);
    return app;
  }
}

// Wrap the callback method that goes into listen(...)
function wrapApp (app) {
  if (!app.callback) {
    log.patch('koa missing app.callback()');
    return;
  }
  shimmer.wrap(app, 'callback', callback => {
    return function () {
      const handle = callback.call(this);
      return function (req, res) {
        const cc = {startTime: Date.now(), startCounts: getStringCounts()};
        log.koa('got request');

        // Create and enter koa transaction
        log.koa('wrapping end()');
        wrapEnd(cc, res);

        // Run real handler
        log.koa('executing handler');
        return handle.call(this, req, res);
      }
    }
  })
}

// Exit koa span and response write
function wrapEnd (cc, res) {
  if (!res.end) {
    log.patch('koa missing res.end()');
    return;
  }
  shimmer.wrap(res, 'end', realEnd => {
    return function () {
      const sc = getStringCounts();
      const data = {
        et: Date.now() - cc.startTime,
        deltaStrCount: sc.strCalls - cc.startCounts.strCalls,
        deltaObjCount: sc.objCalls - cc.startCounts.objCalls,
        rawCounts: sc,
      };
      record(data)
        .then(unique => {
          if (unique) {
            this.setHeader('x-contrast-id', unique);
          }
          return realEnd.apply(this, arguments);
        });

      // this could lead to some unexpected behavior because
      // the state of the response may not be what it would
      // normally be after really calling end(); the call to
      // realEnd() will be delayed when record() sends to an
      // endpoint or writes to a file. the only real alternatives
      // are to have the send/write fire and forget or, if the user
      // supplied a callback, then the callback could be wrapped and
      // only invoked after record() completes. but in general
      // this should work fine as the output stream may not have
      // finished before end() returns.
      return this;
    }
  })
}
