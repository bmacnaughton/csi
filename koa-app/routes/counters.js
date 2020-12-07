module.exports = ({router, getCounts, accumulate}) => {
  router.get('/', async ctx => {
    ctx.body = getCounts ? getCounts() : {};
  });
  router.post('/', async ctx => {
    accumulate(ctx.request.body);
    ctx.body = {status: 'OK'};
  });
  router.post('/exit', async ctx => {
    ctx.app.emit('exit', 'exit requested');
    ctx.body = {status: 'exit'};
  });
};
