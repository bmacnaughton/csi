'use strict'

const shimmer = require('shimmer');

const record = require('../../recorder/recorder.js').record;
const getStringCount = require('../../util/string-counter');
const debug = require('../../util/debug.js');
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
        log.koa('got request');
        const cc = {startTime: Date.now(), startStringObjectCount: getStringCount()};

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
      const unique = record(
        Date.now() - cc.startTime,
        getStringCount() - cc.startStringObjectCount,
      );

      if (unique) {
        this.setHeader('contrast-id', unique);
      }
      return realEnd.apply(this, arguments);
    }
  })
}
