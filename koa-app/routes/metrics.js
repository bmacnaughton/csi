module.exports = ({router, metrics}) => {
  router.get('/', async ctx => {
    ctx.body = metrics.getSummary();
  });
  router.get('/id/:id', async ctx => {
    ctx.body = metrics.get(ctx.params.id);
  });
  router.get('/summary', async ctx => {
    ctx.body = metrics.getSummary();
  })
  router.post('/', async ctx => {
    await metrics.report(ctx.request.body);
    ctx.body = {status: 'OK', metrics: ctx.request.body};
  });
  router.post('/exit', async ctx => {
    ctx.app.emit('exit', 'exit requested');
    ctx.body = {status: 'exit'};
  });
};