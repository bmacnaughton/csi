//
// implement the simple web app. it's really two in one - one displays
// a list of dog breeds while the other accumulates metrics and displays
// them on request.
//

const metrics = require('./metrics');

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

  // error handling
  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      ctx.status = err.status || 500;
      ctx.body = err.message;
      ctx.app.emit('error', err, ctx);
    }
  });

  // instantiate our new Router
  const metricsRouter = new Router({prefix: '/csi'});
  const dogRouter = new Router({prefix: '/dogs'});
  const homeRouter = new Router();

  // add actions
  const counterOptions = {
    router: metricsRouter,
    getCounts: options.getCounts,
    report: metrics.report,
  };
  require('./routes/counters')(counterOptions);
  require('./routes/dogs')({router: dogRouter});
  require('./routes/home')({router: homeRouter});

  // use all the routes
  app.use(metricsRouter.routes());
  app.use(metricsRouter.allowedMethods());

  app.use(dogRouter.routes());
  app.use(dogRouter.allowedMethods());

  app.use(homeRouter.routes());
  app.use(homeRouter.allowedMethods());

  app.listen(options.port || 3000);

  return app;
}

module.exports = {start};


