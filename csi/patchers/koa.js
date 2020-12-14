//
// patch the koa object to capture metrics
//

const shimmer = require('shimmer');

const {context, recorder, getMetrics, debug} = require('../csi');
const log = {
  patch: debug.make('patch'),
  koa: debug.make('koa'),
};

module.exports = koa => {
  return function (settings) {
    const app = new koa(settings);
    log.koa('wrapping app');
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
        log.koa('contextualizing request');
        // create a context, wrap end(), bind the emitters,
        // and invoke the user's koa handler
        context.run(() => {
          context.init();
          const startMetrics = getMetrics();
          if (wrapEnd(startMetrics, res)) {
            res.end = context.bind(res.end);
          }

          context.bindEmitter(req);
          context.bindEmitter(res);

          // Run real handler
          log.koa('executing handler');
          return handle.call(this, req, res);
        }, {newContext: true});

      }
    }
  })
}

// on response.end() exit
function wrapEnd (startMetrics, res) {
  if (!res.end || typeof res.end !== 'function') {
    log.patch('koa missing res.end()');
    return false;
  }
  shimmer.wrap(res, 'end', realEnd => {
    return function () {
      const endMetrics = getMetrics(startMetrics);

      log.koa('calling recorder.record()')
      recorder.recordRequest(endMetrics)
        .then(unique => {
          if (unique) {
            this.setHeader('x-csi-id', unique);
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
      // this should work fine.
      return this;
    };
  });
  return true;
}
