const configuration = require('./configuration.js');

async function start (options = {}) {
  const path = require('path');

  const Koa = require('koa');
  const logger = require('koa-logger');
  const Router = require('koa-router');
  const bodyParser = require('koa-bodyparser');
  const app = new Koa();

  var Pug = require('koa-pug');
  var pug = new Pug({
    viewPath: path.resolve(__dirname, 'views'),
    basedir: path.resolve(__dirname, 'views'),
    app: app // bind ctx.render
  });

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
  const router = new Router();
  const dogRouter = new Router({prefix: '/dogs'});
  const vanillaRouter = new Router({prefix: '/vanilla'});
  // add actions
  require('./routes/counters')({router, getCounts: options.getCounts});
  require('./routes/dogs')({router: dogRouter});
  require('./routes/vanilla')({router: vanillaRouter});

  // use all the routes
  app.use(router.routes());
  app.use(router.allowedMethods());

  app.use(dogRouter.routes());
  app.use(dogRouter.allowedMethods());

  app.use(vanillaRouter.routes());
  app.use(vanillaRouter.allowedMethods());

  const server = app.listen(options.port || 3000);
}

module.exports = {start};


