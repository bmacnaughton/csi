//
// implement a simple api to store and fetch metrics.
//

const metrics = require('./metrics-store');

async function start (options = {}) {
  const path = require('path');

  const Koa = require('koa');
  const logger = require('koa-logger');
  const Router = require('koa-router');
  const bodyParser = require('koa-bodyparser');
  const app = new Koa();

  const Pug = require('koa-pug');
  const pug = new Pug({
    viewPath: path.resolve(__dirname, 'views'),
    basedir: path.resolve(__dirname, 'views'),
  });

  // could add {app: app} in new Pug() call
  pug.use(app);

  // log all events to the terminal
  app.use(logger());

  // parse the body
  app.use(bodyParser());

  // use status if exception has the property
  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      ctx.status = err.status || 500;
      ctx.body = err.message;
      ctx.app.emit('error', err, ctx);
    }
  });


  const indexRouter = new Router();
  // add actions
  const indexOptions = {
    router: indexRouter,
    metrics,
    log: options.log || function () {},
  };
  require('./routes/index')(indexOptions);
  app.use(indexRouter.routes());
  app.use(indexRouter.allowedMethods());

  const apiRouter = new Router({prefix: '/api'});
  const apiOptions = {
    router: apiRouter,
    metrics,
    log: options.log || function () {},
  }
  require('./routes/api')(apiOptions);
  app.use(apiRouter.routes());
  app.use(apiRouter.allowedMethods());

  // start the app
  app.listen(options.port);

  return app;
}

module.exports = {start};


