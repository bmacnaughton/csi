const configuration = require('./configuration.js');

async function start (options = {}) {

  const Koa = require('koa');
  const logger = require('koa-logger');
  const Router = require('koa-router');
  const app = new Koa();

  // log all events to the terminal
  app.use(logger());

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
  const router = new Router();
  const dogRouter = new Router({
    prefix: '/dogs'
  });
  // add actions
  require('./routes/counters')({router, getCounts: options.getCounts});
  require('./routes/dogs')({dogRouter});

  // tells the router to use all the routes that are on the object
  app.use(router.routes());
  app.use(router.allowedMethods());

  app.use(dogRouter.routes());
  app.use(dogRouter.allowedMethods());

  const server = app.listen(options.port || 3000);
}

module.exports = {start};


