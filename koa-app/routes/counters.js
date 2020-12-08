module.exports = ({router, getCounts, report}) => {
  router.get('/', async ctx => {
    ctx.body = getCounts ? getCounts() : {};
  });
  router.post('/', async ctx => {
    await report(ctx.request.body);
    ctx.body = {status: 'OK'};
  });
  router.post('/exit', async ctx => {
    ctx.app.emit('exit', 'exit requested');
    ctx.body = {status: 'exit'};
  });
};
