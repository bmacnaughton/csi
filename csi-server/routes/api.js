module.exports = ({router, metrics}) => {
  router.get('/', async ctx => {
    const host = ctx.req.headers.host;
    ctx.body = {
      success: true,
      messages: ['fetched api'],
      links: [
        {href: `${host}/id`, method: 'get'},
        {href: `${host}/all`, method: 'get'},
        {href: `${host}/summary`, method: 'get'},
        {href: `${host}/add`, method: 'post'},
      ],
    }
  });
  router.get('/id/:id', async ctx => {
    ctx.body = metrics.get(ctx.params.id);
  });
  router.get('/all', async ctx => {
    ctx.body = metrics.getAll();
    //return ctx.render('metrics/all', {metrics: metrics.getAll()});
  })
  router.get('/summary', async ctx => {
    ctx.body = metrics.getSummary();
    //return ctx.render('metrics/summary', {summary: metrics.getSummary()});
  })
  router.post('/', async ctx => {
    await metrics.report(ctx.request.body);
    ctx.body = {status: 'OK', metrics: ctx.request.body};
  });
};
