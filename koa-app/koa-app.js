//
// implement the simple koa app. it displays dog breeds.
//

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
  const dogRouter = new Router({prefix: '/dogs'});
  const homeRouter = new Router();

  const dogOptions = {
    router: dogRouter,
  }
  require('./routes/dogs')(dogOptions);

  const homeOptions = {
    router: homeRouter,
  }
  require('./routes/home')(homeOptions);

  // use all the routes
  app.use(dogRouter.routes());
  app.use(dogRouter.allowedMethods());

  app.use(homeRouter.routes());
  app.use(homeRouter.allowedMethods());

  app.listen(options.port);

  return app;
}

module.exports = {start};


